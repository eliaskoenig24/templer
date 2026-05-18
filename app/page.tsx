"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    },
  };
}

function Fade({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, style } = useFadeIn(delay);
  return <div ref={ref} style={style} className={className}>{children}</div>;
}

export default function Home() {
  const { t } = useTranslation();
  const [reports, setReports] = useState(0);

  useEffect(() => {
    supabase.from("reports").select("*", { count: "exact", head: true })
      .eq("spam", false).then(({ count }) => setReports(count || 0));
  }, []);

  return (
    <main className="bg-black text-white overflow-x-hidden selection:bg-amber-400/20">

      <style>{`
        @keyframes ticker { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
        .ticker { animation: ticker 40s linear infinite; }
        @keyframes breathe { 0%,100% { opacity:.15; transform:scale(1); } 50% { opacity:.25; transform:scale(1.05); } }
        .breathe { animation: breathe 8s ease-in-out infinite; }
      `}</style>

      {/* ─── NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-5 bg-black/80 backdrop-blur-2xl">
        <span className="text-white font-black tracking-[0.3em] text-sm">TEMPLER</span>
        <div className="flex items-center gap-7">
          <LangSwitcher />
          <Link href="/dashboard" className="text-white/40 hover:text-white text-sm transition-colors">
            {t.nav.dashboard}
          </Link>
          <a
            href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-full hover:bg-amber-300 transition-colors"
          >
            {t.nav.join} ↗
          </a>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">

        {/* Ambient glow */}
        <div className="breathe absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(220,38,38,0.12) 0%, transparent 70%)" }} />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Chip */}
          <Fade>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 text-xs tracking-[0.25em] uppercase px-4 py-2 rounded-full mb-12">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {reports > 0 ? `${reports.toLocaleString()} ${t.hero.reports}` : t.hero.networkActive}
            </div>
          </Fade>

          {/* Headline */}
          <Fade delay={80}>
            <h1 className="font-black tracking-tight leading-[0.88] mb-8"
              style={{ fontSize: "clamp(56px, 11vw, 128px)" }}>
              <span className="block">{t.hero.h1[0]}</span>
              <span className="block">{t.hero.h1[1]}</span>
              <span className="block text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #d97706 100%)" }}>
                {t.hero.h1[2]}
              </span>
            </h1>
          </Fade>

          {/* Sub */}
          <Fade delay={160}>
            <p className="text-white/40 text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-14 font-light">
              {t.hero.sub}
            </p>
          </Fade>

          {/* CTAs */}
          <Fade delay={240}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
                className="bg-white text-black font-semibold text-base px-10 py-4 rounded-full hover:bg-amber-300 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                {t.hero.cta}
              </a>
              <Link
                href="/dashboard"
                className="text-white/40 hover:text-white text-base transition-colors underline-offset-4"
              >
                {t.hero.ctaSec}
              </Link>
            </div>
          </Fade>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/15">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>
      </section>

      {/* ─── STATEMENT ────────────────────────────────────────── */}
      <section className="py-40 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <Fade>
            <p className="text-red-500/60 text-xs uppercase tracking-[0.4em] mb-8">{t.problem.label}</p>
          </Fade>
          <Fade delay={100}>
            <h2 className="font-black leading-tight text-white/90"
              style={{ fontSize: "clamp(40px, 7vw, 84px)" }}>
              {t.problem.h2a}
              <br />
              <span className="text-red-400">{t.problem.h2b}</span>
            </h2>
          </Fade>
          <Fade delay={200}>
            <p className="mt-8 text-white/25 text-xl max-w-xl mx-auto leading-relaxed">{t.problem.intro}</p>
          </Fade>
        </div>
      </section>

      {/* ─── 3 STATS ──────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          {t.problem.stats.map((s, i) => (
            <Fade key={s.n} delay={i * 80} className="px-10 py-16 text-center">
              <div className="text-5xl md:text-6xl font-black text-red-400 mb-4">{s.n}</div>
              <p className="text-white/40 text-sm leading-relaxed mb-2">{s.label}</p>
              <p className="text-white/15 text-xs uppercase tracking-widest">{s.sub}</p>
            </Fade>
          ))}
        </div>
      </section>

      {/* ─── FEATURE: 10 SECONDS ──────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-40 px-6 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 20% 50%, rgba(251,191,36,0.04) 0%, transparent 70%)" }} />
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative">

          {/* Text */}
          <div>
            <Fade>
              <p className="text-amber-400/60 text-xs uppercase tracking-[0.4em] mb-6">{t.how.label}</p>
            </Fade>
            <Fade delay={80}>
              <h2 className="font-black leading-tight mb-6 text-white"
                style={{ fontSize: "clamp(42px, 6vw, 76px)" }}>
                {t.how.h2}
              </h2>
            </Fade>
            <Fade delay={160}>
              <p className="text-white/35 text-xl leading-relaxed mb-12">{t.how.sub}</p>
            </Fade>
            <div className="space-y-8">
              {t.how.steps.map((s, i) => (
                <Fade key={s.n} delay={200 + i * 80}>
                  <div className="flex gap-5">
                    <div className="text-amber-400/30 font-black text-xs mt-1 w-4 shrink-0">{s.n}</div>
                    <div>
                      <p className="font-semibold text-white/80 mb-1">{s.title}</p>
                      <p className="text-white/30 text-sm leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>

          {/* Visual */}
          <Fade delay={120} className="flex justify-center">
            <div className="relative w-64">
              {/* Glow behind phone */}
              <div className="absolute inset-0 scale-150 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)" }} />
              {/* Phone */}
              <div className="relative bg-zinc-950 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
                style={{ aspectRatio: "9/19.5" }}>
                <div className="flex justify-center pt-4 pb-2">
                  <div className="w-24 h-6 bg-black rounded-full" />
                </div>
                <div className="px-5 py-4 flex flex-col gap-3 h-full">
                  {/* Status bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-white/20 font-mono">9:41</span>
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-0.5 rounded-full ${i < 3 ? "bg-white/40" : "bg-white/10"}`}
                          style={{ height: `${6 + i * 2}px`, marginTop: `${4 - i}px` }} />
                      ))}
                    </div>
                  </div>
                  {/* App content mock */}
                  <div className="bg-white/5 rounded-2xl p-3 aspect-video flex items-center justify-center">
                    <span className="text-4xl">📱</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-white/8 rounded-full w-full" />
                    <div className="h-2 bg-red-500/20 rounded-full w-2/3" />
                  </div>
                  {/* Alert */}
                  <div className="mt-auto bg-amber-400/10 border border-amber-400/20 rounded-2xl p-3">
                    <p className="text-amber-400 text-[9px] font-bold uppercase tracking-wider mb-1">⚔ Templer</p>
                    <p className="text-white/50 text-[8px] leading-relaxed">Kategorie wählen und ins Netzwerk senden</p>
                    <div className="flex gap-1.5 mt-2">
                      {["Fake News", "Deepfake"].map((c) => (
                        <div key={c} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[7px] text-white/40">{c}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ─── LIVE NUMBERS ─────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Fade>
            <p className="text-amber-400/50 text-xs uppercase tracking-[0.4em] mb-6">{t.live.label}</p>
            <h2 className="font-black text-white/90 mb-16" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
              {t.live.h2}
            </h2>
          </Fade>
          <div className="grid grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
            {[
              { val: reports, label: t.live.stat1 },
              { val: Math.max(1, Math.floor(reports * 0.7)), label: t.live.stat2 },
              { val: "100%", label: t.live.stat3 },
            ].map((s, i) => (
              <Fade key={i} delay={i * 60} className="bg-black py-10 px-6 text-center">
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  {typeof s.val === "number" ? s.val.toLocaleString() : s.val}
                </div>
                <p className="text-white/25 text-xs uppercase tracking-widest leading-relaxed">{s.label}</p>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VISION ───────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06]">
        {/* Intro */}
        <div className="py-32 px-6 text-center">
          <Fade>
            <p className="text-amber-400/50 text-xs uppercase tracking-[0.4em] mb-6">{t.vision.label}</p>
            <h2 className="font-black text-white/90" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
              {t.vision.h2a}<br />
              <span className="text-amber-400">{t.vision.h2b}</span>
            </h2>
          </Fade>
        </div>

        {/* Scenario cards — full-width alternating */}
        {t.vision.scenarios.map((s, i) => (
          <Fade key={s.title}>
            <div className={`border-t border-white/[0.05] py-24 px-6 ${i % 2 === 1 ? "bg-white/[0.015]" : ""}`}>
              <div className={`max-w-5xl mx-auto flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-16`}>
                <div className="flex-1">
                  <span className="text-xs uppercase tracking-[0.3em] text-amber-400/40 border border-amber-400/15 px-3 py-1 rounded-full mb-6 inline-block">
                    {s.tag}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-black mb-5 leading-tight">{s.title}</h3>
                  <p className="text-white/35 text-lg leading-relaxed">{s.body}</p>
                </div>
                <div className="text-[120px] leading-none opacity-80">{s.emoji}</div>
              </div>
            </div>
          </Fade>
        ))}
      </section>

      {/* ─── MANIFEST ─────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-48 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(251,191,36,0.04) 0%, transparent 70%)" }} />
        <Fade className="relative max-w-3xl mx-auto text-center">
          <p className="text-white/10 text-xs uppercase tracking-[0.5em] mb-16">{t.manifest.label}</p>
          <blockquote className="font-black leading-[1.1] text-white/80"
            style={{ fontSize: "clamp(28px, 4vw, 52px)" }}>
            {t.manifest.quote[0]}<br />
            {t.manifest.quote[1]}<br />
            <span className="text-amber-400">{t.manifest.quote[2]}<br />{t.manifest.quote[3]}</span>
          </blockquote>
          <div className="w-12 h-px bg-amber-400/20 mx-auto mt-16 mb-10" />
          <p className="text-white/20 text-lg leading-relaxed">{t.manifest.sub}</p>
        </Fade>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06] py-48 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(251,191,36,0.07) 0%, transparent 70%)" }} />
        <Fade className="relative max-w-2xl mx-auto">
          <h2 className="font-black leading-[0.9] mb-8"
            style={{ fontSize: "clamp(56px, 10vw, 110px)" }}>
            {t.cta.h2a}<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #d97706 100%)" }}>
              {t.cta.h2b}
            </span>
          </h2>
          <p className="text-white/30 text-xl mb-12 leading-relaxed">{t.cta.sub}</p>
          <a
            href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="inline-block bg-white text-black font-semibold text-base px-12 py-5 rounded-full hover:bg-amber-300 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] mb-6"
          >
            {t.cta.btn}
          </a>
          <br />
          <Link href="/dashboard" className="text-white/20 text-sm hover:text-white/40 transition-colors">
            {t.cta.link}
          </Link>
        </Fade>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-8 py-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-black tracking-[0.3em] text-sm text-white mb-1">TEMPLER</p>
            <p className="text-white/15 text-xs">{t.footer.tagline}</p>
          </div>
          <div className="flex gap-8 text-white/20 text-xs uppercase tracking-widest">
            <Link href="/dashboard" className="hover:text-white/50 transition-colors">{t.footer.dashboard}</Link>
            <Link href="/report" className="hover:text-white/50 transition-colors">{t.footer.report}</Link>
            <a href="https://github.com/eliaskoenig24/templer" className="hover:text-white/50 transition-colors">{t.footer.github}</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
