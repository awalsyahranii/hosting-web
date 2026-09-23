"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getSeoPackages, SeoPackage } from "../lib/seoStore";
import { getWhatsAppUrl, SITE_CONFIG } from "../lib/siteConfig";

export default function JasaSeoPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<SeoPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const handleBuySeo = (pkg: SeoPackage) => {
    const targetUrl = `/checkout?type=seo&package=${encodeURIComponent(
      pkg.name
    )}&price=${pkg.price}&domain=${encodeURIComponent(`Paket ${pkg.name}`)}`;
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("hostingwebid_user") : null;
    if (!savedUser) {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  useEffect(() => {
    function loadPackages() {
      const pkgs = getSeoPackages();
      // Filter active packages for public display
      setPackages(pkgs.filter((p) => p.status === "active"));
      setLoading(false);
    }

    loadPackages();

    window.addEventListener("seo_packages_updated", loadPackages);
    return () => {
      window.removeEventListener("seo_packages_updated", loadPackages);
    };
  }, []);

  function rupiah(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  }

  function formatShortRupiah(val: number) {
    return `Rp.${new Intl.NumberFormat("id-ID").format(val || 0)}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* NAVBAR */}
      <Navbar activeMenu="seo" />

      <main className="flex-1">
        {/* =========================================================
            HERO BANNER SECTION (MATCHING SCREENSHOT)
        ========================================================= */}
        <section className="relative overflow-hidden bg-slate-900 py-24 md:py-32 flex items-center justify-center text-center">
          {/* Background image with overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: "url('/images/seo-hero-bg.jpg')",
            }}
          />
          {/* Gradient Tint Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(14, 116, 144, 0.65) 0%, rgba(15, 23, 42, 0.92) 80%)",
            }}
          />

          <div className="relative container mx-auto px-4 z-10 max-w-4xl flex flex-col items-center">
            {/* Title with yellow cursor effect */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>CV Hostingwebid</span>
              <span className="text-yellow-400 relative inline-flex items-center">
                Jasa SEO
                <span className="inline-block w-1 md:w-1.5 h-8 md:h-12 bg-yellow-400 ml-1.5 animate-pulse" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-sm md:text-lg text-slate-200 font-medium max-w-2xl leading-relaxed">
              Pusing, Website Sepi Pengunjung? Sudah SEO sendiri, Tapi Masih Gitu - Gitu Aja?
              Tenang Aja, Biar Kami Yang Ngurusin Website Anda! Anda Tinggal Duduk Manis Aja Di Rumah.
            </p>

            {/* Quick Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                🚀 Garansi Halaman 1 Google
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                🔗 PBN High DA 50+ Dofollow
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                📈 Laporan Live Ranking Transparan
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            PACKAGES GRID SECTION (MATCHING SCREENSHOT)
        ========================================================= */}
        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
              Daftar Paket Jasa SEO, PBN, Backlink
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-500 font-medium">
              Update Setiap Hari. Sering-sering Mampir Kesini
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium text-sm">
              Memuat daftar paket Jasa SEO...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1.5"
                >
                  {/* CARD IMAGE */}
                  <div className="relative aspect-video w-full overflow-hidden bg-sky-500">
                    <img
                      src={pkg.image || "/images/seo-package.jpg"}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {pkg.badge && (
                      <div className="absolute top-3 right-3 bg-orange-600/90 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        {pkg.badge}
                      </div>
                    )}
                  </div>

                  {/* CARD BODY */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* ICON ROW */}
                      <div className="mb-2 text-slate-500">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>

                      {/* TITLE */}
                      <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                        {pkg.name}
                      </h3>

                      {pkg.description && (
                        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>
                      )}

                      {/* FEATURES LIST */}
                      {pkg.features && pkg.features.length > 0 && (
                        <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-[12px] text-slate-600">
                          {pkg.features.slice(0, 4).map((feat, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* CARD FOOTER / RATING & BUY BUTTON */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* 5 GOLD STARS */}
                      <div className="flex items-center text-amber-400 text-sm tracking-wider">
                        {"★".repeat(pkg.rating || 5)}
                      </div>

                      {/* ORANGE CART BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleBuySeo(pkg)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs md:text-sm rounded-lg shadow-sm hover:shadow-md transition active:scale-95"
                      >
                        <span>🛒</span>
                        <span>{formatShortRupiah(pkg.price)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================
            WHY CHOOSE US / BENEFITS SECTION
        ========================================================= */}
        <section className="py-16 bg-slate-100/70 border-y border-slate-200">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-xl md:text-3xl font-extrabold text-slate-900">
                Kenapa Memilih Jasa SEO &amp; PBN HostingWebID?
              </h3>
              <p className="mt-2 text-xs md:text-sm text-slate-500">
                Teknik optimasi white-hat yang terbukti menaikkan kata kunci bisnis Anda ke peringkat #1 Google.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl font-bold mb-4">
                  🎯
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  PBN High Domain Authority
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Jaringan PBN terawat dengan metrik DA 30-50+ dan clean history backlink bebas spam untuk mengalirkan link juice maksimal.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold mb-4">
                  🛡️
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Aman Algoritma Google
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Penyebaran anchor text natural, drip-feed link building bertahap, dan artikel relevan yang disukai search engine Google.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold mb-4">
                  📊
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  Laporan Lengkap &amp; Transparan
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dapatkan laporan live link PBN serta grafik pergerakan ranking kata kunci bisnis Anda secara berkala setiap bulan.
                </p>
              </div>
            </div>

            {/* WA CTA BOX */}
            <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider block mb-1">
                  KONSULTASI GRATIS KATA KUNCI BISNIS
                </span>
                <h4 className="text-lg md:text-2xl font-black">
                  Bingung Memilih Paket SEO Yang Tepat?
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Hubungi tim ahli SEO HostingWebID via WhatsApp. Kami bantu analisa kata kunci dan berikan rekomendasi strategi terbaik gratis!
                </p>
              </div>
              <a
                href={getWhatsAppUrl("Halo Tim SEO HostingWebID, saya ingin konsultasi paket Jasa SEO & PBN untuk website saya.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition shadow-md flex items-center gap-2 whitespace-nowrap active:scale-95"
              >
                <span>💬</span> Chat WhatsApp Ahli SEO
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER (STANDARD LANDING PAGE FOOTER) */}
      <Footer />
    </div>
  );
}
