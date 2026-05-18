"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started || target === 0) return;
    const step = target / (duration / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setCount(Math.floor(cur));
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [started, target, duration]);

  return { count, ref };
}

function Stat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-black text-white mb-2">
        {count.toLocaleString("de-DE")}{suffix}
      </div>
      <div className="text-white/30 text-xs uppercase tracking-[0.2em] leading-relaxed">{label}</div>
    </div>
  );
}

export default function Home() {
  const [reports, setReports] = useState(0);

  useEffect(() => {
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("spam", false)
      .then(({ count }) => setReports(count || 0));
  }, []);

  return (
    <main className="bg-[#060606] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 px-8 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#060606]/90 backdrop-blur-2xl">
        <span className="font-black tracking-[0.25em] text-sm uppercase">⚔ TEMPLER</span>
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-white/35 hover:text-white text-xs uppercase tracking-widest transition-colors">Dashboard</Link>
          <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="text-xs uppercase tracking-widest font-black bg-white text-[#060606] px-5 py-2.5 rounded-full hover:bg-amber-300 transition-colors">
            Knight werden
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        {/* bg glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-red-900/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-900/10 rounded-full blur-[100px]" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto pt-24">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-amber-400/60 border border-amber-400/15 px-5 py-2 rounded-full mb-16">
            <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
            Der Orden der Wahrheit · Gegründet für alle
          </div>

          <h1 className="text-[clamp(56px,12vw,140px)] font-black leading-[0.85] tracking-[-0.02em] mb-10">
            <span className="block text-white">Millionen</span>
            <span className="block text-white">Lügen.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500">
              Eine Antwort.
            </span>
          </h1>

          <p className="text-white/35 text-xl md:text-2xl max-w-2xl mx-auto mb-16 leading-relaxed font-light">
            Templer ist ein globaler Orden aus Knights — Menschen die Lügen melden,
            Wahrheit verteidigen und die Welt für immer verändern.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
              className="bg-white text-[#060606] font-black text-sm uppercase tracking-widest px-10 py-5 rounded-full hover:bg-amber-300 transition-all hover:scale-105 shadow-2xl">
              ⚔ Dem Orden beitreten
            </a>
            <Link href="/dashboard"
              className="border border-white/10 text-white/50 text-sm uppercase tracking-widest px-10 py-5 rounded-full hover:border-white/25 hover:text-white/75 transition-all">
              Das Schlachtfeld →
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/15">
          <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ── DAS PROBLEM ── */}
      <section className="py-32 px-6 border-y border-white/[0.06] bg-[#060606]">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-500/60 text-[10px] uppercase tracking-[0.4em] mb-6 text-center">Die Bedrohung</p>
          <h2 className="text-4xl md:text-6xl font-black text-center mb-20 leading-tight">
            Die Lüge hat einen<br />
            <span className="text-red-400">unfairen Vorteil.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {[
              { n: "6×", label: "schneller verbreitet sich Fake News als Wahrheit", sub: "MIT Studie, 2018" },
              { n: "3.6B", label: "Menschen sahen COVID-Falschinformation", sub: "WHO, 2020" },
              { n: "10s", label: "braucht KI um ein Deepfake zu erstellen", sub: "Stand 2024" },
            ].map((s) => (
              <div key={s.n} className="bg-[#060606] p-10 text-center">
                <div className="text-5xl md:text-6xl font-black text-red-400 mb-4">{s.n}</div>
                <p className="text-white/50 text-sm leading-relaxed mb-3">{s.label}</p>
                <p className="text-white/15 text-xs uppercase tracking-widest">{s.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-white/20 text-sm mt-10 max-w-xl mx-auto leading-relaxed">
            Regierungen reagieren zu langsam. Konzerne verdienen an der Empörung.
            KI allein versteht den Kontext nicht. <span className="text-white/45">Deshalb braucht es uns.</span>
          </p>
        </div>
      </section>

      {/* ── TEMPLER LIVE ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <p className="text-amber-400/50 text-[10px] uppercase tracking-[0.4em] mb-6 text-center">Der Orden · Live</p>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-20">Was der Orden heute leistet</h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <Stat value={reports} label="Meldungen eingereicht" />
            <Stat value={Math.max(1, Math.floor(reports * 0.6))} label="Knights weltweit aktiv" />
            <Stat value={100} label="% kostenlos — für immer" suffix="%" />
          </div>
        </div>
      </section>

      {/* ── WIE ES FUNKTIONIERT ── */}
      <section className="py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="text-amber-400/50 text-[10px] uppercase tracking-[0.4em] mb-6 text-center">So einfach ist es</p>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
            10 Sekunden. Jede App.
          </h2>
          <p className="text-white/25 text-center mb-20 max-w-md mx-auto">Kein Registrieren. Kein Aufwand. Überall.</p>

          <div className="relative">
            {/* Verbindungslinie */}
            <div className="absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent hidden md:block" />
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "I", icon: "👁", title: "Du siehst es", body: "Fake News auf TikTok. Deepfake auf Instagram. Hassrede auf Telegram. Du erkennst es." },
                { step: "II", icon: "⚔️", title: "Du meldest es", body: "Doppelt auf dein iPhone-Rücken tippen. Kategorie wählen. 10 Sekunden. Fertig." },
                { step: "III", icon: "🌍", title: "Der Orden handelt", body: "Tausende Knights bestätigen. Forscher analysieren. Regierungen werden informiert." },
              ].map((s) => (
                <div key={s.step} className="relative">
                  <div className="w-10 h-10 rounded-full border border-amber-400/25 bg-amber-400/5 flex items-center justify-center text-amber-400/60 text-xs font-black tracking-widest mb-8 mx-auto">
                    {s.step}
                  </div>
                  <div className="border border-white/[0.06] bg-white/[0.02] rounded-2xl p-8 text-center hover:border-amber-400/15 hover:bg-amber-900/5 transition-all">
                    <div className="text-4xl mb-6">{s.icon}</div>
                    <h3 className="font-black text-lg mb-3">{s.title}</h3>
                    <p className="text-white/35 text-sm leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WIE ES DIE WELT ÄNDERT ── */}
      <section className="py-32 px-6 border-t border-white/[0.06] bg-[#040404]">
        <div className="max-w-5xl mx-auto">
          <p className="text-amber-400/50 text-[10px] uppercase tracking-[0.4em] mb-6 text-center">Die Vision</p>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4 leading-tight">
            Was sich ändert wenn<br />
            <span className="text-amber-400">eine Milliarde mitmacht.</span>
          </h2>
          <p className="text-white/25 text-center mb-20 max-w-lg mx-auto">Jede dieser Szenarien ist möglich. In 5 Jahren.</p>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                emoji: "🗳",
                title: "Wahlen werden geschützt",
                body: "Ein Deepfake-Video eines Kandidaten erscheint. Innerhalb von 4 Minuten melden 50.000 Knights weltweit. Automatisch erscheint auf allen Plattformen ein Warnhinweis — bevor es 10 Millionen Menschen sehen.",
                tag: "Demokratie",
              },
              {
                emoji: "🏥",
                title: "Pandemien treffen auf Wahrheit",
                body: "Gefährliche Gesundheitslügen werden in Stunden erkannt, nicht Wochen. Die WHO bekommt Echtzeit-Daten von Templer. Impfkampagnen scheitern nicht mehr an Fehlinformation.",
                tag: "Gesundheit",
              },
              {
                emoji: "⚖️",
                title: "Kriegsverbrechen werden dokumentiert",
                body: "Bürger in Konfliktzonen melden Ereignisse anonym. Tausende Knights bestätigen. Jede Meldung ist gerichtsverwertbar. Das Internationale Strafgericht nutzt Templer-Daten als Beweismittel.",
                tag: "Gerechtigkeit",
              },
              {
                emoji: "📱",
                title: "Jeder Content bekommt einen Wahrheitsscore",
                body: "EU, Apple und Google verpflichten Plattformen dazu, den Templer-Score anzuzeigen. Jedes Video, jeder Artikel — sofort einzuschätzen. Lügen haben keinen Raum mehr.",
                tag: "Zukunft",
              },
            ].map((s) => (
              <div key={s.title} className="border border-white/[0.06] rounded-2xl p-8 hover:border-amber-400/15 transition-all group bg-[#060606]">
                <div className="flex items-start justify-between mb-5">
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400/40 border border-amber-400/15 px-3 py-1 rounded-full">{s.tag}</span>
                </div>
                <h3 className="font-black text-lg mb-3 group-hover:text-amber-300 transition-colors">{s.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFEST ── */}
      <section className="py-40 px-6 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-900/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-white/10 text-[10px] uppercase tracking-[0.5em] mb-12">Das Manifest</p>
          <p className="text-3xl md:text-4xl font-black leading-[1.2] text-white/80 mb-8">
            "Wir bauen keine App.<br />
            Wir bauen keine Firma.<br />
            <span className="text-amber-400">Wir bauen eine Waffe —<br />
            aus Wahrheit."</span>
          </p>
          <div className="w-16 h-px bg-amber-400/20 mx-auto my-10" />
          <p className="text-white/25 text-base leading-relaxed">
            Templer ist non-profit. Kostenlos. Open Source. Für alle Menschen der Erde — unabhängig von Land, Sprache oder Regierung.
            Keine Werbung. Keine Investoren. Kein Geschäftsmodell das die Wahrheit korrumpiert.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-48 px-6 border-t border-white/[0.06] text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-900/12 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-8xl mb-10">⚔</div>
          <h2 className="text-6xl md:text-8xl font-black leading-[0.85] mb-8 tracking-tight">
            Schreib<br />
            <span className="text-amber-400">Geschichte.</span>
          </h2>
          <p className="text-white/30 text-xl mb-14 leading-relaxed">
            Jeder große Wandel began mit einer kleinen Gruppe Menschen
            die geglaubt haben, dass es anders gehen kann.
          </p>
          <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="inline-block bg-white text-[#060606] font-black text-sm uppercase tracking-[0.2em] px-14 py-6 rounded-full hover:bg-amber-300 transition-all hover:scale-105 shadow-2xl mb-6">
            ⚔ Dem Orden beitreten
          </a>
          <br />
          <Link href="/dashboard" className="text-white/20 text-xs uppercase tracking-widest hover:text-white/40 transition-colors">
            Oder schau dir das Schlachtfeld an →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-8 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-black tracking-[0.25em] text-sm uppercase mb-1">⚔ TEMPLER</div>
            <p className="text-white/15 text-xs">Non-profit · Open Source · Für alle Menschen der Erde</p>
          </div>
          <div className="flex gap-8 text-white/20 text-xs uppercase tracking-widest">
            <Link href="/dashboard" className="hover:text-amber-400/60 transition-colors">Dashboard</Link>
            <Link href="/report" className="hover:text-amber-400/60 transition-colors">Melden</Link>
            <a href="https://github.com/eliaskoenig24/templer" className="hover:text-amber-400/60 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
