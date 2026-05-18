"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";
import { INDEPENDENT_TRANSLATIONS } from "@/lib/translations";

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transition: `opacity 0.45s ease ${delay}ms` } };
}

function Fade({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, style } = useFadeIn(delay);
  return <div ref={ref} style={style} className={className}>{children}</div>;
}

export default function Home() {
  const { t, lang } = useTranslation();
  const ind = INDEPENDENT_TRANSLATIONS[lang];
  const [reports, setReports] = useState(0);

  useEffect(() => {
    supabase.from("reports").select("*", { count: "exact", head: true })
      .eq("spam", false).then(({ count }) => setReports(count || 0));
  }, []);

  return (
    <main className="bg-white text-slate-900 antialiased">

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
              <span className="text-white text-[11px] font-black">T</span>
            </div>
            <span className="font-semibold text-sm">Templer</span>
          </Link>
          <div className="flex items-center gap-5">
            <LangSwitcher />
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              {t.nav.dashboard}
            </Link>
            <Link href="/report" className="text-sm font-medium bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors">
              {t.footer.report}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full mb-10">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          {reports > 0 ? `${reports.toLocaleString()} ${t.hero.reports}` : t.hero.networkActive}
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
          {t.hero.h1[0]}<br />
          <span className="text-red-600">{t.hero.h1[1]}</span><br />
          {t.hero.h1[2]}
        </h1>

        <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-xl mx-auto">
          {t.hero.sub}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/report"
            className="bg-slate-900 text-white text-sm font-medium px-8 py-3 rounded-md hover:bg-slate-700 transition-colors">
            {t.hero.cta}
          </Link>
          <Link href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-4 py-3">
            {t.hero.ctaSec}
          </Link>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {t.problem.stats.map((s, i) => (
            <Fade key={s.n} delay={i * 60}>
              <div className="py-6 md:py-0 px-4 md:px-10 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{s.n}</div>
                <p className="text-sm text-slate-600 mb-1 leading-snug">{s.label}</p>
                <p className="text-xs text-slate-400">{s.sub}</p>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <Fade>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.how.h2}</h2>
          <p className="text-slate-500 mb-12">{t.how.sub}</p>
        </Fade>
        <div className="space-y-10">
          {t.how.steps.map((s, i) => (
            <Fade key={s.n} delay={i * 70}>
              <div className="flex gap-5">
                <div className="w-8 h-8 shrink-0 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mt-0.5">
                  <span className="text-red-600 text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── INDEPENDENCE ─────────────────────────────────────────── */}
      <section className="bg-slate-950 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Fade>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
              {ind.title}<br />
              <span className="text-red-400">{ind.titleB}</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              {ind.body}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {ind.tags.map((tag) => (
                <span key={tag} className="text-xs border border-slate-700 text-slate-400 px-4 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ── VISION ───────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <Fade>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.vision.label}</h2>
          <p className="text-slate-500 mb-10 max-w-xl">{t.vision.sub}</p>
        </Fade>
        <div className="space-y-4">
          {t.vision.scenarios.map((s, i) => (
            <Fade key={s.title} delay={i * 60}>
              <div className="flex gap-4 p-5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all">
                <span className="text-2xl shrink-0 mt-0.5">{s.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
                    <span className="text-[11px] text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full shrink-0">{s.tag}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
                </div>
              </div>
            </Fade>
          ))}
        </div>
      </section>

      {/* ── MANIFEST ─────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Fade>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-8">{t.manifest.label}</p>
            <blockquote className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug mb-8">
              {t.manifest.quote[0]}<br />
              {t.manifest.quote[1]}<br />
              <span className="text-red-600">{t.manifest.quote[2]}<br />{t.manifest.quote[3]}</span>
            </blockquote>
            <p className="text-slate-500 text-base leading-relaxed max-w-2xl mx-auto">{t.manifest.sub}</p>
          </Fade>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <Fade>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            {t.cta.h2a} {t.cta.h2b}
          </h2>
          <p className="text-slate-500 text-xl mb-10 max-w-lg mx-auto leading-relaxed">{t.cta.sub}</p>
          <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="inline-block bg-red-600 text-white font-medium text-sm px-10 py-4 rounded-md hover:bg-red-700 transition-colors mb-5">
            {t.cta.btn}
          </a>
          <br />
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            {t.cta.link}
          </Link>
        </Fade>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white text-[9px] font-black">T</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">Templer</span>
            </div>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400">{t.footer.tagline}</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-700 transition-colors">{t.footer.dashboard}</Link>
            <Link href="/report" className="hover:text-slate-700 transition-colors">{t.footer.report}</Link>
            <a href="https://github.com/eliaskoenig24/templer" className="hover:text-slate-700 transition-colors">{t.footer.github}</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
