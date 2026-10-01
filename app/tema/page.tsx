"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getWhatsAppUrl, SITE_CONFIG } from "../lib/siteConfig";
import { getThemes, ThemeItem } from "../lib/themeStore";

export default function TemaPage() {
  const router = useRouter();
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadThemes();
    window.addEventListener("themes_updated", loadThemes);
    return () => {
      window.removeEventListener("themes_updated", loadThemes);
    };
  }, []);

  function loadThemes() {
    const list = getThemes().filter((t) => (t.status || "active") === "active");
    setThemes(list);
  }

  // Dynamic Categories from active themes
  const availableCategories = [
    "Semua",
    ...Array.from(new Set(themes.map((t) => t.category).filter(Boolean))),
  ];

  const filteredThemes = themes.filter((theme) => {
    const matchesCategory = selectedCategory === "Semua" || theme.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (theme.demoUrl || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOrderTheme = (theme: ThemeItem) => {
    const targetUrl = `/checkout?type=theme&package=${encodeURIComponent(
      theme.name
    )}&price=${theme.price}&domain=${encodeURIComponent(`Tema: ${theme.name}`)}`;
    router.push(targetUrl);
  };

  function rupiah(val: number) {
    return `Rp ${new Intl.NumberFormat("id-ID").format(val || 0)}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* NAVBAR */}
      <Navbar activeMenu="tema" />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-slate-900 py-20 md:py-28 flex items-center justify-center text-center">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80')",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 85%)",
            }}
          />

          <div className="relative container mx-auto px-4 z-10 max-w-4xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-5">
              <span>🎨 KATALOG TEMA &amp; TEMPLATE PREMIUM</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Pilihan Desain Website
              <br />
              <span className="text-orange-500">Modern &amp; Siap Pakai.</span>
            </h1>

            <p className="mt-5 text-sm md:text-lg text-slate-300 font-medium max-w-2xl leading-relaxed">
              Jelajahi ratusan template desain profesional siap pakai untuk berbagai bidang bisnis Anda. Ringan, responsif, dan siap langsung mendatangkan pelanggan.
            </p>

            {/* QUICK STATS PILLS */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                ⚡ 100% Mobile Friendly
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                🚀 SEO &amp; Ads Ready
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                💬 Integrasi WhatsApp
              </span>
            </div>
          </div>
        </section>

        {/* CATALOG SECTION */}
        <section className="py-16 md:py-24 container mx-auto px-4 max-w-7xl">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            {/* CATEGORY BUTTONS */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-orange-600 text-white shadow-md shadow-orange-500/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* SEARCH INPUT */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Cari tema / bidang bisnis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* THEMES GRID */}
          {filteredThemes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group"
                >
                  {/* PREVIEW IMAGE */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden group/img">
                    <img
                      src={theme.image}
                      alt={theme.name}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    />
                    
                    {/* HOVER OVERLAY FOR LIVE DEMO */}
                    {theme.demoUrl && (
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                        <a
                          href={theme.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-extrabold shadow-xl hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center gap-2 transform translate-y-2 group-hover/img:translate-y-0 duration-300"
                        >
                          <span>👁️</span> Buka Live Demo Web
                          <span className="text-slate-400">↗</span>
                        </a>
                      </div>
                    )}

                    {theme.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-orange-600 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md z-10">
                        {theme.badge}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold z-10">
                      {theme.category}
                    </span>
                  </div>

                  {/* BODY */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {theme.name}
                        </h3>
                      </div>
                      
                      <p className="mt-2 text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-2">
                        {theme.description}
                      </p>

                      {/* FEATURES LIST */}
                      <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                        {theme.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* PRICING & ACTIONS */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <del className="text-xs text-slate-400 block">{rupiah(theme.originalPrice)}</del>
                          <strong className="text-xl font-extrabold text-slate-900">{rupiah(theme.price)}</strong>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold">
                          Hemat 50%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        {theme.demoUrl ? (
                          <a
                            href={theme.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <span>👁️</span> Lihat Demo
                          </a>
                        ) : (
                          <a
                            href={getWhatsAppUrl(`Halo Admin HostingWeb, saya ingin melihat live demo tema *${theme.name}*.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <span>👁️</span> Lihat Demo
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOrderTheme(theme)}
                          className="px-3 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-center text-xs font-bold transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                        >
                          <span>🛍️</span> Beli Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
              <span className="text-4xl block mb-3">🔍</span>
              <h3 className="text-lg font-bold text-slate-800">Tidak ada tema ditemukan</h3>
              <p className="text-sm text-slate-500 mt-1">Coba kata kunci lain atau pilih kategori &quot;Semua&quot;.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("Semua");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          {/* CUSTOM REQUEST BANNER */}
          <div className="mt-16 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="max-w-xl">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
                CUSTOM REQUEST DESIGN
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
                Punya Contoh Desain atau Referensi Sendiri?
              </h3>
              <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">
                Kirimkan link website referensi atau desain Figma impian Anda. Tim desainer kami siap membuatkan website persis sesuai kebutuhan bisnis Anda.
              </p>
            </div>
            <a
              href={getWhatsAppUrl("Halo Admin HostingWeb, saya memiliki contoh referensi desain website sendiri dan ingin konsultasi pembuatan custom.")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shrink-0 transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2"
            >
              <span>💬 Request Desain Custom</span>
              <span>→</span>
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
