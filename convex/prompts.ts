import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Pop a random prompt (get it, move to used_prompts, and return it)
export const popRandomPrompt = mutation({
  args: {},
  handler: async (ctx) => {
    const prompts = await ctx.db.query("prompts").collect();
    if (prompts.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * prompts.length);
    const selected = prompts[randomIndex];

    await ctx.db.insert("used_prompts", {
      text: selected.text,
      textEn: selected.textEn,
    });
    
    await ctx.db.delete(selected._id);

    return selected;
  },
});


// Bulk insert prompts — skips duplicates based on Arabic text
export const bulkInsertPrompts = mutation({
  args: {
    prompts: v.array(v.object({
      text: v.string(),
      textEn: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;

    for (const item of args.prompts) {
      const existing = await ctx.db
        .query("prompts")
        .filter((q) => q.eq(q.field("text"), item.text))
        .first();

      if (!existing) {
        await ctx.db.insert("prompts", { text: item.text, textEn: item.textEn });
        inserted++;
      } else {
        skipped++;
      }
    }

    return { inserted, skipped, total: args.prompts.length };
  },
});

// Get total count
export const getPromptCount = query({
  args: {},
  handler: async (ctx) => {
    const prompts = await ctx.db.query("prompts").collect();
    return prompts.length;
  },
});

// Get recent prompts to avoid duplicates in generation
export const getRecentPrompts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const prompts = await ctx.db
      .query("prompts")
      .order("desc")
      .take(limit);
    return prompts.map((p) => p.text);
  },
});

// Restore all used prompts back to active prompts table
export const restoreAllUsedPrompts = mutation({
  args: {},
  handler: async (ctx) => {
    const used = await ctx.db.query("used_prompts").collect();
    let restored = 0;
    
    for (const item of used) {
      const existing = await ctx.db
        .query("prompts")
        .filter((q) => q.eq(q.field("text"), item.text))
        .first();
        
      if (!existing) {
        await ctx.db.insert("prompts", {
          text: item.text,
          textEn: item.textEn,
        });
        restored++;
      }
      
      await ctx.db.delete(item._id);
    }
    
    return { restored };
  },
});
