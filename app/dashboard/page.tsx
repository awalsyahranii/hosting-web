"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getExpiryInfo } from "@/app/lib/expiryHelper";

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
  billing_period: string;
  service_status: string;
  start_date: string | null;
  expiry_date: string | null;
  order_number?: string;
};

type InvoiceSummary = {
  id: number;
  invoice_number: string;
  total: string | number;
  status: string;
  created_at: string;
  due_date?: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/dashboard");
      return;
    }
    try {
      setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("hostingwebid_user");
      router.push("/login?redirect=/dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const [hostings, setHostings] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);

  function getDeletedSet(): Set<string> {
    const deletedSet = new Set<string>();
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("hostingweb_deleted_orders") : null;
      if (raw) {
        (JSON.parse(raw) as string[]).forEach((item) => {
          if (item) deletedSet.add(String(item).trim().toLowerCase());
        });
      }
    } catch {}
    return deletedSet;
  }

  useEffect(() => {
    let isMounted = true;
    async function fetchInvoices() {
      try {
        const response = await fetch(
          "/api/backend/invoice/index.php",
          { method: "GET", credentials: "include", cache: "no-store" }
        );
        const result = await response.json().catch(() => null);
        if (response.ok && result?.status === "success" && isMounted) {
          const deletedSet = getDeletedSet();
          const rawList = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.data?.invoices)
            ? result.data.invoices
            : [];
          const list = rawList.filter((inv: any) => {
            const num = (inv.invoice_number || "").toLowerCase();
            const ordId = String(inv.order_id || "").toLowerCase();
            const invId = String(inv.id || "").toLowerCase();
            if (num && deletedSet.has(num)) return false;
            if (ordId && deletedSet.has(ordId)) return false;
            if (invId && deletedSet.has(invId)) return false;
            if (deletedSet.has(`ord-${ordId}`)) return false;
            if (deletedSet.has(`inv-${invId}`)) return false;
            return true;
          });
          setInvoices(list);
        }
      } catch (error) {
        console.error("Gagal load invoice:", error);
      }
    }

    async function fetchServices() {
      try {
        const deletedSet = getDeletedSet();
        const [resHosting, resDomain, resOrder] = await Promise.all([
          fetch("/api/backend/service/index.php?type=hosting", { method: "GET", credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => null),
          fetch("/api/backend/service/index.php?type=domain", { method: "GET", credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => null),
          fetch("/api/backend/dashboardusers/order/index.php", { method: "GET", credentials: "include", cache: "no-store" }).then(r => r.json()).catch(() => null),
        ]);

        if (resHosting?.status === "success" && Array.isArray(resHosting.data) && isMounted) {
          setHostings(resHosting.data.filter((h: any) => {
            const ordNum = (h.order_number || "").toLowerCase();
            const sId = String(h.id || "").toLowerCase();
            return !deletedSet.has(ordNum) && !deletedSet.has(sId);
          }));
        }
        if (resDomain?.status === "success" && Array.isArray(resDomain.data) && isMounted) {
          setDomains(resDomain.data.filter((d: any) => {
            const ordNum = (d.order_number || "").toLowerCase();
            const sId = String(d.id || "").toLowerCase();
            return !deletedSet.has(ordNum) && !deletedSet.has(sId);
          }));
        }
        if (resOrder?.status === "success" && isMounted) {
          const list = (resOrder.data?.orders || (Array.isArray(resOrder.data) ? resOrder.data : [])).filter((o: any) => {
            const ordNum = (o.order_number || "").toLowerCase();
            const ordId = String(o.id || "").toLowerCase();
            return !deletedSet.has(ordNum) && !deletedSet.has(ordId) && !deletedSet.has(`ord-${ordId}`);
          });
          setOrdersCount(list.length);
        }
      } catch (error) {
        console.error("Gagal load services:", error);
      }
    }

    void fetchInvoices();
    void fetchServices();

    const onStorageChange = () => {
      void fetchInvoices();
      void fetchServices();
    };
    window.addEventListener("storage", onStorageChange);

    const interval = window.setInterval(() => {
      void fetchInvoices();
      void fetchServices();
    }, 4000);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", onStorageChange);
      window.clearInterval(interval);
    };
  }, []);

  function rupiah(value: string | number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Belum aktif";
    try {
      const date = new Date(dateStr.replace(" ", "T"));
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  }

  function getStatusLabel(status: string) {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "aktif") return "Aktif";
    if (s === "expired") return "Expired";
    return "Menunggu";
  }

  const hostingList = hostings.length > 0 ? hostings : userServices.filter(s => {
    const cat = (s.service_category || "").toLowerCase();
    const dom = (s.domain_name || "").toLowerCase();
    return cat.includes("hosting") || cat.includes("paket") || dom.includes("hosting") || dom.includes("paket");
  });

  const domainList = domains.length > 0 ? domains : userServices.filter(s => {
    const cat = (s.service_category || "").toLowerCase();
    const dom = (s.domain_name || "").toLowerCase();
    return (cat.includes("domain") || dom.includes(".")) && !cat.includes("hosting");
  });

  const hostingCount = hostingList.length;
  const domainCount = domainList.length;

  const unpaidInvoices = invoices.filter(
    (inv) => inv.status?.toLowerCase() !== "paid"
  );
  const unpaidCount = unpaidInvoices.length;

  const unpaidTotalAmount = unpaidInvoices.reduce(
    (sum, inv) => sum + (Number(inv.total) || 0),
    0
  );

  const totalOrdersCount = ordersCount || invoices.length;

  const expiringServices = [...hostingList, ...domainList].filter(item => {
    const exp = getExpiryInfo(item.expiry_date);
    return exp.isExpiringSoon || exp.isExpired;
  });

  if (loading) {
    return (
      <div className="py-16 text-center text-sm font-semibold text-slate-500">
        Memuat data dashboard...
      </div>
    );
  }

  const userName = user?.name || "Member";

  return (
    <>
      {/* WARNING BANNER JIKA ADA LAYANAN KEDALUWARSA / SISA <= 7 HARI */}
      {expiringServices.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-l-4 border-amber-500 p-4 rounded-xl bg-amber-50 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                Peringatan Perpanjangan Layanan ({expiringServices.length} Layanan Perlu Perhatian)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Ada hosting atau domain Anda yang akan berakhir dalam 7 hari atau sudah kedaluwarsa. Perpanjang sekarang agar website dan email Anda tidak offline.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/invoices"
            className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow transition"
          >
            Perpanjang Sekarang →
          </Link>
        </div>
      )}

      {/* HERO WELCOME BANNER */}
      <div className="dash-hero-banner">
        <div className="dash-hero-content">
          <div className="dash-hero-pill">
            <span>SELAMAT DATANG</span>
            <span>👑</span>
          </div>
          <h2 className="dash-hero-title">Halo, {userName}!</h2>
          <p className="dash-hero-desc">
            Kelola {hostingCount} hosting aktif, {domainCount} domain terdaftar,
            dan tagihan layanan website Anda dengan lancar dari satu tempat
            terpadu.
          </p>
        </div>

        <div className="dash-hero-actions">
          <a href="/#pricing" className="dash-hero-btn-white">
            + Order Hosting Baru
          </a>
          <a href="/#domain" className="dash-hero-btn-trans">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Cari Domain</span>
          </a>
        </div>
      </div>

      {/* =========================================================
          STATS 4 CARDS GRID
      ========================================================= */}
      <div className="dash-stats-grid">
        {/* STAT 1: HOSTING AKTIF */}
        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <div className="dash-stat-icon-box peach">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <Link href="/dashboard/hosting" className="dash-stat-link">
              Lihat →
            </Link>
          </div>
          <span className="dash-stat-label">HOSTING AKTIF</span>
          <div className="dash-stat-value-row">
            <span className="dash-stat-number">{hostingCount}</span>
            <span className="dash-stat-badge green">
              {hostingCount > 0 ? "Semua online" : "Belum ada"}
            </span>
          </div>
          <p className="dash-stat-footer-text">Cyber IDC Jakarta Tier-3</p>
        </div>

        {/* STAT 2: DOMAIN AKTIF */}
        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <div className="dash-stat-icon-box yellow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <Link href="/dashboard/domain" className="dash-stat-link">
              Lihat →
            </Link>
          </div>
          <span className="dash-stat-label">DOMAIN AKTIF</span>
          <div className="dash-stat-value-row">
            <span className="dash-stat-number">{domainCount}</span>
            <span className="dash-stat-badge yellow">
              {domainCount > 0 ? "Terhubung" : "Belum ada"}
            </span>
          </div>
          <p className="dash-stat-footer-text">
            Auto Renew aktif ({domainCount})
          </p>
        </div>

        {/* STAT 3: TOTAL PESANAN */}
        <div className="dash-stat-card">
          <div className="dash-stat-top">
            <div className="dash-stat-icon-box blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <Link href="/dashboard/orders" className="dash-stat-link">
              Lihat →
            </Link>
          </div>
          <span className="dash-stat-label">TOTAL PESANAN</span>
          <div className="dash-stat-value-row">
            <span className="dash-stat-number">{totalOrdersCount}</span>
            <span className="dash-stat-badge blue">Tahun 2026</span>
          </div>
          <p className="dash-stat-footer-text">Semua riwayat transaksimu</p>
        </div>

        {/* STAT 4: INVOICE BELUM BAYAR */}
        <div
          className={`dash-stat-card ${
            unpaidCount > 0 ? "stat-alert" : ""
          }`}
        >
          <div className="dash-stat-top">
            <div className="dash-stat-icon-box red">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <Link href="/dashboard/invoices" className="dash-stat-link red">
              Bayar →
            </Link>
          </div>
          <span className="dash-stat-label">INVOICE BELUM BAYAR</span>
          <div className="dash-stat-value-row">
            <span className="dash-stat-number">{unpaidCount}</span>
            <span
              className={`dash-stat-badge ${
                unpaidCount > 0 ? "red" : "green"
              }`}
            >
              {unpaidCount > 0 ? "Perlu Tindakan" : "Lunas Semua"}
            </span>
          </div>
          <p className="dash-stat-footer-text">
            <strong>Total: {rupiah(unpaidTotalAmount)}</strong>
          </p>
        </div>
      </div>

      {/* =========================================================
          QUICK ACTION SECTION
      ========================================================= */}
      <div className="dash-quick-section">
        <div className="dash-section-meta">
          <span className="dash-section-pretitle">QUICK ACTION</span>
          <h3 className="dash-section-title">Apa yang ingin kamu lakukan?</h3>
        </div>

        <div className="dash-quick-grid">
          <a href="/#pricing" className="dash-quick-card">
            <div className="dash-quick-card-left">
              <div className="dash-quick-icon-box orange">+</div>
              <div className="dash-quick-text">
                <h4>Beli Hosting Baru</h4>
                <p>Pilih paket cloud NVMe super cepat</p>
              </div>
            </div>
            <span className="dash-quick-arrow">→</span>
          </a>

          <a href="/#domain" className="dash-quick-card">
            <div className="dash-quick-card-left">
              <div className="dash-quick-icon-box yellow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="dash-quick-text">
                <h4>Kelola Domain</h4>
                <p>Atur DNS record &amp; nameserver</p>
              </div>
            </div>
            <span className="dash-quick-arrow">→</span>
          </a>

          <Link href="/dashboard/profile" className="dash-quick-card">
            <div className="dash-quick-card-left">
              <div className="dash-quick-icon-box pink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="dash-quick-text">
                <h4>Profil Saya</h4>
                <p>Kelola info akun &amp; billing Anda</p>
              </div>
            </div>
            <span className="dash-quick-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* =========================================================
          TWO-COLUMN TABLES (HOSTING SAYA & DOMAIN SAYA)
      ========================================================= */}
      <div className="dash-tables-grid">
        {/* COLUMN 1: HOSTING SAYA */}
        <div className="dash-table-card">
          <div className="dash-table-header">
            <div className="dash-table-title-group">
              <span className="dash-table-pretitle">HOSTING SAYA</span>
              <h3 className="dash-table-title">Layanan Aktif</h3>
            </div>
            <Link href="/dashboard/hosting" className="dash-table-view-all">
              Lihat semua →
            </Link>
          </div>

          <div className="dash-services-list">
            {hostingList.length > 0 ? (
              hostingList.slice(0, 5).map((item) => {
                const exp = getExpiryInfo(item.expiry_date);
                return (
                  <div key={item.id} className="dash-service-item">
                    <div className="dash-service-left">
                      <div className="dash-service-icon-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                          <line x1="6" y1="6" x2="6.01" y2="6" />
                          <line x1="6" y1="18" x2="6.01" y2="18" />
                        </svg>
                      </div>
                      <div className="dash-service-info">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="dash-service-name">
                            {item.domain_name}
                          </span>
                          {exp.isExpired && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                              ⛔ Expired
                            </span>
                          )}
                          {exp.isExpiringSoon && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 animate-pulse">
                              ⚠️ {exp.statusText}
                            </span>
                          )}
                        </div>
                        <span className="dash-service-sub">
                          {item.service_category || "Cloud Hosting"} • Berakhir: {exp.formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className="dash-service-right">
                      <span
                        className={`dash-service-status-pill ${
                          getStatusLabel(item.service_status) === "Aktif"
                            ? "active"
                            : "pending"
                        }`}
                      >
                        ● {getStatusLabel(item.service_status)}
                      </span>
                      <Link
                        href={
                          exp.isExpiringSoon || exp.isExpired
                            ? "/dashboard/invoices"
                            : getStatusLabel(item.service_status) === "Aktif"
                            ? `/dashboard/hosting`
                            : "/dashboard/invoices"
                        }
                        className={`dash-service-action-btn ${
                          exp.isExpiringSoon || exp.isExpired
                            ? "pay"
                            : getStatusLabel(item.service_status) === "Aktif"
                            ? ""
                            : "pay"
                        }`}
                      >
                        {exp.isExpiringSoon || exp.isExpired
                          ? "Perpanjang"
                          : getStatusLabel(item.service_status) === "Aktif"
                          ? "cPanel"
                          : "Bayar"}
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="dash-empty-state">
                <div className="dash-empty-icon">📦</div>
                <h4>Belum Ada Layanan Hosting</h4>
                <p>Anda belum memiliki layanan hosting aktif.</p>
                <Link href="/#pricing" className="dash-empty-action-btn">
                  + Order Hosting Sekarang
                </Link>
              </div>
            )}
          </div>

          <div className="dash-table-footer">
            <span>
              Menampilkan {Math.min(hostingList.length, 5)} dari{" "}
              {hostingCount} Hosting
            </span>
            <Link href="/dashboard/hosting" className="dash-table-footer-link">
              Kelola Semua Hosting →
            </Link>
          </div>
        </div>

        {/* COLUMN 2: DOMAIN SAYA */}
        <div className="dash-table-card">
          <div className="dash-table-header">
            <div className="dash-table-title-group">
              <span className="dash-table-pretitle">DOMAIN SAYA</span>
              <h3 className="dash-table-title">Domain Terdaftar</h3>
            </div>
            <Link href="/dashboard/domain" className="dash-table-view-all">
              Lihat semua →
            </Link>
          </div>

          <div className="dash-services-list">
            {domainList.length > 0 ? (
              domainList.slice(0, 5).map((item) => {
                const exp = getExpiryInfo(item.expiry_date);
                return (
                  <div key={item.id} className="dash-service-item">
                    <div className="dash-service-left">
                      <div className="dash-service-icon-box yellow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <div className="dash-service-info">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="dash-service-name">
                            {item.domain_name}
                          </span>
                          {exp.isExpired && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                              ⛔ Expired
                            </span>
                          )}
                          {exp.isExpiringSoon && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 animate-pulse">
                              ⚠️ {exp.statusText}
                            </span>
                          )}
                        </div>
                        <span className="dash-service-sub">
                          Berakhir: {exp.formattedDate}
                        </span>
                      </div>
                    </div>

                    <div className="dash-service-right">
                      <span
                        className={`dash-service-status-pill ${
                          getStatusLabel(item.service_status) === "Aktif"
                            ? "active"
                            : "pending"
                        }`}
                      >
                        ● {getStatusLabel(item.service_status)}
                      </span>
                      <Link
                        href={
                          exp.isExpiringSoon || exp.isExpired
                            ? "/dashboard/invoices"
                            : getStatusLabel(item.service_status) === "Aktif"
                            ? `/dashboard/domain`
                            : "/dashboard/invoices"
                        }
                        className={`dash-service-action-btn ${
                          exp.isExpiringSoon || exp.isExpired
                            ? "pay"
                            : getStatusLabel(item.service_status) === "Aktif"
                            ? ""
                            : "pay"
                        }`}
                      >
                        {exp.isExpiringSoon || exp.isExpired
                          ? "Perpanjang"
                          : getStatusLabel(item.service_status) === "Aktif"
                          ? "Atur DNS"
                          : "Selesaikan"}
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="dash-empty-state">
                <div className="dash-empty-icon">🌐</div>
                <h4>Belum Ada Domain Terdaftar</h4>
                <p>Daftarkan nama domain bisnis Anda sekarang.</p>
                <Link href="/#domain" className="dash-empty-action-btn">
                  🔍 Cari Domain Baru
                </Link>
              </div>
            )}
          </div>

          <div className="dash-table-footer">
            <span>
              Menampilkan {Math.min(domainList.length, 5)} dari{" "}
              {domainCount} Domain
            </span>
            <Link href="/dashboard/domain" className="dash-table-footer-link">
              Kelola Semua Domain →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}