"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang, T } from "./translations";

type I18nContext = { t: T; lang: Lang; setLang: (l: Lang) => void };

const Ctx = createContext<I18nContext>({ t: translations.de, lang: "de", setLang: () => {} });

function detect(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("templer_lang") as Lang | null;
  if (stored && translations[stored]) return stored;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  return browser === "de" ? "de" : "en";
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

export function LangSwitcher() {
  const { lang, setLang } = useTranslation();
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setLang("de")}
        className={`text-xs px-2 py-1 rounded transition-colors ${lang === "de" ? "text-white" : "text-white/25 hover:text-white/50"}`}
      >
        DE
      </button>
      <span className="text-white/10 text-xs">|</span>
      <button
        onClick={() => setLang("en")}
        className={`text-xs px-2 py-1 rounded transition-colors ${lang === "en" ? "text-white" : "text-white/25 hover:text-white/50"}`}
      >
        EN
      </button>
    </div>
  );
}
