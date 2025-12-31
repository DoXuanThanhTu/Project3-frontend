import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "white" | "dark" | "orange";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "white",
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: "theme-storage", // key localStorage
    }
  )
);
