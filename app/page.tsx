"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";
import { INDEPENDENT_TRANSLATIONS } from "@/lib/translations";
import type { Lang } from "@/lib/translations";

function AgoraLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" />
      <circle cx="12" cy="4.5" r="1.5" />
      <circle cx="19" cy="8.25" r="1.5" />
      <circle cx="19" cy="15.75" r="1.5" />
      <circle cx="12" cy="19.5" r="1.5" />
      <circle cx="5" cy="15.75" r="1.5" />
      <circle cx="5" cy="8.25" r="1.5" />
    </svg>
  );
}

const INFOBOX: Record<Lang, { founded: string; status: string; languages: string; platforms: string; reports: string; license: string }> = {
  de: { founded: "Gegründet", status: "Status", languages: "Sprachen", platforms: "Plattformen", reports: "Meldungen", license: "Lizenz" },
  en: { founded: "Founded", status: "Status", languages: "Languages", platforms: "Platforms", reports: "Reports", license: "License" },
  es: { founded: "Fundada", status: "Estado", languages: "Idiomas", platforms: "Plataformas", reports: "Informes", license: "Licencia" },
  fr: { founded: "Fondée", status: "Statut", languages: "Langues", platforms: "Plateformes", reports: "Signalements", license: "Licence" },
  pt: { founded: "Fundada", status: "Status", languages: "Idiomas", platforms: "Plataformas", reports: "Denúncias", license: "Licença" },
  ru: { founded: "Основана", status: "Статус", languages: "Языки", platforms: "Платформы", reports: "Сообщения", license: "Лицензия" },
  ar: { founded: "تأسست", status: "الحالة", languages: "اللغات", platforms: "المنصات", reports: "التقارير", license: "الترخيص" },
  zh: { founded: "创立", status: "状态", languages: "语言", platforms: "平台", reports: "举报", license: "许可证" },
  hi: { founded: "स्थापित", status: "स्थिति", languages: "भाषाएं", platforms: "प्लेटफ़ॉर्म", reports: "रिपोर्ट", license: "लाइसेंस" },
  id: { founded: "Didirikan", status: "Status", languages: "Bahasa", platforms: "Platform", reports: "Laporan", license: "Lisensi" },
  tr: { founded: "Kuruluş", status: "Durum", languages: "Diller", platforms: "Platformlar", reports: "Raporlar", license: "Lisans" },
};

