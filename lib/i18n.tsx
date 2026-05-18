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
};

function detect(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("templer_lang") as Lang | null;
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
    localStorage.setItem("templer_lang", l);
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

const LANGS: { code: Lang; label: string }[] = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
  { code: "pt", label: "PT" },
];

export function LangSwitcher() {
  const { lang, setLang } = useTranslation();
  return (
    <div className="flex items-center gap-0.5">
      {LANGS.map((l, i) => (
        <span key={l.code} className="flex items-center">
          <button
            onClick={() => setLang(l.code)}
            className={`text-[11px] px-1.5 py-0.5 rounded transition-colors ${lang === l.code ? "text-white font-bold" : "text-white/20 hover:text-white/50"}`}
          >
            {l.label}
          </button>
          {i < LANGS.length - 1 && <span className="text-white/10 text-[10px]">·</span>}
        </span>
      ))}
    </div>
  );
}
