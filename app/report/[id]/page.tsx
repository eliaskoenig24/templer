"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";

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

function TrustBar({ verified, disputed, t }: { verified: number; disputed: number; t: { votes: string; confirmedPct: string } }) {
  const total = verified + disputed;
  if (total === 0) return null;
  const pct = Math.round((verified / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        <span>{pct}{t.confirmedPct}</span>
        <span>{total} {t.votes}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 60 ? "bg-green-500" : pct <= 40 ? "bg-red-500" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
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
        const { data: rel } = await supabase.from("reports").select("*")
          .eq("category", data.category).eq("spam", false).neq("id", id)
          .order("created_at", { ascending: false }).limit(4);
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

  function ago(d: string) {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return t.detail.justNow;
    if (m < 60) return t.detail.minutesAgo.replace("{n}", String(m));
    const h = Math.floor(m / 60);
    if (h < 24) return t.detail.hoursAgo.replace("{n}", String(h));
    return t.detail.daysAgo.replace("{n}", String(Math.floor(h / 24)));
  }

  const c = report ? getColor(report.category) : getColor("");

  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-600" aria-hidden="true">
              <circle cx="12" cy="12" r="2.5" /><circle cx="12" cy="4.5" r="1.5" /><circle cx="19" cy="8.25" r="1.5" />
              <circle cx="19" cy="15.75" r="1.5" /><circle cx="12" cy="19.5" r="1.5" /><circle cx="5" cy="15.75" r="1.5" /><circle cx="5" cy="8.25" r="1.5" />
            </svg>
            <span className="font-serif font-bold text-xl tracking-tight">Agora</span>
          </Link>
          <div className="flex items-center gap-5">
            <LangSwitcher />
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{t.detail.back}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-40 text-slate-400 text-sm">{t.detail.loading}</div>
        ) : !report ? (
          <div className="text-center py-40">
            <p className="text-slate-400 mb-4">{t.detail.notFound}</p>
            <Link href="/dashboard" className="text-red-600 hover:text-red-700 text-sm">{t.detail.back}</Link>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Link href="/dashboard" className="hover:text-slate-600 transition-colors">{t.detail.back.replace("← ", "")}</Link>
              <span>/</span>
              <span className="text-slate-600">{report.category}</span>
            </div>

            {/* Main card */}
            <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden mb-6`}>
              <div className="px-6 py-5 border-b border-slate-200/60">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                  <span className={`text-xs border px-2.5 py-1 rounded-full ${c.badge}`}>{report.category}</span>
                  <span className={`text-xs border px-2.5 py-1 rounded-full ${c.badge}`}>{report.platform}</span>
                  {report.spam && <span className="text-xs border border-red-200 bg-red-100 text-red-600 px-2.5 py-1 rounded-full">{t.detail.spam}</span>}
                </div>
                <p className="text-slate-800 text-lg leading-relaxed mb-4">{report.description}</p>
                <div className="flex items-center gap-5 text-xs text-slate-400 flex-wrap">
                  <span>{ago(report.created_at)}</span>
                  {report.knight_id && <span className="font-mono">Knight-{report.knight_id.slice(-4).toUpperCase()}</span>}
                  {report.content_url && (
                    <a href={report.content_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 transition-colors underline underline-offset-2">
                      {t.detail.source}
                    </a>
                  )}
                </div>
              </div>

              {report.image_url && (
                <div className="px-6 py-5 border-b border-slate-200/60">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">{t.detail.screenshot}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={report.image_url} alt="Screenshot" className="rounded-lg w-full max-h-96 object-contain bg-slate-100" />
                </div>
              )}

              {/* Verification */}
              <div className="px-6 py-5 bg-white/60">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">{t.detail.verification}</p>
                <TrustBar verified={report.verified_count} disputed={report.disputed_count} t={t.detail} />
                <div className="flex gap-3 mt-4">
                  {vote ? (
                    <div className={`w-full text-center py-2.5 rounded-lg text-sm font-medium border ${vote === "verified" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                      {vote === "verified" ? t.detail.confirmed : t.detail.disputed}
                    </div>
                  ) : (
                    <>
                      <button onClick={() => castVote("verified")} disabled={voteLoading}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300 transition-all disabled:opacity-40">
                        {t.detail.confirm} · {report.verified_count}
                      </button>
                      <button onClick={() => castVote("disputed")} disabled={voteLoading}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-40">
                        {t.detail.dispute} · {report.disputed_count}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">{t.detail.related} — {report.category}</p>
                <div className="space-y-2">
                  {related.map((r) => (
                    <Link key={r.id} href={`/report/${r.id}`}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[10px] border px-2 py-0.5 rounded-full shrink-0 ${getColor(r.category).badge}`}>{r.platform}</span>
                        <span className="text-slate-600 text-sm truncate group-hover:text-slate-900 transition-colors">{r.description}</span>
                      </div>
                      <span className="text-slate-400 text-xs shrink-0 ml-4 font-mono">{ago(r.created_at)}</span>
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
