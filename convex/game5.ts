import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new room
export const createRoom = mutation({
  args: {
    playerId: v.string(),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate a random 4-digit code
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    await ctx.db.insert("game5Rooms", {
      roomCode,
      players: [
        {
          id: args.playerId,
          name: args.playerName,
          isHost: true,
          score: 0,
          currentAnswer: null,
          answerTime: null,
        },
      ],
      phase: "lobby",
      selectedPackageId: null,
      currentQuestionIndex: 0,
      questionStartTime: null,
      answersRevealed: false,
      selectedQuestionIds: null,
      previousWinnerId: null,
    });
    
    return roomCode;
  },
});

// Join an existing room
export const joinRoom = mutation({
  args: {
    roomCode: v.string(),
    playerId: v.string(),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("game5Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
      
    if (!room) throw new Error("Room not found");
    if (room.phase !== "lobby" && room.phase !== "playing") throw new Error("Game already started");
    
    // Check if player already in room
    if (room.players.some((p) => p.id === args.playerId)) {
      return; // Already joined
    }
    
    const newPlayers = [
      ...room.players,
      {
        id: args.playerId,
        name: args.playerName,
        isHost: false,
        score: 0,
        currentAnswer: null,
        answerTime: null,
      },
    ];
    
    await ctx.db.patch(room._id, { players: newPlayers });
  },
});

// Start the game with a selected package
export const startGame = mutation({
  args: {
    roomCode: v.string(),
    packageId: v.string(),
    questionIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("game5Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
      
    if (!room) throw new Error("Room not found");
    
    await ctx.db.patch(room._id, {
      phase: "playing",
      selectedPackageId: args.packageId,
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      answersRevealed: false,
      selectedQuestionIds: args.questionIds,
    });
  },
});

// Submit an answer
export const submitAnswer = mutation({
  args: {
    roomCode: v.string(),
    playerId: v.string(),
    answerIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("game5Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
      
    if (!room || room.phase !== "playing" || room.answersRevealed) return;
    
    const now = Date.now();
    const updatedPlayers = room.players.map((p) => {
      if (p.id === args.playerId && p.currentAnswer === null) {
        return { ...p, currentAnswer: args.answerIndex, answerTime: now };
      }
      return p;
    });
    
    await ctx.db.patch(room._id, { players: updatedPlayers });
  },
});

// Reveal answers and calculate scores
export const revealAnswers = mutation({
  args: {
    roomCode: v.string(),
    correctIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("game5Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
      
    if (!room || room.answersRevealed) return;
    
    // Calculate points
    // 1st correct gets 6, 2nd gets 3, 3rd gets 1
    const correctPlayers = room.players
      .filter((p) => p.currentAnswer === args.correctIndex && p.answerTime !== null)
      .sort((a, b) => (a.answerTime!) - (b.answerTime!));
      
    const pointsMap = new Map<string, number>();
    if (correctPlayers.length > 0) pointsMap.set(correctPlayers[0].id, 6);
    if (correctPlayers.length > 1) pointsMap.set(correctPlayers[1].id, 3);
    if (correctPlayers.length > 2) pointsMap.set(correctPlayers[2].id, 1);
    
    const updatedPlayers = room.players.map((p) => {
      const points = pointsMap.get(p.id) || 0;
      return {
        ...p,
        score: p.score + points,
      };
    });
    
    await ctx.db.patch(room._id, {
      players: updatedPlayers,
      answersRevealed: true,
    });
  },
});

// Move to next question
export const nextQuestion = mutation({
  args: {
    roomCode: v.string(),
    isGameOver: v.boolean(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("game5Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
      
    if (!room) return;
    
    if (args.isGameOver) {
      let winnerId = null;
      if (room.players.length > 0) {
        const sorted = [...room.players].sort((a, b) => b.score - a.score);
        if (sorted[0].score > 0) {
          winnerId = sorted[0].id;
        }
      }
      await ctx.db.patch(room._id, { 
        phase: "gameover",
        previousWinnerId: winnerId
      });
    } else {
      // Reset answers and increment index
      const resetPlayers = room.players.map((p) => ({
        ...p,
        currentAnswer: null,
        answerTime: null,
      }));
      
      await ctx.db.patch(room._id, {
        players: resetPlayers,
        currentQuestionIndex: room.currentQuestionIndex + 1,
        questionStartTime: Date.now(),
        answersRevealed: false,
      });
    }
  },
});

// Get room state
export const getRoom = query({
  args: {
    roomCode: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("game5Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
      
    return room;
  },
});

// Restart game to lobby
export const restartToLobby = mutation({
  args: {
    roomCode: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("game5Rooms")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
      
    if (!room) return;
    
    const resetPlayers = room.players.map((p) => ({
      ...p,
      score: 0,
      currentAnswer: null,
      answerTime: null,
    }));
    
    await ctx.db.patch(room._id, {
      phase: "lobby",
      players: resetPlayers,
      selectedPackageId: null,
      currentQuestionIndex: 0,
      questionStartTime: null,
      answersRevealed: false,
      selectedQuestionIds: null,
    });
  },
});

