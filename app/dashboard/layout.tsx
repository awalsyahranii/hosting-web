"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getExpiryInfo } from "@/app/lib/expiryHelper";
import { getWhatsAppUrl } from "@/app/lib/siteConfig";

type User = {
  id?: number;
  name: string;
  email: string;
  role?: string;
};

type UserService = {
  id: number;
  domain_name: string;
  service_category: string;
  service_status: string;
  expiry_date?: string | null;
};

type InvoiceSummary = {
  id: number;
  invoice_number: string;
  total: string | number;
  status: string;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    try {
      setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("hostingwebid_user");
      localStorage.removeItem("hostingweb_auth");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  const [hostings, setHostings] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  async function fetchInvoices() {
    try {
      const response = await fetch(
        "http://localhost/hosting_webid/api/v1/invoice/index.php",
        { method: "GET", credentials: "include" }
      );
      const result = await response.json().catch(() => null);
      if (response.ok && result?.status === "success") {
        setInvoices(result.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data invoice:", error);
    }
  }

  async function fetchUserServices() {
    try {
      const [resHosting, resDomain, resOrder] = await Promise.all([
        fetch("http://localhost/hosting_webid/api/v1/service/index.php?type=hosting", { method: "GET", credentials: "include" }).then(r => r.json()).catch(() => null),
        fetch("http://localhost/hosting_webid/api/v1/service/index.php?type=domain", { method: "GET", credentials: "include" }).then(r => r.json()).catch(() => null),
        fetch("http://localhost/hosting_webid/api/v1/dashboardusers/order/index.php", { method: "GET", credentials: "include" }).then(r => r.json()).catch(() => null),
      ]);

      if (resHosting?.status === "success" && Array.isArray(resHosting.data)) {
        setHostings(resHosting.data);
      }
      if (resDomain?.status === "success" && Array.isArray(resDomain.data)) {
        setDomains(resDomain.data);
      }
      if (resOrder?.status === "success") {
        const list = resOrder.data?.orders || (Array.isArray(resOrder.data) ? resOrder.data : []);
        setOrdersCount(list.length);
      }
    } catch (error) {
      console.error("Gagal mengambil data service:", error);
    }
  }

  useEffect(() => {
    void fetchInvoices();
    void fetchUserServices();
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hostingwebid_user");
    localStorage.removeItem("hostingweb_auth");
    router.push("/login");
  };

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  const hostingCount = hostings.length;
  const domainCount = domains.length;

  const expiringHostings = hostings.filter((h) => {
    const exp = getExpiryInfo(h.expiry_date);
    return exp.isExpiringSoon || exp.isExpired;
  });

  const expiringDomains = domains.filter((d) => {
    const exp = getExpiryInfo(d.expiry_date);
    return exp.isExpiringSoon || exp.isExpired;
  });

  const expiringHostingCount = expiringHostings.length;
  const expiringDomainCount = expiringDomains.length;

  const unpaidInvoices = invoices.filter((inv) => {
    const st = (inv.status || "").toLowerCase();
    return st !== "paid" && st !== "lunas" && st !== "berhasil";
  });
  const unpaidCount = unpaidInvoices.length;
  const totalOrdersCount = ordersCount || invoices.length;

  const totalNotificationsCount = unpaidCount + expiringHostingCount + expiringDomainCount;

  function rupiah(value: string | number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  const unpaidTotalAmount = unpaidInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) || 0),
    0
  );

  // Dynamic breadcrumb label
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Ringkasan Akun";
    if (pathname.startsWith("/dashboard/hosting")) return "Hosting Saya";
    if (pathname.startsWith("/dashboard/domain")) return "Domain Saya";
    if (pathname.startsWith("/dashboard/invoices")) return "Tagihan / Invoice";
    if (pathname.startsWith("/dashboard/orders")) return "Riwayat Pesanan";
    if (pathname.startsWith("/dashboard/profile")) return "Profil Saya";
    if (pathname.startsWith("/dashboard/security")) return "Keamanan & 2FA";
    return "Client Area";
  };

  return (
    <div className="dash-page-wrapper">
      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================================
          PERSISTENT SIDEBAR
      ========================================================= */}
      <aside
        className={`dash-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        {/* SIDEBAR BRAND */}
        <div className="dash-sidebar-header">
          <Link href="/" className="dash-brand-logo">
            <img src="/logo.png" alt="hostingwebid" />
          </Link>
          <button
            type="button"
            className="dash-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            ✕
          </button>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <div className="dash-sidebar-body">
          {/* SECTION: UTAMA */}
          <div className="dash-nav-section">
            <span className="dash-nav-heading">UTAMA</span>

            <Link
              href="/dashboard"
              className={`dash-nav-link ${pathname === "/dashboard" ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </span>
                <span>Dashboard</span>
              </div>
              {pathname === "/dashboard" && <span className="dash-nav-active-dot" />}
            </Link>

            <Link
              href="/dashboard/hosting"
              className={`dash-nav-link ${pathname.startsWith("/dashboard/hosting") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </span>
                <span>Hosting Saya</span>
              </div>
              {expiringHostingCount > 0 ? (
                <span className="dash-badge-pill-warning animate-pulse flex items-center gap-1">
                  ⚠️ {expiringHostingCount} Perhatian
                </span>
              ) : (
                <span className="dash-badge-count">{hostingCount}</span>
              )}
            </Link>

            <Link
              href="/dashboard/domain"
              className={`dash-nav-link ${pathname.startsWith("/dashboard/domain") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
                <span>Domain Saya</span>
              </div>
              {expiringDomainCount > 0 ? (
                <span className="dash-badge-pill-warning animate-pulse flex items-center gap-1">
                  ⚠️ {expiringDomainCount} Perhatian
                </span>
              ) : (
                <span className="dash-badge-count">{domainCount}</span>
              )}
            </Link>

            <Link
              href="/dashboard/ads"
              className={`dash-nav-link ${pathname.startsWith("/dashboard/ads") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </span>
                <span>Google Ads</span>
              </div>
              <span className="dash-badge-count" style={{ background: "#ea580c", color: "#fff" }}>Ads</span>
            </Link>
          </div>

          {/* SECTION: TRANSAKSI & BILLING */}
          <div className="dash-nav-section">
            <span className="dash-nav-heading">TRANSAKSI &amp; BILLING</span>

            <Link
              href="/dashboard/invoices"
              className={`dash-nav-link ${pathname.startsWith("/dashboard/invoices") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span>Tagihan / Invoice</span>
              </div>
              {unpaidCount > 0 ? (
                <span className="dash-badge-pill-warning">
                  {unpaidCount} Menunggu
                </span>
              ) : (
                <span className="dash-badge-count">0</span>
              )}
            </Link>

            <Link
              href="/dashboard/orders"
              className={`dash-nav-link ${pathname.startsWith("/dashboard/orders") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </span>
                <span>Riwayat Pesanan</span>
              </div>
              <span className="dash-badge-count">{totalOrdersCount}</span>
            </Link>
          </div>

          {/* SECTION: AKUN & PREFERENSI */}
          <div className="dash-nav-section">
            <span className="dash-nav-heading">AKUN &amp; PREFERENSI</span>

            <Link
              href="/dashboard/profile"
              className={`dash-nav-link ${pathname.startsWith("/dashboard/profile") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span>Profil Saya</span>
              </div>
            </Link>

            <Link
              href="/dashboard/security"
              className={`dash-nav-link ${pathname.startsWith("/dashboard/security") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <span>Keamanan &amp; 2FA</span>
              </div>
              <span className="dash-badge-pill-success">Aktif</span>
            </Link>
          </div>

          {/* BOTTOM WHATSAPP SUPPORT CARD */}
          <div className="dash-sidebar-help">
            <div className="dash-help-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2.1 21.9l5.01-1.28A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.6 0-3.1-.45-4.39-1.22l-.31-.19-2.97.76.79-2.9-.2-.32A7.95 7.95 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
            <div className="dash-help-content">
              <h5>Butuh bantuan teknis?</h5>
              <p>Tim support siap 24/7 untuk Anda.</p>
              <a
                href={getWhatsAppUrl("Halo Admin HostingWeb, saya butuh bantuan teknis di dashboard.")}
                target="_blank"
                rel="noopener noreferrer"
                className="dash-help-link"
              >
                Hubungi via WhatsApp →
              </a>
            </div>
          </div>
        </div>

        {/* SIDEBAR FOOTER USER */}
        <div className="dash-sidebar-user">
          <div className="dash-user-profile-left">
            <div className="dash-avatar-square">{userInitial}</div>
            <div className="dash-user-info-text">
              <span className="dash-user-info-name">{userName}</span>
              <span className="dash-user-info-email">{userEmail}</span>
            </div>
          </div>
          <button
            type="button"
            className="dash-logout-btn"
            onClick={handleLogout}
            title="Logout Akun"
            aria-label="Logout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN AREA (HEADER + CONTENT + FOOTER)
      ========================================================= */}
      <div className="dash-main-area">
        {/* TOP HEADER */}
        <header className="dash-top-header">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="dash-mobile-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka navigasi"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* BREADCRUMBS */}
            <div className="dash-breadcrumbs">
              <Link href="/dashboard" className="text-slate-500 hover:text-slate-800">
                🏠 Dashboard
              </Link>
              <span>›</span>
              <span>Client Area</span>
              <span>›</span>
              <span className="dash-breadcrumbs-current">{getPageTitle()}</span>
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="dash-header-center-search">
            <svg
              className="dash-header-search-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="dash-header-search-input"
              placeholder="Cari domain, hosting, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* RIGHT ACTIONS */}
          <div className="dash-header-right-actions">
            {/* NOTIFICATION BELL */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                className="dash-header-icon-btn"
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                aria-label="Notifikasi"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {totalNotificationsCount > 0 && (
                  <span className="dash-badge-dot-header">{totalNotificationsCount}</span>
                )}
              </button>

              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-50 animate-fade-in text-slate-800">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Pusat Notifikasi</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      {totalNotificationsCount} Baru
                    </span>
                  </div>

                  <div className="py-2 space-y-3 max-h-80 overflow-y-auto">
                    {/* EXPIRING HOSTING NOTIFICATIONS */}
                    {expiringHostings.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                          <span>⚠️</span>
                          <span>Hosting Segera Berakhir ({expiringHostings.length})</span>
                        </div>
                        {expiringHostings.map((h) => {
                          const exp = getExpiryInfo(h.expiry_date);
                          return (
                            <div key={`notif-h-${h.id}`} className="py-1 text-[11px] text-amber-800 border-t border-amber-200/60 first:border-0">
                              <strong className="block text-slate-900">{h.domain_name}</strong>
                              <span>{exp.statusText} • Berakhir {exp.formattedDate}</span>
                            </div>
                          );
                        })}
                        <Link
                          href="/dashboard/hosting"
                          onClick={() => setNotificationDropdownOpen(false)}
                          className="mt-2 block text-center py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-[11px] transition shadow-sm"
                        >
                          Kelola Hosting →
                        </Link>
                      </div>
                    )}

                    {/* EXPIRING DOMAIN NOTIFICATIONS */}
                    {expiringDomains.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-yellow-900 mb-1">
                          <span>🌐</span>
                          <span>Domain Perlu Perpanjangan ({expiringDomains.length})</span>
                        </div>
                        {expiringDomains.map((d) => {
                          const exp = getExpiryInfo(d.expiry_date);
                          return (
                            <div key={`notif-d-${d.id}`} className="py-1 text-[11px] text-yellow-800 border-t border-yellow-200/60 first:border-0">
                              <strong className="block text-slate-900">{d.domain_name}</strong>
                              <span>{exp.statusText} • Berakhir {exp.formattedDate}</span>
                            </div>
                          );
                        })}
                        <Link
                          href="/dashboard/domain"
                          onClick={() => setNotificationDropdownOpen(false)}
                          className="mt-2 block text-center py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-bold text-[11px] transition shadow-sm"
                        >
                          Kelola Domain →
                        </Link>
                      </div>
                    )}

                    {/* UNPAID INVOICES */}
                    {unpaidCount > 0 ? (
                      <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-1">
                          <span>💳</span>
                          <span>Tagihan Menunggu ({unpaidCount})</span>
                        </div>
                        <p className="text-[11px] text-rose-800">
                          Total <strong>{rupiah(unpaidTotalAmount)}</strong> belum dibayar.
                        </p>
                        <Link
                          href="/dashboard/invoices"
                          onClick={() => setNotificationDropdownOpen(false)}
                          className="mt-2 block text-center py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold text-[11px] transition shadow-sm"
                        >
                          Bayar Invoice Sekarang →
                        </Link>
                      </div>
                    ) : (
                      expiringHostings.length === 0 && expiringDomains.length === 0 && (
                        <div className="py-6 text-center text-xs text-slate-500">
                          <div className="text-2xl mb-1">✨</div>
                          <p className="font-semibold text-slate-700">Semua Layanan &amp; Tagihan Aman!</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada pemberitahuan perpanjangan saat ini.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>



            {/* USER PROFILE PILL */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="dash-header-user-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="dash-avatar-orange">{userInitial}</div>
                <div className="dash-header-user-meta hidden sm:flex">
                  <span className="dash-header-user-greeting">
                    Hello, {userName}!
                  </span>
                  <span className="dash-header-user-sub">{userEmail}</span>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    👤 Profil Saya
                  </Link>
                  <Link
                    href="/dashboard/invoices"
                    className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    📄 Riwayat Tagihan
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =========================================================
            DYNAMIC PAGE CONTENT
        ========================================================= */}
        <main className="dash-body-content">{children}</main>

        {/* =========================================================
            PERSISTENT FOOTER
        ========================================================= */}
        <footer className="dash-footer-bar">
          <div className="dash-footer-brand-text">
            <strong>hostingwebid</strong> — Jasa Web Murah &amp; Cloud Hosting Berkualitas
          </div>
          <div className="flex items-center gap-3">
            <span className="dash-footer-status-pill">
              <span className="dash-footer-status-dot" />
              Latency: 2ms (Cyber IDC 1)
            </span>
            <span>•</span>
            <span>© 2026 All Rights Reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
