"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type User = {
  name: string;
  email: string;
  password?: string;
};

type UserService = {
  id: number;
  domain_name: string;
  service_category: string;
  billing_period: string;
  service_status: string;
  start_date: string | null;
  expiry_date: string | null;
  order_number: string;
};

type InvoiceSummary = {
  id: number;
  invoice_number: string;
  total: string | number;
  status: string;
  created_at: string;
  due_date?: string;
};

const orders = [
  {
    id: "#ORD-20260817-001",
    package: "Paket Bisnis Pro",
    date: "17 Agustus 2026",
    amount: "Rp 1.500.000",
    status: "Berhasil",
  },
  {
    id: "#ORD-20260810-002",
    package: "Paket Starter Website",
    date: "10 Agustus 2026",
    amount: "Rp 750.000",
    status: "Berhasil",
  },
];

// Invoices state will be defined inside the component instead of globally

type DashboardNotification = {
  id: number | string;
  icon: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  href?: string;
};

const notifications: DashboardNotification[] = [
  {
    id: 1,
    icon: "🔔",
    title: "Selamat datang di HostingWeb",
    description: "Akun Anda berhasil login.",
    time: "Baru saja",
    unread: true,
  },
  {
    id: 2,
    icon: "📄",
    title: "Invoice terbaru",
    description: "#INV-20260817-001 telah tersedia.",
    time: "17 Agustus 2026",
    unread: true,
  },
  {
    id: 3,
    icon: "✓",
    title: "Pembayaran berhasil",
    description: "Pembayaran Paket Bisnis Pro berhasil.",
    time: "17 Agustus 2026",
    unread: false,
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [userServices, setUserServices] = useState<UserService[]>([]);
  const [currentTime] = useState(() => Date.now());

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [notificationCount, setNotificationCount] = useState(
    notifications.filter((item) => item.unread).length
  );

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("hostingwebid_user");

    if (!savedUser) {
      window.location.href = "/login?redirect=/dashboard";
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setTimeout(() => setUser(parsedUser), 0);
    } catch {
      localStorage.removeItem("hostingwebid_user");
      localStorage.removeItem("hostingweb_auth");

      window.location.href =
        "/login?redirect=/dashboard";

      return;
    }
  }, []);

  async function fetchInvoices() {
    try {
      const response = await fetch(
        "http://localhost/hosting_webid/api/v1/invoice/index.php",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok && result.status === "success") {
        const loadedInvoices: InvoiceSummary[] = result.data || [];
        setInvoices(loadedInvoices);
        setNotificationCount(
          notifications.filter((item) => item.unread).length +
            loadedInvoices.filter(
              (invoice) => invoice.status.toLowerCase() === "paid"
            ).length
        );
      }
    } catch (error) {
      console.error("Gagal mengambil data invoice:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserServices() {
    try {
      const response = await fetch(
        "http://localhost/hosting_webid/api/v1/service/index.php",
        { method: "GET", credentials: "include" }
      );
      const result = await response.json();
      if (response.ok && result.status === "success") {
        setUserServices(result.data || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data service:", error);
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) return;
    setTimeout(() => {
      void fetchInvoices();
      void fetchUserServices();
    }, 0);
  }, []);

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
      }).format(date);
    } catch {
      return dateStr;
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }

      if (
        cartRef.current &&
        !cartRef.current.contains(target)
      ) {
        setCartOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const closeAllDropdowns = () => {
    setNotificationOpen(false);
    setProfileOpen(false);
    setCartOpen(false);
  };

  const handleNotificationToggle = () => {
    setNotificationOpen((value) => !value);
    setProfileOpen(false);
    setCartOpen(false);
  };

  const handleProfileToggle = () => {
    setProfileOpen((value) => !value);
    setNotificationOpen(false);
    setCartOpen(false);
  };

  const handleCartToggle = () => {
    setCartOpen((value) => !value);
    setNotificationOpen(false);
    setProfileOpen(false);
  };

  const handleReadNotifications = () => {
    setNotificationCount(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("hostingwebid_user");
    localStorage.removeItem("hostingweb_auth");

    window.location.href = "/";
  };

  if (loading) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-loading-box">
          <div className="dashboard-spinner" />
          <p>Memuat dashboard...</p>
        </div>
      </main>
    );
  }

  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  function remainingDays(expiryDate: string | null) {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate.replace(" ", "T")).getTime();
    if (Number.isNaN(expiry)) return null;
    return Math.ceil((expiry - currentTime) / 86400000);
  }

  function serviceStatus(status: string) {
    if (status.toLowerCase() === "active") return "Aktif";
    if (status.toLowerCase() === "expired") return "Expired";
    return "Menunggu";
  }

  const hostingServices = userServices
    .filter((service) => service.service_category === "website")
    .map((service) => ({
      id: service.id,
      domain: service.domain_name,
      package: "Layanan Website",
      storage: service.billing_period,
      status: serviceStatus(service.service_status),
      expiry: service.expiry_date ? formatDate(service.expiry_date) : "Belum aktif",
    }));

  const domains = userServices.map((service) => ({
    id: service.id,
    domain: service.domain_name,
    status: serviceStatus(service.service_status),
    expiry: service.expiry_date ? formatDate(service.expiry_date) : "Belum aktif",
  }));

  const expiringServices = userServices.filter((service) => {
    const days = remainingDays(service.expiry_date);
    return service.service_status.toLowerCase() === "active" && days !== null && days <= 7;
  });

  const dashboardNotifications: DashboardNotification[] = [
    ...notifications,
    ...invoices
      .filter((invoice) => invoice.status.toLowerCase() === "paid")
      .slice(0, 5)
      .map((invoice) => ({
        id: `invoice-${invoice.id}`,
        icon: "▤",
        title: "Invoice pembayaran tersedia",
        description: `${invoice.invoice_number} telah dibuat dan berstatus lunas.`,
        time: formatDate(invoice.created_at),
        unread: true,
        href: `/dashboard/invoices?id=${invoice.id}`,
      })),
  ];

  return (
    <main className="dashboard-page">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          className="dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="dashboard-sidebar-top">

          <Link
            href="/"
            className="dashboard-brand"
            onClick={() => setSidebarOpen(false)}
          >
            <img
              src="/logo.png"
              alt="HostingWeb"
            />
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

          <div className="dashboard-nav-label">
            UTAMA
          </div>

          <Link
            href="/dashboard"
            className="dashboard-nav-item active"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="dashboard-nav-icon">
              ⌂
            </span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/hosting"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="dashboard-nav-icon">
              ◫
            </span>
            <span>Hosting Saya</span>
          </Link>

          <Link
            href="/dashboard/domain"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="dashboard-nav-icon">
              ◉
            </span>
            <span>Domain Saya</span>
          </Link>

          <div className="dashboard-nav-label">
            TRANSAKSI
          </div>

          <Link
            href="/dashboard/orders"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="dashboard-nav-icon">
              🛒
            </span>
            <span>Pesanan</span>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="dashboard-nav-icon">
              ▤
            </span>
            <span>Invoice</span>
          </Link>

          <div className="dashboard-nav-label">
            AKUN
          </div>

          <Link
            href="/dashboard/profile"
            className="dashboard-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="dashboard-nav-icon">
              ◯
            </span>
            <span>Profil Saya</span>
          </Link>

        </nav>

        <div className="dashboard-sidebar-bottom">

          <div className="dashboard-sidebar-support">
            <div className="support-icon">
              ?
            </div>

            <div>
              <strong>
                Butuh bantuan?
              </strong>

              <span>
                Hubungi support kami.
              </span>
            </div>
          </div>

          <button
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Keluar
          </button>

        </div>
      </aside>

      {/* MAIN */}

      <div className="dashboard-main">

        {/* TOPBAR */}

        <header className="dashboard-topbar">

          <div className="dashboard-topbar-left">

            <button
              className="dashboard-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              ☰
            </button>

            <div>
              <span className="dashboard-page-label">
                DASHBOARD
              </span>

              <h1>
                Overview
              </h1>
            </div>

          </div>

          <div className="dashboard-topbar-right">

            {/* NOTIFICATION */}

            <div
              className="dashboard-header-dropdown"
              ref={notificationRef}
            >

              <button
                className="dashboard-notification"
                onClick={handleNotificationToggle}
                aria-label="Notifikasi"
                aria-expanded={notificationOpen}
              >
                🔔

                {notificationCount > 0 && (
                  <span className="notification-badge">
                    {notificationCount > 9
                      ? "9+"
                      : notificationCount}
                  </span>
                )}

              </button>

              {notificationOpen && (
                <div className="dashboard-dropdown notification-dropdown">

                  <div className="dropdown-header">

                    <div>
                      <strong>
                        Notifikasi
                      </strong>

                      <span>
                        {notificationCount} belum dibaca
                      </span>
                    </div>

                    {notificationCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          handleReadNotifications
                        }
                      >
                        Tandai dibaca
                      </button>
                    )}

                  </div>

                  <div className="notification-list">

                    {dashboardNotifications.map(
                      (notification) => (
                        <Link
                          className={`notification-item ${
                            notification.unread
                              ? "unread"
                              : ""
                          }`}
                          key={notification.id}
                          href={notification.href || "/dashboard"}
                          onClick={closeAllDropdowns}
                        >

                          <div className="notification-icon">
                            {notification.icon}
                          </div>

                          <div className="notification-content">

                            <strong>
                              {notification.title}
                            </strong>

                            <p>
                              {
                                notification.description
                              }
                            </p>

                            <small>
                              {notification.time}
                            </small>

                          </div>

                        </Link>
                      )
                    )}

                  </div>

                  <Link
                    href="/dashboard"
                    className="dropdown-footer-link"
                    onClick={
                      closeAllDropdowns
                    }
                  >
                    Lihat semua notifikasi →
                  </Link>

                </div>
              )}

            </div>

            {/* PROFILE */}

            <div
              className="dashboard-header-dropdown"
              ref={profileRef}
            >

              <button
                className="dashboard-profile-trigger"
                onClick={handleProfileToggle}
                aria-expanded={profileOpen}
              >

                <div className="dashboard-avatar">
                  {userName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="dashboard-user-info">
                  <strong>
                    Hello, {userName}!
                  </strong>

                  <span>
                    {userEmail}
                  </span>
                </div>

                <span className="profile-chevron">
                  ▼
                </span>

              </button>

              {profileOpen && (
                <div className="dashboard-dropdown profile-dropdown">

                  <div className="profile-dropdown-user">

                    <div className="profile-large-avatar">
                      {userName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {userName}
                      </strong>

                      <span>
                        {userEmail}
                      </span>
                    </div>

                  </div>

                  <div className="dropdown-divider" />

                  <Link
                    href="/dashboard/profile"
                    onClick={
                      closeAllDropdowns
                    }
                  >
                    <span>◯</span>
                    Edit Account Details
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={
                      closeAllDropdowns
                    }
                  >
                    <span>♙</span>
                    Contacts / Sub-Accounts
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={
                      closeAllDropdowns
                    }
                  >
                    <span>🔑</span>
                    Change Password
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={
                      closeAllDropdowns
                    }
                  >
                    <span>🛡</span>
                    Security Settings
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={
                      closeAllDropdowns
                    }
                  >
                    <span>✉</span>
                    Email History
                  </Link>

                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-logout"
                    onClick={handleLogout}
                  >
                    <span>↪</span>
                    Logout
                  </button>

                </div>
              )}

            </div>

            {/* CART */}

            <div
              className="dashboard-header-dropdown"
              ref={cartRef}
            >

              <button
                className="dashboard-cart"
                onClick={handleCartToggle}
                aria-label="Keranjang"
                aria-expanded={cartOpen}
              >
                🛒

                <span className="cart-badge">
                  0
                </span>
              </button>

              {cartOpen && (
                <div className="dashboard-dropdown cart-dropdown">

                  <div className="dropdown-header">
                    <div>
                      <strong>
                        Keranjang
                      </strong>

                      <span>
                        0 produk
                      </span>
                    </div>
                  </div>

                  <div className="cart-empty">

                    <div className="cart-empty-icon">
                      🛒
                    </div>

                    <strong>
                      Keranjang masih kosong
                    </strong>

                    <p>
                      Belum ada produk atau layanan
                      yang ditambahkan.
                    </p>

                  </div>

                  <Link
                    href="/cart"
                    className="cart-button"
                    onClick={
                      closeAllDropdowns
                    }
                  >
                    Lihat Keranjang
                  </Link>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="dashboard-content">

          {expiringServices.length > 0 && (
            <div className="service-expiry-warning">
              <strong>Perhatian: layanan segera berakhir</strong>
              <span>
                {expiringServices.map((service) => `${service.domain_name} (${remainingDays(service.expiry_date)} hari)`).join(", ")}
              </span>
            </div>
          )}

          {/* WELCOME */}

          <section className="dashboard-welcome-card">

            <div className="dashboard-welcome-content">

              <span>
                SELAMAT DATANG 👋
              </span>

              <h2>
                Halo, {userName}!
              </h2>

              <p>
                Kelola hosting, domain, pesanan,
                dan layanan website kamu dari
                satu tempat.
              </p>

            </div>

            <div className="dashboard-welcome-decoration">
              <div />
              <div />
              <div />
            </div>

          </section>

          {/* STATISTICS */}

          <section className="dashboard-stats">

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon hosting">
                ◫
              </div>

              <div className="dashboard-stat-content">
                <span>Hosting Aktif</span>

                <strong>
                  {hostingServices.length}
                </strong>
              </div>

              <Link href="/dashboard/hosting">
                Lihat →
              </Link>

            </div>

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon domain">
                ◉
              </div>

              <div className="dashboard-stat-content">
                <span>Domain Aktif</span>

                <strong>
                  {domains.length}
                </strong>
              </div>

              <Link href="/dashboard/domain">
                Lihat →
              </Link>

            </div>

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon order">
                🛒
              </div>

              <div className="dashboard-stat-content">
                <span>Total Pesanan</span>

                <strong>
                  {orders.length}
                </strong>
              </div>

              <Link href="/dashboard/orders">
                Lihat →
              </Link>

            </div>

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon invoice">
                ▤
              </div>

              <div className="dashboard-stat-content">
                <span>Invoice</span>

                <strong>
                  {invoices.length}
                </strong>
              </div>

              <Link href="/dashboard/invoices">
                Lihat →
              </Link>

            </div>

          </section>

          {/* QUICK ACTION */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>
                <span>
                  QUICK ACTION
                </span>

                <h2>
                  Apa yang ingin kamu lakukan?
                </h2>
              </div>

            </div>

            <div className="dashboard-actions">

              <Link
                href="/#pricing"
                className="dashboard-action-card"
              >
                <div className="dashboard-action-icon">
                  +
                </div>

                <div>
                  <strong>
                    Beli Hosting
                  </strong>

                  <span>
                    Pilih paket hosting baru
                  </span>
                </div>

                <b>→</b>
              </Link>

              <Link
                href="/dashboard/domain"
                className="dashboard-action-card"
              >
                <div className="dashboard-action-icon">
                  ◉
                </div>

                <div>
                  <strong>
                    Kelola Domain
                  </strong>

                  <span>
                    Lihat domain kamu
                  </span>
                </div>

                <b>→</b>
              </Link>

              <Link
                href="/dashboard/profile"
                className="dashboard-action-card"
              >
                <div className="dashboard-action-icon">
                  ◯
                </div>

                <div>
                  <strong>
                    Profil Saya
                  </strong>

                  <span>
                    Kelola informasi akun
                  </span>
                </div>

                <b>→</b>
              </Link>

            </div>

          </section>

          {/* HOSTING + DOMAIN */}

          <section className="dashboard-two-column">

            <div className="dashboard-panel">

              <div className="dashboard-panel-heading">

                <div>
                  <span>
                    HOSTING SAYA
                  </span>

                  <h2>
                    Layanan aktif
                  </h2>
                </div>

                <Link href="/dashboard/hosting">
                  Lihat semua →
                </Link>

              </div>

              {hostingServices.length > 0 ? (
                <div className="service-list">

                  {hostingServices.map(
                    (service) => (
                      <div
                        className="service-item"
                        key={service.id}
                      >

                        <div className="service-icon hosting-service">
                          ◫
                        </div>

                        <div className="service-info">

                          <strong>
                            {service.domain}
                          </strong>

                          <span>
                            {service.package}
                          </span>

                          <small>
                            {service.storage}
                          </small>

                        </div>

                        <div className="service-status">
                          <span>●</span>
                          {service.status}
                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="dashboard-empty">

                  <div>◫</div>

                  <h3>
                    Belum ada hosting
                  </h3>

                  <p>
                    Kamu belum memiliki layanan
                    hosting.
                  </p>

                  <Link href="/#pricing">
                    Pilih Paket Hosting
                  </Link>

                </div>
              )}

            </div>

            <div className="dashboard-panel">

              <div className="dashboard-panel-heading">

                <div>
                  <span>
                    DOMAIN SAYA
                  </span>

                  <h2>
                    Domain aktif
                  </h2>
                </div>

                <Link href="/dashboard/domain">
                  Lihat semua →
                </Link>

              </div>

              {domains.length > 0 ? (
                <div className="service-list">

                  {domains.map(
                    (domain) => (
                      <div
                        className="service-item"
                        key={domain.id}
                      >

                        <div className="service-icon domain-service">
                          ◉
                        </div>

                        <div className="service-info">

                          <strong>
                            {domain.domain}
                          </strong>

                          <span>
                            Domain .com
                          </span>

                          <small>
                            Berakhir{" "}
                            {domain.expiry}
                          </small>

                        </div>

                        <div className="service-status">
                          <span>●</span>
                          {domain.status}
                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="dashboard-empty">

                  <div>◉</div>

                  <h3>
                    Belum ada domain
                  </h3>

                  <p>
                    Kamu belum memiliki domain.
                  </p>

                  <Link href="/#pricing">
                    Cari Domain
                  </Link>

                </div>
              )}

            </div>

          </section>

          {/* RECENT ORDERS */}

          <section className="dashboard-panel dashboard-orders-panel">

            <div className="dashboard-panel-heading">

              <div>
                <span>
                  TRANSAKSI
                </span>

                <h2>
                  Pesanan terbaru
                </h2>
              </div>

              <Link href="/dashboard/orders">
                Lihat semua →
              </Link>

            </div>

            <div className="dashboard-table-wrapper">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>ORDER</th>
                    <th>PAKET</th>
                    <th>TANGGAL</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {orders.map((order) => (
                    <tr key={order.id}>

                      <td>
                        <strong>
                          {order.id}
                        </strong>
                      </td>

                      <td>
                        {order.package}
                      </td>

                      <td>
                        {order.date}
                      </td>

                      <td>
                        <strong>
                          {order.amount}
                        </strong>
                      </td>

                      <td>
                        <span className="order-status success">
                          ● {order.status}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>

          {/* INVOICE */}

          <section className="dashboard-panel dashboard-invoice-panel">

            <div className="dashboard-panel-heading">

              <div>
                <span>
                  PEMBAYARAN
                </span>

                <h2>
                  Invoice terbaru
                </h2>
              </div>

              <Link href="/dashboard/invoices">
                Lihat semua →
              </Link>

            </div>

            {invoices.length === 0 ? (
              <p style={{ fontSize: "11px", color: "#888", padding: "10px 0" }}>Belum ada invoice baru.</p>
            ) : (
              invoices.slice(0, 5).map((invoice) => {
                const isPaid = invoice.status.toLowerCase() === "paid" || invoice.status.toLowerCase() === "lunas";
                return (
                  <div
                    className="invoice-item"
                    key={invoice.id}
                  >
                    <div className="invoice-left">
                      <div className="invoice-icon">
                        ▤
                      </div>
                      <div>
                        <strong>
                          {invoice.invoice_number}
                        </strong>
                        <span>
                          Registrasi Domain / Hosting
                        </span>
                      </div>
                    </div>

                    <div className="invoice-middle">
                      <span>
                        {formatDate(invoice.created_at)}
                      </span>
                      <strong>
                        {rupiah(invoice.total)}
                      </strong>
                    </div>

                    <div className="invoice-right">
                      <span className={`invoice-status ${isPaid ? "paid" : "unpaid"}`} style={{ color: isPaid ? "#12a34a" : "#b45309" }}>
                        {isPaid ? "✓ Lunas" : "• Belum Bayar"}
                      </span>
                      <Link href={`/dashboard/invoices?id=${invoice.id}`}>
                        <button type="button">
                          Lihat
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}

          </section>

        </div>

      </div>

      {/* MOBILE BOTTOM NAV */}

      <nav className="dashboard-mobile-nav">

        <Link
          href="/dashboard"
          className="mobile-nav-active"
        >
          <span>⌂</span>
          Dashboard
        </Link>

        <Link href="/dashboard/hosting">
          <span>◫</span>
          Hosting
        </Link>

        <Link href="/dashboard/domain">
          <span>◉</span>
          Domain
        </Link>

        <Link href="/dashboard/orders">
          <span>🛒</span>
          Pesanan
        </Link>

        <Link href="/dashboard/profile">
          <span>◯</span>
          Profil
        </Link>

      </nav>

    </main>
  );
}