"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Report = {
  id: string;
  platform: string;
  category: string;
  description: string;
  reporter_country: string | null;
  image_url: string | null;
  created_at: string;
  verified_count: number;
  disputed_count: number;
};

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Alle");

  const platforms = ["Alle", "TikTok", "Instagram", "Twitter/X", "Facebook", "YouTube", "Telegram", "WhatsApp"];

  useEffect(() => {
    async function load() {
      setLoading(true);

      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filter !== "Alle") {
        query = query.eq("platform", filter);
      }

      const { data, error } = await query;
      console.log("data:", data, "error:", error);
      if (error) {
        console.error("Supabase error:", error);
      }
      if (data) setReports(data);

      const { count } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });
      setTotal(count || 0);

      setLoading(false);
    }
    load();
  }, [filter]);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "gerade eben";
    if (mins < 60) return `vor ${mins} Min.`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    return `vor ${Math.floor(hours / 24)} Tagen`;
  }

  const categoryColors: Record<string, string> = {
    "Falschinformation / Fake News": "text-yellow-400 border-yellow-800 bg-yellow-950/40",
    "Deepfake / KI-generierter Inhalt": "text-purple-400 border-purple-800 bg-purple-950/40",
    "Hassrede / Aufrufe zur Gewalt": "text-red-400 border-red-800 bg-red-950/40",
    "Politische Manipulation": "text-orange-400 border-orange-800 bg-orange-950/40",
    "Gesundheitliche Fehlinformation": "text-green-400 border-green-800 bg-green-950/40",
    "Finanzielle Manipulation": "text-blue-400 border-blue-800 bg-blue-950/40",
    "Kriegspropaganda": "text-rose-400 border-rose-800 bg-rose-950/40",
    "Sonstiges": "text-zinc-400 border-zinc-700 bg-zinc-900",
  };

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

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="text-red-500 text-xs uppercase tracking-widest mb-2">Live</div>
            <h1 className="text-3xl font-bold">Globales Dashboard</h1>
            <p className="text-zinc-500 mt-1">{total.toLocaleString("de-DE")} Meldungen im Netzwerk</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-zinc-400 text-sm">Echtzeit</span>
          </div>
        </div>

        {/* Platform filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-4 py-2 rounded text-sm border transition-colors ${
                filter === p
                  ? "border-red-600 bg-red-600/20 text-white"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Reports */}
        {loading ? (
          <div className="text-center text-zinc-600 py-20">Lade Meldungen...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-zinc-600 mb-4">Noch keine Meldungen.</div>
            <Link href="/report" className="text-red-500 hover:text-red-400 text-sm">
              Erste Meldung einreichen →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-zinc-400 text-sm font-medium">{r.platform}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${categoryColors[r.category] || categoryColors["Sonstiges"]}`}>
                        {r.category}
                      </span>
                      {r.reporter_country && (
                        <span className="text-zinc-600 text-xs">{r.reporter_country}</span>
                      )}
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2">{r.description}</p>
                    {r.image_url && (
                      <img
                        src={r.image_url}
                        alt="Screenshot"
                        className="mt-3 rounded border border-zinc-700 max-h-40 object-cover"
                      />
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-zinc-600 text-xs mb-2">{timeAgo(r.created_at)}</div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-500">✓ {r.verified_count}</span>
                      <span className="text-red-500">✗ {r.disputed_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
