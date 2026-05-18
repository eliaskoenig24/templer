"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Report = {
  id: string;
  platform: string;
  category: string;
  description: string;
  image_url: string | null;
  content_url: string | null;
  knight_id: string | null;
  created_at: string;
  spam: boolean;
  verified_count: number;
  disputed_count: number;
};

const COLORS: Record<string, { bg: string; border: string; badge: string; dot: string }> = {
  "Fake News":               { bg: "bg-amber-950/20",  border: "border-amber-800/30",  badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",  dot: "bg-amber-400" },
  "Deepfake/KI-Inhalte":    { bg: "bg-violet-950/20", border: "border-violet-800/30", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20", dot: "bg-violet-400" },
  "Hassrede/Gewalt":         { bg: "bg-red-950/20",    border: "border-red-800/30",    badge: "bg-red-500/10 text-red-400 border-red-500/20",          dot: "bg-red-400" },
  "Politische Manipulation": { bg: "bg-orange-950/20", border: "border-orange-800/30", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", dot: "bg-orange-400" },
};
function getColor(cat: string) { return COLORS[cat] || { bg: "bg-white/[0.02]", border: "border-white/8", badge: "bg-white/5 text-white/40 border-white/10", dot: "bg-white/30" }; }

function ago(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m} Minuten`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Stunden`;
  return `vor ${Math.floor(h / 24)} Tagen`;
}

function TrustBar({ verified, disputed }: { verified: number; disputed: number }) {
  const total = verified + disputed;
  if (total === 0) return null;
  const pct = Math.round((verified / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-white/30 mb-2">
        <span>{pct}% bestätigt</span>
        <span>{total} Stimmen</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct >= 60 ? "bg-green-400" : pct <= 40 ? "bg-red-400" : "bg-amber-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [related, setRelated] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [vote, setVote] = useState<"verified" | "disputed" | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`voted_${id}`);
    if (stored === "verified" || stored === "disputed") setVote(stored);

    async function load() {
      const { data } = await supabase.from("reports").select("*").eq("id", id).single();
      if (data) {
        setReport(data);
        const { data: rel } = await supabase
          .from("reports").select("*")
          .eq("category", data.category).eq("spam", false)
          .neq("id", id).order("created_at", { ascending: false }).limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function castVote(type: "verified" | "disputed") {
    if (vote || !report || voteLoading) return;
    setVoteLoading(true);
    const field = type === "verified" ? "verified_count" : "disputed_count";
    const next = (report[field] || 0) + 1;
    await supabase.from("reports").update({ [field]: next }).eq("id", report.id);
    setReport({ ...report, [field]: next });
    setVote(type);
    localStorage.setItem(`voted_${id}`, type);
    setVoteLoading(false);
  }

  const c = report ? getColor(report.category) : getColor("");

  return (
    <main className="min-h-screen bg-[#000] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center text-xs font-black">T</div>
          <span className="font-semibold text-sm tracking-widest uppercase text-white/90">Templer</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition-colors">← Dashboard</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">

        {loading ? (
          <div className="flex items-center justify-center py-40 text-white/20 text-sm">Lade Meldung…</div>
        ) : !report ? (
          <div className="text-center py-40">
            <p className="text-white/20 mb-4">Meldung nicht gefunden.</p>
            <Link href="/dashboard" className="text-red-400 hover:text-red-300 text-sm">← Zurück zum Dashboard</Link>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/20 mb-8">
              <Link href="/dashboard" className="hover:text-white/40 transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-white/40">{report.category}</span>
            </div>

            {/* Main card */}
            <div className={`rounded-2xl border ${c.border} ${c.bg} overflow-hidden mb-6`}>
              {/* Header */}
              <div className="px-8 py-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                  <span className={`text-xs border px-2.5 py-1 rounded-full ${c.badge}`}>{report.category}</span>
                  <span className={`text-xs border px-2.5 py-1 rounded-full ${c.badge}`}>{report.platform}</span>
                  {report.spam && (
                    <span className="text-xs border border-red-500/20 bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full">Spam</span>
                  )}
                </div>

                <p className="text-white/80 text-lg leading-relaxed mb-5">{report.description}</p>

                <div className="flex items-center gap-6 text-xs text-white/20">
                  <span>{ago(report.created_at)}</span>
                  {report.knight_id && (
                    <span className="font-mono">Knight-{report.knight_id.slice(-4).toUpperCase()}</span>
                  )}
                  {report.content_url && (
                    <a href={report.content_url} target="_blank" rel="noopener noreferrer"
                      className="text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">
                      Quelle →
                    </a>
                  )}
                </div>
              </div>

              {/* Screenshot */}
              {report.image_url && (
                <div className="px-8 py-6 border-b border-white/5">
                  <p className="text-xs text-white/20 uppercase tracking-widest mb-3">Screenshot</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.image_url}
                    alt="Screenshot"
                    className="rounded-xl w-full max-h-96 object-contain bg-black/40"
                  />
                </div>
              )}

              {/* Verification */}
              <div className="px-8 py-6">
                <p className="text-xs text-white/25 uppercase tracking-widest mb-5">Verifikation</p>

                <TrustBar verified={report.verified_count} disputed={report.disputed_count} />

                <div className="flex gap-3 mt-5">
                  {vote ? (
                    <div className={`w-full text-center py-3 rounded-xl text-sm font-bold border ${
                      vote === "verified"
                        ? "border-green-500/30 bg-green-950/20 text-green-400"
                        : "border-red-500/30 bg-red-950/20 text-red-400"
                    }`}>
                      {vote === "verified" ? "✓ Du hast bestätigt" : "✗ Du hast angefochten"}
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => castVote("verified")}
                        disabled={voteLoading}
                        className="flex-1 py-3 rounded-xl text-sm font-bold border border-green-500/20 bg-green-950/10 text-green-400/70 hover:bg-green-950/20 hover:text-green-400 hover:border-green-500/30 transition-all disabled:opacity-40"
                      >
                        ✓ Bestätigen · {report.verified_count}
                      </button>
                      <button
                        onClick={() => castVote("disputed")}
                        disabled={voteLoading}
                        className="flex-1 py-3 rounded-xl text-sm font-bold border border-red-500/20 bg-red-950/10 text-red-400/70 hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
                      >
                        ✗ Anfechten · {report.disputed_count}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="text-xs text-white/20 uppercase tracking-widest mb-4">Weitere Meldungen — {report.category}</p>
                <div className="space-y-2">
                  {related.map((r) => (
                    <Link key={r.id} href={`/report/${r.id}`}
                      className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[10px] border px-2 py-0.5 rounded-full shrink-0 ${getColor(r.category).badge}`}>{r.platform}</span>
                        <span className="text-white/40 text-sm truncate group-hover:text-white/60 transition-colors">{r.description}</span>
                      </div>
                      <span className="text-white/15 text-xs shrink-0 ml-4 font-mono">{ago(r.created_at)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
