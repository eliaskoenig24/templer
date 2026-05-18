"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";

type Report = {
  id: string;
  platform: string;
  category: string;
  description: string;
  image_url: string | null;
  knight_id: string | null;
  created_at: string;
  spam: boolean;
};

type CategoryGroup = {
  category: string;
  count: number;
  latest: string;
  reports: Report[];
  trending: boolean;
};

type KnightStat = { knight_id: string; count: number };

const COLORS: Record<string, { bg: string; border: string; badge: string; dot: string }> = {
  "Fake News":               { bg: "bg-amber-50",  border: "border-amber-200",  badge: "bg-amber-100 text-amber-700 border-amber-200",  dot: "bg-amber-400" },
  "Falschinformation / Fake News": { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  "Misinformation / Fake News": { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  "Deepfake/KI-Inhalte":    { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  "Deepfake / KI-generierter Inhalt": { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  "Deepfake / AI-generated Content": { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-400" },
  "Hassrede/Gewalt":         { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700 border-red-200",          dot: "bg-red-500" },
  "Hassrede / Aufrufe zur Gewalt": { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  "Hate Speech / Incitement to Violence": { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  "Politische Manipulation": { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  "Political Manipulation":  { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-400" },
};
function getColor(cat: string) {
  return COLORS[cat] || { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" };
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [knights, setKnights] = useState<KnightStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  async function load() {
    const { data } = await supabase
      .from("reports").select("*").eq("spam", false)
      .order("created_at", { ascending: false }).limit(300);
    const reports: Report[] = data || [];
    setTotal(reports.length);
    const map = new Map<string, Report[]>();
    for (const r of reports) {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    }
    setGroups(
      Array.from(map.entries())
        .map(([cat, reps]) => ({ category: cat, count: reps.length, latest: reps[0].created_at, reports: reps.slice(0, 3), trending: reps.length >= 3 }))
        .sort((a, b) => b.count - a.count)
    );
    const km = new Map<string, number>();
    for (const r of reports) { if (r.knight_id) km.set(r.knight_id, (km.get(r.knight_id) || 0) + 1); }
    setKnights(Array.from(km.entries()).map(([id, count]) => ({ knight_id: id, count })).sort((a, b) => b.count - a.count).slice(0, 10));
    setLastUpdate(new Date());
    setLoading(false);
  }

  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, []);

  function ago(d: string) {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return t.ago.just;
    if (m < 60) return `${m}${t.ago.min}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}${t.ago.hour}`;
    return `${Math.floor(h / 24)}${t.ago.day}`;
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-600" aria-hidden="true">
              <circle cx="12" cy="12" r="2.5" /><circle cx="12" cy="4.5" r="1.5" /><circle cx="19" cy="8.25" r="1.5" />
              <circle cx="19" cy="15.75" r="1.5" /><circle cx="12" cy="19.5" r="1.5" /><circle cx="5" cy="15.75" r="1.5" /><circle cx="5" cy="8.25" r="1.5" />
            </svg>
            <span className="font-serif font-bold text-xl tracking-tight">Agora</span>
          </Link>
          <div className="flex items-center gap-5">
            <LangSwitcher />
            <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
              className="text-sm font-medium bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors">
              {t.dashboard.installBtn}
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 text-xs font-medium uppercase tracking-wider">{t.dashboard.liveLabel}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{t.dashboard.title}</h1>
            <p className="text-slate-400 mt-1 text-sm">{total.toLocaleString()} {t.dashboard.meldungen} · {t.dashboard.updatedAgo} {ago(lastUpdate.toISOString())}</p>
          </div>
          <Link href="/report" className="hidden sm:block text-sm font-medium bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-700 transition-colors">
            {t.dashboard.reportBtn}
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Reports list */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-32 text-slate-400 text-sm">{t.dashboard.loading}</div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <p className="text-slate-400 text-sm">{t.dashboard.empty}</p>
                <Link href="/report" className="text-red-600 hover:text-red-700 text-sm transition-colors">{t.dashboard.emptyLink}</Link>
              </div>
            ) : groups.map((g) => {
              const c = getColor(g.category);
              return (
                <div key={g.category} className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                      <span className="font-semibold text-sm text-slate-900">{g.category}</span>
                      {g.trending && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                          {t.dashboard.trending}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-xs">{g.count} {t.dashboard.meldungen}</span>
                  </div>
                  <div className="border-t border-slate-200/60 divide-y divide-slate-200/60 bg-white/60">
                    {g.reports.map((r) => (
                      <Link key={r.id} href={`/report/${r.id}`} className="flex items-center justify-between px-4 py-3 gap-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`text-[10px] border px-2 py-0.5 rounded-full shrink-0 ${c.badge}`}>{r.platform}</span>
                          <span className="text-slate-600 text-sm truncate group-hover:text-slate-900 transition-colors">{r.description}</span>
                        </div>
                        <span className="text-slate-400 text-xs shrink-0 font-mono">{ago(r.created_at)}</span>
                      </Link>
                    ))}
                    {g.count > 3 && (
                      <div className="px-4 py-2 text-slate-400 text-xs">+{g.count - 3} {t.dashboard.mehr}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h2 className="font-semibold text-sm text-slate-900">{t.dashboard.topKnights}</h2>
                <p className="text-slate-400 text-xs mt-0.5">{t.dashboard.aktivste}</p>
              </div>
              {knights.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-slate-400 text-xs mb-3">{t.dashboard.noKnights}</p>
                  <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db" className="text-xs text-red-600 hover:text-red-700 transition-colors">
                    {t.dashboard.shortcutLink}
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {knights.map((k, i) => (
                    <div key={k.knight_id} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm w-5 text-center">{medals[i] || <span className="text-slate-400 text-xs">{i + 1}</span>}</span>
                        <span className="text-sm font-mono text-slate-600">Knight-{k.knight_id.slice(-4).toUpperCase()}</span>
                      </div>
                      <span className="text-red-600 text-sm font-semibold">{k.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-slate-500 text-xs mb-4 leading-relaxed">{t.dashboard.meldBox}</p>
              <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
                className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-700 transition-colors mb-2">
                {t.dashboard.iosShortcut}
              </a>
              <Link href="/report" className="flex items-center justify-center w-full border border-slate-200 text-slate-600 text-sm py-2.5 rounded-md hover:border-slate-300 hover:text-slate-900 transition-colors">
                {t.dashboard.webForm}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
