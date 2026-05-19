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
});
