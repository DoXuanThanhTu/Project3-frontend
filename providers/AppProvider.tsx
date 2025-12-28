"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/app.store";
import i18n from "@/i18n/messages";

interface AppProviderProps {
  children: React.ReactNode;
  initialTheme?: "white" | "dark" | "orange";
  initialLang?: "vi" | "en";
}

export default function AppProvider({
  children,
  initialTheme,
  initialLang,
}: AppProviderProps) {
  const { theme, lang, setTheme, setLang } = useAppStore();

  // Hydrate Zustand state với SSR initial values
  useEffect(() => {
    if (initialTheme && theme !== initialTheme) setTheme(initialTheme);
    if (initialLang && lang !== initialLang) setLang(initialLang);
  }, [initialTheme, initialLang]);

  // Sync theme + lang DOM
  useEffect(() => {
    const root = document.documentElement;

    // Theme
    root.classList.remove("theme-dark", "theme-orange");
    if (theme !== "white") root.classList.add(`theme-${theme}`);

    // Lang
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
      root.lang = lang;
    }
  }, [theme, lang]);

  return <>{children}</>;
}
