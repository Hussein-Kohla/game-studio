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
    const pairs = await ctx.db
      .query("imposterWords")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const available = pairs.filter((p) => !excludeSet.has(p._id));
    if (available.length === 0) return null;

    const selected = available[Math.floor(Math.random() * available.length)];
    return {
      pairId: selected._id,
      word: selected.word,
      impostorWord: selected.impostorWord,
    };
  },
});

/** يحدّث كلمات الامبوستر من الملف بعد تعديل الأزواج (بدون حذف الكل) */
export const syncPairsFromCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    let updated = 0;
    let notFound = 0;

    for (const [categoryId, pairs] of Object.entries(IMPOSTER_PAIRS)) {
      for (const pair of pairs) {
        const row = await ctx.db
          .query("imposterWords")
          .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
          .filter((q) => q.eq(q.field("word"), pair.word))
          .first();

        if (row) {
          if (row.impostorWord !== pair.impostorWord) {
            await ctx.db.patch(row._id, { impostorWord: pair.impostorWord });
            updated++;
          }
        } else {
          await ctx.db.insert("imposterWords", {
            categoryId,
            word: pair.word,
            impostorWord: pair.impostorWord,
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

    for (const [categoryId, pairs] of Object.entries(IMPOSTER_PAIRS)) {
      for (const pair of pairs) {
        const dup = await ctx.db
          .query("imposterWords")
          .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
          .filter((q) => q.eq(q.field("word"), pair.word))
          .first();

        if (!dup) {
          await ctx.db.insert("imposterWords", {
            categoryId,
            word: pair.word,
            impostorWord: pair.impostorWord,
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
