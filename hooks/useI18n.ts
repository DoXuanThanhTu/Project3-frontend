"use client";
import { useEffect } from "react";
import { useAppStore } from "@/stores/app.store";
import i18n from "@/i18n/messages";

export function useI18n() {
  const lang = useAppStore((s) => s.lang);
  const { t } = i18n;

  // Đúng: chỉ thay đổi i18n trong effect
  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  return t;
}
