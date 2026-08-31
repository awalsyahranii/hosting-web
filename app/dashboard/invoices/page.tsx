"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

type OrderItem = {
  id: number;
  order_id: number;
  domain_id: number;
  domain_name: string;
  price: string;
};

type InvoiceDetail = {
  id: number;
  invoice_number: string;
  order_id: number;
  order_number: string;
  items: OrderItem[];
  subtotal: string;
  ppn: string;
  discount: string;
  total: string;
  status: string;
  due_date: string;
  created_at: string;
};

type InvoiceListItem = {
  id: number;
  order_id: number;
  invoice_number: string;
  subtotal: string;
  ppn: string;
  discount: string;
  total: string;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
};

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInvoiceId = searchParams.get("id");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load User and Invoices
  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/dashboard/invoices");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchInvoices(parsedUser.id);
    } catch {
      localStorage.removeItem("hostingwebid_user");
      localStorage.removeItem("hostingweb_auth");
      router.push("/login?redirect=/dashboard/invoices");
    }
  }, []);

  // Watch for selected invoice changes via URL parameter
  useEffect(() => {
    if (initialInvoiceId && user) {
      fetchInvoiceDetail(Number(initialInvoiceId));
    } else {
      setSelectedInvoice(null);
    }
  }, [initialInvoiceId, user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchInvoices(userId: number) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost/hosting_webid/api/v1/invoice/index.php",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        setError(result.message || "Gagal mengambil daftar invoice.");
        return;
      }

      setInvoices(result.data || []);

      // If there is an ID in the URL, that is fetched by the other useEffect.
      // Otherwise, select the first invoice in the list automatically if available
      if (!initialInvoiceId && result.data && result.data.length > 0) {
        fetchInvoiceDetail(result.data[0].id);
      }
    } catch (err) {
      console.error("Fetch invoices error:", err);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvoiceDetail(invoiceId: number) {
    try {
      setDetailLoading(true);
      const response = await fetch(
        `http://localhost/hosting_webid/api/v1/invoice/index.php?invoice_id=${invoiceId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setSelectedInvoice(result.data);
      } else {
        console.error("Gagal mengambil detail invoice:", result.message);
      }
    } catch (err) {
      console.error("Fetch invoice detail error:", err);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("hostingwebid_user");
    localStorage.removeItem("hostingweb_auth");
    router.push("/login");
  }

  function rupiah(value: string | number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateStr;
    }
  }

  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  return (
    <main className="dashboard-page my-invoices-page">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          className="dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu"
        />
      )}

      {/* SIDEBAR */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="dashboard-sidebar-top">
          <Link href="/" className="dashboard-brand" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.png" alt="HostingWeb" />
          </Link>
          <button
            className="dashboard-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            ×
          </button>
        </div>

        <nav className="dashboard-nav">
          <div className="dashboard-nav-label">UTAMA</div>
          <Link href="/dashboard" className="dashboard-nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="dashboard-nav-icon">⌂</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/hosting" className="dashboard-nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="dashboard-nav-icon">◫</span>
            <span>Hosting Saya</span>
          </Link>
          <Link href="/dashboard/domain" className="dashboard-nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="dashboard-nav-icon">◉</span>
            <span>Domain Saya</span>
          </Link>

          <div className="dashboard-nav-label">TRANSAKSI</div>
          <Link href="/dashboard/orders" className="dashboard-nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="dashboard-nav-icon">🛒</span>
            <span>Pesanan</span>
          </Link>
          <Link href="/dashboard/invoices" className="dashboard-nav-item active" onClick={() => setSidebarOpen(false)}>
            <span className="dashboard-nav-icon">▤</span>
            <span>Invoice</span>
          </Link>

          <div className="dashboard-nav-label">AKUN</div>
          <Link href="/dashboard/profile" className="dashboard-nav-item" onClick={() => setSidebarOpen(false)}>
            <span className="dashboard-nav-icon">◯</span>
            <span>Profil Saya</span>
          </Link>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-sidebar-support">
            <div className="support-icon">?</div>
            <div>
              <strong>Butuh bantuan?</strong>
              <span>Hubungi support kami.</span>
            </div>
          </div>

          <button className="dashboard-logout" onClick={handleLogout}>
            <span>↪</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="dashboard-main">
        {/* TOPBAR */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button className="dashboard-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
              ☰
            </button>
            <div>
              <span className="dashboard-page-label">TRANSAKSI</span>
              <h1>Daftar Invoice</h1>
            </div>
          </div>

          <div className="dashboard-topbar-right">
            {/* PROFILE DROPDOWN */}
            <div className="dashboard-header-dropdown" ref={profileRef}>
              <button className="dashboard-profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="dashboard-avatar">{userName.charAt(0).toUpperCase()}</div>
                <div className="dashboard-user-info">
                  <strong>Hello, {userName}!</strong>
                  <span>{userEmail}</span>
                </div>
                <span className="profile-chevron">▼</span>
              </button>

              {profileOpen && (
                <div className="dashboard-dropdown profile-dropdown">
                  <div className="profile-dropdown-user">
                    <div className="profile-large-avatar">{userName.charAt(0).toUpperCase()}</div>
                    <div>
                      <strong>{userName}</strong>
                      <span>{userEmail}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)}>
                    <span>◯</span> Edit Account Details
                  </Link>
                  <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)}>
                    <span>🔑</span> Change Password
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-logout" onClick={handleLogout}>
                    <span>↪</span> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT PANELS */}
        <div className="dashboard-content">
          {error && <div className="error-alert">{error}</div>}

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Memuat data invoice...</p>
            </div>
          ) : (
            <div className="invoices-layout">
              {/* LEFT: INVOICES LIST */}
              <div className="invoices-list-section">
                <h2>Semua Invoice ({invoices.length})</h2>
                {invoices.length === 0 ? (
                  <div className="invoices-empty">
                    <span className="empty-icon">▤</span>
                    <h3>Belum ada invoice</h3>
                    <p>Anda belum melakukan pemesanan hosting atau domain.</p>
                  </div>
                ) : (
                  <div className="invoices-scroll-list">
                    {invoices.map((inv) => {
                      const isSelected = selectedInvoice?.id === inv.id;
                      const isPaid = inv.status.toLowerCase() === "paid" || inv.status.toLowerCase() === "lunas";
                      return (
                        <button
                          key={inv.id}
                          className={`invoice-list-card ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            router.push(`/dashboard/invoices?id=${inv.id}`);
                          }}
                        >
                          <div className="card-top">
                            <strong>{inv.invoice_number}</strong>
                            <span className={`status-badge ${isPaid ? "paid" : "unpaid"}`}>
                              {isPaid ? "Lunas" : "Belum Bayar"}
                            </span>
                          </div>
                          <div className="card-middle">
                            <span>Dibuat: {formatDate(inv.created_at).split(" pukul")[0]}</span>
                            <strong>{rupiah(inv.total)}</strong>
                          </div>
                          <div className="card-bottom">
                            <span>Jatuh Tempo: {formatDate(inv.due_date).split(" pukul")[0]}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: INVOICE DETAIL VIEW */}
              <div className="invoice-detail-section">
                {detailLoading ? (
                  <div className="detail-loading">
                    <div className="spinner" />
                    <p>Memuat detail invoice...</p>
                  </div>
                ) : selectedInvoice ? (
                  <div className="invoice-detail-card">
                    {/* Header Detail */}
                    <div className="detail-header">
                      <div>
                        <span className="detail-subtitle">INVOICE DETAIL</span>
                        <h2>{selectedInvoice.invoice_number}</h2>
                        <span className="order-number-tag">Order: #{selectedInvoice.order_number}</span>
                      </div>
                      <div className="status-container">
                        <span
                          className={`status-pill ${
                            selectedInvoice.status.toLowerCase() === "paid" ||
                            selectedInvoice.status.toLowerCase() === "lunas"
                              ? "paid"
                              : "unpaid"
                          }`}
                        >
                          {selectedInvoice.status.toLowerCase() === "paid" ||
                          selectedInvoice.status.toLowerCase() === "lunas"
                            ? "Lunas"
                            : "Belum Dibayar"}
                        </span>
                      </div>
                    </div>

                    <div className="divider" />

                    {/* Meta Informasi */}
                    <div className="meta-grid">
                      <div>
                        <span>Tanggal Invoice</span>
                        <strong>{formatDate(selectedInvoice.created_at)}</strong>
                      </div>
                      <div>
                        <span>Batas Waktu (Jatuh Tempo)</span>
                        <strong className="due-date-highlight">
                          {formatDate(selectedInvoice.due_date)}
                        </strong>
                      </div>
                    </div>

                    {/* Daftar Layanan / Items */}
                    <div className="items-section">
                      <h3>Item Layanan</h3>
                      <div className="items-table">
                        <div className="table-header">
                          <span>Deskripsi</span>
                          <span className="text-right">Harga</span>
                        </div>
                        <div className="table-body">
                          {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                            selectedInvoice.items.map((item) => (
                              <div key={item.id} className="table-row">
                                <div>
                                  <span className="item-name">{item.domain_name}</span>
                                  <span className="item-sub">Registrasi Domain</span>
                                </div>
                                <strong className="text-right">{rupiah(item.price)}</strong>
                              </div>
                            ))
                          ) : (
                            <div className="table-row">
                              <span className="item-name">Registrasi Layanan Hosting / Domain</span>
                              <strong className="text-right">
                                {rupiah(Number(selectedInvoice.subtotal))}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ringkasan Biaya */}
                    <div className="payment-summary">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>{rupiah(selectedInvoice.subtotal)}</span>
                      </div>
                      <div className="summary-row">
                        <span>PPN (11%)</span>
                        <span>{rupiah(selectedInvoice.ppn)}</span>
                      </div>
                      {Number(selectedInvoice.discount) > 0 && (
                        <div className="summary-row discount">
                          <span>Diskon</span>
                          <span>-{rupiah(selectedInvoice.discount)}</span>
                        </div>
                      )}
                      <div className="summary-row total">
                        <span>Total Pembayaran</span>
                        <strong>{rupiah(selectedInvoice.total)}</strong>
                      </div>
                    </div>

                    {/* Panduan Pembayaran jika Belum Lunas */}
                    {(selectedInvoice.status.toLowerCase() === "unpaid" ||
                      selectedInvoice.status.toLowerCase() === "belum bayar") && (
                      <div className="payment-instructions">
                        <h3>Panduan Transfer Pembayaran</h3>
                        <p>
                          Silakan melakukan transfer pembayaran ke salah satu rekening resmi di bawah ini sebesar{" "}
                          <strong>{rupiah(selectedInvoice.total)}</strong> sebelum batas waktu jatuh tempo.
                        </p>

                        <div className="bank-list">
                          <div className="bank-card">
                            <div className="bank-header">
                              <span className="bank-name">Bank BCA</span>
                            </div>
                            <div className="bank-details">
                              <span>Nomor Rekening:</span>
                              <strong>123-456-7890</strong>
                              <span>A/N: <strong>HostingWeb Indonesia</strong></span>
                            </div>
                          </div>

                          <div className="bank-card">
                            <div className="bank-header">
                              <span className="bank-name">Bank Mandiri</span>
                            </div>
                            <div className="bank-details">
                              <span>Nomor Rekening:</span>
                              <strong>987-654-3210</strong>
                              <span>A/N: <strong>HostingWeb Indonesia</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="action-buttons">
                          <a
                            href={`https://wa.me/6281234567890?text=Halo%20HostingWeb%2C%20saya%20ingin%20mengkonfirmasi%20pembayaran%20untuk%20invoice%20*${
                              selectedInvoice.invoice_number
                            }*%20dengan%20total%20transfer%20sebesar%20*${rupiah(
                              selectedInvoice.total
                            )}*.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp"
                          >
                            <span>💬</span> Konfirmasi via WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="invoice-detail-empty">
                    <span className="detail-empty-icon">▤</span>
                    <h3>Pilih Invoice</h3>
                    <p>Silakan pilih invoice dari daftar di sebelah kiri untuk melihat detail pembayaran.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* CSS Tambahan khusus untuk Halaman Invoices */
        .my-invoices-page {
          background: #fcfcfd;
        }
        
        .invoices-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          min-height: calc(100vh - 120px);
          align-items: start;
        }

        .invoices-list-section {
          background: white;
          border: 1px solid #eef0f3;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .invoices-list-section h2 {
          font-size: 14px;
          font-weight: 700;
          color: #1a1e29;
          margin-bottom: 16px;
        }

        .invoices-scroll-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 700px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .invoice-list-card {
          width: 100%;
          text-align: left;
          background: #fafbfc;
          border: 1px solid #eef0f3;
          border-radius: 10px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .invoice-list-card:hover {
          background: #f1f4f8;
          border-color: #d1d8e2;
        }

        .invoice-list-card.selected {
          background: #fff8f5;
          border-color: var(--orange);
          box-shadow: 0 2px 8px rgba(247, 147, 30, 0.1);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-top strong {
          font-size: 11px;
          color: #1a1e29;
        }

        .card-middle {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .card-middle span {
          font-size: 10px;
          color: #7d8590;
        }

        .card-middle strong {
          font-size: 12px;
          color: var(--navy);
        }

        .card-bottom {
          font-size: 9px;
          color: #9aa2ac;
        }

        .status-badge {
          font-size: 8px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }

        .status-badge.paid {
          background: #ecfdf5;
          color: #047857;
        }

        .status-badge.unpaid {
          background: #fffbeb;
          color: #b45309;
        }

        /* Detail Section */
        .invoice-detail-section {
          min-height: 400px;
        }

        .invoice-detail-card {
          background: white;
          border: 1px solid #eef0f3;
          border-radius: 14px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .detail-subtitle {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--orange);
        }

        .detail-header h2 {
          font-size: 20px;
          font-weight: 800;
          color: var(--navy);
          margin: 4px 0;
        }

        .order-number-tag {
          font-size: 11px;
          color: #7d8590;
        }

        .status-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 8px;
        }

        .status-pill.paid {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #d1fae5;
        }

        .status-pill.unpaid {
          background: #fff5f5;
          color: #e53e3e;
          border: 1px solid #fed7d7;
        }

        .divider {
          height: 1px;
          background: #eef0f3;
          margin: 24px 0;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          background: #fafbfc;
          border: 1px solid #eef0f3;
          border-radius: 10px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .meta-grid span {
          display: block;
          font-size: 10px;
          color: #7d8590;
          margin-bottom: 4px;
        }

        .meta-grid strong {
          font-size: 12px;
          color: #1a1e29;
        }

        .due-date-highlight {
          color: #e53e3e !important;
        }

        .items-section h3 {
          font-size: 13px;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 12px;
        }

        .items-table {
          border: 1px solid #eef0f3;
          border-radius: 10px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 120px;
          background: #fafbfc;
          padding: 12px 18px;
          font-size: 10px;
          font-weight: 800;
          color: #7d8590;
          border-bottom: 1px solid #eef0f3;
        }

        .table-body {
          padding: 6px 0;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 120px;
          padding: 12px 18px;
          font-size: 11px;
          border-bottom: 1px solid #fafbfc;
          align-items: center;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .item-name {
          display: block;
          font-weight: 700;
          color: #1a1e29;
        }

        .item-sub {
          font-size: 9px;
          color: #9aa2ac;
        }

        .text-right {
          text-align: right;
        }

        .payment-summary {
          background: #fafbfc;
          border: 1px solid #eef0f3;
          border-radius: 10px;
          padding: 16px 20px;
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #4a5568;
        }

        .summary-row.discount {
          color: #e53e3e;
        }

        .summary-row.total {
          border-top: 1px solid #eef0f3;
          padding-top: 10px;
          margin-top: 4px;
          font-size: 13px;
          color: var(--navy);
        }

        .summary-row.total strong {
          font-size: 16px;
          color: var(--orange);
        }

        /* Instructions */
        .payment-instructions {
          margin-top: 30px;
          background: #fff8f5;
          border: 1px solid #ffe3d5;
          border-radius: 12px;
          padding: 20px 24px;
        }

        .payment-instructions h3 {
          font-size: 13px;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 8px;
        }

        .payment-instructions p {
          font-size: 11px;
          line-height: 1.6;
          color: #4a5568;
          margin-bottom: 16px;
        }

        .bank-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .bank-card {
          background: white;
          border: 1px solid #ffd0b8;
          border-radius: 8px;
          padding: 14px;
          box-shadow: 0 2px 6px rgba(247, 147, 30, 0.03);
        }

        .bank-name {
          font-size: 11px;
          font-weight: 800;
          color: var(--navy);
          display: block;
          margin-bottom: 6px;
        }

        .bank-details {
          display: flex;
          flex-direction: column;
          gap: 3px;
          font-size: 10px;
          color: #7d8590;
        }

        .bank-details strong {
          font-size: 12px;
          color: #1a1e29;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          margin-top: 10px;
        }

        .btn-whatsapp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #25d366;
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 10px 24px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s ease;
          box-shadow: 0 4px 10px rgba(37, 211, 102, 0.2);
        }

        .btn-whatsapp:hover {
          background: #1ebd59;
        }

        /* Empty / Loading States */
        .invoice-detail-empty, .invoices-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 1px solid #eef0f3;
          border-radius: 14px;
          height: 100%;
        }

        .detail-empty-icon, .empty-icon {
          font-size: 40px;
          color: #cbd5e1;
          margin-bottom: 16px;
        }

        .invoice-detail-empty h3, .invoices-empty h3 {
          font-size: 14px;
          font-weight: 700;
          color: #1a1e29;
          margin-bottom: 6px;
        }

        .invoice-detail-empty p, .invoices-empty p {
          font-size: 11px;
          color: #7d8590;
          max-width: 280px;
        }

        .loading-state, .detail-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f1f5f9;
          border-top-color: var(--orange);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        .error-alert {
          background: #fff5f5;
          color: #e53e3e;
          border: 1px solid #fed7d7;
          border-radius: 8px;
          padding: 12px 18px;
          font-size: 11px;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 991px) {
          .invoices-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={
      <main className="dashboard-page" style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#fcfcfd" }}>
        <div className="loading-state" style={{ textAlign: "center" }}>
          <div className="spinner" style={{ width: "32px", height: "32px", border: "3px solid #f1f5f9", borderTopColor: "#f7931e", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "12px" }} />
          <p style={{ fontSize: "11px", color: "#666" }}>Memuat halaman invoice...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    }>
      <InvoicesContent />
    </Suspense>
  );
}
