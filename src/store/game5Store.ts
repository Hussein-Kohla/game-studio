import { create } from 'zustand';

export const useGame5Store = create<{
  roomCode: string | null;
  myPlayerId: string | null;
  myName: string | null;
  isHost: boolean;
  setRoomCode: (code: string | null) => void;
  setMyPlayerId: (id: string | null) => void;
  setMyName: (name: string | null) => void;
  setIsHost: (host: boolean) => void;
  reset: () => void;
}>((set) => ({
  roomCode: null,
  myPlayerId: null,
  myName: null,
  isHost: false,
  setRoomCode: (code) => set({ roomCode: code }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setMyName: (name) => set({ myName: name }),
  setIsHost: (host) => set({ isHost: host }),
  reset: () => set({ roomCode: null, myPlayerId: null, myName: null, isHost: false }),
}));

export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 9);
}
