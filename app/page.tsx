"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";

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

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? "translateY(0px)" : "translateY(28px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` } };
}

function Stat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-6xl font-black text-white mb-2 tabular-nums">{count.toLocaleString()}{suffix}</div>
      <div className="text-white/30 text-xs uppercase tracking-[0.2em] leading-relaxed max-w-[160px] mx-auto">{label}</div>
    </div>
  );
}

function FadeSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, style } = useFadeIn(delay);
  return <div ref={ref} style={style} className={className}>{children}</div>;
}

function PhoneMockup({ step, title, content, active }: { step: string; title: string; content: React.ReactNode; active: boolean }) {
  return (
    <div className={`relative transition-all duration-500 ${active ? "scale-105" : "scale-100 opacity-60"}`}>
      <div className="w-44 mx-auto bg-[#111] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl" style={{ aspectRatio: "9/19" }}>
        <div className="flex justify-center pt-3 pb-1"><div className="w-20 h-5 bg-black rounded-full" /></div>
        <div className="px-4 py-3 h-full flex flex-col">{content}</div>
      </div>
      <div className="text-center mt-5">
        <div className="text-amber-400/40 text-[10px] uppercase tracking-[0.3em] mb-1">{step}</div>
        <div className="text-white/70 text-sm font-bold">{title}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [reports, setReports] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("spam", false)
      .then(({ count }) => setReports(count || 0));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveStep(s => (s + 1) % 3), 2500);
    return () => clearInterval(timer);
  }, []);

  const ticker = [...t.ticker, ...t.ticker];

  return (
    <main className="bg-[#060606] text-white overflow-x-hidden">
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 35s linear infinite; }
        @keyframes glow-pulse { 0%,100% { box-shadow: 0 0 40px rgba(251,191,36,0.08); } 50% { box-shadow: 0 0 80px rgba(251,191,36,0.22), 0 0 120px rgba(251,191,36,0.08); } }
        .glow-btn { animation: glow-pulse 3s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        .float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.028]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 px-8 py-4 flex items-center justify-between border-b border-white/[0.05] bg-[#060606]/90 backdrop-blur-2xl">
        <span className="font-black tracking-[0.25em] text-sm uppercase">⚔ TEMPLER</span>
        <div className="flex items-center gap-6">
          <LangSwitcher />
          <Link href="/dashboard" className="text-white/30 hover:text-white text-xs uppercase tracking-widest transition-colors duration-300">{t.nav.dashboard}</Link>
          <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="text-xs uppercase tracking-widest font-black bg-white text-[#060606] px-5 py-2.5 rounded-full hover:bg-amber-300 transition-all duration-300">
            {t.nav.join}
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-red-900/15 rounded-full blur-[180px]" />
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-900/8 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto pt-28">
          <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] border border-red-500/20 bg-red-950/20 text-red-400/80 px-5 py-2.5 rounded-full mb-14">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {t.hero.networkActive} · {reports.toLocaleString()} {t.hero.reports}
          </div>
          <h1 className="text-[clamp(52px,11vw,130px)] font-black leading-[0.87] tracking-[-0.025em] mb-12">
            <span className="block text-white">{t.hero.h1[0]}</span>
            <span className="block text-white">{t.hero.h1[1]}</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-400 to-orange-500">{t.hero.h1[2]}</span>
          </h1>
          <p className="text-white/30 text-xl md:text-2xl max-w-xl mx-auto mb-14 leading-relaxed font-light">{t.hero.sub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
              className="glow-btn bg-white text-[#060606] font-black text-sm uppercase tracking-[0.15em] px-12 py-5 rounded-full hover:bg-amber-300 transition-all duration-300 hover:scale-105">
              {t.hero.cta}
            </a>
            <Link href="/dashboard" className="border border-white/[0.08] text-white/40 text-sm uppercase tracking-widest px-10 py-5 rounded-full hover:border-white/20 hover:text-white/65 transition-all duration-300">
              {t.hero.ctaSec}
            </Link>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/12">
          <span className="text-[9px] uppercase tracking-[0.45em]">{t.hero.scroll}</span>
          <div className="w-px h-14 bg-gradient-to-b from-white/15 to-transparent" />
        </div>
      </section>

      {/* TICKER */}
      <div className="w-full overflow-hidden border-y border-red-900/20 bg-red-950/10 py-3">
        <div className="ticker-track flex gap-12 whitespace-nowrap w-max">
          {ticker.map((item, i) => (
            <span key={i} className="text-xs text-red-400/60 uppercase tracking-widest shrink-0">{item}</span>
          ))}
        </div>
      </div>

      {/* PROBLEM */}
      <section className="py-32 px-6 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <p className="text-red-500/50 text-[10px] uppercase tracking-[0.45em] mb-6 text-center">{t.problem.label}</p>
            <h2 className="text-4xl md:text-6xl font-black text-center mb-6 leading-tight">
              {t.problem.h2a}<br /><span className="text-red-400">{t.problem.h2b}</span>
            </h2>
            <p className="text-white/20 text-center text-sm mb-16 max-w-md mx-auto">{t.problem.intro}</p>
          </FadeSection>
          <FadeSection delay={150}>
            <div className="grid md:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
              {t.problem.stats.map((s) => (
                <div key={s.n} className="bg-[#060606] p-10 text-center group hover:bg-red-950/10 transition-colors duration-500">
                  <div className="text-5xl md:text-7xl font-black text-red-400 mb-5 group-hover:scale-105 transition-transform duration-300">{s.n}</div>
                  <p className="text-white/45 text-sm leading-relaxed mb-3">{s.label}</p>
                  <p className="text-white/12 text-xs uppercase tracking-widest">{s.sub}</p>
                </div>
              ))}
            </div>
          </FadeSection>
          <FadeSection delay={250}>
            <p className="text-center text-white/18 text-sm mt-10 max-w-lg mx-auto leading-relaxed">
              {t.problem.footer} <span className="text-white/40">{t.problem.footerEm}</span>
            </p>
          </FadeSection>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-32 px-6 border-b border-white/[0.05] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-amber-900/6 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <FadeSection>
            <p className="text-amber-400/45 text-[10px] uppercase tracking-[0.45em] mb-6 text-center">{t.how.label}</p>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-3">{t.how.h2}</h2>
            <p className="text-white/22 text-center mb-20 max-w-sm mx-auto">{t.how.sub}</p>
          </FadeSection>
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <FadeSection delay={100}>
              <div className="flex justify-center items-end gap-6">
                <PhoneMockup step={t.how.phone.step1} title={t.how.steps[0].title} active={activeStep === 0}
                  content={<div className="flex flex-col gap-2 pt-2">
                    <div className="text-[8px] text-white/30 uppercase tracking-wider mb-1">TikTok</div>
                    <div className="bg-white/5 rounded-xl p-2 aspect-video flex items-center justify-center"><span className="text-2xl">📱</span></div>
                    <div className="bg-white/5 rounded-lg px-2 py-1.5"><div className="h-1.5 bg-white/10 rounded w-3/4 mb-1" /><div className="h-1.5 bg-red-500/30 rounded w-1/2" /></div>
                    <div className="text-[7px] text-red-400/60 uppercase tracking-wider mt-1">{t.how.phone.suspicious}</div>
                  </div>} />
                <PhoneMockup step={t.how.phone.step2} title={t.how.steps[1].title} active={activeStep === 1}
                  content={<div className="flex flex-col gap-1.5 pt-2">
                    <div className="text-[8px] text-white/30 uppercase tracking-wider mb-2">{t.how.phone.choose}</div>
                    {["Fake News", "Deepfake", "Hate"].map((cat, i) => (
                      <div key={cat} className={`rounded-lg px-2.5 py-2 text-[8px] font-bold border transition-all ${i === 1 && activeStep === 1 ? "border-amber-400/40 bg-amber-400/10 text-amber-400" : "border-white/8 text-white/30"}`}>{cat}</div>
                    ))}
                    <div className="mt-3 bg-white rounded-lg py-2 text-[8px] font-black text-black text-center">{t.how.phone.report}</div>
                  </div>} />
                <PhoneMockup step={t.how.phone.step3} title={t.how.steps[2].title} active={activeStep === 2}
                  content={<div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className={`text-3xl transition-all duration-500 ${activeStep === 2 ? "float" : ""}`}>⚔️</div>
                    <div className="text-[9px] font-black text-green-400 uppercase tracking-wider">{t.how.phone.sent}</div>
                    <div className="text-[7px] text-white/25 text-center leading-relaxed">{t.how.phone.active}</div>
                    <div className="flex gap-1 mt-2">{[...Array(5)].map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 4 ? "bg-green-400/60" : "bg-white/10"}`} />))}</div>
                  </div>} />
              </div>
            </FadeSection>
            <FadeSection delay={200}>
              <div className="space-y-10">
                {t.how.steps.map((s, i) => (
                  <div key={s.n} className={`flex gap-6 items-start transition-all duration-500 ${activeStep === i ? "opacity-100" : "opacity-35"}`}>
                    <div className="w-10 h-10 rounded-full border border-amber-400/20 bg-amber-400/5 flex items-center justify-center text-amber-400/60 text-xs font-black shrink-0 mt-0.5">{s.n}</div>
                    <div><h3 className="font-black text-lg mb-2">{s.title}</h3><p className="text-white/32 text-sm leading-relaxed">{s.body}</p></div>
                  </div>
                ))}
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="py-32 px-6 border-b border-white/[0.05] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/8 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <FadeSection>
            <p className="text-amber-400/45 text-[10px] uppercase tracking-[0.45em] mb-6 text-center">{t.live.label}</p>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-20">{t.live.h2}</h2>
          </FadeSection>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <FadeSection delay={0}><Stat value={reports} label={t.live.stat1} /></FadeSection>
            <FadeSection delay={120}><Stat value={Math.max(1, Math.floor(reports * 0.7))} label={t.live.stat2} /></FadeSection>
            <FadeSection delay={240}><Stat value={100} label={t.live.stat3} suffix="%" /></FadeSection>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="py-32 px-6 border-b border-white/[0.05] bg-[#040404]">
        <div className="max-w-5xl mx-auto">
          <FadeSection>
            <p className="text-amber-400/45 text-[10px] uppercase tracking-[0.45em] mb-6 text-center">{t.vision.label}</p>
            <h2 className="text-4xl md:text-5xl font-black text-center mb-3 leading-tight">
              {t.vision.h2a}<br /><span className="text-amber-400">{t.vision.h2b}</span>
            </h2>
            <p className="text-white/20 text-center mb-20 max-w-md mx-auto">{t.vision.sub}</p>
          </FadeSection>
          <div className="grid md:grid-cols-2 gap-4">
            {t.vision.scenarios.map((s, i) => (
              <FadeSection key={s.title} delay={i * 80}>
                <div className="border border-white/[0.05] rounded-2xl p-8 hover:border-amber-400/12 transition-all duration-500 group bg-[#060606] h-full">
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{s.emoji}</span>
                    <span className="text-[9px] uppercase tracking-widest text-amber-400/35 border border-amber-400/12 px-3 py-1 rounded-full">{s.tag}</span>
                  </div>
                  <h3 className="font-black text-lg mb-3 group-hover:text-amber-300 transition-colors duration-300">{s.title}</h3>
                  <p className="text-white/30 text-sm leading-relaxed">{s.body}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFEST */}
      <section className="py-40 px-6 border-b border-white/[0.05] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-amber-900/6 rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>
        <FadeSection className="relative max-w-3xl mx-auto text-center">
          <p className="text-white/8 text-[10px] uppercase tracking-[0.5em] mb-14">{t.manifest.label}</p>
          <p className="text-3xl md:text-[2.6rem] font-black leading-[1.15] text-white/75 mb-8">
            "{t.manifest.quote[0]}<br />{t.manifest.quote[1]}<br />
            <span className="text-amber-400">{t.manifest.quote[2]}<br />{t.manifest.quote[3]}"</span>
          </p>
          <div className="w-16 h-px bg-amber-400/15 mx-auto my-12" />
          <p className="text-white/22 text-base leading-relaxed max-w-lg mx-auto">{t.manifest.sub}</p>
        </FadeSection>
      </section>

      {/* CTA */}
      <section className="py-48 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-amber-900/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>
        <FadeSection className="relative z-10 max-w-2xl mx-auto">
          <div className="text-8xl mb-10 float inline-block">⚔</div>
          <h2 className="text-6xl md:text-8xl font-black leading-[0.87] mb-8 tracking-tight">
            {t.cta.h2a}<br /><span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-400 to-orange-500">{t.cta.h2b}</span>
          </h2>
          <p className="text-white/25 text-xl mb-14 leading-relaxed max-w-lg mx-auto">{t.cta.sub}</p>
          <a href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="glow-btn inline-block bg-white text-[#060606] font-black text-sm uppercase tracking-[0.2em] px-14 py-6 rounded-full hover:bg-amber-300 transition-all duration-300 hover:scale-105 mb-8">
            {t.cta.btn}
          </a>
          <br />
          <Link href="/dashboard" className="text-white/18 text-xs uppercase tracking-widest hover:text-white/38 transition-colors duration-300">{t.cta.link}</Link>
        </FadeSection>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] px-8 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-black tracking-[0.25em] text-sm uppercase mb-1">⚔ TEMPLER</div>
            <p className="text-white/12 text-xs">{t.footer.tagline}</p>
          </div>
          <div className="flex gap-8 text-white/18 text-xs uppercase tracking-widest">
            <Link href="/dashboard" className="hover:text-amber-400/55 transition-colors">{t.footer.dashboard}</Link>
            <Link href="/report" className="hover:text-amber-400/55 transition-colors">{t.footer.report}</Link>
            <a href="https://github.com/eliaskoenig24/templer" className="hover:text-amber-400/55 transition-colors">{t.footer.github}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
