import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { GROUP_SIZE } from "./schema";

export const getWordGroups = query({
  args: { lang: v.string() },
  handler: async (ctx, args) => {
    const words = await ctx.db
      .query("words")
      .withIndex("by_lang", (q) => q.eq("lang", args.lang))
      .collect();
    const counts = new Map<number, number>();
    for (const w of words) {
      if (w.groupId === undefined) continue;
      counts.set(w.groupId, (counts.get(w.groupId) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a - b)
      .map(([groupId, count]) => ({ groupId, count }));
  },
});

export const popRandomWord = mutation({
  args: {
    lang: v.string(),
    groupId: v.number(),
    exclude: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const excludeSet = new Set(args.exclude ?? []);
    const words = await ctx.db
      .query("words")
      .withIndex("by_lang_group", (q) =>
        q.eq("lang", args.lang).eq("groupId", args.groupId)
      )
      .collect();

    const available = words.filter((w) => !excludeSet.has(w.word));
    if (available.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * available.length);
    const selected = available[randomIndex];
    return {
      word: selected.word,
      lang: selected.lang,
      forbiddenWords: selected.forbiddenWords,
      remaining: available.length - 1,
    };
  },
});

export const bulkInsertWords = mutation({
  args: {
    words: v.array(v.object({
      word: v.string(),
      lang: v.string(),
      forbiddenWords: v.array(v.string()),
    })),
    groupId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;
    let targetGroupId = args.groupId;

    if (targetGroupId === undefined) {
      const lang = args.words[0]?.lang ?? "ar";
      const all = await ctx.db
        .query("words")
        .withIndex("by_lang", (q) => q.eq("lang", lang))
        .collect();
      const withGroup = all.filter((w) => w.groupId !== undefined);
      if (withGroup.length === 0) {
        targetGroupId = 1;
      } else {
        const maxGroup = Math.max(...withGroup.map((w) => w.groupId!));
        const inMax = withGroup.filter((w) => w.groupId === maxGroup).length;
        targetGroupId = inMax >= GROUP_SIZE ? maxGroup + 1 : maxGroup;
      }
    }

    for (const item of args.words) {
      const existing = await ctx.db
        .query("words")
        .withIndex("by_lang", (q) => q.eq("lang", item.lang))
        .filter((q) => q.eq(q.field("word"), item.word))
        .first();

      if (!existing) {
        await ctx.db.insert("words", { ...item, groupId: targetGroupId });
        inserted++;
      } else {
        skipped++;
      }
    }

    return { inserted, skipped, total: args.words.length, groupId: targetGroupId };
  },
});

export const getWordCount = query({
  args: { lang: v.string(), groupId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.groupId !== undefined) {
      const words = await ctx.db
        .query("words")
        .withIndex("by_lang_group", (q) =>
          q.eq("lang", args.lang).eq("groupId", args.groupId!)
        )
        .collect();
      return words.length;
    }
    const words = await ctx.db
      .query("words")
      .withIndex("by_lang", (q) => q.eq("lang", args.lang))
      .collect();
    return words.length;
  },
});

export const getRecentWords = query({
  args: { lang: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const words = await ctx.db
      .query("words")
      .withIndex("by_lang", (q) => q.eq("lang", args.lang))
      .order("desc")
      .take(limit);
    return words.map((w) => w.word);
  },
});
