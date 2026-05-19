import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Pop a random word (get it, move it to used_words, and return it)
export const popRandomWord = mutation({
  args: { lang: v.string() },
  handler: async (ctx, args) => {
    const words = await ctx.db
      .query("words")
      .withIndex("by_lang", (q) => q.eq("lang", args.lang))
      .collect();

    if (words.length === 0) return null;
    
    // Pick a random word
    const randomIndex = Math.floor(Math.random() * words.length);
    const selected = words[randomIndex];
    
    // Move to used_words
    await ctx.db.insert("used_words", {
      word: selected.word,
      lang: selected.lang,
      forbiddenWords: selected.forbiddenWords,
    });
    
    // Delete from main table
    await ctx.db.delete(selected._id);
    
    return selected;
  },
});


// Bulk insert — skips duplicates based on word text
export const bulkInsertWords = mutation({
  args: {
    words: v.array(v.object({
      word: v.string(),
      lang: v.string(),
      forbiddenWords: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;

    for (const item of args.words) {
      // Check if word already exists
      const existing = await ctx.db
        .query("words")
        .withIndex("by_lang", (q) => q.eq("lang", item.lang))
        .filter((q) => q.eq(q.field("word"), item.word))
        .first();

      if (!existing) {
        await ctx.db.insert("words", item);
        inserted++;
      } else {
        skipped++;
      }
    }

    return { inserted, skipped, total: args.words.length };
  },
});

// Get total count of words
export const getWordCount = query({
  args: { lang: v.string() },
  handler: async (ctx, args) => {
    const words = await ctx.db
      .query("words")
      .withIndex("by_lang", (q) => q.eq("lang", args.lang))
      .collect();
    return words.length;
  },
});

// Get recent words to avoid duplicates in generation
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
