"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITE_CONFIG, getWhatsAppUrl } from "../lib/siteConfig";

interface NavbarProps {
  activeMenu?: string;
}

export default function Navbar({ activeMenu }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("hostingwebid_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hostingwebid_user");
    localStorage.removeItem("hostingweb_auth");
    fetch("/api/backend/auth/logout.php", { credentials: "include" }).catch(() => null);
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin" || user?.role === "superadmin";

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
            <Link href="/#pricing" className={activeMenu === "pricing" || activeMenu === "website" ? "active" : ""}>
              Jasa Website
            </Link>
            <Link href="/#google-ads" className={activeMenu === "google-ads" ? "active" : ""}>
              Google Ads
            </Link>
            <Link href="/#portfolio" className={activeMenu === "portfolio" ? "active" : ""}>
              Portfolio
            </Link>
            <Link href="/#domain" className={activeMenu === "domain" ? "active" : ""}>
              Cek Domain
            </Link>
            <Link href="/seo" className={activeMenu === "seo" ? "active" : ""}>
              SEO
            </Link>
            <Link href="/#features" className={activeMenu === "features" ? "active" : ""}>
              Keunggulan
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
            {user ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="nav-button"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>{isAdmin ? "⚡ Panel Admin" : "👤 Dashboard Saya"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-login"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-login">
                  Masuk
                </Link>
                <Link href="/register" className="nav-button">
                  Mulai Sekarang
                </Link>
              </>
            )}
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
              Jasa Website
            </Link>
            <Link href="/#google-ads" onClick={() => setMobileMenuOpen(false)}>
              Google Ads
            </Link>
            <Link href="/#portfolio" onClick={() => setMobileMenuOpen(false)}>
              Portfolio
            </Link>
            <Link href="/#domain" onClick={() => setMobileMenuOpen(false)}>
              Cek Domain
            </Link>
            <Link href="/seo" onClick={() => setMobileMenuOpen(false)}>
              SEO
            </Link>
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)}>
              Keunggulan
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
              Blog &amp; Panduan
            </Link>
            <Link href="/#faq" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="mobile-register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isAdmin ? "⚡ Panel Admin" : "👤 Dashboard Saya"}
                  <span>→</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="mobile-login"
                  style={{ textAlign: "left", width: "100%", background: "none", border: "none", cursor: "pointer" }}
                >
                  Keluar / Logout
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
