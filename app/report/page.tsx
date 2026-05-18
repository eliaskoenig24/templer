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
    <main className="min-h-screen bg-black text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center font-bold text-sm">T</div>
          <span className="font-semibold tracking-widest text-sm uppercase">Templer</span>
        </Link>
        <div className="flex items-center gap-6">
          <LangSwitcher />
          <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">{t.nav.dashboard}</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-red-500 text-xs uppercase tracking-widest mb-3">{t.report.knightLabel}</div>
          <h1 className="text-3xl font-bold mb-3">{t.report.h1}</h1>
          <p className="text-zinc-400">{t.report.sub}</p>
        </div>

        {status === "success" ? (
          <div className="border border-green-700 bg-green-950 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">⚔️</div>
            <h2 className="text-xl font-bold text-green-400 mb-2">{t.report.successTitle}</h2>
            <p className="text-zinc-400 mb-6">{t.report.successSub}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setStatus("idle")} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded transition-colors">
                {t.report.again}
              </button>
              <Link href="/dashboard" className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-6 py-3 rounded transition-colors">
                {t.nav.dashboard}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t.report.platform}</label>
              <div className="grid grid-cols-3 gap-2">
                {t.report.platforms.map((p) => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, platform: p })}
                    className={`py-2 px-3 rounded text-sm border transition-colors ${form.platform === p ? "border-red-600 bg-red-600/20 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t.report.category}</label>
              <div className="grid grid-cols-2 gap-2">
                {t.report.categories.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                    className={`py-2 px-3 rounded text-sm border transition-colors text-left ${form.category === c ? "border-red-600 bg-red-600/20 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t.report.url}</label>
              <input type="url" value={form.content_url} onChange={(e) => setForm({ ...form, content_url: e.target.value })}
                placeholder="https://..." className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t.report.desc}</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t.report.descPlaceholder} rows={4} required
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none transition-colors resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t.report.country}</label>
              <input type="text" value={form.reporter_country} onChange={(e) => setForm({ ...form, reporter_country: e.target.value })}
                placeholder={t.report.countryPlaceholder}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none transition-colors" />
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.anonymous ? "bg-red-600" : "bg-zinc-700"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.anonymous ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm text-zinc-400">{t.report.anon}</span>
            </div>

            {status === "error" && (
              <div className="border border-red-800 bg-red-950/50 rounded px-4 py-3 text-red-400 text-sm">{t.report.error}</div>
            )}

            <button type="submit" disabled={!form.platform || !form.category || !form.description || status === "loading"}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded transition-colors text-lg">
              {status === "loading" ? t.report.submitting : t.report.submit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
