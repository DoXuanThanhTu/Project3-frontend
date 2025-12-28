import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "vi" | "en";

export const useLangStore = create(
  persist(
    (set) => ({
      lang: "vi",
      setLang: (lang: Lang) => set({ lang }),
    }),
    {
      name: "lang-storage",
    }
  )
);
