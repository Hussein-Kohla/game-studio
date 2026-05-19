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
  currentWordId: string | null;
  setTeams: (teams: Team[]) => void;
  addScore: (teamId: string, points: number) => void;
  nextTurn: () => void;
  resetGame: () => void;
}

export const useGame2Store = create<Game2State>()(
  persist(
    (set) => ({
      teams: [],
      currentTeamIndex: 0,
      currentWordId: null,
      
      setTeams: (teams) => set({ teams, currentTeamIndex: 0, currentWordId: null }),
      
      addScore: (teamId, points) => set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId ? { ...team, score: team.score + points } : team
        )
      })),
      
      nextTurn: () => set((state) => ({
        currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length
      })),
      
      resetGame: () => set({ teams: [], currentTeamIndex: 0, currentWordId: null }),
    }),
    {
      name: 'party-game2-storage',
    }
  )
);
