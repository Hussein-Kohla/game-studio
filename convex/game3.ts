import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRoom = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("game3Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
  },
});

export const createRoom = mutation({
  args: { roomCode: v.string(), playerId: v.string(), playerName: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("game3Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
    
    if (existing) {
      throw new Error("Room already exists");
    }

    await ctx.db.insert("game3Rooms", {
      roomCode: args.roomCode,
      players: [{ id: args.playerId, name: args.playerName, team: "red", isHost: true }],
      phase: "lobby",
      selectedCategory: null,
      cards: [],
      scores: { red: 0, green: 0 },
      secretCards: { red: null, green: null },
      eliminatedCards: { red: [], green: [] },
      winner: null,
      currentTurn: "red",
    });
  },
});

export const joinRoom = mutation({
  args: { roomCode: v.string(), playerId: v.string(), playerName: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("game3Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
    
    if (!room) {
      return false; // Room not found
    }

    if (room.players.length >= 2 && !room.players.find(p => p.id === args.playerId)) {
      return false; // Room full
    }

    if (!room.players.find(p => p.id === args.playerId)) {
      const newPlayers = [...room.players, { id: args.playerId, name: args.playerName, team: "green" as const, isHost: false }];
      await ctx.db.patch(room._id, { players: newPlayers });
    }
    
    return true;
  },
});

export const selectCategory = mutation({
  args: { 
    roomCode: v.string(), 
    category: v.string(), 
    cards: v.array(v.object({
      id: v.string(),
      label: v.string(),
      categoryId: v.string(),
      isMatched: v.optional(v.boolean()),
      isFlipped: v.optional(v.boolean()),
      flippedBy: v.optional(v.union(v.literal('red'), v.literal('green'))),
    }))
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.query("game3Rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode)).first();
    if (room) {
      await ctx.db.patch(room._id, {
        phase: "category",
        selectedCategory: args.category,
        cards: args.cards,
        secretCards: { red: null, green: null },
        eliminatedCards: { red: [], green: [] },
        winner: null,
      });
    }
  },
});

export const startReveal = mutation({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.query("game3Rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode)).first();
    if (room) {
      await ctx.db.patch(room._id, {
        phase: "reveal",
        revealStartTime: Date.now(),
      });
    }
  },
});

export const setSecretCard = mutation({
  args: { roomCode: v.string(), team: v.union(v.literal("red"), v.literal("green")), cardId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.query("game3Rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode)).first();
    if (room) {
      await ctx.db.patch(room._id, {
        secretCards: { ...room.secretCards, [args.team]: args.cardId },
      });
    }
  },
});

export const startTurns = mutation({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.query("game3Rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode)).first();
    if (room) {
      // If someone didn't pick, pick random
      const newSecretCards = { ...room.secretCards };
      if (!newSecretCards.red && room.cards.length > 0) {
        newSecretCards.red = room.cards[Math.floor(Math.random() * room.cards.length)].id;
      }
      if (!newSecretCards.green && room.cards.length > 0) {
        newSecretCards.green = room.cards[Math.floor(Math.random() * room.cards.length)].id;
      }
      
      await ctx.db.patch(room._id, {
        phase: "turns",
        secretCards: newSecretCards,
        currentTurn: "red",
      });
    }
  },
});

export const flipCard = mutation({
  args: { roomCode: v.string(), team: v.union(v.literal("red"), v.literal("green")), cardId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.query("game3Rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode)).first();
    if (room) {
      const eliminated = room.eliminatedCards[args.team] || [];
      const isEliminated = eliminated.includes(args.cardId);
      const newEliminated = isEliminated ? eliminated.filter(id => id !== args.cardId) : [...eliminated, args.cardId];
      
      await ctx.db.patch(room._id, {
        eliminatedCards: { ...room.eliminatedCards, [args.team]: newEliminated }
      });
    }
  },
});

export const guessCard = mutation({
  args: { roomCode: v.string(), guessingTeam: v.union(v.literal("red"), v.literal("green")), cardId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.query("game3Rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode)).first();
    if (room) {
      const opponentTeam = args.guessingTeam === "red" ? "green" : "red";
      const opponentSecret = room.secretCards[opponentTeam];
      
      if (args.cardId === opponentSecret) {
        await ctx.db.patch(room._id, {
          phase: "gameover",
          winner: args.guessingTeam,
          scores: { ...room.scores, [args.guessingTeam]: room.scores[args.guessingTeam] + 1 }
        });
      } else {
        const eliminated = room.eliminatedCards[args.guessingTeam] || [];
        const newEliminated = eliminated.includes(args.cardId) ? eliminated : [...eliminated, args.cardId];

        await ctx.db.patch(room._id, {
          currentTurn: opponentTeam,
          eliminatedCards: { ...room.eliminatedCards, [args.guessingTeam]: newEliminated }
        });
      }
    }
  },
});

export const endTurn = mutation({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.query("game3Rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode)).first();
    if (room) {
      await ctx.db.patch(room._id, {
        currentTurn: room.currentTurn === "red" ? "green" : "red"
      });
    }
  },
});

export const resetGame = mutation({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.query("game3Rooms").withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode)).first();
    if (room) {
      await ctx.db.patch(room._id, {
        phase: "lobby",
        selectedCategory: null,
        cards: [],
        secretCards: { red: null, green: null },
        eliminatedCards: { red: [], green: [] },
        winner: null,
        currentTurn: "red"
      });
    }
  },
});
