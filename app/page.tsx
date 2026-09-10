"use client";

import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    id: "starter",
    name: "✨ Paket Starter Website",
    description: "Cocok untuk memulai website profesional.",
    price: 750000,
    popular: false,
    features: [
      "💻 Hosting 3GB",
      "🌐 Termasuk Domain .com",
      "🚀 Website Siap Pakai",
      "✔️ Setting SEO On-Page",
      "✔️ Garansi Bebas Error",
    ],
  },

  {
    id: "business-pro",
    name: "🔥 Paket Bisnis Pro",
    description: "Untuk bisnis yang ingin berkembang lebih cepat.",
    price: 1500000,
    popular: true,
    features: [
      "💻 Hosting 10GB",
      "🌐 Termasuk Domain .com",
      "🚀 Website Siap Pakai",
      "✔️ FREE 30 Artikel SEO Berkualitas",
      "✔️ FREE Riset Kata Kunci",
      "✔️ Setting SEO On-Page",
      "✔️ Garansi Bebas Error",
    ],
  },

  {
    id: "elite-enterprise",
    name: "🌟 Paket Elite Enterprise",
    description:
      "Untuk bisnis dengan kebutuhan website dan SEO lebih tinggi.",
    price: 2000000,
    popular: false,
    features: [
      "💻 Hosting 50GB",
      "🌐 Termasuk Domain .com",
      "🚀 Website Siap Pakai",
      "✔️ FREE 30 Artikel SEO Berkualitas",
      "✔️ FREE Riset Kata Kunci",
      "✔️ Setting SEO On-Page",
      "✔️ Garansi Bebas Error",
      "✔️ Optimasi SEO untuk Traffic",
    ],
  },
];

const features = [
  {
    icon: "⚡",
    title: "Super Cepat",
    description:
      "Server menggunakan teknologi SSD NVMe untuk memberikan performa website yang cepat dan responsif.",
    detail:
      "Website yang cepat memberikan pengalaman yang lebih nyaman bagi pengunjung. HostingWeb menggunakan teknologi SSD NVMe untuk membantu website tetap responsif dan memiliki performa yang optimal.",
    benefits: [
      "Menggunakan penyimpanan SSD NVMe",
      "Performa website lebih responsif",
      "Loading halaman lebih cepat",
      "Cocok untuk website bisnis dan profesional",
    ],
  },

  {
    icon: "🛡",
    title: "Aman & Terpercaya",
    description:
      "SSL gratis, sistem keamanan berlapis dan backup rutin untuk menjaga website tetap aman.",
    detail:
      "Keamanan website merupakan hal penting. HostingWeb menyediakan SSL dan sistem keamanan berlapis untuk membantu melindungi website serta data kamu.",
    benefits: [
      "SSL untuk keamanan koneksi website",
      "Sistem keamanan berlapis",
      "Backup data secara berkala",
      "Perlindungan tambahan untuk data website",
    ],
  },

  {
    icon: "🚀",
    title: "Mudah Dikembangkan",
    description:
      "Paket hosting fleksibel yang bisa disesuaikan dengan pertumbuhan website dan bisnis kamu.",
    detail:
      "Website dan bisnis kamu bisa terus berkembang. HostingWeb menyediakan paket yang fleksibel sehingga kebutuhan hosting dapat disesuaikan seiring pertumbuhan website.",
    benefits: [
      "Pilihan paket sesuai kebutuhan",
      "Dapat melakukan upgrade paket",
      "Cocok untuk website yang terus berkembang",
      "Fleksibel untuk kebutuhan bisnis",
    ],
  },

  {
    icon: "💬",
    title: "Support Responsif",
    description:
      "Tim support siap membantu ketika kamu membutuhkan bantuan terkait hosting dan website.",
    detail:
      "Ketika mengalami kendala terkait hosting atau website, kamu dapat mendapatkan bantuan dari tim support untuk membantu menemukan solusi yang tepat.",
    benefits: [
      "Bantuan terkait layanan hosting",
      "Dukungan ketika mengalami kendala",
      "Membantu memberikan solusi",
      "Support yang mudah dihubungi",
    ],
  },

  {
    icon: "🌐",
    title: "Domain Mudah",
    description:
      "Cari dan daftarkan domain impianmu dengan proses yang cepat dan sederhana.",
    detail:
      "Domain merupakan alamat utama website kamu. HostingWeb membantu membuat proses penggunaan dan pengelolaan domain menjadi lebih mudah.",
    benefits: [
      "Domain .com tersedia pada paket tertentu",
      "Proses pengelolaan domain lebih sederhana",
      "Domain menjadi identitas profesional website",
      "Cocok untuk website bisnis dan personal",
    ],
  },

  {
    icon: "🔄",
    title: "Backup Berkala",
    description:
      "Data website kamu mendapatkan backup berkala sehingga lebih aman dari kehilangan data.",
    detail:
      "Backup berkala memberikan perlindungan tambahan terhadap data website. Dengan adanya salinan data, risiko kehilangan data akibat masalah pada website dapat dikurangi.",
    benefits: [
      "Backup dilakukan secara berkala",
      "Perlindungan tambahan terhadap data",
      "Mengurangi risiko kehilangan data",
      "Mendukung proses pemulihan website",
    ],
  },
];

