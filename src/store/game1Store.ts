import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  selectedGroupId: number | null;
  usedPrompts: string[];
  setTeams: (teams: Team[], groupId: number) => void;
  markPromptUsed: (text: string) => void;
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
      selectedGroupId: null,
      usedPrompts: [],

      setTeams: (teams, groupId) =>
        set({
          teams,
          selectedGroupId: groupId,
          usedPrompts: [],
          boxes: initialBoxes,
          currentTeamIndex: 0,
        }),

      markPromptUsed: (text) =>
        set((state) => ({
          usedPrompts: state.usedPrompts.includes(text)
            ? state.usedPrompts
            : [...state.usedPrompts, text],
        })),
      
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
      
      resetGame: () =>
        set({
          teams: [],
          boxes: initialBoxes,
          currentTeamIndex: 0,
          selectedGroupId: null,
          usedPrompts: [],
        }),
    }),
    {
      name: 'party-game1-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
