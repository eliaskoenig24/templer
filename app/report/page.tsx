"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useTranslation, LangSwitcher } from "@/lib/i18n";

export default function ReportPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ content_url: "", platform: "", category: "", description: "", reporter_country: "", anonymous: true });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const { error } = await supabase.from("reports").insert([{
      content_url: form.content_url || null,
      platform: form.platform,
      category: form.category,
      description: form.description,
      reporter_country: form.reporter_country || null,
      anonymous: form.anonymous,
      verified_count: 0,
      disputed_count: 0,
    }]);
    if (error) { setStatus("error"); } else {
      setStatus("success");
      setForm({ content_url: "", platform: "", category: "", description: "", reporter_country: "", anonymous: true });
    }
  }

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
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">{t.nav.dashboard}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-14">
        <div className="mb-10">
          <p className="text-red-600 text-xs font-medium uppercase tracking-wider mb-2">{t.report.knightLabel}</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{t.report.h1}</h1>
          <p className="text-slate-500 text-sm leading-relaxed">{t.report.sub}</p>
        </div>

        {status === "success" ? (
          <div className="border border-green-200 bg-green-50 rounded-xl p-8 text-center">
            <div className="text-3xl mb-4">⚔️</div>
            <h2 className="text-lg font-bold text-green-700 mb-2">{t.report.successTitle}</h2>
            <p className="text-slate-500 text-sm mb-6">{t.report.successSub}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setStatus("idle")} className="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2.5 rounded-md transition-colors">
                {t.report.again}
              </button>
              <Link href="/dashboard" className="border border-slate-200 hover:border-slate-300 text-slate-600 text-sm px-5 py-2.5 rounded-md transition-colors">
                {t.nav.dashboard}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.report.platform}</label>
              <div className="grid grid-cols-3 gap-2">
                {t.report.platforms.map((p) => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, platform: p })}
                    className={`py-2 px-3 rounded-md text-sm border transition-colors ${
                      form.platform === p
                        ? "border-red-600 bg-red-50 text-red-700 font-medium"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.report.category}</label>
              <div className="grid grid-cols-2 gap-2">
                {t.report.categories.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                    className={`py-2 px-3 rounded-md text-sm border transition-colors text-left ${
                      form.category === c
                        ? "border-red-600 bg-red-50 text-red-700 font-medium"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.report.url}</label>
              <input type="url" value={form.content_url} onChange={(e) => setForm({ ...form, content_url: e.target.value })}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-colors" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.report.desc}</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t.report.descPlaceholder} rows={4} required
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-colors resize-none" />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.report.country}</label>
              <input type="text" value={form.reporter_country} onChange={(e) => setForm({ ...form, reporter_country: e.target.value })}
                placeholder={t.report.countryPlaceholder}
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-colors" />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
                className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${form.anonymous ? "bg-red-600" : "bg-slate-200"}`}
                style={{ height: "22px" }}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] shadow-sm transition-transform ${form.anonymous ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm text-slate-500">{t.report.anon}</span>
            </div>

            {status === "error" && (
              <div className="border border-red-200 bg-red-50 rounded-md px-4 py-3 text-red-600 text-sm">{t.report.error}</div>
            )}

            <button type="submit" disabled={!form.platform || !form.category || !form.description || status === "loading"}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded-md transition-colors text-sm">
              {status === "loading" ? t.report.submitting : t.report.submit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
