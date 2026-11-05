"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getWhatsAppUrl } from "@/app/lib/siteConfig";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400"><svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
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
      <Navbar activeMenu="blog" />

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
                <svg className="w-3.5 h-3.5 text-slate-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> {article.views} Pembaca
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
                  <svg className="w-3.5 h-3.5 fill-emerald-600 inline" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.838.896 2.791.896 3.182 0 5.769-2.587 5.77-5.766.001-3.182-2.585-5.782-5.77-5.782zm9.969 5.766c0 5.514-4.486 10-10 10-1.803 0-3.491-.482-4.957-1.321l-5.043 1.383 1.399-4.923c-.917-1.517-1.429-3.279-1.429-5.139 0-5.514 4.486-10 10-10s10 4.486 10 10z"/></svg> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={shareTwitter}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-slate-700 inline" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter / X
                </button>
                <button
                  type="button"
                  onClick={shareFacebook}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-blue-600 inline" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> {copied ? "✓ Tersalin!" : "Salin Link"}
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
                Rekomendasi Terbaik
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
                  <svg className="w-4 h-4 text-orange-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Artikel Terkait
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
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
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
      <Footer />
    </div>
  );
}
