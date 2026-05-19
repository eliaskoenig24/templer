"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";

function AgoraLogo({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" /><circle cx="12" cy="4.5" r="1.5" />
      <circle cx="19" cy="8.25" r="1.5" /><circle cx="19" cy="15.75" r="1.5" />
      <circle cx="12" cy="19.5" r="1.5" /><circle cx="5" cy="15.75" r="1.5" /><circle cx="5" cy="8.25" r="1.5" />
    </svg>
  );
}

type Report = {
  id: string;
  platform: string;
  category: string;
  description: string;
  created_at: string;
  verified_count: number;
  disputed_count: number;
  reporter_country: string | null;
};

type Status = "verified" | "disputed" | "pending";

function getStatus(v: number, d: number): Status {
  if (v >= 3 && v > d * 1.5) return "verified";
  if (d >= 3 && d > v * 1.5) return "disputed";
  return "pending";
}

const STATUS: Record<Status, { label: string; labelEn: string; cls: string; dot: string }> = {
  verified: { label: "Verifiziert", labelEn: "Verified",  cls: "text-green-700 bg-green-50 border-green-200",  dot: "bg-green-500" },
  disputed: { label: "Bestritten",  labelEn: "Disputed",  cls: "text-red-700 bg-red-50 border-red-200",        dot: "bg-red-500"   },
  pending:  { label: "Ausstehend",  labelEn: "Pending",   cls: "text-slate-500 bg-slate-50 border-slate-200",  dot: "bg-slate-300" },
};

const CAT_COLORS: Record<string, string> = {
  "bg-amber-400":  "#fbbf24",
  "bg-violet-500": "#8b5cf6",
  "bg-red-500":    "#ef4444",
  "bg-orange-400": "#fb923c",
  "bg-slate-300":  "#cbd5e1",
};

function catDot(cat: string): string {
  if (cat.includes("Fake") || cat.includes("Falsch") || cat.includes("Misinform")) return "bg-amber-400";
  if (cat.includes("Deepfake") || cat.includes("KI") || cat.includes("AI")) return "bg-violet-500";
  if (cat.includes("Hass") || cat.includes("Hate")) return "bg-red-500";
  if (cat.includes("Polit")) return "bg-orange-400";
  return "bg-slate-300";
}

