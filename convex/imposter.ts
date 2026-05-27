import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { IMPOSTER_CATEGORIES } from "./imposterCategories";
import { IMPOSTER_PAIRS } from "./imposterData";

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const result = [];
    for (const cat of IMPOSTER_CATEGORIES) {
      const words = await ctx.db
        .query("imposterWords")
        .withIndex("by_category", (q) => q.eq("categoryId", cat.id))
        .collect();
      result.push({
        id: cat.id,
        label: cat.label,
        count: words.length,
      });
    }
    return result;
  },
});

export const pickRandomPair = mutation({
  args: {
    categoryId: v.string(),
    exclude: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const excludeSet = new Set(args.exclude ?? []);
    const groups = await ctx.db
      .query("imposterWords")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const available = groups.filter((g) => !excludeSet.has(g._id));
    if (available.length === 0) return null;

    const selectedGroup = available[Math.floor(Math.random() * available.length)];
    
    // Pick two different words randomly
    const wordsArray = selectedGroup.words ?? [];
    const shuffledWords = [...wordsArray].sort(() => Math.random() - 0.5);
    const word1 = shuffledWords[0];
    const word2 = shuffledWords.length > 1 ? shuffledWords[1] : word1;

    // Swap randomly (50% chance)
    const swap = Math.random() > 0.5;

    return {
      pairId: selectedGroup._id,
      word: swap ? word2 : word1,
      impostorWord: swap ? word1 : word2,
    };
  },
});

/** يحدّث كلمات الامبوستر من الملف بعد تعديل المجموعات */
export const syncPairsFromCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    let notFound = 0;

    for (const [categoryId, groups] of Object.entries(IMPOSTER_PAIRS)) {
      const existingInCat = await ctx.db
        .query("imposterWords")
        .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
        .collect();

      for (const group of groups) {
        // Find existing group by checking if it contains the first word
        const row = existingInCat.find((r) => (r.words ?? []).includes(group.words[0]));

        if (row) {
          await ctx.db.patch(row._id, { words: group.words });
          updated++;
        } else {
          await ctx.db.insert("imposterWords", {
            categoryId,
            words: group.words,
          });
          notFound++;
        }
      }
    }

    return { updated, inserted: notFound };
  },
});

export const seedImposterWords = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.force) {
      const existing = await ctx.db.query("imposterWords").collect();
      for (const row of existing) {
        await ctx.db.delete(row._id);
      }
    }

    let inserted = 0;
    let skipped = 0;

    for (const [categoryId, groups] of Object.entries(IMPOSTER_PAIRS)) {
      const existingInCat = await ctx.db
        .query("imposterWords")
        .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
        .collect();

      for (const group of groups) {
        const dup = existingInCat.find((r) => (r.words ?? []).includes(group.words[0]));

        if (!dup) {
          await ctx.db.insert("imposterWords", {
            categoryId,
            words: group.words,
          });
          inserted++;
        } else {
          skipped++;
        }
      }
    }

    return { inserted, skipped };
  },
});
