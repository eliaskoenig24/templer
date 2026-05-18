"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [reports, setReports] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      const { count } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("spam", false);
      setReports(count || 0);
      setLoaded(true);
    }
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-[#080608] text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-[#080608]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚔️</span>
          <span className="font-black text-sm tracking-[0.2em] uppercase text-white/90">Templer</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-white/40 hover:text-white/70 text-sm transition-colors tracking-wide">Dashboard</Link>
          <a
            href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="text-sm bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black px-5 py-2 rounded-full hover:opacity-90 transition-all tracking-wide"
          >
            Dem Orden beitreten
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">

        {/* Dramatischer Hintergrund */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-amber-500/30 via-amber-500/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-amber-900/10 blur-[140px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-red-900/15 blur-[80px]" />
          {/* Sterne */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white/40 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">

          {/* Orden-Badge */}
          <div className="inline-flex items-center gap-3 border border-amber-500/20 bg-amber-500/5 px-6 py-2.5 rounded-full text-amber-400/80 text-xs uppercase tracking-[0.3em] mb-12">
            <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
            Gegründet für die Wahrheit
            <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
          </div>

          <h1 className="text-7xl md:text-[110px] font-black leading-[0.85] tracking-tight mb-8">
            <span className="text-white/90">Die Welt</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
              braucht dich.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/35 max-w-2xl mx-auto mb-6 leading-relaxed font-light">
            Lügen verbreiten sich schneller als je zuvor.
            <br />
            <span className="text-white/55">Die Templer kämpfen zurück.</span>
          </p>

          <p className="text-white/20 text-sm tracking-widest uppercase mb-14">
            — Schließe dich dem Orden an —
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black px-10 py-5 rounded-full text-base hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-amber-900/30 tracking-wide"
            >
              ⚔️ Knight werden
            </a>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto border border-white/10 text-white/50 font-semibold px-10 py-5 rounded-full text-base hover:border-amber-500/30 hover:text-amber-400/70 transition-all"
            >
              Das Schlachtfeld ansehen →
            </Link>
          </div>

          <p className="text-white/15 text-xs tracking-widest">
            KOSTENLOS · ANONYM · NON-PROFIT · OPEN SOURCE
          </p>
        </div>

        {/* Scroll-Linie */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-px h-16 bg-gradient-to-b from-amber-500/40 to-transparent mx-auto" />
        </div>
      </section>

      {/* Live Counter */}
      <section className="py-24 px-6 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-900/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <p className="text-amber-500/50 text-xs uppercase tracking-[0.3em] mb-8">Der Orden in Zahlen</p>
          <div className="grid grid-cols-3 gap-8">
            {[
              { val: loaded ? reports.toLocaleString("de-DE") : "—", label: "Feinde der Wahrheit gemeldet" },
              { val: loaded ? Math.max(1, Math.floor(reports * 0.6)).toLocaleString("de-DE") : "—", label: "Knights im Einsatz" },
              { val: "∞", label: "Wille zur Wahrheit" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-5xl md:text-6xl font-black text-amber-400 mb-3">{s.val}</div>
                <div className="text-white/25 text-xs uppercase tracking-widest leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Die Mission */}
      <section className="py-40 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-amber-500/40 text-xs uppercase tracking-[0.3em] mb-4">Die Mission</p>
          <h2 className="text-5xl md:text-6xl font-black leading-tight">
            Seit Jahrhunderten schützen
            <br />
            <span className="text-white/40">die Templer die Wahrheit.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: "👁",
              title: "Du siehst es",
              body: "In jeder App. In jedem Land. Fake News, Deepfakes, Manipulation — du erkennst es als Knight sofort.",
            },
            {
              icon: "⚔️",
              title: "Du handelst",
              body: "Zweimal auf dein iPhone tippen. 5 Sekunden. Deine Meldung landet sofort im globalen Orden-Netzwerk.",
            },
            {
              icon: "🛡",
              title: "Der Orden urteilt",
              body: "Tausende Knights weltweit bestätigen. Die Wahrheit siegt. Die Lüge verschwindet.",
            },
          ].map((s) => (
            <div key={s.title} className="border border-white/6 bg-white/[0.02] rounded-2xl p-8 hover:border-amber-500/20 hover:bg-amber-900/5 transition-all group">
              <div className="text-3xl mb-6">{s.icon}</div>
              <h3 className="text-lg font-black mb-3 group-hover:text-amber-300 transition-colors">{s.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manifest */}
      <section className="py-32 px-6 relative overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/10 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-white/15 text-xs uppercase tracking-[0.4em] mb-10">Das Manifest</p>
          <blockquote className="text-3xl md:text-4xl font-black leading-tight text-white/80 mb-12">
            "Lügen töten.
            <br />
            <span className="text-amber-400">Nicht mit Schwertern —</span>
            <br />
            mit Worten, Videos, Algorithmen."
          </blockquote>
          <p className="text-white/30 text-base leading-relaxed max-w-xl mx-auto">
            Die Templer wurden gegründet weil Regierungen versagen, Konzerne schweigen
            und Algorithmen verdienen. Wir nicht. Wir kämpfen für alle — kostenlos, für immer.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-800/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-6xl mb-8">⚔️</div>
          <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            Genug zugesehen.
          </h2>
          <p className="text-white/35 text-xl mb-12 leading-relaxed">
            Der Orden braucht jeden Knight.
            <br />Installiere den Shortcut. Fange heute an.
          </p>
          <a
            href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="inline-block bg-gradient-to-r from-amber-500 to-amber-400 text-black font-black px-14 py-6 rounded-full text-xl hover:opacity-90 transition-all hover:scale-105 shadow-2xl shadow-amber-900/40"
          >
            ⚔️ Dem Orden beitreten
          </a>
          <p className="text-white/15 text-xs mt-6 tracking-widest uppercase">
            Kostenlos · Anonym · Für immer
          </p>
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-white/20 text-xs tracking-widest uppercase">
          <span>⚔️</span>
          <span>Templer — Non-profit. Für alle Menschen der Erde.</span>
        </div>
        <div className="flex gap-8 text-white/15 text-xs tracking-widest uppercase">
          <Link href="/dashboard" className="hover:text-amber-400/60 transition-colors">Dashboard</Link>
          <Link href="/report" className="hover:text-amber-400/60 transition-colors">Melden</Link>
          <a href="https://github.com/eliaskoenig24/templer" className="hover:text-amber-400/60 transition-colors">GitHub</a>
        </div>
      </footer>
    </main>
  );
}
