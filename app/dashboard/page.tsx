"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type User = {
  name: string;
  email: string;
  password?: string;
};

const hostingServices = [
  {
    domain: "bisniskamu.com",
    package: "Paket Bisnis Pro",
    storage: "10 GB",
    status: "Aktif",
    expiry: "17 Agustus 2027",
  },
];

const domains = [
  {
    domain: "bisniskamu.com",
    status: "Aktif",
    expiry: "17 Agustus 2027",
  },
];

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

const invoices = [
  {
    id: "#INV-20260817-001",
    description: "Paket Bisnis Pro",
    date: "17 Agustus 2026",
    amount: "Rp 1.500.000",
    status: "Lunas",
  },
];

const notifications = [
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
      setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("hostingwebid_user");
      localStorage.removeItem("hostingweb_auth");

      window.location.href =
        "/login?redirect=/dashboard";

      return;
    }

    setLoading(false);
  }, []);

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

                    {notifications.map(
                      (notification) => (
                        <div
                          className={`notification-item ${
                            notification.unread
                              ? "unread"
                              : ""
                          }`}
                          key={notification.id}
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

                        </div>
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
                        key={service.domain}
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
                        key={domain.domain}
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

            {invoices.map((invoice) => (
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
                      {invoice.id}
                    </strong>

                    <span>
                      {invoice.description}
                    </span>
                  </div>

                </div>

                <div className="invoice-middle">

                  <span>
                    {invoice.date}
                  </span>

                  <strong>
                    {invoice.amount}
                  </strong>

                </div>

                <div className="invoice-right">

                  <span className="invoice-status">
                    ✓ {invoice.status}
                  </span>

                  <button>
                    Lihat
                  </button>

                </div>

              </div>
            ))}

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