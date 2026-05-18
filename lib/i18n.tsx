"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang, T } from "./translations";

type I18nContext = { t: T; lang: Lang; setLang: (l: Lang) => void };

const Ctx = createContext<I18nContext>({ t: translations.en, lang: "en", setLang: () => {} });

// Maps browser language codes to our supported languages
const LANG_MAP: Record<string, Lang> = {
  de: "de",
  en: "en",
  es: "es",
  ca: "es", // Catalan → Spanish
  gl: "es", // Galician → Spanish
  fr: "fr",
  pt: "pt",
  ru: "ru",
  uk: "ru", // Ukrainian → Russian (closest available)
  be: "ru", // Belarusian → Russian
  ar: "ar",
  zh: "zh",
  hi: "hi",
  mr: "hi", // Marathi → Hindi (closest available)
  id: "id",
  ms: "id", // Malay → Indonesian (mutually intelligible)
  tr: "tr",
};

function detect(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("agora_lang") as Lang | null;
  if (stored && translations[stored]) return stored;
  // navigator.languages gives all preferred languages in order
  for (const lang of navigator.languages) {
    const code = lang.slice(0, 2).toLowerCase();
    if (LANG_MAP[code]) return LANG_MAP[code];
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detect());
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("agora_lang", l);
  }

  return (
    <Ctx.Provider value={{ t: translations[lang], lang, setLang }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTranslation() {
  return useContext(Ctx);
}

const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: "de", label: "DE", native: "Deutsch" },
  { code: "en", label: "EN", native: "English" },
  { code: "es", label: "ES", native: "Español" },
  { code: "fr", label: "FR", native: "Français" },
  { code: "pt", label: "PT", native: "Português" },
  { code: "ru", label: "RU", native: "Русский" },
  { code: "ar", label: "AR", native: "العربية" },
  { code: "zh", label: "ZH", native: "中文" },
  { code: "hi", label: "HI", native: "हिन्दी" },
  { code: "id", label: "ID", native: "Bahasa Indonesia" },
  { code: "tr", label: "TR", native: "Türkçe" },
];

export function LangSwitcher() {
  const { lang, setLang } = useTranslation();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className="text-[11px] bg-white text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded px-2 py-1 cursor-pointer transition-colors outline-none appearance-none"
    >
      {LANGS.map((l) => (
        <option key={l.code} value={l.code} className="bg-white text-slate-900">
          {l.label} · {l.native}
        </option>
      ))}
    </select>
  );
}