const testimonials = [
  {
    name: "Andi Pratama",
    role: "Owner Online Store",
    text: "Sejak pindah ke Hostingwebid website toko online saya terasa jauh lebih cepat. Support-nya juga responsif.",
  },
  {
    name: "Rizky Maulana",
    role: "Web Developer",
    text: "Harganya terjangkau dan proses setup-nya gampang. Cocok untuk project client maupun website pribadi.",
  },
  {
    name: "Dewi Anggraini",
    role: "Business Owner",
    text: "Saya suka karena tidak ribet. Domain dan hosting bisa diurus di satu tempat dan dibantu ketika ada kendala.",
  },
];

const faqs = [
  {
    question: "Apa itu web hosting?",
    answer:
      "Web hosting adalah layanan yang digunakan untuk menyimpan file website agar website dapat diakses melalui internet.",
  },
  {
    question: "Apakah mendapatkan SSL gratis?",
    answer:
      "Ya. Paket hosting Hostingwebid dilengkapi SSL sehingga website dapat menggunakan koneksi HTTPS.",
  },
  {
    question: "Apakah bisa menggunakan domain sendiri?",
    answer:
      "Tentu. Kamu dapat menggunakan domain yang sudah dimiliki atau mendaftarkan domain baru melalui Hostingwebid.",
  },
  {
    question: "Apakah bisa migrasi dari hosting lain?",
    answer:
      "Bisa. Untuk paket tertentu tersedia bantuan migrasi sehingga proses perpindahan website menjadi lebih mudah.",
  },
  {
    question: "Bagaimana jika saya mengalami masalah?",
    answer:
      "Kamu dapat menghubungi tim support Hostingwebid melalui WhatsApp atau kanal support yang tersedia.",
  },
];

