import { PROMPTS } from "./promptsData";
import { WORDS } from "./wordsData";
import { mutation } from "./_generated/server";





export const populate = mutation({
  args: {},
  handler: async (ctx) => {
    let insertedPrompts = 0;
    for (const p of PROMPTS) {
      const existing = await ctx.db
        .query("prompts")
        .filter((q) => q.eq(q.field("text"), p.text))
        .first();
      if (!existing) {
        await ctx.db.insert("prompts", p);
        insertedPrompts++;
      }
    }

    let insertedWords = 0;
    for (const w of WORDS) {
      const existing = await ctx.db
        .query("words")
        .withIndex("by_lang", (q) => q.eq("lang", "ar"))
        .filter((q) => q.eq(q.field("word"), w.word))
        .first();
      if (!existing) {
        await ctx.db.insert("words", w);
        insertedWords++;
      }
    }

    return { insertedPrompts, insertedWords };
  },
});

export const resetAllPrompts = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Delete all existing prompts
    const allPrompts = await ctx.db.query("prompts").collect();
    for (const p of allPrompts) {
      await ctx.db.delete(p._id);
    }
    
    // 2. Delete all used_prompts
    const allUsedPrompts = await ctx.db.query("used_prompts").collect();
    for (const p of allUsedPrompts) {
      await ctx.db.delete(p._id);
    }

    // 3. Insert all new highly detailed prompts
    let inserted = 0;
    for (const p of PROMPTS) {
      await ctx.db.insert("prompts", p);
      inserted++;
    }

    return `Successfully deleted old/used prompts and inserted ${inserted} brand new ultra-detailed prompts!`;
  },
});

export const resetAllWords = mutation({
  args: {},
  handler: async (ctx) => {
    const allWords = await ctx.db.query("words").collect();
    for (const w of allWords) {
      await ctx.db.delete(w._id);
    }
    
    const allUsedWords = await ctx.db.query("used_words").collect();
    for (const w of allUsedWords) {
      await ctx.db.delete(w._id);
    }

    let inserted = 0;
    for (const w of WORDS) {
      await ctx.db.insert("words", w);
      inserted++;
    }

    return `Successfully deleted old/used words and inserted ${inserted} new words!`;
  },
});


