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
  verified_count: number;
  disputed_count: number;
  spam: boolean;
};

type CategoryGroup = {
  category: string;
  count: number;
  latest: string;
  reports: Report[];
  trending: boolean;
};

type KnightStat = {
  knight_id: string;
  count: number;
};

export default function DashboardPage() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [knights, setKnights] = useState<KnightStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Alle echten Meldungen laden (kein Spam)
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("spam", false)
        .order("created_at", { ascending: false })
        .limit(200);

      const reports: Report[] = data || [];
      setTotal(reports.length);

      // Automatisch nach Kategorie gruppieren
      const groupMap = new Map<string, Report[]>();
      for (const r of reports) {
        if (!groupMap.has(r.category)) groupMap.set(r.category, []);
        groupMap.get(r.category)!.push(r);
      }

      // Gruppen sortieren: meiste Meldungen zuerst
      const grouped: CategoryGroup[] = Array.from(groupMap.entries())
        .map(([category, reps]) => ({
          category,
          count: reps.length,
          latest: reps[0].created_at,
          reports: reps.slice(0, 3), // nur die 3 neuesten anzeigen
          trending: reps.length >= 3, // ab 3 Meldungen = trending
        }))
        .sort((a, b) => b.count - a.count || new Date(b.latest).getTime() - new Date(a.latest).getTime());

      setGroups(grouped);

      // Knight-Rangliste berechnen
      const knightMap = new Map<string, number>();
      for (const r of reports) {
        if (r.knight_id) {
          knightMap.set(r.knight_id, (knightMap.get(r.knight_id) || 0) + 1);
        }
      }
      const knightList: KnightStat[] = Array.from(knightMap.entries())
        .map(([knight_id, count]) => ({ knight_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setKnights(knightList);
      setLoading(false);
    }
    load();

    // Alle 30 Sekunden automatisch aktualisieren
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "gerade eben";
    if (mins < 60) return `vor ${mins} Min.`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    return `vor ${Math.floor(hours / 24)} Tagen`;
  }

  function knightName(id: string) {
    return `Knight-${id.slice(-4).toUpperCase()}`;
  }

  const categoryColors: Record<string, string> = {
    "Fake News": "border-yellow-700 bg-yellow-950/30 text-yellow-400",
    "Deepfake/KI-Inhalte": "border-purple-700 bg-purple-950/30 text-purple-400",
    "Hassrede/Gewalt": "border-red-700 bg-red-950/30 text-red-400",
    "Politische Manipulation": "border-orange-700 bg-orange-950/30 text-orange-400",
    "Sonstiges": "border-zinc-700 bg-zinc-900 text-zinc-400",
  };

  const rankEmoji = ["🥇", "🥈", "🥉", "4.", "5.", "6.", "7.", "8.", "9.", "10."];

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center font-bold text-sm">T</div>
          <span className="font-semibold tracking-widest text-sm uppercase">Templer</span>
        </Link>
        <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded transition-colors">
          Melden
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="text-red-500 text-xs uppercase tracking-widest mb-2">Live</div>
            <h1 className="text-3xl font-bold">Globales Dashboard</h1>
            <p className="text-zinc-500 mt-1">{total.toLocaleString("de-DE")} verifizierte Meldungen</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-zinc-400 text-sm">Aktualisiert alle 30s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Hauptbereich: Kategorien-Gruppen */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center text-zinc-600 py-20">Analysiere Meldungen...</div>
            ) : groups.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-zinc-600 mb-4">Noch keine Meldungen.</div>
                <Link href="/report" className="text-red-500 hover:text-red-400 text-sm">
                  Erste Meldung einreichen →
                </Link>
              </div>
            ) : (
              groups.map((g) => (
                <div key={g.category} className={`border rounded-lg overflow-hidden ${categoryColors[g.category] || categoryColors["Sonstiges"]}`}>
                  {/* Gruppen-Header */}
                  <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{g.category}</span>
                      {g.trending && (
                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                          TRENDING
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold">
                      {g.count} {g.count === 1 ? "Meldung" : "Meldungen"}
                    </div>
                  </div>

                  {/* Neueste Meldungen in dieser Gruppe */}
                  <div className="divide-y divide-white/5">
                    {g.reports.map((r) => (
                      <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-white/40">{r.platform}</span>
                          </div>
                          <p className="text-sm text-white/70 truncate">{r.description}</p>
                        </div>
                        <span className="text-xs text-white/30 shrink-0">{timeAgo(r.created_at)}</span>
                      </div>
                    ))}
                    {g.count > 3 && (
                      <div className="px-5 py-2 text-xs text-white/30">
                        + {g.count - 3} weitere Meldungen
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Seitenleiste: Knight-Rangliste */}
          <div className="space-y-4">
            <div className="border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                <span className="text-lg">⚔️</span>
                <span className="font-semibold">Top Knights</span>
              </div>

              {knights.length === 0 ? (
                <div className="px-5 py-6 text-zinc-600 text-sm text-center">
                  Noch keine Knights mit Account.<br />
                  <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db" className="text-red-500 hover:text-red-400 mt-2 inline-block">
                    Shortcut installieren →
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {knights.map((k, i) => (
                    <div key={k.knight_id} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm w-6">{rankEmoji[i]}</span>
                        <span className="text-sm font-mono text-zinc-300">{knightName(k.knight_id)}</span>
                      </div>
                      <span className="text-sm text-red-400 font-bold">{k.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schnell-Melden Box */}
            <div className="border border-zinc-800 rounded-lg p-5">
              <p className="text-sm text-zinc-400 mb-4">Etwas gesehen? Sofort melden:</p>
              <a
                href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
                className="block w-full text-center bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-3 rounded transition-colors mb-2"
              >
                ⚔️ iOS Shortcut
              </a>
              <Link
                href="/report"
                className="block w-full text-center border border-zinc-700 hover:border-zinc-500 text-zinc-400 text-sm py-3 rounded transition-colors"
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
