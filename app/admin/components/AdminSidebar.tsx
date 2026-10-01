"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminSidebarProps {
  currentPath?: string;
  pendingPaymentCount?: number;
  darkMode?: boolean;
  onLogout?: () => void;
}

export default function AdminSidebar({
  currentPath,
  pendingPaymentCount: propPendingCount,
  darkMode = false,
  onLogout,
}: AdminSidebarProps) {
  const router = useRouter();
  const activePath = usePathname() || currentPath || "/admin";
  const [pendingCount, setPendingCount] = useState<number>(propPendingCount ?? 0);

  useEffect(() => {
    if (propPendingCount !== undefined) {
      setPendingCount(propPendingCount);
      return;
    }

    async function fetchPendingPayments() {
      try {
        const response = await fetch(
          "/api/backend/admin/payment/index.php",
          { method: "GET", credentials: "include" }
        );
        const result = await response.json().catch(() => null);
        if (response.ok && result?.status === "success") {
          const payments = Array.isArray(result.data)
            ? result.data
            : result.data?.payments || [];
          const count = payments.filter(
            (p: { status?: string }) => (p.status || "pending").toLowerCase() === "pending"
          ).length;
          setPendingCount(count);
        }
      } catch (err) {
        console.error("AdminSidebar pending payments fetch error:", err);
      }
    }

    void fetchPendingPayments();
  }, [propPendingCount]);

  const [currentUser, setCurrentUser] = useState<{ name?: string; role?: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hostingwebid_user");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("hostingwebid_user");
      localStorage.removeItem("hostingweb_auth");
      router.push("/login");
    }
  };

  const isCurrent = (path: string) => {
    if (path === "/admin") {
      return activePath === "/admin";
    }
    return activePath.startsWith(path);
  };

  return (
    <aside className={`admin-sidebar ${darkMode ? "admin-dark" : ""}`}>
      {/* BRAND LOGO */}
      <div className="admin-logo">
        <Link href="/admin" className="flex flex-col items-start gap-1">
          <img src="/logo.png" alt="HostingWebID" />
          {currentUser?.role === "super_admin" || currentUser?.role === "superadmin" ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              👑 SUPER ADMIN
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              🛡️ ADMIN PANEL
            </span>
          )}
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="admin-nav">
        {/* =========================================================
            SECTION 1: UTAMA
        ========================================================= */}
        <div className="admin-nav-title">MENU UTAMA</div>

        {/* 1. Dashboard */}
        <Link
          href="/admin"
          className={`admin-nav-item ${isCurrent("/admin") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </span>
          <span className="admin-nav-text">Dashboard</span>
          {isCurrent("/admin") && <span className="admin-nav-dot" />}
        </Link>

        {/* =========================================================
            SECTION 2: LAYANAN & PRODUK
        ========================================================= */}
        <div className="admin-nav-title" style={{ marginTop: "14px" }}>
          LAYANAN &amp; PRODUK
        </div>

        {/* 2. Hosting */}
        <Link
          href="/admin/hosting"
          className={`admin-nav-item ${isCurrent("/admin/hosting") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </span>
          <span className="admin-nav-text">Hosting</span>
          {isCurrent("/admin/hosting") && <span className="admin-nav-dot" />}
        </Link>

        {/* 3. Domain */}
        <Link
          href="/admin/domain"
          className={`admin-nav-item ${isCurrent("/admin/domain") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </span>
          <span className="admin-nav-text">Domain</span>
          {isCurrent("/admin/domain") && <span className="admin-nav-dot" />}
        </Link>

        {/* 4. Layanan Jasa Web & Google Ads */}
        <Link
          href="/admin/services"
          className={`admin-nav-item ${isCurrent("/admin/services") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
          <span className="admin-nav-text">Jasa Web &amp; Ads</span>
          {isCurrent("/admin/services") && <span className="admin-nav-dot" />}
        </Link>

        {/* 5. Layanan Jasa SEO & PBN */}
        <Link
          href="/admin/seo"
          className={`admin-nav-item ${isCurrent("/admin/seo") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </span>
          <span className="admin-nav-text">Jasa SEO</span>
          {isCurrent("/admin/seo") && <span className="admin-nav-dot" />}
        </Link>

        {/* 6. Tema Website */}
        <Link
          href="/admin/tema"
          className={`admin-nav-item ${isCurrent("/admin/tema") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.6-10-9.6z" />
              <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
              <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
              <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
              <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="admin-nav-text">Tema Website</span>
          {isCurrent("/admin/tema") && <span className="admin-nav-dot" />}
        </Link>

        {/* =========================================================
            SECTION 3: TRANSAKSI & BILLING
        ========================================================= */}
        <div className="admin-nav-title" style={{ marginTop: "14px" }}>
          TRANSAKSI &amp; BILLING
        </div>

        {/* 5. Tagihan & Invoice */}
        <Link
          href="/admin/invoice"
          className={`admin-nav-item ${isCurrent("/admin/invoice") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </span>
          <span className="admin-nav-text">Tagihan &amp; Invoice</span>
          {isCurrent("/admin/invoice") && <span className="admin-nav-dot" />}
        </Link>

        {/* 6. Konfirmasi & Mutasi Pembayaran */}
        <Link
          href="/admin/payment"
          className={`admin-nav-item ${isCurrent("/admin/payment") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </span>
          <span className="admin-nav-text">Payment</span>
          {pendingCount > 0 && (
            <span className="admin-menu-badge">{pendingCount}</span>
          )}
          {isCurrent("/admin/payment") && !pendingCount && (
            <span className="admin-nav-dot" />
          )}
        </Link>

        {/* 7. Riwayat Pesanan (Order Logs) */}
        <Link
          href="/admin/order"
          className={`admin-nav-item ${isCurrent("/admin/order") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </span>
          <span className="admin-nav-text">Pesanan</span>
          {isCurrent("/admin/order") && <span className="admin-nav-dot" />}
        </Link>

        {/* =========================================================
            SECTION 4: PENGGUNA & PROMO
        ========================================================= */}
        <div className="admin-nav-title" style={{ marginTop: "14px" }}>
          PENGGUNA &amp; PROMO
        </div>

        {/* 8. Pengguna (User Management) */}
        <Link
          href="/admin/user"
          className={`admin-nav-item ${isCurrent("/admin/user") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span className="admin-nav-text">User</span>
          {isCurrent("/admin/user") && <span className="admin-nav-dot" />}
        </Link>

        {/* 9. Kupon & Diskon */}
        <Link
          href="/admin/coupon"
          className={`admin-nav-item ${isCurrent("/admin/coupon") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </span>
          <span className="admin-nav-text">Coupon</span>
          {isCurrent("/admin/coupon") && <span className="admin-nav-dot" />}
        </Link>

        {/* 10. Manajemen Artikel & Blog */}
        <Link
          href="/admin/articles"
          className={`admin-nav-item ${isCurrent("/admin/articles") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </span>
          <span className="admin-nav-text">Artikel &amp; Blog</span>
          {isCurrent("/admin/articles") && <span className="admin-nav-dot" />}
        </Link>

        {/* =========================================================
            SECTION 5: SUPER ADMIN MASTER
        ========================================================= */}
        <div className="admin-nav-title font-black flex items-center gap-1 text-amber-500" style={{ marginTop: "14px" }}>
          <span>👑</span> SUPER ADMIN
        </div>

        {/* 10. Master Control & System Hub */}
        <Link
          href="/admin/system"
          className={`admin-nav-item ${isCurrent("/admin/system") ? "active" : ""}`}
        >
          <span className="admin-nav-svg-wrap text-amber-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="admin-nav-text font-bold text-amber-500 dark:text-amber-400">Master Control</span>
          {isCurrent("/admin/system") && <span className="admin-nav-dot" style={{ backgroundColor: "#f59e0b" }} />}
        </Link>
      </nav>

      {/* SIDEBAR BOTTOM ACTIONS */}
      <div className="admin-sidebar-bottom">
        <Link href="/dashboard" className="admin-nav-item admin-bottom-link">
          <span className="admin-nav-svg-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </span>
          <span className="admin-nav-text">Dashboard User</span>
        </Link>

        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
          aria-label="Keluar"
        >
          <span className="admin-nav-svg-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span className="admin-nav-text">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
