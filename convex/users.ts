import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const loginOrRegister = mutation({
  args: {
    name: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existingUser) {
      if (existingUser.password !== args.password) {
        throw new Error("كلمة المرور غير صحيحة");
      }

      // Fetch progress
      let progress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", existingUser._id))
        .first();

      if (!progress) {
        const progressId = await ctx.db.insert("userProgress", {
          userId: existingUser._id,
          game1UsedPrompts: [],
          game2UsedWords: [],
          game4UsedPairs: [],
          game5UsedQuestions: [],
        });
        progress = await ctx.db.get(progressId);
      }

      return { user: existingUser, progress };
    }

    // Register
    const userId = await ctx.db.insert("users", {
      name: args.name,
      password: args.password,
    });

    const progressId = await ctx.db.insert("userProgress", {
      userId,
      game1UsedPrompts: [],
      game2UsedWords: [],
      game4UsedPairs: [],
      game5UsedQuestions: [],
    });

    const newUser = await ctx.db.get(userId);
    const progress = await ctx.db.get(progressId);

    return { user: newUser, progress };
  },
});

export const addProgress = mutation({
  args: {
    userId: v.id("users"),
    game: v.union(v.literal("game1"), v.literal("game2"), v.literal("game4"), v.literal("game5")),
    itemIds: v.array(v.string()), // Can add multiple
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) return;

    const updates: any = {};
    if (args.game === "game1") {
      updates.game1UsedPrompts = Array.from(new Set([...progress.game1UsedPrompts, ...args.itemIds]));
    } else if (args.game === "game2") {
      updates.game2UsedWords = Array.from(new Set([...progress.game2UsedWords, ...args.itemIds]));
    } else if (args.game === "game4") {
      updates.game4UsedPairs = Array.from(new Set([...progress.game4UsedPairs, ...args.itemIds]));
    } else if (args.game === "game5") {
      updates.game5UsedQuestions = Array.from(new Set([...progress.game5UsedQuestions, ...args.itemIds]));
    }

    await ctx.db.patch(progress._id, updates);
    return await ctx.db.get(progress._id);
  },
});

export const clearProgress = mutation({
  args: {
    userId: v.id("users"),
    game: v.union(v.literal("game1"), v.literal("game2"), v.literal("game4"), v.literal("game5")),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!progress) return;

    const updates: any = {};
    if (args.game === "game1") updates.game1UsedPrompts = [];
    if (args.game === "game2") updates.game2UsedWords = [];
    if (args.game === "game4") updates.game4UsedPairs = [];
    if (args.game === "game5") updates.game5UsedQuestions = [];

    await ctx.db.patch(progress._id, updates);
    return await ctx.db.get(progress._id);
  },
});
