"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SITE_CONFIG, getWhatsAppUrl } from "../lib/siteConfig";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  author: string;
  views: number;
  created_at: string;
}

export default function BlogIndexPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const response = await fetch("/api/backend/article/index.php");
        const json = await response.json();
        if (json.status === "success" && json.data) {
          setArticles(json.data.articles || []);
          setCategories(json.data.categories || []);
        }
      } catch (err) {
        console.error("Gagal memuat artikel:", err);
      } finally {
        setLoading(false);
      }
    }
    void fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat =
        selectedCategory === "Semua" ||
        art.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr.replace(" ", "T"));
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  };

  const getCategoryColor = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes("hosting")) return "bg-orange-100 text-orange-800 border-orange-200";
    if (lower.includes("seo")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (lower.includes("bisnis") || lower.includes("digital")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (lower.includes("domain") || lower.includes("dns")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (lower.includes("keamanan") || lower.includes("security")) return "bg-rose-100 text-rose-800 border-rose-200";
    if (lower.includes("ads") || lower.includes("iklan")) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <Navbar activeMenu="blog" />

      {/* =========================================================
          HERO BANNER
      ========================================================= */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-orange-50/50 via-white to-slate-50 border-b border-slate-200/60 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold">
            <span>📚</span>
            <span>PUSAT EDUKASI &amp; WAWASAN DIGITAL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Blog &amp; Panduan <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">HostingWeb ID</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Kumpulan artikel pilihan, tips SEO, tutorial server, strategi bisnis online, dan tren teknologi web untuk mendukung kesuksesan website Anda.
          </p>

          {/* SEARCH BAR */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-slate-400 text-base pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="Cari artikel hosting, SEO, domain, atau tips website..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-4">
            <button
              type="button"
              onClick={() => setSelectedCategory("Semua")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                selectedCategory === "Semua"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Semua ({articles.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setSelectedCategory(cat.category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === cat.category
                    ? "bg-orange-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN ARTICLES CONTENT
      ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Memuat artikel terbaru...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto shadow-sm">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-lg font-bold text-slate-900">Artikel tidak ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tidak ada artikel yang cocok dengan kata kunci atau kategori yang Anda pilih.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Semua");
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* FEATURED TOP ARTICLE (JIKA TIDAK SEDANG FILTER KETAT) */}
            {featuredArticle && !searchQuery && selectedCategory === "Semua" && (
              <div className="relative group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto min-h-[280px] overflow-hidden">
                  <img
                    src={featuredArticle.thumbnail || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800"}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-orange-600 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-lg shadow-md">
                      ⭐ Artikel Pilihan
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryColor(featuredArticle.category)}`}>
                        {featuredArticle.category}
                      </span>
                      <span className="text-[11px] text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500">{formatDate(featuredArticle.created_at)}</span>
                    </div>

                    <Link href={`/blog/${featuredArticle.slug}`}>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-orange-600 transition leading-snug">
                        {featuredArticle.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {featuredArticle.author.charAt(0)}
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-slate-800">{featuredArticle.author}</strong>
                        <span className="text-[10px] text-slate-400">Penulis Spesialis</span>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${featuredArticle.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition group-hover:translate-x-1"
                    >
                      <span>Baca Selengkapnya</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* ARTICLES GRID */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Daftar Artikel</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {filteredArticles.length}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {(searchQuery || selectedCategory !== "Semua" ? filteredArticles : remainingArticles).map((article) => (
                  <article
                    key={article.id}
                    className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* THUMBNAIL */}
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                        <img
                          src={article.thumbnail || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md bg-white/90 ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="p-5 sm:p-6 space-y-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>📅 {formatDate(article.created_at)}</span>
                          <span>•</span>
                          <span>👁️ {article.views} views</span>
                        </div>

                        <Link href={`/blog/${article.slug}`}>
                          <h4 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition leading-snug line-clamp-2">
                            {article.title}
                          </h4>
                        </Link>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* CARD FOOTER */}
                    <div className="p-5 sm:p-6 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                          {article.author.charAt(0)}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600">{article.author}</span>
                      </div>

                      <Link
                        href={`/blog/${article.slug}`}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 transition inline-flex items-center gap-1 group-hover:translate-x-0.5"
                      >
                        Baca →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          CTA BANNER
      ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3 py-1 bg-orange-600/30 text-orange-400 border border-orange-500/30 text-[10px] font-extrabold uppercase tracking-wider rounded-full">
              🚀 Siap Membangun Website Anda?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dapatkan Cloud Hosting NVMe Cepat &amp; Domain Gratis Hari Ini
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tingkatkan kecepatan dan reputasi bisnis Anda dengan paket hosting bergaransi uptime 99.9% dan dukungan teknis 24/7.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/#pricing"
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition transform active:scale-95"
              >
                Lihat Paket Hosting →
              </Link>
              <a
                href={getWhatsAppUrl("Halo Admin HostingWeb, saya membaca artikel di blog dan ingin konsultasi paket hosting.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl backdrop-blur-sm transition"
              >
                Konsultasi WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <Footer />
    </div>
  );
}
