"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

function paymentDomain(payment: Payment) {
  return payment.domain_name ?? payment.domain ?? payment.items?.map((item) => item.domain_name).filter(Boolean).join(", ") ?? "-";
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
      if (parsed.role !== "admin") {
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
      setPayments(extractPayments(result.data));
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

  const filteredPayments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return payments;
    return payments.filter((payment) =>
      [payment.payment_number, payment.order_number, paymentName(payment), payment.email, paymentDomain(payment), statusLabel(payment.status)]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [payments, search]);

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
      <aside className="admin-sidebar">
        <div className="admin-logo"><img src="/logo.png" alt="HostingWebID" /></div>
        <nav className="admin-nav">
          <div className="admin-nav-title">MENU UTAMA</div>
          <Link href="/admin" className="admin-nav-item"><span>⌂</span>Dashboard</Link>
          <Link href="/admin/hosting" className="admin-nav-item"><span>▣</span>Hosting</Link>
          <Link href="/admin/domain" className="admin-nav-item"><span>◎</span>Domain</Link>
          <Link href="/admin/coupon" className="admin-nav-item"><span>%</span>Coupon</Link>
          <Link href="/admin/user" className="admin-nav-item"><span>♟</span>User</Link>
          <Link href="/admin/order" className="admin-nav-item"><span>▣</span>Pesanan</Link>
          <Link href="/admin/invoice" className="admin-nav-item"><span>▤</span>Invoice</Link>
          <Link href="/admin/payment" className="admin-nav-item active"><span>▣</span>Payment</Link>
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/dashboard" className="admin-nav-item"><span>←</span>Dashboard User</Link>
          <button className="admin-logout" onClick={logout} type="button"><span>↪</span>Keluar</button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div><div className="admin-breadcrumb">ADMIN PANEL / PAYMENT</div><h1>Payment</h1></div>
          <div className="admin-header-right"><button className="admin-payment-notification" type="button" title="Payment pending"><span aria-hidden="true">▣</span>{pendingPaymentCount > 0 && <strong>{pendingPaymentCount}</strong>}</button><div className="admin-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nomor order..." /></div></div>
        </header>

        <div className="admin-payment-toolbar"><div><h2>Daftar Pembayaran</h2><p>Periksa pembayaran pending sebelum mengaktifkan layanan.</p>{pendingPaymentCount > 0 && <strong className="admin-payment-alert">{pendingPaymentCount} payment dari user menunggu diproses</strong>}</div><button className="admin-payment-refresh" type="button" onClick={loadPayments}>Muat ulang</button></div>
        {error && <div className="general-error">{error}</div>}
        {notice && <div className="admin-payment-notice">{notice}</div>}

        <section className="admin-payment-table-wrap">
          {loading ? <div className="admin-payment-empty">Memuat data payment...</div> : filteredPayments.length === 0 ? <div className="admin-payment-empty">Tidak ada payment ditemukan.</div> : (
            <div className="admin-payment-table-scroll"><table className="admin-payment-table"><thead><tr><th>Payment</th><th>Order</th><th>User</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
              {filteredPayments.map((payment) => <tr key={`${paymentId(payment)}-${payment.payment_number}`}><td><strong>{payment.payment_number || `PAY-${paymentId(payment)}`}</strong></td><td>{payment.order_number || `ORD-${payment.order_id ?? "-"}`}</td><td><strong>{paymentName(payment)}</strong><small>{payment.email || "-"}</small></td><td>{formatRupiah(paymentAmount(payment))}</td><td><span className={`admin-payment-status ${statusLabel(payment.status).toLowerCase()}`}>{statusLabel(payment.status)}</span></td><td><button className="admin-payment-detail" type="button" onClick={() => openDetail(payment)}>Detail</button></td></tr>)}
            </tbody></table></div>
          )}
        </section>
      </section>

      {selectedPayment && <div className="admin-payment-modal-backdrop" role="presentation" onClick={() => setSelectedPayment(null)}><section className="admin-payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-detail-title" onClick={(event) => event.stopPropagation()}>
        <div className="admin-payment-modal-header"><div><div className="admin-breadcrumb">PAYMENT DETAIL</div><h2 id="payment-detail-title">Detail Pembayaran</h2></div><button type="button" className="admin-payment-close" onClick={() => setSelectedPayment(null)} aria-label="Tutup detail">×</button></div>
        {detailLoading ? <div className="admin-payment-empty">Memuat detail...</div> : <><dl className="admin-payment-details">
          <div><dt>Nomor Payment</dt><dd>{selectedPayment.payment_number || `PAY-${paymentId(selectedPayment)}`}</dd></div><div><dt>Nomor Order</dt><dd>{selectedPayment.order_number || `ORD-${selectedPayment.order_id ?? "-"}`}</dd></div><div><dt>Username</dt><dd>{paymentName(selectedPayment)}</dd></div><div><dt>Email</dt><dd>{selectedPayment.email || "-"}</dd></div><div><dt>Domain</dt><dd>{paymentDomain(selectedPayment)}</dd></div><div><dt>Total Pembayaran</dt><dd>{formatRupiah(paymentAmount(selectedPayment))}</dd></div><div><dt>Metode Transfer</dt><dd>{selectedPayment.payment_method || "transfer"}</dd></div><div><dt>Tanggal Pembayaran</dt><dd>{formatDate(selectedPayment.paid_at || selectedPayment.payment_date || selectedPayment.created_at)}</dd></div><div><dt>Status</dt><dd><span className={`admin-payment-status ${statusLabel(selectedPayment.status).toLowerCase()}`}>{statusLabel(selectedPayment.status)}</span></dd></div>
        </dl>{statusLabel(selectedPayment.status) === "Pending" && <button className="admin-payment-confirm" type="button" onClick={confirmPayment} disabled={confirming}>{confirming ? "Memproses..." : "Konfirmasi Pembayaran"}</button>}</>}
      </section></div>}
    </main>
  );
}
