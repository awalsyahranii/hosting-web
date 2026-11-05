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
                Solusi profesional pembuatan website siap pakai, jasa iklan Google Ads bergaransi halaman 1, dan optimasi digital marketing terpercaya untuk melejitkan bisnis Anda.
              </p>
            </div>

            <div className="footer-top-features">
              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-red">
                  <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div className="feat-text">
                  <span className="feat-label">Kecepatan</span>
                  <strong className="feat-value">NVMe SSD Cepat</strong>
                </div>
              </div>

              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-orange">
                  <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="feat-text">
                  <span className="feat-label">Keamanan</span>
                  <strong className="feat-value">Garansi 99.9% Up</strong>
                </div>
              </div>

              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-teal">
                  <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                </div>
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
                  <div className="contact-icon-box">
                    <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Telepon:</span>
                    <a href={`tel:${SITE_CONFIG.phone.replace(/[^0-9]/g, "")}`} className="contact-meta-val">
                      {SITE_CONFIG.phone}
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box contact-wa-icon">
                    <svg className="w-4 h-4 fill-emerald-400" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.838.896 2.791.896 3.182 0 5.769-2.587 5.77-5.766.001-3.182-2.585-5.782-5.77-5.782zm9.969 5.766c0 5.514-4.486 10-10 10-1.803 0-3.491-.482-4.957-1.321l-5.043 1.383 1.399-4.923c-.917-1.517-1.429-3.279-1.429-5.139 0-5.514 4.486-10 10-10s10 4.486 10 10z"/>
                    </svg>
                  </div>
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
                  <div className="contact-icon-box">
                    <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Email Resmi:</span>
                    <a href={`mailto:${SITE_CONFIG.email}`} className="contact-meta-val">
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box">
                    <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Alamat Kantor:</span>
                    <span className="contact-meta-val">Ruko No. 2A/11, Jl. Tamalate II</span>
                    <span className="contact-meta-sub">Kota Makassar - Sulawesi Selatan 90245</span>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box">
                    <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
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
                <li><Link href="/seo">Jasa SEO &amp; PBN</Link></li>
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
                    <div className="ssl-lock-box">
                      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
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
