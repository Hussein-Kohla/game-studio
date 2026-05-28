import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Id } from '../../convex/_generated/dataModel';

export interface User {
  _id: Id<"users">;
  name: string;
}

export interface UserProgress {
  game1UsedPrompts: string[];
  game2UsedWords: string[];
  game4UsedPairs: string[];
  game5UsedQuestions: string[];
}

interface AuthState {
  user: User | null;
  progress: UserProgress | null;
  login: (user: User, progress: UserProgress) => void;
  logout: () => void;
  setProgress: (progress: UserProgress) => void;
  addLocalProgress: (game: 'game1' | 'game2' | 'game4' | 'game5', itemIds: string[]) => void;
  clearLocalProgress: (game: 'game1' | 'game2' | 'game4' | 'game5') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      progress: null,
      login: (user, progress) => set({ user, progress }),
      logout: () => set({ user: null, progress: null }),
      setProgress: (progress) => set({ progress }),
      addLocalProgress: (game, itemIds) => set((state) => {
        if (!state.progress) return state;
        const newProgress = { ...state.progress };
        if (game === 'game1') newProgress.game1UsedPrompts = Array.from(new Set([...newProgress.game1UsedPrompts, ...itemIds]));
        if (game === 'game2') newProgress.game2UsedWords = Array.from(new Set([...newProgress.game2UsedWords, ...itemIds]));
        if (game === 'game4') newProgress.game4UsedPairs = Array.from(new Set([...newProgress.game4UsedPairs, ...itemIds]));
        if (game === 'game5') newProgress.game5UsedQuestions = Array.from(new Set([...newProgress.game5UsedQuestions, ...itemIds]));
        return { progress: newProgress };
      }),
      clearLocalProgress: (game) => set((state) => {
        if (!state.progress) return state;
        const newProgress = { ...state.progress };
        if (game === 'game1') newProgress.game1UsedPrompts = [];
        if (game === 'game2') newProgress.game2UsedWords = [];
        if (game === 'game4') newProgress.game4UsedPairs = [];
        if (game === 'game5') newProgress.game5UsedQuestions = [];
        return { progress: newProgress };
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
