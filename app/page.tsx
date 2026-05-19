"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";

function AgoraLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="4.5" r="1.5" />
      <circle cx="19" cy="8.25" r="1.5" />
      <circle cx="19" cy="15.75" r="1.5" />
      <circle cx="12" cy="19.5" r="1.5" />
      <circle cx="5" cy="15.75" r="1.5" />
      <circle cx="5" cy="8.25" r="1.5" />
    </svg>
  );
}

type RecentReport = { id: string; platform: string; category: string; created_at: string };

const DOT: [string, string][] = [
  ["Fake", "bg-amber-400"],
  ["Falsch", "bg-amber-400"],
  ["Misinform", "bg-amber-400"],
  ["Deepfake", "bg-violet-500"],
  ["KI-", "bg-violet-500"],
  ["AI-", "bg-violet-500"],
  ["Hass", "bg-red-500"],
  ["Hate", "bg-red-500"],
  ["Polit", "bg-orange-400"],
];
function dot(cat: string) {
  for (const [k, cls] of DOT) if (cat.includes(k)) return cls;
  return "bg-slate-300";
}

export default function Home() {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null);
  const [recent, setRecent] = useState<RecentReport[]>([]);

  useEffect(() => {
    async function load() {
      const [c, r] = await Promise.all([
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("spam", false),
        supabase.from("reports").select("id,platform,category,created_at").eq("spam", false)
          .order("created_at", { ascending: false }).limit(6),
      ]);
      setCount(c.count ?? 0);
      setRecent(r.data || []);
    }
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  function ago(d: string) {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return t.ago.just;
    if (m < 60) return `${m}${t.ago.min}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}${t.ago.hour}`;
    return `${Math.floor(h / 24)}${t.ago.day}`;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">

      {/* NAV */}
      <nav className="border-b border-slate-100 px-6 h-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <AgoraLogo size={17} className="text-red-600" />
          <span className="font-serif font-bold text-xl tracking-tight">Agora</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <LangSwitcher />
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 transition-colors">{t.nav.dashboard}</Link>
        </div>
      </nav>

      {/* CENTER */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        <AgoraLogo size={52} className="text-red-600 mb-10" />

        <div className="mb-3">
          {count !== null ? (
            <span className="text-7xl md:text-8xl font-serif font-bold text-slate-900 tabular-nums">
              {count.toLocaleString()}
            </span>
          ) : (
            <span className="text-7xl md:text-8xl font-serif font-bold text-slate-100 select-none">···</span>
          )}
        </div>

        <p className="flex items-center gap-1.5 text-sm text-slate-400 mb-12">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
          {t.hero.reports} · {t.hero.networkActive}
        </p>

        <Link href="/report"
          className="bg-red-600 text-white font-medium text-base px-12 py-4 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors w-full max-w-xs text-center mb-4">
          {t.hero.cta}
        </Link>

        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
          Registry öffnen →
        </Link>
      </div>

      {/* LIVE FEED */}
      {recent.length > 0 && (
        <div className="border-t border-slate-100 shrink-0">
          <div className="max-w-lg mx-auto px-6 py-4 space-y-2.5">
            {recent.map((r) => (
              <Link key={r.id} href={`/report/${r.id}`}
                className="flex items-center gap-3 group">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot(r.category)}`} />
                <span className="text-xs text-slate-400 shrink-0 w-20 truncate">{r.platform}</span>
                <span className="text-xs text-slate-500 flex-1 truncate group-hover:text-slate-800 transition-colors">{r.category}</span>
                <span className="text-xs text-slate-300 shrink-0 font-mono">{ago(r.created_at)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-100 px-6 py-4 text-center shrink-0">
        <div className="flex items-center justify-center gap-5 text-xs text-slate-300">
          <Link href="/report" className="hover:text-slate-500 transition-colors">{t.footer.report}</Link>
          <a href="https://github.com/eliaskoenig24/templer" className="hover:text-slate-500 transition-colors">GitHub</a>
          <span>{t.footer.tagline}</span>
        </div>
      </footer>

    </main>
  );
}
