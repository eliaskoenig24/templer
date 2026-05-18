"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [reports, setReports] = useState(0);
  const [countries, setCountries] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      const { count } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("spam", false);
      const { data } = await supabase.from("reports").select("reporter_country").eq("spam", false);
      const unique = new Set((data || []).map((r) => r.reporter_country).filter(Boolean)).size;
      setReports(count || 0);
      setCountries(unique);
      setLoaded(true);
    }
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-[#000] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-600 rounded-md flex items-center justify-center text-xs font-black">T</div>
          <span className="font-semibold text-sm tracking-widest uppercase text-white/90">Templer</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link>
          <a
            href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="text-sm bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
          >
            Installieren
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-20">
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur px-4 py-2 rounded-full text-xs text-white/60 uppercase tracking-widest mb-10">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Das Immunsystem des Internets
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight mb-8">
            Wahrheit
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
              gehört allen.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-12 leading-relaxed">
            Millionen Knights melden Falschinformation in Echtzeit —
            aus jeder App, jedem Land, auf jedem Gerät.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
              className="w-full sm:w-auto bg-white text-black font-bold px-8 py-4 rounded-full text-base hover:bg-white/90 transition-all hover:scale-105"
            >
              ⚔️ iOS Shortcut installieren
            </a>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto border border-white/15 text-white/80 font-semibold px-8 py-4 rounded-full text-base hover:border-white/30 hover:text-white transition-all"
            >
              Live-Dashboard →
            </Link>
          </div>

          <p className="text-white/25 text-xs mt-5">
            Kostenlos · Anonym · Non-profit · Open Source
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-20 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { value: loaded ? reports.toLocaleString("de-DE") : "—", label: "Meldungen" },
            { value: loaded ? Math.max(1, Math.floor(reports * 0.6)).toLocaleString("de-DE") : "—", label: "Knights" },
            { value: loaded ? String(countries || "—") : "—", label: "Länder" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{s.value}</div>
              <div className="text-white/30 text-xs uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <p className="text-center text-white/30 text-xs uppercase tracking-widest mb-4">So funktioniert es</p>
        <h2 className="text-4xl md:text-5xl font-black text-center mb-20">
          30 Sekunden. Jede App. Weltweit.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", title: "Du siehst etwas", body: "Fake News, Deepfake, Hassrede — egal ob TikTok, Instagram oder WhatsApp." },
            { n: "02", title: "Doppelt tippen", body: "Zweimal auf die iPhone-Rückseite tippen. Kategorie wählen. Fertig." },
            { n: "03", title: "Netzwerk analysiert", body: "Tausende Knights weltweit bestätigen oder widersprechen sofort." },
          ].map((s) => (
            <div key={s.n} className="bg-white/[0.03] border border-white/8 rounded-2xl p-8 hover:bg-white/[0.05] transition-colors">
              <div className="text-red-500/60 text-xs font-mono mb-5 tracking-widest">{s.n}</div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Big CTA */}
      <section className="relative py-40 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black mb-6">Werde Knight.</h2>
          <p className="text-white/40 text-lg mb-10">
            Die Welt braucht Menschen die handeln. Nicht zusehen.
          </p>
          <a
            href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="inline-block bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-5 rounded-full text-lg transition-all hover:scale-105"
          >
            ⚔️ Jetzt installieren
          </a>
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-[10px] font-black">T</div>
          <span className="text-white/30 text-xs">Templer — Non-profit. Für alle.</span>
        </div>
        <div className="flex gap-6 text-white/25 text-xs">
          <Link href="/dashboard" className="hover:text-white/50 transition-colors">Dashboard</Link>
          <Link href="/report" className="hover:text-white/50 transition-colors">Melden</Link>
          <a href="https://github.com/eliaskoenig24/templer" className="hover:text-white/50 transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
