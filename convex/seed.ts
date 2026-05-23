import { PROMPTS } from "./promptsData";
import { WORDS } from "./wordsData";
import { mutation } from "./_generated/server";
import { GROUP_SIZE } from "./schema";

function assignGroupIds<T>(items: T[]): Array<T & { groupId: number }> {
  return items.map((item, index) => ({
    ...item,
    groupId: Math.floor(index / GROUP_SIZE) + 1,
  }));
}

export const populate = mutation({
  args: {},
  handler: async (ctx) => {
    let insertedPrompts = 0;
    for (const p of assignGroupIds(PROMPTS)) {
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
    for (const w of assignGroupIds(WORDS)) {
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

/** Assign groupId to existing rows (50 per group). Safe to run after schema change. */
export const migrateToGroups = mutation({
  args: {},
  handler: async (ctx) => {
    const prompts = await ctx.db.query("prompts").collect();
    prompts.sort((a, b) => a._creationTime - b._creationTime);

    let promptPatches = 0;
    for (let i = 0; i < prompts.length; i++) {
      const groupId = Math.floor(i / GROUP_SIZE) + 1;
      if (prompts[i].groupId !== groupId) {
        await ctx.db.patch(prompts[i]._id, { groupId });
        promptPatches++;
      }
    }

    const words = await ctx.db.query("words").collect();
    const langs = [...new Set(words.map((w) => w.lang))];
    let wordPatches = 0;

    for (const lang of langs) {
      const langWords = words
        .filter((w) => w.lang === lang)
        .sort((a, b) => a._creationTime - b._creationTime);

      for (let i = 0; i < langWords.length; i++) {
        const groupId = Math.floor(i / GROUP_SIZE) + 1;
        if (langWords[i].groupId !== groupId) {
          await ctx.db.patch(langWords[i]._id, { groupId });
          wordPatches++;
        }
      }
    }

    return {
      promptPatches,
      wordPatches,
      promptGroups: Math.ceil(prompts.length / GROUP_SIZE),
      wordGroups: langs.map((lang) => ({
        lang,
        groups: Math.ceil(words.filter((w) => w.lang === lang).length / GROUP_SIZE),
      })),
    };
  },
});

/** Wipe and re-insert catalog with groupId (run once after schema migration). */
export const reseedCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    const allPrompts = await ctx.db.query("prompts").collect();
    for (const p of allPrompts) {
      await ctx.db.delete(p._id);
    }

    const allWords = await ctx.db.query("words").collect();
    for (const w of allWords) {
      await ctx.db.delete(w._id);
    }

    let insertedPrompts = 0;
    for (const p of assignGroupIds(PROMPTS)) {
      await ctx.db.insert("prompts", p);
      insertedPrompts++;
    }

    let insertedWords = 0;
    for (const w of assignGroupIds(WORDS)) {
      await ctx.db.insert("words", w);
      insertedWords++;
    }

    return {
      insertedPrompts,
      insertedWords,
      promptGroups: Math.ceil(PROMPTS.length / GROUP_SIZE),
      wordGroups: Math.ceil(WORDS.length / GROUP_SIZE),
    };
  },
});