type DomainResultItem = {
  domain: string;
  extension: string;
  available: boolean | null;
  price: number;
  promo_price: number | null;
  domain_id: number;
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [domain, setDomain] = useState("");

const [domainLoading, setDomainLoading] =
  useState(false);

const [domainResults, setDomainResults] = useState<
  DomainResultItem[]
>([]);

const [domainQuery, setDomainQuery] =
  useState("");

const [domainError, setDomainError] =
  useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
    // STATE UNTUK MODAL FITUR
    const [selectedFeature, setSelectedFeature] =
      useState<(typeof features)[number] | null>(null);

    const searchDomain = async () => {
    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\s+/g, "")
      .replace(/\.(com|net|org|id|co\.id|xyz|info|online|cloud|site|store|tech|dev|io|biz|us|me|tv|cc|buzz|lol|mom|it\.com)$/i, "");

    if (!cleanDomain) {
      setDomainError(
        "Silakan masukkan nama domain terlebih dahulu."
      );
      setDomainResults([]);
      return;
    }

    setDomainLoading(true);
    setDomainError("");
    setDomainResults([]);
    setDomainQuery(cleanDomain);

    try {
      const response = await fetch(
        "http://localhost/hosting_webid/api/v1/domain/batch_check.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            domain: cleanDomain,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (
        !response.ok ||
        result?.status !== "success"
      ) {
        setDomainError(
          result?.message ||
            "Gagal mengecek domain."
        );
        return;
      }

      const results: DomainResultItem[] =
        (result.data?.results || []).map(
          (item: DomainResultItem) => ({
            domain: item.domain,
            extension: item.extension,
            available: item.available,
            price: Number(item.price) || 0,
            promo_price:
              item.promo_price !== null &&
              item.promo_price !== undefined
                ? Number(item.promo_price)
                : null,
            domain_id: item.domain_id || 0,
          })
        );

      setDomainResults(results);

    } catch (error) {
      setDomainError(
        error instanceof Error
          ? error.message
          : "Tidak dapat terhubung ke server."
      );

    } finally {

      setDomainLoading(false);

    }
  };

  return (
    <main>
{/* =====================================================
    NAVBAR
===================================================== */}
<header className="navbar">
  <div className="container nav-inner">

    {/* LOGO */}
    <Link
      href="/"
      className="brand"
      onClick={() => setMobileMenuOpen(false)}
    >
      <img src="/logo.png" alt="Hostingwebid" />
    </Link>

    {/* DESKTOP NAVIGATION */}
    <nav className="nav-menu">
      <a href="/#hosting">Hosting</a>
      <a href="/#domain">Domain</a>
      <a href="/#features">Fitur</a>
      <a href="/#pricing">Harga</a>
      <a href="/#faq">FAQ</a>
    </nav>

    {/* DESKTOP ACTIONS */}
    <div className="nav-actions">

      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="nav-contact"
      >
        Hubungi Kami
      </a>

      <Link href="/login" className="nav-login">
        Masuk
      </Link>

      <Link href="/register" className="nav-button">
        Mulai Sekarang
      </Link>

    </div>

    {/* MOBILE MENU BUTTON */}
    <button
      className={`mobile-menu-button ${
        mobileMenuOpen ? "menu-open" : ""
      }`}
      aria-label={
        mobileMenuOpen
          ? "Tutup menu"
          : "Buka menu"
      }
      type="button"
      onClick={() =>
        setMobileMenuOpen(!mobileMenuOpen)
      }
    >
      <span />
      <span />
      <span />
    </button>

  </div>

  {/* =====================================================
      MOBILE / TABLET MENU
  ===================================================== */}
  {mobileMenuOpen && (
    <div className="mobile-menu">

      <a
        href="/#hosting"
        onClick={() => setMobileMenuOpen(false)}
      >
        Hosting
      </a>

      <a
        href="/#domain"
        onClick={() => setMobileMenuOpen(false)}
      >
        Domain
      </a>

      <a
        href="/#features"
        onClick={() => setMobileMenuOpen(false)}
      >
        Fitur
      </a>

      <a
        href="/#pricing"
        onClick={() => setMobileMenuOpen(false)}
      >
        Harga
      </a>

      <a
        href="/#faq"
        onClick={() => setMobileMenuOpen(false)}
      >
        FAQ
      </a>

      <div className="mobile-menu-divider" />

      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="mobile-contact"
        onClick={() => setMobileMenuOpen(false)}
      >
        Hubungi Kami
      </a>

      <Link
        href="/login"
        className="mobile-login"
        onClick={() => setMobileMenuOpen(false)}
      >
        Masuk
      </Link>

      <Link
        href="/register"
        className="mobile-register"
        onClick={() => setMobileMenuOpen(false)}
      >
        Mulai Sekarang
        <span>→</span>
      </Link>

    </div>
  )}
</header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="hero">
        <div className="hero-grid-pattern" />

        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="container hero-container">

          {/* LEFT CONTENT */}
          <div className="hero-content">

            <div className="hero-badge">
              <span className="badge-dot" />
              Web Hosting Cepat & Terpercaya
            </div>

            <h1>
              Hosting Murah
              <br />
              <span>Untuk Website Hebat</span>
            </h1>

            <p className="hero-description">
              Bangun website profesional dengan hosting cepat,
              aman, dan stabil. Solusi hosting dan domain untuk
              bisnis, toko online, portfolio, hingga website pribadi.
            </p>

            <div className="hero-checklist">

              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>SSD NVMe berkecepatan tinggi</span>
              </div>

              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>SSL Gratis</span>
              </div>

              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Backup berkala</span>
              </div>

              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Support responsif</span>
              </div>

            </div>

            <div className="hero-actions">

              <a href="#pricing" className="btn btn-primary">
                Lihat Paket Hosting
                <span>→</span>
              </a>

              <a href="#domain" className="btn btn-outline">
                Cari Domain
              </a>

            </div>

            <div className="hero-trust">

              <div className="trust-avatars">
                <span>A</span>
                <span>R</span>
                <span>D</span>
                <span>+</span>
              </div>

              <div>
                <div className="trust-stars">★★★★★</div>
                <p>Dipercaya pelanggan Indonesia</p>
              </div>

            </div>

          </div>

          {/* RIGHT VISUAL */}
          <div className="hero-visual">

            <div className="hero-circle hero-circle-one" />
            <div className="hero-circle hero-circle-two" />
            <div className="hero-circle hero-circle-three" />

            {/* Review Card */}
            <div className="floating-card review-card">

              <div className="review-header">

                <div className="google-letter">G</div>

                <div>
                  <strong>Google Review</strong>
                  <small>Customer Rating</small>
                </div>

              </div>

              <div className="review-stars">
                ★★★★★
              </div>

              <div className="review-bottom">
                <strong>5.0</strong>
                <span>Excellent</span>
              </div>

            </div>

            {/* Growth Card */}
            <div className="floating-card growth-card">

              <span className="card-label">
                Website Growth
              </span>

              <div className="growth-number">
                <strong>+40%</strong>
                <span>↗</span>
              </div>

              <div className="mini-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

            </div>

            {/* SERVER DASHBOARD */}
            <div className="server-dashboard">

              <div className="server-header">

                <div className="server-brand">

                  <div className="server-logo">
                    H
                  </div>

                  <div>
                    <strong>Hostingwebid</strong>
                    <small>Cloud Hosting</small>
                  </div>

                </div>

                <div className="server-online">
                  <span />
                  Online
                </div>

              </div>

              <div className="server-content">

                <div className="server-content-top">

                  <div>
                    <span>Server Performance</span>
                    <strong>99.9%</strong>
                  </div>

                  <div className="server-period">
                    Last 30 days
                  </div>

                </div>

                <div className="big-chart">

                  <div className="chart-lines">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>

                  <svg
                    viewBox="0 0 500 180"
                    preserveAspectRatio="none"
                    className="chart-svg"
                  >

                    <defs>

                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        x2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ff1111"
                        />
                        <stop
                          offset="100%"
                          stopColor="#f7931e"
                        />
                      </linearGradient>

                      <linearGradient
                        id="chartFill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ff4d20"
                          stopOpacity="0.35"
                        />
                        <stop
                          offset="100%"
                          stopColor="#ff4d20"
                          stopOpacity="0"
                        />
                      </linearGradient>

                    </defs>

                    <path
                      d="M0 150 C40 130, 55 145, 85 115 C120 80, 125 125, 160 105 C195 85, 200 120, 235 82 C270 45, 280 92, 315 65 C350 35, 360 70, 390 45 C425 15, 450 42, 500 5 L500 180 L0 180 Z"
                      fill="url(#chartFill)"
                    />

                    <path
                      d="M0 150 C40 130, 55 145, 85 115 C120 80, 125 125, 160 105 C195 85, 200 120, 235 82 C270 45, 280 92, 315 65 C350 35, 360 70, 390 45 C425 15, 450 42, 500 5"
                      fill="none"
                      stroke="url(#chartGradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />

                  </svg>

                </div>

                <div className="server-stats">

                  <div>
                    <span>CPU Usage</span>
                    <strong>18%</strong>
                  </div>

                  <div>
                    <span>Memory</span>
                    <strong>32%</strong>
                  </div>

                  <div>
                    <span>Uptime</span>
                    <strong>99.9%</strong>
                  </div>

                </div>

              </div>

            </div>

            {/* SPEED CARD */}
            <div className="speed-card">

              <div className="speed-icon">
                ⚡
              </div>

              <div>
                <span>Website Speed</span>
                <strong>40x Faster</strong>
              </div>

            </div>

            {/* DOMAIN PROMO */}
            <div className="domain-promo-card">

              <div className="promo-top">
                <span>🔥</span>
                <strong>Promo Domain</strong>
              </div>

              <div className="promo-main">

                <div>
                  <strong>.COM</strong>
                  <span>Mulai dari</span>
                </div>

                <div className="promo-price">
                  <strong>Rp114.900</strong>
                  <del>Rp209.900</del>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST BAR
      ===================================================== */}
      <section className="trust-section">

        <div className="container trust-grid">

          <div className="trust-item">
            <strong>99.9%</strong>
            <span>Server Uptime</span>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <strong>24/7</strong>
            <span>Customer Support</span>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <strong>NVMe</strong>
            <span>Storage Technology</span>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <strong>SSL</strong>
            <span>Gratis Selamanya</span>
          </div>

        </div>

      </section>

      {/* =====================================================
              DOMAIN SEARCH
          ===================================================== */}

          <section
            className="domain-section"
            id="domain"
          >
            <div className="container">

              <div className="domain-wrapper">

                {/* =================================================
                    DOMAIN TEXT
                ================================================= */}

                <div className="domain-text">

                  <span className="section-label">
                    CARI DOMAIN
                  </span>

                  <h2>
                    Temukan nama domain
                    <br />
                    <span>
                      untuk brand kamu.
                    </span>
                  </h2>

                  <p>
                    Pilih nama domain yang mudah diingat dan
                    buat bisnis kamu terlihat lebih profesional.
                  </p>

                </div>


                {/* =================================================
                    DOMAIN SEARCH BOX
                ================================================= */}

                <div className="domain-search-box">

                  <div className="domain-input">

                    <span>
                      www.
                    </span>

                    <input
                      type="text"
                      placeholder="namabisnis"
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value);

                        setDomainResults([]);
                        setDomainError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void searchDomain();
                        }
                      }}
                      disabled={domainLoading}
                      autoComplete="off"
                    />

                    <span className="domain-input-tld">
                      .com
                    </span>

                  </div>


                  {/* =================================================
                      SEARCH BUTTON
                  ================================================= */}

                  <button
                    type="button"
                    className="domain-search-button"
                    onClick={() => {
                      void searchDomain();
                    }}
                    disabled={domainLoading}
                  >

                    {domainLoading
                      ? "Mengecek..."
                      : "Cari Domain"}

                  </button>

                </div>


              </div>

            </div>


            {/* =================================================
                LOADING
            ================================================= */}

            {domainLoading && (

              <div className="domain-batch-loading">

                <div className="domain-loading-spinner" />

                <div>

                  <strong>
                    Sedang mengecek ketersediaan domain...
                  </strong>

                  <span>
                    Mengecek semua ekstensi, mohon tunggu sebentar.
                  </span>

                </div>

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {domainError &&
              !domainLoading && (

                <div className="domain-batch-error">

                  <div className="domain-batch-error-icon">
                    !
                  </div>

                  <div>

                    <strong>
                      Gagal mengecek domain
                    </strong>

                    <span>
                      {domainError}
                    </span>

                  </div>

                </div>

              )}


            {/* =================================================
                DOMAIN RESULTS GRID
            ================================================= */}

            {domainResults.length > 0 &&
              !domainLoading &&
              !domainError && (

                <div className="domain-results-section">

                  <div className="domain-results-header">

                    <h3>
                      Hasil pencarian untuk{" "}
                      <strong>
                        &ldquo;{domainQuery}&rdquo;
                      </strong>
                    </h3>

                    <span>
                      {domainResults.filter(
                        (r) => r.available === true
                      ).length}{" "}
                      domain tersedia dari{" "}
                      {domainResults.length} ekstensi
                    </span>

                  </div>


                  <div className="domain-results-grid">

                    {domainResults.map((item, index) => (

                      <div
                        className={`domain-result-card ${
                          item.available === true
                            ? "domain-card-available"
                            : item.available === false
                            ? "domain-card-unavailable"
                            : "domain-card-unknown"
                        }`}
                        key={item.domain}
                        style={{
                          animationDelay: `${index * 0.05}s`,
                        }}
                      >

                        <div className="domain-card-top">

                          <div className="domain-card-name">

                            <span className="domain-card-base">
                              {domainQuery}
                            </span>

                            <span className="domain-card-ext">
                              {item.extension}
                            </span>

                          </div>

                          <div
                            className={`domain-card-badge ${
                              item.available === true
                                ? "badge-available"
                                : item.available === false
                                ? "badge-unavailable"
                                : "badge-unknown"
                            }`}
                          >
                            {item.available === true
                              ? "Tersedia"
                              : item.available === false
                              ? "Tidak Tersedia"
                              : "�"}
                          </div>

                        </div>

                        <div className="domain-card-bottom">

                          <div className="domain-card-price">

                            {item.promo_price !== null &&
                            item.promo_price > 0 ? (
                              <>
                                <del>
                                  Rp{" "}
                                  {item.price.toLocaleString(
                                    "id-ID"
                                  )}
                                </del>

                                <strong>
                                  Rp{" "}
                                  {item.promo_price.toLocaleString(
                                    "id-ID"
                                  )}
                                </strong>
                              </>
                            ) : (
                              <strong>
                                Rp{" "}
                                {item.price.toLocaleString(
                                  "id-ID"
                                )}
                              </strong>
                            )}

                            <span className="domain-card-period">
                              /tahun
                            </span>

                          </div>

                          {item.available === true ? (
                            <Link
                              href={`/checkout?domain=${encodeURIComponent(
                                item.domain
                              )}&domain_id=${item.domain_id}`}
                              className="domain-card-buy"
                            >
                              Beli
                            </Link>
                          ) : item.available === false ? (
                            <span className="domain-card-taken">
                              Sudah diambil
                            </span>
                          ) : (
                            <span className="domain-card-taken">
                              �
                            </span>
                          )}

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

              )}

          </div>

        </section>

      {/* =====================================================
          HOSTING PLANS
      ===================================================== */}
      <section className="pricing-section" id="pricing">

        <div className="container">

          <div className="section-heading center">

            <span className="section-label">
              PAKET HOSTING
            </span>

            <h2>
              Hosting sesuai kebutuhan
              <br />
              <span>website kamu.</span>
            </h2>

            <p>
              Pilih paket yang sesuai dengan kebutuhan website
              dan bisnis kamu.
            </p>

          </div>

          <div className="pricing-grid">

            {plans.map((plan) => (

              <div
                className={`pricing-card ${
                  plan.popular ? "popular" : ""
                }`}
                key={plan.id}
              >

                {plan.popular && (
                  <div className="popular-label">
                    PALING POPULER
                  </div>
                )}

                <div className="pricing-card-top">

                  <h3>{plan.name}</h3>

                  <p>{plan.description}</p>

                </div>

                <div className="price">

                  <small>Harga mulai dari</small>

                  <div>
                    <span>Rp</span>

                    <strong>
                      {plan.price.toLocaleString("id-ID")}
                    </strong>
                  </div>

                </div>

                <a
                  href={`/checkout?paket=${plan.id}`}
                  className={`pricing-button ${
                    plan.popular
                      ? "pricing-button-primary"
                      : ""
                  }`}
                >
                  Beli Sekarang
                  <span>→</span>
                </a>

                <div className="pricing-divider" />

                <strong className="feature-title">
                  Yang kamu dapatkan:
                </strong>

                <ul className="pricing-features">

                  {plan.features.map(
                    (feature, index) => (

                      <li key={index}>
                        <span>✓</span>
                        {feature}
                      </li>

                    )
                  )}

                </ul>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="features-section" id="features">

        <div className="container">

          <div className="section-heading">

            <span className="section-label">
              FITUR UNGGULAN
            </span>

            <h2>
              Semua yang dibutuhkan
              <br />
              <span>website kamu.</span>
            </h2>

            <p>
              Kami menyediakan infrastruktur yang dirancang
              untuk membuat website tetap cepat, aman,
              dan mudah dikelola.
            </p>

          </div>

          <div className="features-grid">

            {features.map((feature) => (

              <div
                className="feature-card"
                key={feature.title}
              >

                <div className="feature-icon">
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <button
                  type="button"
                  className="feature-link"
                  onClick={() =>
                    setSelectedFeature(feature)
                  }
                >
                  Pelajari lebih lanjut
                  <span>→</span>
                </button>

              </div>

            ))}

          </div>

        </div>

        {/* =====================================================
            FEATURE DETAIL MODAL
        ===================================================== */}
        {selectedFeature && (

          <div
            className="feature-modal-overlay"
            onClick={() =>
              setSelectedFeature(null)
            }
          >

            <div
              className="feature-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                type="button"
                className="feature-modal-close"
                onClick={() =>
                  setSelectedFeature(null)
                }
                aria-label="Tutup"
              >
                ×
              </button>

              <div className="feature-modal-icon">
                {selectedFeature.icon}
              </div>

              <span className="section-label">
                FITUR UNGGULAN
              </span>

              <h2>
                {selectedFeature.title}
              </h2>

              <p className="feature-modal-description">
                {selectedFeature.detail}
              </p>

              <ul className="feature-modal-list">

                {selectedFeature.benefits.map(
                  (benefit, index) => (

                    <li key={index}>
                      <span>✓</span>
                      {benefit}
                    </li>

                  )
                )}

              </ul>

              <button
                type="button"
                className="pricing-button pricing-button-primary"
                onClick={() => {

                  setSelectedFeature(null);

                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });

                }}
              >
                Lihat Paket Hosting
                <span>→</span>
              </button>

            </div>

          </div>

        )}

      </section>

      {/* =====================================================
          WHY US
      ===================================================== */}
      <section className="why-section" id="hosting">

        <div className="container why-grid">

          <div className="why-visual">

            <div className="why-main-card">

              <div className="why-card-header">

                <div className="why-logo">
                  H
                </div>

                <div>
                  <strong>Hostingwebid</strong>
                  <span>Hosting Dashboard</span>
                </div>

                <div className="online-badge">
                  <span />
                  Online
                </div>

              </div>

              <div className="why-card-body">

                <div className="website-row">

                  <div className="website-icon">
                    W
                  </div>

                  <div>
                    <strong>websitekamu.com</strong>
                    <span>Active website</span>
                  </div>

                  <b>99.9%</b>

                </div>

                <div className="performance-bar">
                  <span />
                </div>

                <div className="performance-labels">
                  <span>Performance</span>
                  <strong>Excellent</strong>
                </div>

              </div>

            </div>

            <div className="why-floating">

              <span>✓</span>

              <div>
                <strong>Website Aktif</strong>
                <small>99.9% uptime</small>
              </div>

            </div>

          </div>

          <div className="why-content">

            <span className="section-label">
              KENAPA HOSTINGWEBID?
            </span>

            <h2>
              Bukan cuma hosting.
              <br />
              <span>Partner website kamu.</span>
            </h2>

            <p>
              Kami percaya hosting yang bagus bukan hanya
              soal server. Kamu juga membutuhkan layanan
              yang mudah digunakan dan support yang bisa
              diandalkan.
            </p>

            <div className="why-list">

              <div>

                <span>01</span>

                <div>
                  <strong>Performa cepat</strong>

                  <p>
                    Infrastruktur modern untuk loading
                    website yang lebih cepat.
                  </p>
                </div>

              </div>

              <div>

                <span>02</span>

                <div>
                  <strong>Harga transparan</strong>

                  <p>
                    Pilih paket sesuai kebutuhan tanpa
                    fitur yang tidak diperlukan.
                  </p>
                </div>

              </div>

              <div>

                <span>03</span>

                <div>
                  <strong>Support manusia</strong>

                  <p>
                    Dapatkan bantuan ketika kamu
                    membutuhkannya.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          TESTIMONIAL
      ===================================================== */}
      <section className="testimonial-section">

        <div className="container">

          <div className="section-heading center">

            <span className="section-label">
              TESTIMONIAL
            </span>

            <h2>
              Cerita dari pelanggan
              <br />
              <span>Hostingwebid.</span>
            </h2>

            <p>
              Beberapa pengalaman pelanggan yang
              menggunakan layanan kami.
            </p>

          </div>

          <div className="testimonial-grid">

            {testimonials.map((testimonial) => (

              <div
                className="testimonial-card"
                key={testimonial.name}
              >

                <div className="testimonial-stars">
                  ★★★★★
                </div>

                <p>
                  “{testimonial.text}”
                </p>

                <div className="testimonial-author">

                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>

                  <div>
                    <strong>
                      {testimonial.name}
                    </strong>

                    <span>
                      {testimonial.role}
                    </span>
                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="cta-section">

        <div className="container">

          <div className="cta-box">

            <div className="cta-glow" />

            <div className="cta-content">

              <span className="section-label">
                SIAP MEMULAI?
              </span>

              <h2>
                Saatnya website kamu
                <br />
                <span>
                  tampil lebih profesional.
                </span>
              </h2>

              <p>
                Pilih hosting terbaik untuk website kamu
                dan mulai berkembang bersama Hostingwebid.
              </p>

              <div className="cta-buttons">

                <a
                  href="#pricing"
                  className="cta-primary"
                >
                  Lihat Paket Hosting
                  <span>→</span>
                </a>

                <a
                  href="https://wa.me/6281234567890"
                  className="cta-secondary"
                >
                  Chat WhatsApp
                </a>

              </div>

            </div>

            <div className="cta-decoration">
              <div />
              <div />
              <div />
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}
      <section className="faq-section" id="faq">

        <div className="container faq-grid">

          <div className="faq-intro">

            <span className="section-label">
              FAQ
            </span>

            <h2>
              Pertanyaan yang
              <br />
              <span>
                sering ditanyakan.
              </span>
            </h2>

            <p>
              Masih bingung? Hubungi tim kami dan kami
              akan membantu menjelaskan layanan yang
              paling sesuai untuk kamu.
            </p>

            <a
              href="https://wa.me/6281234567890"
              className="faq-contact"
            >
              Tanya via WhatsApp →
            </a>

          </div>

          <div className="faq-list">

            {faqs.map((faq, index) => {

              const isOpen =
                openFaq === index;

              return (

                <div
                  className={`faq-item ${
                    isOpen ? "faq-open" : ""
                  }`}
                  key={faq.question}
                >

                  <button
                    onClick={() =>
                      setOpenFaq(
                        isOpen ? null : index
                      )
                    }
                    className="faq-question"
                  >

                    <span>
                      {faq.question}
                    </span>

                    <span className="faq-plus">
                      {isOpen ? "−" : "+"}
                    </span>

                  </button>

                  <div className="faq-answer">

                    <p>
                      {faq.answer}
                    </p>

                  </div>

                </div>

              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="footer" id="contact">

        <div className="container">

          <div className="footer-main">

            <div className="footer-brand">

              <img
                src="/logo.png"
                alt="Hostingwebid"
              />

              <p>
                Solusi hosting dan domain untuk membantu
                website dan bisnis kamu berkembang lebih
                cepat.
              </p>

              <div className="social-links">

                <a
                  href="#"
                  aria-label="Instagram"
                >
                  IG
                </a>

                <a
                  href="#"
                  aria-label="Facebook"
                >
                  FB
                </a>

                <a
                  href="#"
                  aria-label="TikTok"
                >
                  TK
                </a>

                <a
                  href="https://wa.me/6281234567890"
                  aria-label="WhatsApp"
                >
                  WA
                </a>

              </div>

            </div>

            <div className="footer-column">

              <h4>Produk</h4>

              <a href="#hosting">
                Web Hosting
              </a>

              <a href="#domain">
                Domain
              </a>

              <a href="#pricing">
                Paket Hosting
              </a>

              <a href="#features">
                Fitur
              </a>

            </div>

            <div className="footer-column">

              <h4>Perusahaan</h4>

              <a href="#">
                Tentang Kami
              </a>

              <a href="#">
                Kontak
              </a>

              <a href="#">
                Blog
              </a>

              <a href="#">
                Karir
              </a>

            </div>

            <div className="footer-column">

              <h4>Bantuan</h4>

              <a href="#faq">
                FAQ
              </a>

              <a href="#">
                Knowledge Base
              </a>

              <a href="#">
                Panduan
              </a>

              <a href="#">
                Status Server
              </a>

            </div>

            <div className="footer-column">

              <h4>Hubungi Kami</h4>

              <p className="footer-contact">
                WhatsApp
                <strong>
                  +62 812-3456-7890
                </strong>
              </p>

              <p className="footer-contact">
                Email
                <strong>
                  hello@hostingwebid.com
                </strong>
              </p>

            </div>

          </div>

          <div className="footer-bottom">

            <span>
              © 2026 Hostingwebid. All rights reserved.
            </span>

            <div>

              <a href="#">
                Privacy Policy
              </a>

              <a href="#">
                Terms of Service
              </a>

            </div>

          </div>

        </div>

      </footer>

      {/* =====================================================
          WHATSAPP FLOATING BUTTON
      ===================================================== */}
      <a
        href="https://wa.me/6281234567890"
        className="whatsapp-float"
        aria-label="Chat WhatsApp"
      >

        <span>☏</span>

        <div>
          <strong>
            Chat dengan kami
          </strong>

          <small>
            Online sekarang
          </small>
        </div>

      </a>

    </main>
  );
}