export default function Home() {
  const { t, lang } = useTranslation();
  const ind = INDEPENDENT_TRANSLATIONS[lang];
  const ib = INFOBOX[lang];
  const [reports, setReports] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("spam", false)
      .then(({ count }) => setReports(count ?? 0));
  }, []);

  return (
    <main className="bg-white text-slate-900 antialiased min-h-screen">

      {/* NAV */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AgoraLogo size={18} className="text-red-600" />
            <span className="font-serif font-bold text-xl tracking-tight">Agora</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <LangSwitcher />
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">{t.nav.dashboard}</Link>
            <Link href="/report" className="text-slate-700 hover:text-slate-900 font-medium transition-colors">{t.footer.report}</Link>
          </div>
        </div>
      </nav>

      {/* ARTICLE HEADER + INFOBOX */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-2">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Article */}
          <article className="flex-1 min-w-0">
            <h1 className="text-4xl font-serif font-bold leading-tight mb-1">Agora</h1>
            <p className="text-sm text-slate-500 italic mb-4">{t.hero.badge}</p>
            <hr className="border-slate-200 mb-4" />
            <p className="text-slate-800 leading-relaxed mb-5 text-base max-w-2xl">{t.hero.sub}</p>
            <div className="flex items-center gap-5 mb-6 flex-wrap">
              {reports !== null && reports > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {reports.toLocaleString()} {t.hero.reports}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/report"
                className="bg-red-600 text-white text-sm font-medium px-5 py-2 rounded hover:bg-red-700 transition-colors">
                {t.hero.cta}
              </Link>
              <Link href="/dashboard"
                className="border border-slate-200 text-slate-600 text-sm px-5 py-2 rounded hover:border-slate-300 hover:text-slate-900 transition-colors">
                {t.hero.ctaSec}
              </Link>
            </div>
          </article>

          {/* Infobox */}
          <aside className="w-full lg:w-60 shrink-0 lg:mt-0 mt-4">
            <div className="border border-slate-300 rounded text-sm overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-300 px-3 py-4 text-center">
                <AgoraLogo size={36} className="text-red-600 mx-auto mb-2" />
                <p className="font-serif font-bold text-base">Agora</p>
              </div>
              <table className="w-full">
                <tbody>
                  {[
                    { label: ib.founded, value: "2024", red: false },
                    { label: ib.status, value: "Non-Profit", red: false },
                    { label: ib.languages, value: "11", red: false },
                    { label: ib.platforms, value: "8+", red: false },
                    { label: ib.reports, value: reports !== null ? reports.toLocaleString() : "…", red: true },
                    { label: ib.license, value: "Open Source", red: false },
                  ].map((row, i, arr) => (
                    <tr key={row.label} className={i < arr.length - 1 ? "border-b border-slate-200" : ""}>
                      <td className="px-3 py-2 bg-slate-50 font-medium text-slate-600 w-[45%] align-top text-xs">{row.label}</td>
                      <td className={`px-3 py-2 text-xs ${row.red ? "text-red-600 font-semibold" : "text-slate-700"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>
        </div>
      </div>

      {/* STATS */}
      <section className="border-y border-slate-100 bg-slate-50 mt-10">
        <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {t.problem.stats.map((s) => (
            <div key={s.n} className="py-6 md:py-0 px-4 md:px-10 text-center">
              <div className="text-3xl font-serif font-bold text-red-600 mb-1.5">{s.n}</div>
              <p className="text-sm text-slate-700 mb-1 leading-snug">{s.label}</p>
              <p className="text-xs text-slate-400 font-mono">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="font-serif font-bold text-2xl mb-1">{t.how.h2}</h2>
        <p className="text-slate-400 text-sm border-b border-slate-200 pb-4 mb-8">{t.how.sub}</p>
        <div className="space-y-8">
          {t.how.steps.map((s, i) => (
            <div key={i} className="flex gap-5">
              <div className="w-7 h-7 shrink-0 rounded-full border border-red-200 bg-red-50 flex items-center justify-center mt-0.5">
                <span className="text-red-600 text-xs font-bold font-mono">{i + 1}</span>
              </div>
              <div className="pt-0.5">
                <h3 className="font-serif font-semibold text-slate-900 mb-1.5">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INDEPENDENCE */}
      <section className="border-y border-slate-100 bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1">
              <h2 className="font-serif font-bold text-2xl mb-1">{ind.title}</h2>
              <p className="text-red-600 font-semibold mb-4">{ind.titleB}</p>
              <p className="text-slate-600 leading-relaxed text-sm max-w-xl">{ind.body}</p>
            </div>
            <div className="flex flex-wrap gap-2 md:pt-1 shrink-0">
              {ind.tags.map((tag) => (
                <span key={tag} className="text-xs border border-slate-300 text-slate-500 px-3 py-1.5 rounded-full bg-white">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="font-serif font-bold text-2xl mb-1">{t.vision.label}</h2>
        <p className="text-slate-400 text-sm border-b border-slate-200 pb-4 mb-8">{t.vision.sub}</p>
        <div className="grid md:grid-cols-2 gap-4">
          {t.vision.scenarios.map((s) => (
            <div key={s.title} className="border border-slate-200 rounded-lg p-5 hover:border-slate-300 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl shrink-0">{s.emoji}</span>
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">{s.tag}</p>
                  <h3 className="font-serif font-semibold text-slate-900 text-sm">{s.title}</h3>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEFINITION BLOCK */}
      <section className="border-y border-slate-100 bg-slate-50 py-14">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-6 font-mono">{t.manifest.label}</p>
          <blockquote className="border-l-4 border-red-600 pl-6 mb-6">
            <p className="font-serif font-bold text-2xl md:text-3xl text-slate-900 leading-snug">
              {t.manifest.quote[0]}<br />
              <span className="text-sm font-normal text-slate-400 font-mono tracking-widest">{t.manifest.quote[1]}</span><br />
              <span className="text-slate-700">{t.manifest.quote[2]}<br />
                <span className="text-red-600">{t.manifest.quote[3]}</span>
              </span>
            </p>
          </blockquote>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xl">{t.manifest.sub}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="font-serif font-bold text-2xl md:text-3xl mb-3">{t.cta.h2a} {t.cta.h2b}</h2>
        <p className="text-slate-500 mb-8 leading-relaxed max-w-lg">{t.cta.sub}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/report"
            className="inline-block bg-red-600 text-white text-sm font-medium px-6 py-3 rounded hover:bg-red-700 transition-colors text-center">
            {t.cta.btn}
          </Link>
          <Link href="/dashboard"
            className="inline-block border border-slate-200 text-slate-600 text-sm px-6 py-3 rounded hover:border-slate-300 hover:text-slate-900 transition-colors text-center">
            {t.cta.link}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <AgoraLogo size={14} className="text-red-600" />
              <span className="text-sm font-serif font-semibold text-slate-900">Agora</span>
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
