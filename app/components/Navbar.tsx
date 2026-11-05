"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWhatsAppUrl } from "../lib/siteConfig";

interface NavbarProps {
  activeMenu?: string;
}

export default function Navbar({ activeMenu }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string; role?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 180);
  };

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
            onClick={() => {
              setMobileMenuOpen(false);
              setDropdownOpen(false);
            }}
          >
            <img src="/logo.png" alt="HostingWebID" />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="nav-menu">
            {/* DROPDOWN: LAYANAN & PRODUK (MODERN & ELEGAN) */}
            <div
              className="relative inline-block"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`group inline-flex items-center gap-2 py-2 px-3 rounded-full text-[14px] font-semibold transition-all duration-200 ${
                  dropdownOpen ||
                  activeMenu === "hosting" ||
                  activeMenu === "domain" ||
                  activeMenu === "website" ||
                  activeMenu === "seo" ||
                  activeMenu === "tema"
                    ? "text-orange-600 bg-orange-50/80 font-bold"
                    : "text-slate-700 hover:text-orange-600 hover:bg-slate-50"
                }`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>Layanan &amp; Produk</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${dropdownOpen ? "rotate-180 text-orange-600" : "text-slate-400 group-hover:text-orange-600"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* MEGA DROPDOWN (IDWEBHOST STYLE - ONLY ACTIVE SERVICES) */}
              {dropdownOpen && (
                <div
                  className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 md:-translate-x-[35%] w-[600px] max-w-[95vw] bg-white rounded-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18),0_0_0_1px_rgba(226,232,240,0.8)]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* KOLOM 1: HOSTING & DOMAIN & TEMA */}
                    <div className="space-y-2.5">
                      {/* 1. Hosting NVMe */}
                      <Link
                        href="/#pricing"
                        className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all group/item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                            <line x1="6" y1="6" x2="6.01" y2="6" />
                            <line x1="6" y1="18" x2="6.01" y2="18" />
                          </svg>
                        </div>
                        <div>
                          <strong className="text-[13px] font-bold text-slate-800 group-hover/item:text-orange-600 transition-colors block">
                            Hosting NVMe
                          </strong>
                          <span className="text-[11.5px] text-slate-500 font-normal leading-snug block mt-0.5">
                            Cloud Server NVMe super cepat &amp; cPanel resmi
                          </span>
                        </div>
                      </Link>

                      {/* 2. Domain Murah */}
                      <Link
                        href="/#domain"
                        className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all group/item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        </div>
                        <div>
                          <strong className="text-[13px] font-bold text-slate-800 group-hover/item:text-orange-600 transition-colors block">
                            Domain Murah
                          </strong>
                          <span className="text-[11.5px] text-slate-500 font-normal leading-snug block mt-0.5">
                            Cek &amp; daftarkan domain .com, .id, .my.id instan
                          </span>
                        </div>
                      </Link>

                      {/* 3. Tema Website */}
                      <Link
                        href="/tema"
                        className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all group/item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.6-10-9.6z" />
                            <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
                            <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
                            <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
                            <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
                          </svg>
                        </div>
                        <div>
                          <strong className="text-[13px] font-bold text-slate-800 group-hover/item:text-orange-600 transition-colors block">
                            Tema Website
                          </strong>
                          <span className="text-[11.5px] text-slate-500 font-normal leading-snug block mt-0.5">
                            Katalog template &amp; desain bisnis siap pakai
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* KOLOM 2: JASA + HUBUNGI KAMI */}
                    <div className="space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        {/* 4. Jasa Web & Ads */}
                        <Link
                          href="/#pricing"
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all group/item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </div>
                          <div>
                            <strong className="text-[13px] font-bold text-slate-800 group-hover/item:text-orange-600 transition-colors block">
                              Jasa Web &amp; Ads
                            </strong>
                            <span className="text-[11.5px] text-slate-500 font-normal leading-snug block mt-0.5">
                              Website siap pakai &amp; iklan Google Ads konversi
                            </span>
                          </div>
                        </Link>

                        {/* 5. Jasa SEO & PBN */}
                        <Link
                          href="/seo"
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all group/item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-105 transition-transform">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                              <polyline points="17 6 23 6 23 12" />
                            </svg>
                          </div>
                          <div>
                            <strong className="text-[13px] font-bold text-slate-800 group-hover/item:text-orange-600 transition-colors block">
                              Jasa SEO &amp; PBN
                            </strong>
                            <span className="text-[11.5px] text-slate-500 font-normal leading-snug block mt-0.5">
                              Optimasi ranking Google &amp; backlink authority
                            </span>
                          </div>
                        </Link>
                      </div>

                      {/* HUBUNGI KAMI BOX (IDWEBHOST STYLE) */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mt-1">
                        <strong className="text-xs font-bold text-slate-900 block mb-0.5">
                          Hubungi Kami
                        </strong>
                        <p className="text-[11px] text-slate-500 leading-snug mb-1.5">
                          Punya kebutuhan custom website atau server?
                        </p>
                        <a
                          href={getWhatsAppUrl("Halo Admin HostingWeb, saya punya kebutuhan custom untuk website / hosting saya.")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          <span>Kami tunggu Sekarang</span>
                          <svg className="w-3.5 h-3.5 fill-emerald-600" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.586 1.838.896 2.791.896 3.182 0 5.769-2.587 5.77-5.766.001-3.182-2.585-5.782-5.77-5.782zm9.969 5.766c0 5.514-4.486 10-10 10-1.803 0-3.491-.482-4.957-1.321l-5.043 1.383 1.399-4.923c-.917-1.517-1.429-3.279-1.429-5.139 0-5.514 4.486-10 10-10s10 4.486 10 10z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* OTHER MAIN MENUS */}
            <Link
              href="/#portfolio"
              className={activeMenu === "portfolio" ? "active" : ""}
              onClick={() => setDropdownOpen(false)}
            >
              Portfolio
            </Link>

            <Link
              href="/#features"
              className={activeMenu === "features" ? "active" : ""}
              onClick={() => setDropdownOpen(false)}
            >
              Keunggulan
            </Link>

            <Link
              href="/blog"
              className={activeMenu === "blog" ? "active" : ""}
              onClick={() => setDropdownOpen(false)}
            >
              Blog
            </Link>

            <Link
              href="/#faq"
              className={activeMenu === "faq" ? "active" : ""}
              onClick={() => setDropdownOpen(false)}
            >
              FAQ
            </Link>
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="nav-actions">
            {user ? (
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="nav-button inline-flex items-center gap-2"
              >
                {isAdmin ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
                <span>{isAdmin ? "Panel Admin" : "Dashboard Saya"}</span>
              </Link>
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

        {/* MOBILE / TABLET MENU DRAWER (IDWEBHOST STYLE) */}
        {mobileMenuOpen && (
          <div className="mobile-menu bg-white border-t border-slate-100 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* ACCORDION: LAYANAN & PRODUK */}
            <div className="border-b border-slate-100/80 pb-1">
              <button
                type="button"
                className="w-full flex items-center justify-between py-3 px-2 text-left font-bold text-[15px] text-[#1b2559] hover:text-orange-600 transition-colors select-none"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              >
                <span className="flex items-center gap-2">
                  <span>Layanan &amp; Produk</span>
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ease-out ${
                    mobileServicesOpen ? "rotate-180 text-orange-600" : "text-slate-400"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* SMOOTH ANIMATED ACCORDION CONTAINER */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  mobileServicesOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-1.5 pl-2 pr-1 pt-1 pb-2">
                    {/* 1. Hosting NVMe */}
                    <Link
                      href="/#pricing"
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/60 transition-all group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                          <line x1="6" y1="6" x2="6.01" y2="6" />
                          <line x1="6" y1="18" x2="6.01" y2="18" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-[13.5px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors block">
                          Hosting NVMe
                        </strong>
                        <span className="text-[11px] text-slate-500 font-normal block leading-tight">
                          Cloud Server NVMe super cepat &amp; cPanel resmi
                        </span>
                      </div>
                    </Link>

                    {/* 2. Domain Murah */}
                    <Link
                      href="/#domain"
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/60 transition-all group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-[13.5px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors block">
                          Domain Murah
                        </strong>
                        <span className="text-[11px] text-slate-500 font-normal block leading-tight">
                          Cek &amp; daftarkan domain .com, .id, .my.id instan
                        </span>
                      </div>
                    </Link>

                    {/* 3. Tema Website */}
                    <Link
                      href="/tema"
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/60 transition-all group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.6-10-9.6z" />
                          <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
                          <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
                          <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
                          <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-[13.5px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors block">
                          Tema Website
                        </strong>
                        <span className="text-[11px] text-slate-500 font-normal block leading-tight">
                          Katalog template &amp; desain bisnis siap pakai
                        </span>
                      </div>
                    </Link>

                    {/* 4. Jasa Web & Ads */}
                    <Link
                      href="/#pricing"
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/60 transition-all group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-[13.5px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors block">
                          Jasa Web &amp; Ads
                        </strong>
                        <span className="text-[11px] text-slate-500 font-normal block leading-tight">
                          Website siap pakai &amp; iklan Google Ads konversi
                        </span>
                      </div>
                    </Link>

                    {/* 5. Jasa SEO & PBN */}
                    <Link
                      href="/seo"
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/60 transition-all group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#20295b] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                          <polyline points="17 6 23 6 23 12" />
                        </svg>
                      </div>
                      <div>
                        <strong className="text-[13.5px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors block">
                          Jasa SEO &amp; PBN
                        </strong>
                        <span className="text-[11px] text-slate-500 font-normal block leading-tight">
                          Optimasi ranking Google &amp; backlink authority
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* OTHER MAIN PAGES */}
            <div className="py-1">
              <Link
                href="/#portfolio"
                className="flex items-center justify-between py-3 px-2 border-b border-slate-100/80 text-[15px] font-semibold text-[#1b2559] hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Portfolio</span>
              </Link>

              <Link
                href="/#features"
                className="flex items-center justify-between py-3 px-2 border-b border-slate-100/80 text-[15px] font-semibold text-[#1b2559] hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Keunggulan</span>
              </Link>

              <Link
                href="/blog"
                className="flex items-center justify-between py-3 px-2 border-b border-slate-100/80 text-[15px] font-semibold text-[#1b2559] hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Blog &amp; Panduan</span>
              </Link>

              <Link
                href="/#faq"
                className="flex items-center justify-between py-3 px-2 border-b border-slate-100/80 text-[15px] font-semibold text-[#1b2559] hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>FAQ</span>
              </Link>

              <Link
                href="/#pricing"
                className="flex items-center justify-between py-3 px-2 text-[15px] font-semibold text-[#1b2559] hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-1.5">
                  <span>Promo Spesial</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                  Hemat s.d 60%
                </span>
              </Link>
            </div>

            {/* ACTIONS / AUTH BUTTONS */}
            <div className="pt-3 mt-1 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <Link
                    href={isAdmin ? "/admin" : "/dashboard"}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-md hover:shadow-orange-500/25 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{isAdmin ? "Panel Admin" : "Dashboard Saya"}</span>
                    <span>→</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 px-4 text-center text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
                  >
                    Keluar / Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-md hover:shadow-orange-500/25 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Mulai Sekarang</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Masuk ke Akun
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
