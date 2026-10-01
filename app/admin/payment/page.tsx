"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import { printOrDownloadInvoicePdf } from "@/app/lib/invoicePdf";

type Payment = {
  payment_id?: number | string;
  id?: number | string;
  payment_number?: string;
  order_id?: number | string;
  order_number?: string;
  username?: string;
  user_name?: string;
  email?: string;
  domain?: string;
  domain_name?: string;
  amount?: number | string;
  total?: number | string;
  payment_method?: string;
  paid_at?: string | null;
  confirmation_requested_at?: string | null;
  payment_date?: string | null;
  created_at?: string | null;
  status?: string;
  service_category?: string;
  domains?: string;
  billing_period?: string;
  service_status?: string;
  start_date?: string | null;
  expiry_date?: string | null;
  items?: Array<{
    domain_name?: string;
    billing_period?: string;
    start_date?: string | null;
    expiry_date?: string | null;
  }>;
};

type ApiResponse = {
  status: string;
  message?: string;
  data?: Payment[] | { payments?: Payment[]; payment?: Payment } | Payment;
};

type User = {
  role?: string;
  name?: string;
  username?: string;
  email?: string;
};

const API_BASE = "/api/backend";
const PAYMENT_API = `${API_BASE}/admin/payment/index.php`;
const CONFIRM_API = `${API_BASE}/admin/payment/confirm.php`;


function paymentId(payment: Payment) {
  return Number(payment.payment_id ?? payment.id);
}

function paymentAmount(payment: Payment) {
  return payment.amount ?? payment.total ?? 0;
}

function paymentName(payment: Payment) {
  return payment.username ?? payment.user_name ?? "-";
}

/**
 * Accurately determines if payment is for Hosting, Domain, or Google Ads.
 */
function getPaymentCategory(payment: Payment): "hosting" | "domain" | "google_ads" | "seo" | "website" | "theme" {
  const cat = (payment.service_category || "").toLowerCase();
  const dom = (
    payment.domain_name ||
    payment.domain ||
    (payment as any).domains ||
    (payment as any).package_name ||
    ""
  ).toLowerCase();
  const amt = Number(payment.amount ?? payment.total ?? 0);

  // 0. Explicit Theme keywords
  if (
    cat.includes("tema") ||
    cat.includes("theme") ||
    cat.includes("template") ||
    dom.includes("tema") ||
    dom.includes("theme") ||
    dom.includes("template")
  ) {
    return "theme";
  }

  // 1. Explicit Google Ads keywords
  if (
    cat.includes("ads") ||
    cat.includes("iklan") ||
    cat.includes("google") ||
    dom.includes("google") ||
    dom.includes("ads") ||
    dom.includes("iklan") ||
    dom.includes("pemula") ||
    dom.includes("bisnis") ||
    dom.includes("search ads") ||
    dom.includes("campaign") ||
    amt === 777000 ||
    amt === 1110000 ||
    amt === 1665000 ||
    amt === 3330000
  ) {
    return "google_ads";
  }

  // 2. Explicit SEO keywords
  if (cat.includes("seo") || dom.includes("seo") || dom.includes("backlink") || dom.includes("pbn")) {
    return "seo";
  }

  // 3. Explicit Website keywords
  if (cat.includes("website") || dom.includes("jasa pembuatan website") || dom.includes("pembuatan website") || dom.includes("desain web") || dom.includes("custom desain")) {
    return "website";
  }

  // 4. Explicit Domain keywords
  if (
    cat === "domain" ||
    dom.includes("pendaftaran domain") ||
    dom.includes("registrasi domain") ||
    (dom.startsWith("domain:") && !dom.includes("hosting") && !dom.includes("website") && !dom.includes("server"))
  ) {
    return "domain";
  }

  // 5. Explicit Hosting keywords
  if (
    cat === "hosting" ||
    cat.includes("hosting") ||
    dom.includes("hosting") ||
    dom.includes("cpanel") ||
    dom.includes("nvme") ||
    dom.includes("server") ||
    dom.includes("starter") ||
    dom.includes("business-pro") ||
    dom.includes("elite-enterprise")
  ) {
    return "hosting";
  }

  // 6. Default classification
  if (amt <= 300000 && (dom.endsWith(".com") || dom.endsWith(".id") || dom.endsWith(".my.id") || dom.endsWith(".co.id"))) {
    return "domain";
  }

  return "hosting";
}

