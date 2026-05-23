import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

interface Game2State {
  teams: Team[];
  currentTeamIndex: number;
  selectedGroupId: number | null;
  groupWordCount: number;
  usedWords: string[];
  isGameOver: boolean;
  setTeams: (teams: Team[], groupId: number, groupWordCount: number) => void;
  markWordUsed: (word: string) => void;
  addScore: (teamId: string, points: number) => void;
  nextTurn: () => void;
  endGame: () => void;
  resetGame: () => void;
}

export const useGame2Store = create<Game2State>()(
  persist(
    (set) => ({
      teams: [],
      currentTeamIndex: 0,
      selectedGroupId: null,
      groupWordCount: 0,
      usedWords: [],
      isGameOver: false,

      setTeams: (teams, groupId, groupWordCount) =>
        set({
          teams,
          selectedGroupId: groupId,
          groupWordCount,
          usedWords: [],
          isGameOver: false,
          currentTeamIndex: 0,
        }),

      markWordUsed: (word) =>
        set((state) => ({
          usedWords: state.usedWords.includes(word)
            ? state.usedWords
            : [...state.usedWords, word],
        })),

      addScore: (teamId, points) =>
        set((state) => ({
          teams: state.teams.map((team) =>
            team.id === teamId ? { ...team, score: team.score + points } : team
          ),
        })),

      nextTurn: () =>
        set((state) => ({
          currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length,
        })),

      endGame: () => set({ isGameOver: true }),

      resetGame: () =>
        set({
          teams: [],
          currentTeamIndex: 0,
          selectedGroupId: null,
          groupWordCount: 0,
          usedWords: [],
          isGameOver: false,
        }),
    }),
    {
      name: 'party-game2-storage',
    }
  )
);
