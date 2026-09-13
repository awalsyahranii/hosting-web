"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE_CONFIG, getWhatsAppUrl } from "../lib/siteConfig";

interface NavbarProps {
  activeMenu?: string;
}

export default function Navbar({ activeMenu }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="container nav-inner">
          {/* LOGO */}
          <Link
            href="/"
            className="brand"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img src="/logo.png" alt="HostingWebID" />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="nav-menu">
            <Link href="/#pricing" className={activeMenu === "hosting" ? "active" : ""}>
              Hosting
            </Link>
            <Link href="/#domain" className={activeMenu === "domain" ? "active" : ""}>
              Domain
            </Link>
            <Link href="/#portfolio" className={activeMenu === "portfolio" ? "active" : ""}>
              Portfolio
            </Link>
            <Link href="/#google-ads" className={activeMenu === "google-ads" ? "active" : ""}>
              Google Ads
            </Link>
            <Link href="/seo" className={activeMenu === "seo" ? "active" : ""}>
              SEO
            </Link>
            <Link href="/#features" className={activeMenu === "features" ? "active" : ""}>
              Fitur
            </Link>
            <Link href="/blog" className={activeMenu === "blog" ? "active" : ""}>
              Blog
            </Link>
            <Link href="/#faq" className={activeMenu === "faq" ? "active" : ""}>
              FAQ
            </Link>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="nav-actions">
            <Link href="/login" className="nav-login">
              Masuk
            </Link>

            <Link href="/register" className="nav-button">
              Mulai Sekarang
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className={`mobile-menu-button ${mobileMenuOpen ? "menu-open" : ""}`}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* MOBILE / TABLET MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link href="/#pricing" onClick={() => setMobileMenuOpen(false)}>
              Hosting
            </Link>
            <Link href="/#domain" onClick={() => setMobileMenuOpen(false)}>
              Domain
            </Link>
            <Link href="/#portfolio" onClick={() => setMobileMenuOpen(false)}>
              Portfolio
            </Link>
            <Link href="/#google-ads" onClick={() => setMobileMenuOpen(false)}>
              Google Ads
            </Link>
            <Link href="/seo" onClick={() => setMobileMenuOpen(false)}>
              SEO
            </Link>
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)}>
              Fitur
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
              Blog &amp; Panduan
            </Link>
            <Link href="/#faq" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>

            <div className="mobile-menu-divider" />

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
    </>
  );
}