function paymentDomain(payment: Payment) {
  const dom =
    payment.domain_name ??
    payment.domain ??
    (payment as any).domains ??
    (payment as any).package_name ??
    payment.items?.map((item) => item.domain_name).filter(Boolean).join(", ");
  const cat = getPaymentCategory(payment);
  const amt = Number(payment.amount ?? payment.total ?? 0);

  if (cat === "theme") {
    if (dom && dom !== "-" && !dom.startsWith("PAY-") && !dom.startsWith("ORD-")) {
      return `🎨 ${dom.replace(/^domain:\s*/i, "").replace(/^tema:\s*/i, "")}`;
    }
    return "🎨 Template & Tema Website";
  }

  if (cat === "google_ads") {
    if (dom && dom !== "-" && !dom.startsWith("PAY-") && !dom.startsWith("ORD-")) {
      return `🎯 ${dom.replace(/^domain:\s*/i, "")}`;
    }
    if (amt >= 3000000) return "🎯 Paket Bisnis 30 Hari Google Ads";
    if (amt >= 2000000) return "🎯 Paket Bisnis 20 Hari Google Ads";
    if (amt >= 1500000) return "🎯 Paket Pemula 30 Hari / Bisnis 15 Hari Google Ads";
    if (amt >= 1000000) return "🎯 Paket Pemula 20 Hari / Bisnis 10 Hari Google Ads";
    if (amt >= 700000) return "🎯 Paket Pemula 14 Hari Google Ads";
    return "🎯 Kampanye Iklan Google Ads";
  }

  if (cat === "hosting") {
    if (dom && dom !== "-" && !dom.startsWith("PAY-") && !dom.startsWith("ORD-")) {
      return dom;
    }
    if (amt >= 1900000 && amt <= 2500000) {
      return "🌟 Paket Elite Enterprise (Tahunan)";
    }
    if (amt >= 1400000 && amt <= 1800000) {
      return "🔥 Paket Bisnis Pro (Tahunan)";
    }
    if (amt >= 700000 && amt <= 950000) {
      return "✨ Paket Starter Website (Tahunan)";
    }
    return "☁️ Paket Cloud Hosting NVMe";
  }

  // Domain Category
  if (dom && dom !== "-" && !dom.startsWith("PAY-") && !dom.startsWith("ORD-")) {
    return `🌐 Domain: ${dom}`;
  }
  return "🌐 Pendaftaran Domain Web";
}

function statusLabel(status?: string) {
  const normalized = (status || "pending").toLowerCase();
  if (["paid", "success", "completed"].includes(normalized)) return "Paid";
  if (["failed", "cancelled", "canceled"].includes(normalized)) return "Failed";
  return "Pending";
}

