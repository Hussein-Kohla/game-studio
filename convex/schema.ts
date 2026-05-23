import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  words: defineTable({
    word: v.string(),
    lang: v.string(), // "ar" or "en"
    forbiddenWords: v.array(v.string()),
  }).index("by_lang", ["lang"]),
  
  used_words: defineTable({
    word: v.string(),
    lang: v.string(),
    forbiddenWords: v.array(v.string()),
  }),
  
  prompts: defineTable({
    text: v.string(),        // Arabic display text
    textEn: v.string(),      // English text for image generation
  }),

  used_prompts: defineTable({
    text: v.string(),
    textEn: v.string(),
  }),
  
  gameState: defineTable({
    gameId: v.string(),
    teams: v.any(),
    scores: v.any(),
    state: v.any(),
  }).index("by_gameId", ["gameId"]),

  game3Rooms: defineTable({
    roomCode: v.string(),
    players: v.array(v.object({
      id: v.string(),
      name: v.string(),
      team: v.union(v.literal('red'), v.literal('green')),
      isHost: v.boolean(),
    })),
    phase: v.union(v.literal('lobby'), v.literal('category'), v.literal('reveal'), v.literal('turns'), v.literal('gameover')),
    selectedCategory: v.union(v.string(), v.null()),
    cards: v.array(v.object({
      id: v.string(),
      label: v.string(),
      categoryId: v.string(),
      isMatched: v.optional(v.boolean()),
      isFlipped: v.optional(v.boolean()),
      flippedBy: v.optional(v.union(v.literal('red'), v.literal('green'))),
    })),
    scores: v.object({
      red: v.number(),
      green: v.number(),
    }),
    secretCards: v.object({
      red: v.union(v.string(), v.null()),
      green: v.union(v.string(), v.null()),
    }),
    eliminatedCards: v.object({
      red: v.array(v.string()),
      green: v.array(v.string()),
    }),
    winner: v.union(v.literal('red'), v.literal('green'), v.null()),
    currentTurn: v.union(v.literal('red'), v.literal('green')),
    revealStartTime: v.optional(v.number()), // To sync the countdown
  }).index("by_roomCode", ["roomCode"]),
});
