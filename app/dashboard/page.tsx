"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  "Fake News":               { bg: "bg-amber-950/20",   border: "border-amber-800/30",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",   dot: "bg-amber-400" },
  "Deepfake/KI-Inhalte":    { bg: "bg-violet-950/20",  border: "border-violet-800/30",  badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",  dot: "bg-violet-400" },
  "Hassrede/Gewalt":         { bg: "bg-red-950/20",     border: "border-red-800/30",     badge: "bg-red-500/10 text-red-400 border-red-500/20",           dot: "bg-red-400" },
  "Politische Manipulation": { bg: "bg-orange-950/20",  border: "border-orange-800/30",  badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",  dot: "bg-orange-400" },
  "Sonstiges":               { bg: "bg-white/[0.02]",   border: "border-white/8",        badge: "bg-white/5 text-white/40 border-white/10",              dot: "bg-white/30" },
};

function getColor(cat: string) { return COLORS[cat] || COLORS["Sonstiges"]; }

export default function DashboardPage() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [knights, setKnights] = useState<KnightStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  async function load() {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("spam", false)
      .order("created_at", { ascending: false })
      .limit(300);

    const reports: Report[] = data || [];
    setTotal(reports.length);

    const map = new Map<string, Report[]>();
    for (const r of reports) {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    }

    setGroups(
      Array.from(map.entries())
        .map(([cat, reps]) => ({
          category: cat,
          count: reps.length,
          latest: reps[0].created_at,
          reports: reps.slice(0, 3),
          trending: reps.length >= 3,
        }))
        .sort((a, b) => b.count - a.count)
    );

    const km = new Map<string, number>();
    for (const r of reports) {
      if (r.knight_id) km.set(r.knight_id, (km.get(r.knight_id) || 0) + 1);
    }
    setKnights(
      Array.from(km.entries())
        .map(([id, count]) => ({ knight_id: id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    );

    setLastUpdate(new Date());
    setLoading(false);
  }

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  function ago(d: string) {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return "gerade";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className="min-h-screen bg-[#000] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center text-xs font-black">T</div>
          <span className="font-semibold text-sm tracking-widest uppercase text-white/90">Templer</span>
        </Link>
        <a
          href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
          className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
        >
          ⚔️ Installieren
        </a>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 text-xs uppercase tracking-widest">Live</span>
            </div>
            <h1 className="text-4xl font-black">Globales Dashboard</h1>
            <p className="text-white/30 mt-1 text-sm">{total.toLocaleString("de-DE")} Meldungen · aktualisiert {ago(lastUpdate.toISOString())}</p>
          </div>
          <Link href="/report" className="hidden sm:block border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-sm px-5 py-2.5 rounded-full transition-colors">
            + Melden
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Meldungen */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-32 text-white/20 text-sm">Analysiere Netzwerk…</div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <p className="text-white/20 text-sm">Noch keine Meldungen</p>
                <Link href="/report" className="text-red-500 hover:text-red-400 text-sm transition-colors">Erste Meldung einreichen →</Link>
              </div>
            ) : groups.map((g) => {
              const c = getColor(g.category);
              return (
                <div key={g.category} className={`rounded-2xl border ${c.bg} ${c.border} overflow-hidden`}>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                      <span className="font-semibold text-sm">{g.category}</span>
                      {g.trending && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                          Trending
                        </span>
                      )}
                    </div>
                    <span className="text-white/30 text-xs font-mono">{g.count} Meldungen</span>
                  </div>

                  <div className="border-t border-white/5 divide-y divide-white/5">
                    {g.reports.map((r) => (
                      <Link key={r.id} href={`/report/${r.id}`} className="flex items-center justify-between px-5 py-3 gap-4 hover:bg-white/[0.03] transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-[10px] border px-2 py-0.5 rounded-full shrink-0 ${c.badge}`}>{r.platform}</span>
                          <span className="text-white/50 text-sm truncate group-hover:text-white/70 transition-colors">{r.description}</span>
                        </div>
                        <span className="text-white/20 text-xs shrink-0 font-mono">{ago(r.created_at)}</span>
                      </Link>
                    ))}
                    {g.count > 3 && (
                      <div className="px-5 py-2.5 text-white/20 text-xs">
                        +{g.count - 3} weitere
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Knight Leaderboard */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="font-bold text-sm">⚔️ Top Knights</h2>
                <p className="text-white/25 text-xs mt-0.5">Aktivste Melder</p>
              </div>
              {knights.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-white/20 text-xs mb-4">Noch keine Knights mit ID</p>
                  <a
                    href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Shortcut installieren →
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {knights.map((k, i) => (
                    <div key={k.knight_id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-base w-5 text-center">{medals[i] || <span className="text-white/20 text-xs">{i + 1}</span>}</span>
                        <span className="text-sm font-mono text-white/60">Knight-{k.knight_id.slice(-4).toUpperCase()}</span>
                      </div>
                      <span className="text-red-400 text-sm font-bold">{k.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Melden Box */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
              <p className="text-white/40 text-xs mb-4 leading-relaxed">
                Siehst du gerade etwas? Melde es in 10 Sekunden.
              </p>
              <a
                href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
                className="flex items-center justify-center gap-2 w-full bg-white text-black text-sm font-bold py-3 rounded-xl hover:bg-white/90 transition-colors mb-2"
              >
                ⚔️ iOS Shortcut
              </a>
              <Link
                href="/report"
                className="flex items-center justify-center w-full border border-white/10 text-white/50 text-sm py-3 rounded-xl hover:border-white/20 hover:text-white/70 transition-colors"
              >
                Web-Formular
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