function formatRupiah(value: number | string | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

async function readResponse(response: Response): Promise<ApiResponse> {
  const result = await response.json();
  if (!response.ok || result.status !== "success") {
    throw new Error(result.message || "Permintaan payment gagal.");
  }
  return result;
}

function extractPayments(data: ApiResponse["data"]): Payment[] {
  if (Array.isArray(data)) return data;
  if (data && "payments" in data && Array.isArray(data.payments)) {
    return data.payments;
  }
  return data && !Array.isArray(data) && "payment_id" in data
    ? [data]
    : [];
}

export default function AdminPaymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "hosting" | "domain" | "google_ads" | "seo" | "website" | "theme">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(savedUser) as User;
      if (parsed.role !== "admin" && parsed.role !== "super_admin" && parsed.role !== "superadmin") {
        router.push("/dashboard");
        return;
      }
      setTimeout(() => setUser(parsed), 0);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(PAYMENT_API, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const result = await readResponse(response);
      const apiPayments = extractPayments(result.data);

      const resReport = await fetch(
        "/api/backend/admin/order/report.php",
        { credentials: "include" }
      ).catch(() => null);
      const jsonReport = resReport ? await resReport.json().catch(() => null) : null;
      const services = jsonReport?.data?.services || [];
      const serviceMap = new Map<string, any>();
      services.forEach((s: any) => {
        if (s.order_number) serviceMap.set(s.order_number, s);
        if (s.order_id) serviceMap.set(String(s.order_id), s);
      });

      const mergedList: Payment[] = [];
      const seenPaymentNumbers = new Set<string>();

      apiPayments.forEach((p) => {
        const pNum = p.payment_number || `PAY-${paymentId(p)}`;
        const ordRef = p.order_number || String(p.order_id || "");
        const matchedService = serviceMap.get(ordRef);

        const domainName =
          p.domain_name ||
          p.domain ||
          (p as any).package_name ||
          matchedService?.domain_name ||
          matchedService?.domain;
        const serviceCategory = p.service_category || matchedService?.service_category;
        const billing = p.billing_period || matchedService?.billing_period;

        mergedList.push({
          ...p,
          domain_name: domainName,
          domain: domainName,
          service_category: serviceCategory,
          billing_period: billing,
        });
        seenPaymentNumbers.add(pNum);
        if (ordRef) seenPaymentNumbers.add(ordRef);
      });

      // Also merge any services from report that may not have direct payment row
      services.forEach((s: any) => {
        const ordNum = s.order_number || (s.order_id ? `ORD-${s.order_id}` : "");
        const payNum = s.payment_number || (ordNum ? `PAY-${ordNum}` : `PAY-SRV-${s.id}`);
        if (!seenPaymentNumbers.has(payNum) && (!ordNum || !seenPaymentNumbers.has(ordNum))) {
          const isPaid =
            (s.service_status || "").toLowerCase() === "active" ||
            (s.order_status || "").toLowerCase() === "completed" ||
            (s.status || "").toLowerCase() === "paid";
          mergedList.push({
            id: s.id,
            payment_id: s.id,
            payment_number: payNum,
            order_id: s.order_id,
            order_number: ordNum,
            username: s.username || s.user_name || "Pelanggan",
            email: s.email || "-",
            domain_name: s.domain_name || s.domain || s.package_name,
            service_category: s.service_category,
            amount: s.order_total || s.price || 0,
            status: isPaid ? "paid" : "pending",
            created_at: s.created_at || s.start_date || s.order_date,
            billing_period: s.billing_period,
          });
          seenPaymentNumbers.add(payNum);
          if (ordNum) seenPaymentNumbers.add(ordNum);
        }
      });

      // Also merge user orders endpoint so all active/pending orders appear
      try {
        const resUserOrders = await fetch(
          "/api/backend/dashboardusers/order/index.php",
          { credentials: "include" }
        ).catch(() => null);
        const jsonUserOrders = resUserOrders ? await resUserOrders.json().catch(() => null) : null;
        const userOrders: any[] = jsonUserOrders?.data?.orders || (Array.isArray(jsonUserOrders?.data) ? jsonUserOrders.data : []);

        userOrders.forEach((o: any) => {
          const ordNum = o.order_number || (o.id ? `ORD-${o.id}` : "");
          const payNum = o.payment_number || `PAY-${ordNum}`;
          if (!seenPaymentNumbers.has(payNum) && (!ordNum || !seenPaymentNumbers.has(ordNum))) {
            const isPaid = ["paid", "lunas", "completed", "success", "aktif", "active"].includes((o.status || "").toLowerCase());
            const realId = Number(o.id || o.order_id || o.payment_id || 0);
            mergedList.push({
              id: realId,
              payment_id: realId,
              payment_number: payNum,
              order_id: o.id || o.order_id,
              order_number: ordNum,
              username: o.username || o.user_name || "Pelanggan",
              email: o.email || "-",
              domain_name: o.domain_name || o.package_name || "Layanan HostingWeb",
              service_category: o.service_category || (String(o.package_name || "").toLowerCase().includes("ads") ? "google_ads" : undefined),
              amount: o.total || o.price || 0,
              status: isPaid ? "paid" : "pending",
              created_at: o.created_at,
            });
            seenPaymentNumbers.add(payNum);
            if (ordNum) seenPaymentNumbers.add(ordNum);
          }
        });
      } catch { }

      setPayments(mergedList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat payment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) setTimeout(() => void loadPayments(), 0);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = window.setInterval(() => {
      void loadPayments();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [user]);

  // CATEGORY COUNTS
  const hostingCount = payments.filter((p) => getPaymentCategory(p) === "hosting").length;
  const domainCount = payments.filter((p) => getPaymentCategory(p) === "domain").length;
  const adsCount = payments.filter((p) => getPaymentCategory(p) === "google_ads").length;
  const seoCount = payments.filter((p) => getPaymentCategory(p) === "seo").length;
  const websiteCount = payments.filter((p) => getPaymentCategory(p) === "website").length;
  const themeCount = payments.filter((p) => getPaymentCategory(p) === "theme").length;
  const pendingCount = payments.filter((p) => statusLabel(p.status) === "Pending").length;
  const paidCount = payments.filter((p) => statusLabel(p.status) === "Paid").length;

  const filteredPayments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return payments.filter((payment) => {
      // Category filter
      if (categoryFilter !== "all") {
        const cat = getPaymentCategory(payment);
        if (cat !== categoryFilter) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const stat = statusLabel(payment.status).toLowerCase();
        if (stat !== statusFilter) return false;
      }

      // Keyword search
      if (keyword) {
        const match = [
          payment.payment_number,
          payment.order_number,
          paymentName(payment),
          payment.email,
          paymentDomain(payment),
          getPaymentCategory(payment),
          statusLabel(payment.status),
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
        if (!match) return false;
      }

      return true;
    });
  }, [payments, search, categoryFilter, statusFilter]);

  const pendingPaymentCount = payments.filter(
    (payment) => statusLabel(payment.status) === "Pending"
  ).length;

  const openDetail = async (payment: Payment) => {
    const id = paymentId(payment);
    if (!Number.isFinite(id)) return;
    try {
      setDetailLoading(true);
      setError("");
      const response = await fetch(`${PAYMENT_API}?payment_id=${id}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const result = await response.json().catch(() => null);
      const detail = result?.data?.payment || result?.data;
      setSelectedPayment(detail || payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail payment.");
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!selectedPayment || statusLabel(selectedPayment.status) !== "Pending") return;
    const id = paymentId(selectedPayment);
    try {
      setConfirming(true);
      setError("");
      setNotice("");
      const response = await fetch(CONFIRM_API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ payment_id: id }),
      });
      await readResponse(response);
      setNotice("Pembayaran berhasil dikonfirmasi.");
      setSelectedPayment({ ...selectedPayment, status: "paid" });
      await loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengonfirmasi pembayaran.");
    } finally {
      setConfirming(false);
    }
  };

  const handleDeletePayment = async (paymentToDelete: Payment) => {
    try {
      setDeleting(true);
      setError("");
      setNotice("");

      const targetId = paymentId(paymentToDelete);
      const targetPaymentNum = paymentToDelete.payment_number;
      const targetOrderId = paymentToDelete.order_id;
      const targetOrderNum = paymentToDelete.order_number;

      // 1. Attempt backend deletion across all order & payment endpoints
      const deleteRequests = [
        fetch(`${API_BASE}/admin/payment/delete.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            payment_id: targetId,
            id: targetId,
            payment_number: targetPaymentNum,
            order_id: targetOrderId,
            order_number: targetOrderNum,
          }),
        }).catch(() => null),
        fetch(`${API_BASE}/admin/order/delete.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            id: targetOrderId || targetId,
            order_id: targetOrderId,
            order_number: targetOrderNum,
          }),
        }).catch(() => null),
        fetch(`${API_BASE}/dashboardusers/order/delete.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            id: targetOrderId || targetId,
            order_id: targetOrderId,
            order_number: targetOrderNum,
          }),
        }).catch(() => null),
        fetch(`${API_BASE}/order/delete.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            id: targetOrderId || targetId,
            order_id: targetOrderId,
            order_number: targetOrderNum,
          }),
        }).catch(() => null),
        fetch(`${API_BASE}/invoice/delete.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            order_id: targetOrderId,
            order_number: targetOrderNum,
            payment_number: targetPaymentNum,
          }),
        }).catch(() => null),
      ];

      await Promise.allSettled(deleteRequests);

      // 2. Synchronize deleted list in localStorage for real-time user dashboard removal
      try {
        const deletedOrders: string[] = JSON.parse(localStorage.getItem("hostingweb_deleted_orders") || "[]");
        if (targetOrderNum) deletedOrders.push(String(targetOrderNum).trim().toLowerCase());
        if (targetOrderId) deletedOrders.push(String(targetOrderId).trim().toLowerCase());
        if (targetPaymentNum) deletedOrders.push(String(targetPaymentNum).trim().toLowerCase());
        if (targetId) deletedOrders.push(String(targetId).trim().toLowerCase());
        localStorage.setItem("hostingweb_deleted_orders", JSON.stringify(Array.from(new Set(deletedOrders))));

        // Clean active checkout payment cache if matching
        const cachedPay = localStorage.getItem("hostingweb_checkout_payment");
        if (cachedPay) {
          const p = JSON.parse(cachedPay);
          if (
            p.orderNumber === targetOrderNum ||
            p.paymentNumber === targetPaymentNum ||
            p.orderId === targetOrderId ||
            p.paymentId === targetId
          ) {
            localStorage.removeItem("hostingweb_checkout_payment");
          }
        }
        window.dispatchEvent(new Event("storage"));
      } catch { }

      // 3. Remove immediately from admin payments state
      setPayments((prev) =>
        prev.filter((p) => {
          const pId = paymentId(p);
          if (targetId && pId === targetId) return false;
          if (targetPaymentNum && p.payment_number === targetPaymentNum) return false;
          if (targetOrderNum && p.order_number === targetOrderNum) return false;
          return true;
        })
      );

      if (
        selectedPayment &&
        (paymentId(selectedPayment) === targetId ||
          (targetPaymentNum && selectedPayment.payment_number === targetPaymentNum))
      ) {
        setSelectedPayment(null);
      }
      setDeleteTarget(null);
      setNotice(`Data pembayaran ${targetPaymentNum || `ID #${targetId}`} berhasil dihapus.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus data pembayaran.");
    } finally {
      setDeleting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("hostingwebid_user");
    localStorage.removeItem("hostingweb_auth");
    router.push("/login");
  };

  if (!user) return <div className="admin-loading">Memuat halaman payment...</div>;

  return (
    <main className="admin-page admin-payment-page">
      <AdminSidebar
        currentPath="/admin/payment"
        pendingPaymentCount={pendingPaymentCount}
        onLogout={logout}
      />

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">ADMIN PANEL / PAYMENT</div>
            <h1>Manajemen Pembayaran</h1>
          </div>
          <div className="admin-header-right">
            <button className="admin-payment-notification" type="button" title="Payment pending">
              <span aria-hidden="true">▣</span>
              {pendingPaymentCount > 0 && <strong>{pendingPaymentCount}</strong>}
            </button>
            <div className="admin-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari order, user, atau layanan..."
              />
            </div>
          </div>
        </header>

        {/* TOOLBAR */}
        <div className="admin-payment-toolbar">
          <div>
            <h2>Daftar Pembayaran</h2>
            <p>Pilih filter layanan di bawah untuk melihat pembayaran hosting, domain, iklan, atau website.</p>
            {pendingPaymentCount > 0 && (
              <strong className="admin-payment-alert">
                {pendingPaymentCount} payment dari user menunggu diproses
              </strong>
            )}
          </div>
          <button className="admin-payment-refresh" type="button" onClick={loadPayments}>
            🔄 Muat ulang
          </button>
        </div>

        {/* CATEGORY & STATUS FILTER TABS */}
        <div className="admin-filter-bar">
          {/* CATEGORY PILLS */}
          <div className="admin-filter-pills flex flex-wrap gap-2">
            <button
              type="button"
              className={`filter-pill ${categoryFilter === "all" ? "active" : ""}`}
              onClick={() => setCategoryFilter("all")}
            >
              <span>Semua Layanan</span>
              <span className="pill-badge">{payments.length}</span>
            </button>
            <button
              type="button"
              className={`filter-pill hosting ${categoryFilter === "hosting" ? "active" : ""}`}
              onClick={() => setCategoryFilter("hosting")}
            >
              <span>🔥 Hosting</span>
              <span className="pill-badge">{hostingCount}</span>
            </button>
            <button
              type="button"
              className={`filter-pill domain ${categoryFilter === "domain" ? "active" : ""}`}
              onClick={() => setCategoryFilter("domain")}
            >
              <span>🌐 Domain</span>
              <span className="pill-badge">{domainCount}</span>
            </button>
            <button
              type="button"
              className={`filter-pill ${categoryFilter === "google_ads" ? "active" : ""}`}
              style={{
                borderColor: categoryFilter === "google_ads" ? "#ea580c" : undefined,
                background: categoryFilter === "google_ads" ? "#fff7ed" : undefined,
                color: categoryFilter === "google_ads" ? "#c2410c" : undefined,
              }}
              onClick={() => setCategoryFilter("google_ads")}
            >
              <span>🎯 Google Ads</span>
              <span className="pill-badge" style={{ background: "#ea580c", color: "#fff" }}>{adsCount}</span>
            </button>
            <button
              type="button"
              className={`filter-pill ${categoryFilter === "seo" ? "active" : ""}`}
              style={{
                borderColor: categoryFilter === "seo" ? "#7c3aed" : undefined,
                background: categoryFilter === "seo" ? "#f5f3ff" : undefined,
                color: categoryFilter === "seo" ? "#6d28d9" : undefined,
              }}
              onClick={() => setCategoryFilter("seo")}
            >
              <span>🚀 Jasa SEO</span>
              <span className="pill-badge" style={{ background: "#7c3aed", color: "#fff" }}>{seoCount}</span>
            </button>
            <button
              type="button"
              className={`filter-pill ${categoryFilter === "website" ? "active" : ""}`}
              style={{
                borderColor: categoryFilter === "website" ? "#16a34a" : undefined,
                background: categoryFilter === "website" ? "#f0fdf4" : undefined,
                color: categoryFilter === "website" ? "#15803d" : undefined,
              }}
              onClick={() => setCategoryFilter("website")}
            >
              <span>💻 Website</span>
              <span className="pill-badge" style={{ background: "#16a34a", color: "#fff" }}>{websiteCount}</span>
            </button>
            <button
              type="button"
              className={`filter-pill ${categoryFilter === "theme" ? "active" : ""}`}
              style={{
                borderColor: categoryFilter === "theme" ? "#d97706" : undefined,
                background: categoryFilter === "theme" ? "#fef3c7" : undefined,
                color: categoryFilter === "theme" ? "#b45309" : undefined,
              }}
              onClick={() => setCategoryFilter("theme")}
            >
              <span>🎨 Tema Website</span>
              <span className="pill-badge" style={{ background: "#d97706", color: "#fff" }}>{themeCount}</span>
            </button>
          </div>

          {/* STATUS SELECTOR */}
          <div className="admin-status-filters">
            <label className="status-label">Status:</label>
            <button
              type="button"
              className={`status-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              Semua
            </button>
            <button
              type="button"
              className={`status-btn pending ${statusFilter === "pending" ? "active" : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`status-btn paid ${statusFilter === "paid" ? "active" : ""}`}
              onClick={() => setStatusFilter("paid")}
            >
              Paid ({paidCount})
            </button>
          </div>
        </div>

        {error && <div className="general-error">{error}</div>}
        {notice && <div className="admin-payment-notice">{notice}</div>}

        <section className="admin-payment-table-wrap">
          {loading ? (
            <div className="admin-payment-empty">Memuat data payment...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="admin-payment-empty">
              Tidak ada data pembayaran yang sesuai dengan filter.
            </div>
          ) : (
            <div className="admin-payment-table-scroll">
              <table className="admin-payment-table">
                <thead>
                  <tr>
                    <th>Tipe</th>
                    <th>Payment</th>
                    <th>Order</th>
                    <th>User</th>
                    <th>Layanan & Rincian</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment, idx) => {
                    const cat = getPaymentCategory(payment);
                    return (
                      <tr key={`payment-${paymentId(payment)}-${payment.payment_number}-${idx}`}>
                        <td>
                          {cat === "hosting" ? (
                            <span className="badge-category hosting">
                              🔥 HOSTING
                            </span>
                          ) : cat === "google_ads" ? (
                            <span className="badge-category" style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                              🎯 GOOGLE ADS
                            </span>
                          ) : cat === "seo" ? (
                            <span className="badge-category" style={{ background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" }}>
                              🚀 JASA SEO
                            </span>
                          ) : cat === "website" ? (
                            <span className="badge-category" style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                              💻 WEBSITE
                            </span>
                          ) : cat === "theme" ? (
                            <span className="badge-category" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
                              🎨 TEMA WEBSITE
                            </span>
                          ) : (
                            <span className="badge-category domain">
                              🌐 DOMAIN
                            </span>
                          )}
                        </td>
                        <td>
                          <strong>{payment.payment_number || `PAY-${paymentId(payment)}`}</strong>
                          <small>{formatDate(payment.created_at || payment.payment_date)}</small>
                        </td>
                        <td>
                          <span className="font-mono text-slate-700 font-semibold">
                            {payment.order_number || `ORD-${payment.order_id ?? "-"}`}
                          </span>
                        </td>
                        <td>
                          <strong>{paymentName(payment)}</strong>
                          <small>{payment.email || "-"}</small>
                        </td>
                        <td>
                          <strong className={cat === "hosting" ? "text-orange-600" : cat === "google_ads" ? "text-amber-700" : cat === "theme" ? "text-amber-600" : "text-blue-600"}>
                            {paymentDomain(payment)}
                          </strong>
                          <small style={{ color: "#64748b", display: "block" }}>
                            {cat === "theme"
                              ? "Akses Selamanya (Sekali Bayar)"
                              : cat === "hosting"
                                ? (payment.billing_period || "Paket Tahunan (12 Bulan)")
                                : cat === "google_ads"
                                  ? (payment.billing_period || "Masa Aktif Kampanye Iklan")
                                  : "Registrasi Domain (1 Tahun)"}
                          </small>
                        </td>
                        <td>
                          <span className="font-bold text-slate-900">
                            {formatRupiah(paymentAmount(payment))}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-payment-status ${statusLabel(payment.status).toLowerCase()}`}>
                            {statusLabel(payment.status)}
                          </span>
                          {payment.confirmation_requested_at && statusLabel(payment.status) === "Pending" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 mt-1 block w-fit animate-pulse">
                              💬 Konfirmasi WA
                            </span>
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button
                              className="admin-payment-detail"
                              type="button"
                              onClick={() => openDetail(payment)}
                            >
                              Detail
                            </button>
                            <button
                              className="admin-payment-delete-btn"
                              type="button"
                              title="Hapus data pembayaran ini"
                              onClick={() => setDeleteTarget(payment)}
                            >
                              🗑️ Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      {/* DETAIL MODAL */}
      {selectedPayment && (
        <div
          className="admin-payment-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedPayment(null)}
        >
          <section
            className="admin-payment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-payment-modal-header">
              <div>
                <div className="admin-breadcrumb">PAYMENT DETAIL</div>
                <h2 id="payment-detail-title">Detail Pembayaran</h2>
              </div>
              <button
                type="button"
                className="admin-payment-close"
                onClick={() => setSelectedPayment(null)}
                aria-label="Tutup detail"
              >
                ×
              </button>
            </div>
            {detailLoading ? (
              <div className="admin-payment-empty">Memuat detail...</div>
            ) : (
              <>
                <dl className="admin-payment-details">
                  <div>
                    <dt>Tipe Layanan</dt>
                    <dd>
                      {getPaymentCategory(selectedPayment) === "hosting" ? (
                        <span className="badge-category hosting">🔥 HOSTING SERVER</span>
                      ) : getPaymentCategory(selectedPayment) === "google_ads" ? (
                        <span className="badge-category" style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                          🎯 GOOGLE ADS
                        </span>
                      ) : getPaymentCategory(selectedPayment) === "seo" ? (
                        <span className="badge-category" style={{ background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" }}>
                          🚀 JASA SEO
                        </span>
                      ) : getPaymentCategory(selectedPayment) === "website" ? (
                        <span className="badge-category" style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
                          💻 WEBSITE
                        </span>
                      ) : getPaymentCategory(selectedPayment) === "theme" ? (
                        <span className="badge-category" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>
                          🎨 TEMA WEBSITE
                        </span>
                      ) : (
                        <span className="badge-category domain">🌐 DOMAIN WEB</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Nomor Payment</dt>
                    <dd>{selectedPayment.payment_number || `PAY-${paymentId(selectedPayment)}`}</dd>
                  </div>
                  <div>
                    <dt>Nomor Order</dt>
                    <dd>{selectedPayment.order_number || `ORD-${selectedPayment.order_id ?? "-"}`}</dd>
                  </div>
                  <div>
                    <dt>Username</dt>
                    <dd>{paymentName(selectedPayment)}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{selectedPayment.email || "-"}</dd>
                  </div>
                  <div>
                    <dt>Layanan / Detail</dt>
                    <dd>{paymentDomain(selectedPayment)}</dd>
                  </div>
                  <div>
                    <dt>Total Pembayaran</dt>
                    <dd>{formatRupiah(paymentAmount(selectedPayment))}</dd>
                  </div>
                  <div>
                    <dt>Metode Transfer</dt>
                    <dd>{selectedPayment.payment_method || "transfer"}</dd>
                  </div>
                  <div>
                    <dt>Tanggal Pembayaran</dt>
                    <dd>
                      {formatDate(
                        selectedPayment.paid_at ||
                        selectedPayment.payment_date ||
                        selectedPayment.created_at
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <span className={`admin-payment-status ${statusLabel(selectedPayment.status).toLowerCase()}`}>
                        {statusLabel(selectedPayment.status)}
                      </span>
                    </dd>
                  </div>
                </dl>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap", alignItems: "center" }}>
                  {statusLabel(selectedPayment.status) === "Pending" && (
                    <button
                      className="admin-payment-confirm"
                      type="button"
                      style={{ flex: "1 1 auto" }}
                      onClick={confirmPayment}
                      disabled={confirming}
                    >
                      {confirming ? "Memproses..." : "Konfirmasi Pembayaran"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const rawAmt = Number(selectedPayment.amount ?? selectedPayment.total ?? 0);
                      const isGoogleAds = getPaymentCategory(selectedPayment) === "google_ads";
                      const isTheme = getPaymentCategory(selectedPayment) === "theme";
                      const desc = isGoogleAds
                        ? (selectedPayment.domain_name || "Paket Bisnis 30 Hari Google Ads (Google Search Campaign)")
                        : paymentDomain(selectedPayment);
                      const itemDesc = isTheme
                        ? "Lisensi Tema & Template Website (Akses Selamanya)"
                        : isGoogleAds
                          ? "Layanan Kampanye Iklan Google Ads"
                          : "Paket Cloud Server & Infrastruktur Website";

                      printOrDownloadInvoicePdf({
                        invoice_number: selectedPayment.payment_number || `INV-${paymentId(selectedPayment)}`,
                        order_number: selectedPayment.order_number || `ORD-${selectedPayment.order_id ?? paymentId(selectedPayment)}`,
                        created_at: selectedPayment.payment_date || selectedPayment.created_at || new Date().toISOString(),
                        due_date: selectedPayment.payment_date || selectedPayment.created_at || new Date().toISOString(),
                        status: selectedPayment.status || "paid",
                        username: paymentName(selectedPayment),
                        email: selectedPayment.email || "-",
                        total: rawAmt,
                        items: [
                          {
                            domain_name: desc,
                            description: itemDesc,
                            price: rawAmt,
                          },
                        ],
                      });
                    }}
                    style={{
                      background: "#ea580c",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "10px",
                      fontWeight: 800,
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(234, 88, 12, 0.2)",
                    }}
                  >
                    <span>📥</span> Unduh Invoice PDF
                  </button>
                  <button
                    type="button"
                    className="admin-payment-modal-delete-btn"
                    onClick={() => {
                      const t = selectedPayment;
                      setSelectedPayment(null);
                      setDeleteTarget(t);
                    }}
                  >
                    <span>🗑️</span> Hapus
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div
          className="admin-payment-modal-backdrop"
          role="presentation"
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="admin-delete-modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-delete-modal-icon">🗑️</div>
            <h3>Hapus Data Pembayaran?</h3>
            <p>
              Apakah Anda yakin ingin menghapus data pembayaran{" "}
              <strong>{deleteTarget.payment_number || `PAY-${paymentId(deleteTarget)}`}</strong>
              {deleteTarget.order_number ? (
                <> (Order: <strong>{deleteTarget.order_number}</strong>)</>
              ) : null}
              ? Data ini akan dihapus dari daftar pembayaran.
            </p>
            <div className="admin-delete-modal-actions">
              <button
                type="button"
                className="admin-delete-cancel-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Batal
              </button>
              <button
                type="button"
                className="admin-delete-confirm-btn"
                onClick={() => handleDeletePayment(deleteTarget)}
                disabled={deleting}
              >
                {deleting ? "Menghapus..." : "Ya, Hapus Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-payment-delete-btn {
          padding: 8px 12px;
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .admin-payment-delete-btn:hover {
          background: #fecaca;
          color: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.15);
        }

        .admin-payment-modal-delete-btn {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .admin-payment-modal-delete-btn:hover {
          background: #fecaca;
          color: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.2);
        }

        .admin-delete-modal-card {
          background: #ffffff;
          border-radius: 18px;
          max-width: 440px;
          width: 90%;
          padding: 28px 24px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: popIn 0.2s ease-out;
        }

        .admin-delete-modal-icon {
          font-size: 40px;
          line-height: 1;
          margin-bottom: 12px;
        }

        .admin-delete-modal-card h3 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .admin-delete-modal-card p {
          font-size: 13.5px;
          color: #64748b;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .admin-delete-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .admin-delete-cancel-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .admin-delete-cancel-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .admin-delete-confirm-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 10px;
          background: #dc2626;
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
          transition: all 0.15s ease;
        }

        .admin-delete-confirm-btn:hover:not(:disabled) {
          background: #b91c1c;
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .admin-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
          background: #ffffff;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
        }

        .admin-filter-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-pill:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .filter-pill.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        .filter-pill.hosting.active {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-color: #ea580c;
          color: #ffffff;
        }

        .filter-pill.domain.active {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-color: #2563eb;
          color: #ffffff;
        }

        .pill-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 7px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          background: rgba(0, 0, 0, 0.08);
          color: inherit;
        }

        .filter-pill.active .pill-badge {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .admin-status-filters {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          margin-right: 4px;
        }

        .status-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .status-btn:hover {
          background: #f8fafc;
        }

        .status-btn.active {
          background: #e2e8f0;
          color: #0f172a;
          font-weight: 700;
        }

        .status-btn.pending.active {
          background: #fef3c7;
          border-color: #fde68a;
          color: #92400e;
        }

        .status-btn.paid.active {
          background: #dcfce7;
          border-color: #bbf7d0;
          color: #166534;
        }

        .badge-category {
          display: inline-flex;
          align-items: center;
          padding: 4px 9px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.03em;
        }

        .badge-category.hosting {
          background: #fff7ed;
          border: 1px solid #ffedd5;
          color: #ea580c;
        }

        .badge-category.domain {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          color: #2563eb;
        }
      `}</style>
    </main>
  );
}
