"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Falschinformation / Fake News",
  "Deepfake / KI-generierter Inhalt",
  "Hassrede / Aufrufe zur Gewalt",
  "Politische Manipulation",
  "Gesundheitliche Fehlinformation",
  "Finanzielle Manipulation",
  "Kriegspropaganda",
  "Sonstiges",
];

const PLATFORMS = [
  "TikTok", "Instagram", "Twitter/X", "Facebook", "YouTube",
  "Telegram", "WhatsApp", "Reddit", "Sonstige",
];

export default function ReportPage() {
  const [form, setForm] = useState({
    content_url: "",
    platform: "",
    category: "",
    description: "",
    reporter_country: "",
    anonymous: true,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const { error } = await supabase.from("reports").insert([
      {
        content_url: form.content_url || null,
        platform: form.platform,
        category: form.category,
        description: form.description,
        reporter_country: form.reporter_country || null,
        anonymous: form.anonymous,
        verified_count: 0,
        disputed_count: 0,
      },
    ]);

    if (error) {
      setStatus("error");
    } else {
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
        <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-red-500 text-xs uppercase tracking-widest mb-3">Knight-Meldung</div>
          <h1 className="text-3xl font-bold mb-3">Inhalt melden</h1>
          <p className="text-zinc-400">Deine Meldung landet sofort im globalen Templer-Netzwerk und wird von anderen Knights verifiziert.</p>
        </div>

        {status === "success" ? (
          <div className="border border-green-700 bg-green-950 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">⚔️</div>
            <h2 className="text-xl font-bold text-green-400 mb-2">Meldung eingereicht</h2>
            <p className="text-zinc-400 mb-6">Das Netzwerk wurde benachrichtigt. Andere Knights werden deinen Fund verifizieren.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setStatus("idle")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded transition-colors"
              >
                Weiteres melden
              </button>
              <Link href="/dashboard" className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-6 py-3 rounded transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Plattform *</label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, platform: p })}
                    className={`py-2 px-3 rounded text-sm border transition-colors ${
                      form.platform === p
                        ? "border-red-600 bg-red-600/20 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Art des Inhalts *</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, category: c })}
                    className={`py-2 px-3 rounded text-sm border transition-colors text-left ${
                      form.category === c
                        ? "border-red-600 bg-red-600/20 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Link zum Inhalt (optional)</label>
              <input
                type="url"
                value={form.content_url}
                onChange={(e) => setForm({ ...form, content_url: e.target.value })}
                placeholder="https://..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Beschreibung *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Was hast du gesehen? Was ist falsch oder gefährlich daran?"
                rows={4}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Dein Land (optional)</label>
              <input
                type="text"
                value={form.reporter_country}
                onChange={(e) => setForm({ ...form, reporter_country: e.target.value })}
                placeholder="z.B. Deutschland"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-4 py-3 text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.anonymous ? "bg-red-600" : "bg-zinc-700"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.anonymous ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm text-zinc-400">Anonym melden</span>
            </div>

            {status === "error" && (
              <div className="border border-red-800 bg-red-950/50 rounded px-4 py-3 text-red-400 text-sm">
                Fehler beim Einreichen. Bitte versuche es erneut.
              </div>
            )}

            <button
              type="submit"
              disabled={!form.platform || !form.category || !form.description || status === "loading"}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded transition-colors text-lg"
            >
              {status === "loading" ? "Wird eingereicht..." : "⚔️ Meldung einreichen"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
