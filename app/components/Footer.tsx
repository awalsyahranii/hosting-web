"use client";

import Link from "next/link";
import { SITE_CONFIG, getWhatsAppUrl } from "../lib/siteConfig";

export default function Footer() {
  return (
    <>
      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}
      <footer className="footer" id="contact">
        <div className="container footer-premium-container">
          {/* TOP ROW: BRAND & FEATURE PILLS */}
          <div className="footer-top-row">
            <div className="footer-top-brand-box">
              <div className="footer-logo-wrap">
                <Link href="/">
                  <img src="/logo.png" alt="HostingWebID" />
                </Link>
              </div>
              <p className="footer-top-desc">
                Solusi hosting, domain, dan pembuatan website murah, cepat, dan terpercaya di Indonesia. Didesain untuk memaksimalkan performa bisnis digital Anda secara terjamin.
              </p>
            </div>

            <div className="footer-top-features">
              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-red">⚡</div>
                <div className="feat-text">
                  <span className="feat-label">Kecepatan</span>
                  <strong className="feat-value">NVMe SSD Cepat</strong>
                </div>
              </div>

              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-orange">🛡️</div>
                <div className="feat-text">
                  <span className="feat-label">Keamanan</span>
                  <strong className="feat-value">Garansi 99.9% Up</strong>
                </div>
              </div>

              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-teal">🎧</div>
                <div className="feat-text">
                  <span className="feat-label">Bantuan</span>
                  <strong className="feat-value">24/7 Siap Sigap</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-divider-glow" />

          {/* MAIN 4-COLUMN GRID */}
          <div className="footer-premium-grid">
            {/* COL 1: KANTOR LAYANAN */}
            <div className="footer-col-kantor">
              <h3 className="footer-sec-title">
                <span className="title-bar" /> KANTOR LAYANAN
              </h3>
              <p className="footer-sec-sub">Hubungi langsung tim helpdesk &amp; representatif kami:</p>

              <div className="footer-contact-stack">
                <div className="contact-row">
                  <div className="contact-icon-box">📞</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Telepon:</span>
                    <a href={`tel:${SITE_CONFIG.phone.replace(/[^0-9]/g, "")}`} className="contact-meta-val">
                      {SITE_CONFIG.phone}
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box contact-wa-icon">💬</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">WhatsApp:</span>
                    <a
                      href={getWhatsAppUrl("Halo Admin HostingWeb, saya ingin berkonsultasi.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-meta-val"
                    >
                      {SITE_CONFIG.whatsappDisplay}
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box">✉️</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Email Resmi:</span>
                    <a href={`mailto:${SITE_CONFIG.email}`} className="contact-meta-val">
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box">📍</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Alamat Kantor:</span>
                    <span className="contact-meta-val">Ruko No. 2A/11, Jl. Tamalate II</span>
                    <span className="contact-meta-sub">Kota Makassar - Sulawesi Selatan 90245</span>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box">🕒</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Jam Operasional:</span>
                    <span className="contact-meta-val">Senin - Sabtu Pkl. 08.00 - 17.00 WIB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COL 2: LAYANAN */}
            <div className="footer-col-nav">
              <h3 className="footer-sec-title">
                <span className="title-bar" /> LAYANAN
              </h3>
              <ul className="footer-nav-links">
                <li><Link href="/#portfolio">Jasa Pembuatan Website</Link></li>
                <li><Link href="/#google-ads">Jasa Iklan Google Ads</Link></li>
                <li><Link href="/#features">Jasa SEO</Link></li>
              </ul>
            </div>

            {/* COL 3: INFORMASI */}
            <div className="footer-col-nav">
              <h3 className="footer-sec-title">
                <span className="title-bar" /> INFORMASI
              </h3>
              <ul className="footer-nav-links">
                <li><Link href="/blog">Blog &amp; Panduan Artikel</Link></li>
                <li><Link href="/checkout">Konfirmasi Pembayaran</Link></li>
                <li><Link href="/#about">Tentang Kami</Link></li>
                <li><Link href="/#portfolio">Portofolio Proyek</Link></li>
                <li><Link href="/#affiliasi">Affiliasi</Link></li>
                <li><Link href="/#legalitas">Legalitas Perusahaan</Link></li>
              </ul>
            </div>

            {/* COL 4: SECURE SHOPPING */}
            <div className="footer-col-secure">
              <h3 className="footer-sec-title">
                <span className="title-bar" /> SECURE SHOPPING
              </h3>
              <p className="footer-sec-sub">
                Transaksi aman dan terenkripsi menggunakan sertifikasi keamanan berstandar internasional.
              </p>

              <div className="footer-security-cards">
                {/* 1. GOOGLE SAFE BROWSING */}
                <div className="security-card">
                  <div className="sec-card-left">
                    <div className="google-g-logo">G</div>
                    <div className="sec-card-info">
                      <div className="sec-card-title flex items-center gap-1">
                        <span>Google Safe Browsing</span>
                        <span className="text-emerald-400">✓</span>
                      </div>
                      <span className="sec-card-desc">Terverifikasi Bebas Malware &amp; Phishing</span>
                    </div>
                  </div>
                  <span className="badge-active-green">ACTIVE</span>
                </div>

                {/* 2. SSL SECURED 256-BIT */}
                <div className="security-card">
                  <div className="sec-card-left">
                    <div className="ssl-lock-box">🔒</div>
                    <div className="sec-card-info">
                      <div className="sec-card-title">SSL SECURED 256-BIT</div>
                      <span className="sec-card-desc">End-to-End Encryption Protocol</span>
                    </div>
                  </div>
                  <span className="badge-tls">TLS 1.3</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SUB-FOOTER */}
          <div className="footer-premium-bottom">
            <div className="footer-copyright">
              © {new Date().getFullYear()} <strong>hostingwebid</strong> • Seluruh hak cipta dilindungi undang-undang.
            </div>
            <div className="footer-legal-bar">
              <Link href="/#syarat">Syarat &amp; Ketentuan</Link>
              <span>•</span>
              <Link href="/#privasi">Kebijakan Privasi</Link>
              <span>•</span>
              <Link href="/#status">Status Layanan</Link>
              <span>•</span>
              <Link href="/#sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================
          WHATSAPP FLOATING BUTTON
      ===================================================== */}
      <a
        href={getWhatsAppUrl("Halo Customer Service HostingWeb, saya butuh informasi / bantuan.")}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat WhatsApp"
      >
        <span>☏</span>
        <div>
          <strong>Chat dengan kami</strong>
          <small>Online sekarang</small>
        </div>
      </a>
    </>
  );
}
