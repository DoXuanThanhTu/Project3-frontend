import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "white" | "dark" | "orange";
type Lang = "vi" | "en";

interface AppState {
  theme: Theme;
  lang: Lang;
  setTheme: (theme: Theme) => void;
  setLang: (lang: Lang) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark" as Theme,
      lang: "en" as Lang,
      setTheme: (theme) => set({ theme }),
      setLang: (lang) => set({ lang }),
    }),
    { name: "app-storage" }
  )
);
