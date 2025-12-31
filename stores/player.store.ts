import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlayerState {
  episodeId: string | null;
  currentTime: number;
  duration: number;

  setEpisode: (id: string) => void;
  setTime: (time: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      episodeId: null,
      currentTime: 0,
      duration: 0,

      setEpisode: (id) => set({ episodeId: id, currentTime: 0 }),
      setTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      reset: () =>
        set({
          episodeId: null,
          currentTime: 0,
          duration: 0,
        }),
    }),
    {
      name: "player-storage",
    }
  )
);
