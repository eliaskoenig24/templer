"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [stats, setStats] = useState({ reports: 0, knights: 0, countries: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      const { count: reportCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });

      const { data: countryData } = await supabase
        .from("reports")
        .select("reporter_country");

      const uniqueCountries = new Set(
        (countryData || []).map((r) => r.reporter_country).filter(Boolean)
      ).size;

      setStats({
        reports: reportCount || 0,
        knights: Math.floor((reportCount || 0) * 0.6),
        countries: uniqueCountries || 0,
      });
      setLoaded(true);
    }
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center font-bold text-sm">T</div>
          <span className="font-semibold tracking-widest text-sm uppercase">Templer</span>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">Dashboard</Link>
          <Link href="/report" className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded transition-colors">Melden</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-block border border-red-600/30 bg-red-600/10 text-red-400 text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-8">
          Das Immunsystem des Internets
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Wahrheit gehört{" "}
          <span className="text-red-500">allen</span>.
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Templer ist ein globales Netzwerk aus Knights — Menschen die Falschinformation,
          gefährliche Inhalte und Manipulation weltweit in Echtzeit melden und verifizieren.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://www.icloud.com/shortcuts/004285ffce5f46ed8c1139a7a4ee12db"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded transition-colors text-lg"
          >
            ⚔️ iOS Shortcut installieren
          </a>
          <Link
            href="/dashboard"
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold px-8 py-4 rounded transition-colors text-lg"
          >
            Live-Dashboard
          </Link>
        </div>
        <p className="text-zinc-600 text-sm mt-4">
          Einmal installieren → doppelt auf iPhone-Rückseite tippen → melden. Kostenlos. Anonym.
        </p>
      </section>

      {/* Live Stats */}
      <section className="border-y border-zinc-800 bg-zinc-950 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className={`text-4xl font-bold text-red-500 transition-all duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}>
              {stats.reports.toLocaleString("de-DE")}
            </div>
            <div className="text-zinc-500 text-sm mt-2 uppercase tracking-wider">Meldungen</div>
          </div>
          <div>
            <div className={`text-4xl font-bold text-red-500 transition-all duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}>
              {stats.knights.toLocaleString("de-DE")}
            </div>
            <div className="text-zinc-500 text-sm mt-2 uppercase tracking-wider">Knights</div>
          </div>
          <div>
            <div className={`text-4xl font-bold text-red-500 transition-all duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}>
              {stats.countries}
            </div>
            <div className="text-zinc-500 text-sm mt-2 uppercase tracking-wider">Länder</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">Wie Templer funktioniert</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Du siehst etwas",
              desc: "Falschinformation, gefährlicher Inhalt, Manipulation — auf jeder Plattform, in jedem Land.",
            },
            {
              step: "02",
              title: "Du meldest es",
              desc: "Screenshot, Link, Beschreibung. 30 Sekunden. Anonym möglich.",
            },
            {
              step: "03",
              title: "Das Netzwerk verifiziert",
              desc: "Andere Knights bestätigen oder widersprechen. Schwarmintelligenz schlägt jeden Algorithmus.",
            },
          ].map((item) => (
            <div key={item.step} className="border border-zinc-800 rounded-lg p-6">
              <div className="text-red-600 font-bold text-sm mb-4 tracking-widest">{item.step}</div>
              <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 bg-zinc-950 py-24 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Werde Knight.</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          Kostenlos. Anonym. Non-profit. Deine Meldung zählt.
        </p>
        <Link
          href="/report"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4 rounded transition-colors text-lg inline-block"
        >
          Jetzt beitreten
        </Link>
      </section>

      <footer className="border-t border-zinc-800 px-6 py-6 text-center text-zinc-600 text-xs">
        Templer — Non-profit. Open Source. Für alle.
      </footer>
    </main>
  );
}