function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="border border-slate-100 rounded-xl p-5 bg-white">
      <div className="text-3xl font-serif font-bold text-slate-900 tabular-nums leading-none mb-1">{value}</div>
      <div className="text-xs font-medium text-slate-700">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function RegistryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  async function load() {
    const [countRes, dataRes] = await Promise.all([
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("spam", false),
      supabase.from("reports")
        .select("id,platform,category,description,created_at,verified_count,disputed_count,reporter_country")
        .eq("spam", false)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    setTotal(countRes.count ?? 0);
    setReports(dataRes.data || []);
    setLoading(false);
    setLastUpdate(new Date());
  }

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  // Derived stats
  const verifiedCount = useMemo(() =>
    reports.filter(r => getStatus(r.verified_count, r.disputed_count) === "verified").length, [reports]);

  const countries = useMemo(() => {
    const s = new Set(reports.map(r => r.reporter_country).filter(Boolean));
    return s.size;
  }, [reports]);

  const platforms = useMemo(() => new Set(reports.map(r => r.platform)).size, [reports]);
  const categories = useMemo(() => Array.from(new Set(reports.map(r => r.category))).sort(), [reports]);
  const platformList = useMemo(() => Array.from(new Set(reports.map(r => r.platform))).sort(), [reports]);

  const filtered = useMemo(() => reports.filter(r => {
    if (filterCat !== "all" && r.category !== filterCat) return false;
    if (filterPlatform !== "all" && r.platform !== filterPlatform) return false;
    if (filterStatus !== "all" && getStatus(r.verified_count, r.disputed_count) !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.description.toLowerCase().includes(q) ||
             r.platform.toLowerCase().includes(q) ||
             r.category.toLowerCase().includes(q);
    }
    return true;
  }), [reports, filterCat, filterStatus, filterPlatform, search]);

  function agoId(index: number): string {
    const n = Math.max(1, (total ?? reports.length) - index);
    return `AGO-${String(n).padStart(5, "0")}`;
  }

  function ago(d: string) {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return t.ago.just;
    if (m < 60) return `${m}${t.ago.min}`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}${t.ago.hour}`;
    return `${Math.floor(h / 24)}${t.ago.day}`;
  }

  const selectCls = "border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:border-slate-400 transition-colors";

  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AgoraLogo className="text-red-600" />
            <span className="font-serif font-bold text-xl tracking-tight">Agora</span>
          </Link>
          <div className="flex items-center gap-4">
            <LangSwitcher />
            <Link href="/report"
              className="text-sm font-medium bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors">
              {"Melden"}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-red-600 uppercase tracking-wider">Live Registry</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900 mb-1">Agora Registry</h1>
              <p className="text-slate-400 text-sm max-w-lg">
                Globale, offene Datenbank verifizierter Fehlinformationen.
                Jeder Eintrag ist unveränderlich, transparent und frei zugänglich.
              </p>
            </div>
            <div className="text-xs text-slate-300 font-mono shrink-0">
              Aktualisiert {ago(lastUpdate.toISOString())}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              value={total !== null ? total.toLocaleString() : "···"}
              label="Einträge gesamt"
              sub="Meldungen weltweit"
            />
            <StatCard
              value={verifiedCount > 0 ? verifiedCount.toLocaleString() : "···"}
              label="Verifiziert"
              sub="Breiter Konsens bestätigt"
            />
            <StatCard
              value={countries > 0 ? `${countries}+` : "···"}
              label="Länder"
              sub="Globale Reichweite"
            />
            <StatCard
              value={platforms > 0 ? platforms.toString() : "···"}
              label="Plattformen"
              sub="Überwacht"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          <input
            type="search"
            placeholder="Einträge durchsuchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-52 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
          />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className={selectCls}>
            <option value="all">Alle Kategorien</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className={selectCls}>
            <option value="all">Alle Plattformen</option>
            {platformList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
            <option value="all">Alle Status</option>
            <option value="verified">✓ Verifiziert</option>
            <option value="pending">⟳ Ausstehend</option>
            <option value="disputed">✗ Bestritten</option>
          </select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-slate-400 mb-4 font-mono">
            {filtered.length.toLocaleString()} Einträge
            {(search || filterCat !== "all" || filterStatus !== "all" || filterPlatform !== "all") &&
              ` · gefiltert von ${total?.toLocaleString() ?? reports.length}`}
          </p>
        )}

        {/* Table */}
        {loading ? (
          <div className="border border-slate-100 rounded-xl py-40 text-center text-slate-400 text-sm">
            Lade Registry…
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-slate-100 rounded-xl py-40 text-center">
            <p className="text-slate-400 text-sm mb-3">Keine Einträge gefunden.</p>
            <button onClick={() => { setSearch(""); setFilterCat("all"); setFilterStatus("all"); setFilterPlatform("all"); }}
              className="text-xs text-red-600 hover:text-red-700 transition-colors">
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-32">ID</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inhalt</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-32">Plattform</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-36">Kategorie</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-32">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-20">Seit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const s = getStatus(r.verified_count, r.disputed_count);
                    const st = STATUS[s];
                    return (
                      <tr key={r.id}
                        onClick={() => router.push(`/report/${r.id}`)}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors group">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-400 select-all">{agoId(i)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${catDot(r.category)}`} />
                            <span className="text-slate-700 truncate max-w-sm group-hover:text-slate-900 transition-colors">
                              {r.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs">{r.platform}</td>
                        <td className="px-4 py-3.5 text-slate-500 text-xs truncate max-w-[140px]">{r.category}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs border px-2 py-0.5 rounded-full ${st.cls}`}>
                            <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{ago(r.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {filtered.map((r, i) => {
                const s = getStatus(r.verified_count, r.disputed_count);
                const st = STATUS[s];
                return (
                  <Link key={r.id} href={`/report/${r.id}`}
                    className="block border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors active:bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] text-slate-400">{agoId(i)}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] border px-2 py-0.5 rounded-full ${st.cls}`}>
                        <span className={`w-1 h-1 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                    <p className="text-slate-700 text-sm leading-snug mb-2.5 line-clamp-2">{r.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${catDot(r.category)}`} />
                      <span>{r.platform}</span>
                      <span>·</span>
                      <span className="truncate">{r.category}</span>
                      <span className="ml-auto font-mono">{ago(r.created_at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Footer note */}
        {!loading && filtered.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
            <span className="font-mono">AGORA OPEN REGISTRY · CC0 · Keine Rechte vorbehalten</span>
            <div className="flex items-center gap-5">
              <a href="https://github.com/eliaskoenig24/templer" className="hover:text-slate-500 transition-colors">GitHub</a>
              <Link href="/report" className="hover:text-slate-500 transition-colors">Inhalt melden</Link>
              <span>Non-Profit · Open Source</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
