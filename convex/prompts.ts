import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { GROUP_SIZE } from "./schema";

export const getPromptGroups = query({
  args: {},
  handler: async (ctx) => {
    const prompts = await ctx.db.query("prompts").collect();
    const counts = new Map<number, number>();
    for (const p of prompts) {
      if (p.groupId === undefined) continue;
      counts.set(p.groupId, (counts.get(p.groupId) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a - b)
      .map(([groupId, count]) => ({ groupId, count }));
  },
});

export const popRandomPrompt = mutation({
  args: {
    groupId: v.number(),
    exclude: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const excludeSet = new Set(args.exclude ?? []);
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const available = prompts.filter((p) => !excludeSet.has(p.text));
    if (available.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * available.length);
    const selected = available[randomIndex];
    return {
      text: selected.text,
      textEn: selected.textEn,
      remaining: available.length - 1,
    };
  },
});

export const bulkInsertPrompts = mutation({
  args: {
    prompts: v.array(v.object({
      text: v.string(),
      textEn: v.string(),
    })),
    groupId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;
    let targetGroupId = args.groupId;

    if (targetGroupId === undefined) {
      const all = await ctx.db.query("prompts").collect();
      const withGroup = all.filter((p) => p.groupId !== undefined);
      if (withGroup.length === 0) {
        targetGroupId = 1;
      } else {
        const maxGroup = Math.max(...withGroup.map((p) => p.groupId!));
        const inMax = withGroup.filter((p) => p.groupId === maxGroup).length;
        targetGroupId = inMax >= GROUP_SIZE ? maxGroup + 1 : maxGroup;
      }
    }

    for (const item of args.prompts) {
      const existing = await ctx.db
        .query("prompts")
        .filter((q) => q.eq(q.field("text"), item.text))
        .first();

      if (!existing) {
        await ctx.db.insert("prompts", {
          text: item.text,
          textEn: item.textEn,
          groupId: targetGroupId,
        });
        inserted++;
      } else {
        skipped++;
      }
    }

    return { inserted, skipped, total: args.prompts.length, groupId: targetGroupId };
  },
});

export const getPromptCount = query({
  args: { groupId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (args.groupId !== undefined) {
      const prompts = await ctx.db
        .query("prompts")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId!))
        .collect();
      return prompts.length;
    }
    const prompts = await ctx.db.query("prompts").collect();
    return prompts.length;
  },
});

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
