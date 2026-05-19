import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface Box {
  id: number;
  isUsed: boolean;
  teamId?: string; // Team that opened it
}

interface Game1State {
  teams: Team[];
  boxes: Box[];
  currentTeamIndex: number;
  setTeams: (teams: Team[]) => void;
  openBox: (boxId: number, teamId: string) => void;
  addScore: (teamId: string, points: number) => void;
  nextTurn: () => void;
  resetGame: () => void;
}

const initialBoxes = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  isUsed: false,
}));

export const useGame1Store = create<Game1State>()(
  persist(
    (set) => ({
      teams: [],
      boxes: initialBoxes,
      currentTeamIndex: 0,
      
      setTeams: (teams) => set({ teams, boxes: initialBoxes, currentTeamIndex: 0 }),
      
      openBox: (boxId, teamId) => set((state) => ({
        boxes: state.boxes.map((box) => 
          box.id === boxId ? { ...box, isUsed: true, teamId } : box
        )
      })),
      
      addScore: (teamId, points) => set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId ? { ...team, score: team.score + points } : team
        )
      })),
      
      nextTurn: () => set((state) => ({
        currentTeamIndex: (state.currentTeamIndex + 1) % state.teams.length
      })),
      
      resetGame: () => set({ teams: [], boxes: initialBoxes, currentTeamIndex: 0 }),
    }),
    {
      name: 'party-game1-storage',
    }
  )
);
