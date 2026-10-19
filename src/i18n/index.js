import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";
import fr from "./locales/fr.json";
import zh from "./locales/zh.json";
import de from "./locales/de.json";
import ja from "./locales/ja.json";
import hi from "./locales/hi.json";
import pt from "./locales/pt.json";
// ... импортируйте остальные

const SUPPORTED = ["en","ru","uz","fr","zh","de","ja","hi","pt"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
        en: { translation: en },
        ru: { translation: ru },
        uz: { translation: uz },
        fr: { translation: fr },
        zh: { translation: zh },
        de: { translation: de },
        ja: { translation: ja },
        hi: { translation: hi },
        pt: { translation: pt },
      },
    fallbackLng: "en",
    supportedLngs: SUPPORTED,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "kurt-lang",
    },
    interpolation: { escapeValue: false },
  });

export default i18n;