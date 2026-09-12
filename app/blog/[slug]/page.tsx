"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getWhatsAppUrl } from "@/app/lib/siteConfig";

interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  author: string;
  views: number;
  created_at: string;
  updated_at: string;
}

interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  author: string;
  created_at: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchArticleDetail() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/backend/article/detail.php?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();

        if (json.status !== "success" || !json.data?.article) {
          throw new Error(json.message || "Artikel tidak ditemukan.");
        }

        setArticle(json.data.article);
        setRelated(json.data.related || []);
      } catch (err: any) {
        setError(err.message || "Gagal memuat artikel.");
      } finally {
        setLoading(false);
      }
    }

    void fetchArticleDetail();
  }, [slug]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr.replace(" ", "T"));
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    if (typeof window !== "undefined" && article) {
      const text = encodeURIComponent(`Baca artikel menarik: "${article.title}" di ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  const shareTwitter = () => {
    if (typeof window !== "undefined" && article) {
      const text = encodeURIComponent(article.title);
      const url = encodeURIComponent(window.location.href);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    }
  };

  const shareFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Memuat isi artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <span className="text-4xl block">📄</span>
          <h2 className="text-xl font-bold text-slate-900">Artikel Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            {error || "Artikel yang Anda tuju mungkin telah dipindahkan atau dihapus."}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/blog"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              ← Kembali ke Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* =========================================================
          TOP NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="HostingWeb ID" className="h-10 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-orange-600 transition">Beranda</Link>
            <Link href="/#pricing" className="hover:text-orange-600 transition">Hosting</Link>
            <Link href="/#domain" className="hover:text-orange-600 transition">Domain</Link>
            <Link href="/#google-ads" className="hover:text-orange-600 transition">Google Ads</Link>
            <Link href="/blog" className="text-orange-600 font-bold">Blog &amp; Artikel</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl transition"
            >
              ← Semua Artikel
            </Link>
            <Link
              href="/#pricing"
              className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-600/20 transition transform active:scale-95"
            >
              Pesan Hosting →
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          ARTICLE HERO HEADER
      ========================================================= */}
      <header className="bg-gradient-to-b from-orange-50/40 via-white to-slate-50 border-b border-slate-200/70 pt-10 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {/* BREADCRUMB */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-orange-600 transition">Beranda</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-orange-600 transition">Blog</Link>
            <span>/</span>
            <span className="text-orange-600 truncate max-w-xs">{article.category}</span>
          </nav>

          {/* CATEGORY BADGE */}
          <div>
            <span className="inline-block px-3 py-1 bg-orange-100 border border-orange-200 text-orange-800 text-xs font-extrabold uppercase tracking-wider rounded-full">
              {article.category}
            </span>
          </div>

          {/* MAIN TITLE */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* METADATA ROW */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
                {article.author.charAt(0)}
              </div>
              <div>
                <strong className="block text-xs font-bold text-slate-900">{article.author}</strong>
                <span className="text-[11px] text-slate-500">Diterbitkan pada {formatDate(article.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span>👁️</span> {article.views} Pembaca
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>⏱️</span> 3 Menit Baca
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN ARTICLE CONTENT & SIDEBAR
      ========================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* ARTICLE CONTENT (8 COLUMNS) */}
          <div className="lg:col-span-8 space-y-8">
            {/* FEATURED IMAGE */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 max-h-[460px]">
              <img
                src={article.thumbnail || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200"}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* EXCERPT LEAD */}
            <div className="p-5 sm:p-6 bg-orange-50/60 border-l-4 border-orange-500 rounded-r-2xl">
              <p className="text-sm sm:text-base font-semibold text-slate-800 italic leading-relaxed">
                &ldquo;{article.excerpt}&rdquo;
              </p>
            </div>

            {/* FORMATTED ARTICLE BODY */}
            <div
              className="article-body-content text-slate-800 leading-relaxed text-sm sm:text-base space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* SHARE BUTTONS */}
            <div className="pt-8 border-t border-slate-200">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Bagikan Artikel Ini:
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <span>💬</span> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={shareTwitter}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <span>🐦</span> Twitter / X
                </button>
                <button
                  type="button"
                  onClick={shareFacebook}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <span>📘</span> Facebook
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <span>🔗</span> {copied ? "✓ Tersalin!" : "Salin Link"}
                </button>
              </div>
            </div>
          </div>

          {/* SIDEBAR (4 COLUMNS) */}
          <aside className="lg:col-span-4 space-y-8">
            {/* PROMO HOSTING CARD */}
            <div className="bg-gradient-to-br from-orange-600 via-orange-600 to-amber-600 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full inline-block">
                🔥 Rekomendasi Terbaik
              </span>
              <h3 className="text-xl font-black leading-snug">
                Butuh Hosting Cepat untuk Website Anda?
              </h3>
              <p className="text-xs text-orange-100 leading-relaxed">
                Gunakan Cloud Hosting NVMe High Speed dengan jaminan 99.9% uptime, SSL gratis, dan domain .com gratis.
              </p>
              <div className="pt-2">
                <Link
                  href="/#pricing"
                  className="w-full py-3 bg-white hover:bg-orange-50 text-orange-700 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  ⚡ Pesan Hosting Sekarang →
                </Link>
              </div>
            </div>

            {/* RELATED ARTICLES */}
            {related.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>📑</span> Artikel Terkait
                </h4>

                <div className="space-y-4">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/blog/${item.slug}`}
                      className="group flex gap-3 items-center hover:bg-slate-50 p-2 rounded-2xl transition"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={item.thumbnail || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-orange-600 block">
                          {item.category}
                        </span>
                        <h5 className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition line-clamp-2 leading-snug">
                          {item.title}
                        </h5>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CONSULTATION BANNER */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 text-center">
              <span className="text-3xl block">💬</span>
              <h4 className="text-sm font-black text-slate-900">Konsultasi Gratis</h4>
              <p className="text-xs text-slate-500">
                Punya pertanyaan mengenai pembuatan website, hosting, atau iklan?
              </p>
              <a
                href={getWhatsAppUrl(`Halo Tim HostingWeb ID, saya membaca artikel "${article.title}" dan ingin konsultasi lebih lanjut.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition inline-flex items-center justify-center gap-1.5"
              >
                Chat WhatsApp Ahli →
              </a>
            </div>
          </aside>
        </div>
      </main>

      {/* STYLES FOR INNER HTML ARTICLE CONTENT */}
      <style jsx global>{`
        .article-body-content h2 {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .article-body-content h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .article-body-content p {
          margin-bottom: 1.25rem;
          line-height: 1.75;
          color: #334155;
        }
        .article-body-content ul, .article-body-content ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
          line-height: 1.75;
          color: #334155;
        }
        .article-body-content li {
          margin-bottom: 0.5rem;
          list-style-type: disc;
        }
        .article-body-content strong {
          color: #0f172a;
          font-weight: 700;
        }
        .article-body-content code {
          background-color: #f1f5f9;
          color: #ea580c;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.85em;
          font-family: monospace;
        }
      `}</style>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} HostingWeb ID. Solusi Hosting, Domain &amp; Website Terpercaya.</p>
          <div className="flex gap-6 font-medium">
            <Link href="/" className="hover:text-orange-600">Beranda</Link>
            <Link href="/blog" className="hover:text-orange-600">Blog</Link>
            <Link href="/#pricing" className="hover:text-orange-600">Hosting</Link>
            <Link href="/#domain" className="hover:text-orange-600">Domain</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
