import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Game4Player {
  id: string;
  name: string;
  score: number;
  avatarUrl: string;
}

export type Game4Phase = 'reveal' | 'questions' | 'voting' | 'results';

/** أزواج مستخدمة في الجلسة — لكل تصنيف على حدة */
export type UsedPairsByCategory = Record<string, string[]>;

interface Game4State {
  players: Game4Player[];
  winScore: number;
  categoryId: string | null;
  categoryLabel: string | null;
  roundNumber: number;
  imposterId: string | null;
  pairId: string | null;
  civilianWord: string;
  impostorWord: string;
  usedPairsByCategory: UsedPairsByCategory;
  phase: Game4Phase;
  revealIndex: number;
  questionStep: number;
  votingIndex: number;
  votes: Record<string, string>;
  winnerId: string | null;

  setConfig: (players: Game4Player[], winScore: number) => void;
  setCategory: (categoryId: string, categoryLabel: string) => void;
  getUsedPairIds: (categoryId: string) => string[];
  getUsedCount: (categoryId: string) => number;
  startRound: (data: {
    pairId: string;
    word: string;
    impostorWord: string;
    imposterId: string;
  }) => void;
  advanceReveal: () => void;
  advanceQuestion: () => void;
  setVote: (voterId: string, suspectId: string) => void;
  advanceVoting: () => void;
  applyRoundScores: () => void;
  setPhase: (phase: Game4Phase) => void;
  getWinner: () => Game4Player | null;
  resetGame: () => void;
}

const initialState = {
  players: [] as Game4Player[],
  winScore: 5,
  categoryId: null as string | null,
  categoryLabel: null as string | null,
  roundNumber: 0,
  imposterId: null as string | null,
  pairId: null as string | null,
  civilianWord: '',
  impostorWord: '',
  usedPairsByCategory: {} as UsedPairsByCategory,
  phase: 'reveal' as Game4Phase,
  revealIndex: 0,
  questionStep: 0,
  votingIndex: 0,
  votes: {} as Record<string, string>,
  winnerId: null as string | null,
};

export const useGame4Store = create<Game4State>()(
  persist(
    (set, get) => ({
      ...initialState,

      setConfig: (players, winScore) =>
        set((state) => ({
          ...initialState,
          players,
          winScore,
          usedPairsByCategory: state.usedPairsByCategory,
        })),

      setCategory: (categoryId, categoryLabel) =>
        set({ categoryId, categoryLabel }),

      getUsedPairIds: (categoryId) => {
        return get().usedPairsByCategory[categoryId] ?? [];
      },

      getUsedCount: (categoryId) => {
        return (get().usedPairsByCategory[categoryId] ?? []).length;
      },

      startRound: ({ pairId, word, impostorWord, imposterId }) =>
        set((state) => {
          const catId = state.categoryId;
          const prev = catId ? (state.usedPairsByCategory[catId] ?? []) : [];
          const nextUsed =
            catId && !prev.includes(pairId) ? [...prev, pairId] : prev;

          return {
            roundNumber: state.roundNumber + 1,
            pairId,
            civilianWord: word,
            impostorWord,
            imposterId,
            usedPairsByCategory:
              catId
                ? { ...state.usedPairsByCategory, [catId]: nextUsed }
                : state.usedPairsByCategory,
            phase: 'reveal',
            revealIndex: 0,
            questionStep: 0,
            votingIndex: 0,
            votes: {},
          };
        }),

      advanceReveal: () =>
        set((state) => {
          const next = state.revealIndex + 1;
          if (next >= state.players.length) {
            return { revealIndex: next, phase: 'questions', questionStep: 0 };
          }
          return { revealIndex: next };
        }),

      advanceQuestion: () =>
        set((state) => {
          const next = state.questionStep + 1;
          if (next >= state.players.length) {
            return { questionStep: next, phase: 'voting', votingIndex: 0, votes: {} };
          }
          return { questionStep: next };
        }),

      setVote: (voterId, suspectId) =>
        set((state) => ({
          votes: { ...state.votes, [voterId]: suspectId },
        })),

      advanceVoting: () =>
        set((state) => {
          const next = state.votingIndex + 1;
          if (next >= state.players.length) {
            return { votingIndex: next, phase: 'results' };
          }
          return { votingIndex: next };
        }),

      applyRoundScores: () =>
        set((state) => {
          const { imposterId, votes, players, winScore } = state;
          if (!imposterId) return state;

          const updated = players.map((p) => {
            const myVote = votes[p.id];
            if (myVote === imposterId) {
              return { ...p, score: p.score + 1 };
            }
            return p;
          });

          const winner = updated.find((p) => p.score >= winScore);

          return {
            players: updated,
            winnerId: winner?.id ?? null,
          };
        }),

      setPhase: (phase) => set({ phase }),

      getWinner: () => {
        const { players, winScore } = get();
        return players.find((p) => p.score >= winScore) ?? null;
      },

      resetGame: () => set({ ...initialState }),
    }),
    {
      name: 'party-game4-storage',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      migrate: (persisted, version) => {
        if (version !== 0) return persisted as Game4State;
        const s = persisted as Record<string, unknown>;
        const legacy = s.usedPairIds;
        if (Array.isArray(legacy) && s.categoryId && typeof s.categoryId === 'string') {
          return {
            ...s,
            usedPairsByCategory: { [s.categoryId]: legacy },
          } as Game4State;
        }
        return { ...s, usedPairsByCategory: s.usedPairsByCategory ?? {} } as Game4State;
      },
    }
  )
);
