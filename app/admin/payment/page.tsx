"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost/hosting_webid/api/v1";
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
function getPaymentCategory(payment: Payment): "hosting" | "domain" | "google_ads" {
  const cat = (payment.service_category || "").toLowerCase();
  const dom = (payment.domain_name || payment.domain || (payment as any).domains || "").toLowerCase();
  const amt = Number(payment.amount ?? payment.total ?? 0);

  if (
    cat.includes("ads") ||
    cat.includes("iklan") ||
    cat.includes("google") ||
    dom.includes("google ads") ||
    dom.includes("paket pemula") ||
    dom.includes("paket bisnis 10") ||
    dom.includes("paket bisnis 15") ||
    dom.includes("paket bisnis 30")
  ) {
    return "google_ads";
  }

  if (cat === "hosting" || cat.includes("hosting")) return "hosting";
  if (cat === "website" || cat === "domain" || cat.includes("domain")) return "domain";

  // If explicit hosting keywords in service description
  if (
    dom.includes("cloud hosting") ||
    dom.includes("paket hosting") ||
    dom.includes("hosting starter") ||
    dom.includes("hosting bisnis") ||
    dom.includes("hosting enterprise") ||
    dom.includes("bisnis pro") ||
    dom.includes("starter website") ||
    dom.includes("elite enterprise") ||
    dom.includes("cpanel") ||
    dom.includes("nvme") ||
    dom.includes("server") ||
    dom.includes("hosting") ||
    dom.includes("paket")
  ) {
    return "hosting";
  }

  // Hosting packages are >= Rp 300.000
  if (amt >= 300000) {
    return "hosting";
  }

  // Domain registration purchases (< Rp 300.000)
  return "domain";
}

function paymentDomain(payment: Payment) {
  const dom = payment.domain_name ?? payment.domain ?? (payment as any).domains ?? payment.items?.map((item) => item.domain_name).filter(Boolean).join(", ");
  const cat = getPaymentCategory(payment);
  const amt = Number(payment.amount ?? payment.total ?? 0);

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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "hosting" | "domain" | "google_ads">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
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
        "http://localhost/hosting_webid/api/v1/admin/order/report.php",
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

        const domainName = p.domain_name || p.domain || matchedService?.domain_name || matchedService?.domain;
        const billing = p.billing_period || matchedService?.billing_period;

        mergedList.push({
          ...p,
          domain_name: domainName,
          domain: domainName,
          billing_period: billing,
        });
        seenPaymentNumbers.add(pNum);
      });

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
      const result = await readResponse(response);
      const detail = result.data && !Array.isArray(result.data) && "payment" in result.data
        ? result.data.payment
        : result.data && !Array.isArray(result.data) && "payment_id" in result.data
          ? result.data
          : payment;
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
            <p>Pilih filter layanan di bawah untuk melihat pembayaran hosting atau domain.</p>
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
          <div className="admin-filter-pills">
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
              <span>🔥 Payment Hosting</span>
              <span className="pill-badge">{hostingCount}</span>
            </button>
            <button
              type="button"
              className={`filter-pill domain ${categoryFilter === "domain" ? "active" : ""}`}
              onClick={() => setCategoryFilter("domain")}
            >
              <span>🌐 Payment Domain</span>
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
                          <strong className={cat === "hosting" ? "text-orange-600" : "text-blue-600"}>
                            {paymentDomain(payment)}
                          </strong>
                          <small style={{ color: "#64748b", display: "block" }}>
                            {cat === "hosting" ? (payment.billing_period || "Paket Tahunan (12 Bulan)") : "Registrasi Domain (1 Tahun)"}
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
                        <td>
                          <button
                            className="admin-payment-detail"
                            type="button"
                            onClick={() => openDetail(payment)}
                          >
                            Detail
                          </button>
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
                {statusLabel(selectedPayment.status) === "Pending" && (
                  <button
                    className="admin-payment-confirm"
                    type="button"
                    onClick={confirmPayment}
                    disabled={confirming}
                  >
                    {confirming ? "Memproses..." : "Konfirmasi Pembayaran"}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}

      <style jsx>{`
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
