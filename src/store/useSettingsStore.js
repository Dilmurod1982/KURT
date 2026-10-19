import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "../i18n";

const SUPPORTED = ["en", "ru", "uz", "fr", "zh", "de", "ja", "hi", "pt"];

const detectLang = () => {
  const sys = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED.includes(sys) ? sys : "en";
};

export const useSettingsStore = create(
  persist(
    (set) => ({
      lang: detectLang(),
      theme: "light",

      setLang: (lang) => {
        const safe = SUPPORTED.includes(lang) ? lang : "en";
        i18n.changeLanguage(safe);
        set({ lang: safe });
      },

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "kurt-settings",
      // при восстановлении из localStorage синхронизируем i18n
      onRehydrateStorage: () => (state) => {
        if (state?.lang) {
          i18n.changeLanguage(state.lang);
        }
      },
    }
  )
);