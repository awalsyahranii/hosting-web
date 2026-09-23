"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id?: number;
  name?: string;
  username?: string;
  email: string;
  role: "user" | "admin";
};

type CheckoutItem = {
  cart_id: number;
  domain_id: number;
  domain_name: string;
  extension: string;
  price: string;
};

type CheckoutData = {
  items: CheckoutItem[];
  subtotal: string;
  ppn: string;
  total: string;
};

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
];

export default function CartPage() {

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // =========================
  // CHECKOUT
  // =========================

  const [checkout, setCheckout] =
    useState<CheckoutData | null>(null);

  const [checkoutLoading, setCheckoutLoading] =
    useState(true);

  const [checkoutError, setCheckoutError] =
    useState("");

  // =========================
  // COUPON
  // =========================

  const [couponOpen, setCouponOpen] =
    useState(false);

  const [couponCode, setCouponCode] =
    useState("");

  const [couponLoading, setCouponLoading] =
    useState(false);

  const [couponError, setCouponError] =
    useState("");

  const [couponSuccess, setCouponSuccess] =
    useState("");

  const [discount, setDiscount] =
    useState(0);

  const [appliedCoupon, setAppliedCoupon] =
    useState("");

  // =========================
  // SIDEBAR / DROPDOWN
  // =========================

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [cartOpen, setCartOpen] =
    useState(false);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  const cartRef =
    useRef<HTMLDivElement>(null);


  /* =======================================================
   CEK AKSES HALAMAN CART
   ADMIN TIDAK BOLEH MENGAKSES CART USER
    ======================================================= */

    useEffect(() => {

      const savedUser =
        localStorage.getItem(
          "hostingwebid_user"
        );


      // =====================================================
      // TIDAK ADA SESSION
      // =====================================================

      if (!savedUser) {

        router.replace("/login");

        return;

      }


      try {

        const parsedUser =
          JSON.parse(savedUser);


        // ===================================================
        // VALIDASI ROLE
        // ===================================================

        if (
          parsedUser?.role !== "user"
        ) {

          // ADMIN TIDAK BOLEH MASUK CART

          router.replace("/admin");

          return;

        }


        // ===================================================
        // USER VALID
        // ===================================================

        setUser(parsedUser);

        setLoading(false);

      } catch (error) {

        console.error(
          "Session user tidak valid:",
          error
        );


        localStorage.removeItem(
          "hostingwebid_user"
        );

        localStorage.removeItem(
          "hostingweb_auth"
        );


        router.replace("/login");

      }

    }, [router]);


  // =========================
  // FETCH CHECKOUT
  // =========================

  useEffect(() => {

    /*
    * Jangan mengambil checkout sebelum
    * user berhasil divalidasi.
    */

    if (
      loading ||
      !user ||
      user.role !== "user"
    ) {

      return;

    }


    async function fetchCheckout() {

      try {

        setCheckoutLoading(true);

        setCheckoutError("");


        const response =
          await fetch(
            "/api/backend/checkout/index.php",
            {
              method: "GET",

              credentials: "include",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );


        let result: any;

        try {

          result =
            await response.json();

        } catch {

          result = null;

        }


        /*
        * Kalau session berubah menjadi admin
        * atau API menolak akses.
        */

        if (
          response.status === 401 ||
          response.status === 403 ||
          (result && result.status !== "success" && result.message?.toLowerCase().includes("login"))
        ) {
          router.replace("/login?redirect=/cart");
          return;
        }


        if (!response.ok) {

          setCheckoutError(
            result?.message ||
            "Gagal mengambil data checkout."
          );

          return;

        }


        setCheckout(
          result?.data ?? null
        );


      } catch (error) {

        console.error(
          "Checkout API error:",
          error
        );


        setCheckoutError(
          "Tidak dapat terhubung ke server."
        );


      } finally {

        setCheckoutLoading(false);

      }

    }


    fetchCheckout();


  }, [
    loading,
    user,
    router
  ]);


  // =========================
  // CLICK OUTSIDE DROPDOWN
  // =========================

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      const target =
        event.target as Node;

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


  // =========================
  // CLOSE DROPDOWNS
  // =========================

  const closeAllDropdowns = () => {

    setNotificationOpen(false);
    setProfileOpen(false);
    setCartOpen(false);

  };


  // =========================
  // LOGOUT
  // =========================
    const handleLogout = async () => {
      try {
        const response = await fetch(
          "/api/backend/auth/logout.php",
          {
            method: "POST",
            credentials: "include",
          }
        );

        const result = await response.json();

        console.log("Logout response:", result);

      } catch (error) {
        console.error("Logout error:", error);

      } finally {

        // Hapus data login frontend
        localStorage.removeItem("hostingwebid_user");
        localStorage.removeItem("hostingweb_auth");

        // Kembali ke halaman login
        window.location.href = "/login";
      }
    };


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <main className="dashboard-loading">

        <div className="dashboard-loading-box">

          <div className="dashboard-spinner" />

          <p>
            Memuat keranjang...
          </p>

        </div>

      </main>
    );

  }


  // =========================
  // USER DATA
  // =========================

  const userName =
    user?.name ||
    user?.username ||
    "User";

  const userEmail =
    user?.email ||
    "";
    
  // =========================
  // FORMAT RUPIAH
  // =========================

  const formatRupiah = (
    value: string | number
  ) => {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }
    ).format(Number(value));

  };


  // =========================
  // PRICE CALCULATION
  // =========================

  const subtotalAmount = checkout
    ? Number(checkout.subtotal)
    : 0;

  const discountAmount =
    Number(discount || 0);

  const afterDiscountAmount =
    Math.max(
      subtotalAmount -
      discountAmount,
      0
    );

  const ppnAmount =
    afterDiscountAmount * 0.11;

  const totalAmount =
    afterDiscountAmount +
    ppnAmount;


  // =========================
  // APPLY COUPON
  // =========================

  const handleApplyCoupon =
    async () => {

      if (!couponCode.trim()) {

        setCouponError(
          "Silakan masukkan kode kupon."
        );

        return;
      }

      if (!checkout) {

        setCouponError(
          "Data checkout belum tersedia."
        );

        return;
      }

      try {

        setCouponLoading(true);

        setCouponError("");
        setCouponSuccess("");

        const response =
          await fetch(
            "/api/backend/coupon/validate.php",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials: "include",

              body: JSON.stringify({
                code:
                  couponCode.trim(),

                subtotal:
                  checkout.subtotal,
              }),
            }
          );

        const result =
          await response.json();

        console.log(
          "Coupon response:",
          result
        );


        // =========================
        // COUPON ERROR
        // =========================

        if (
          !response.ok ||
          result.status !== "success"
        ) {

          setCouponError(
            result.message ||
            "Kode kupon tidak dapat digunakan."
          );

          setDiscount(0);

          setAppliedCoupon("");

          return;
        }


        // =========================
        // COUPON SUCCESS
        // =========================

        const couponData =
          result.data;


        setDiscount(
          Number(
            couponData.discount
          )
        );


        setAppliedCoupon(
          couponData.coupon.code
        );


        setCouponSuccess(
          `Kupon ${couponData.coupon.code} berhasil digunakan.`
        );


      } catch (error) {

        console.error(
          "Coupon API error:",
          error
        );

        setCouponError(
          "Tidak dapat terhubung ke server."
        );

      } finally {

        setCouponLoading(false);

      }

    };


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

      {/* SIDEBAR */}
      <aside
        className={`dash-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="dash-sidebar-header">
          <Link href="/" className="dash-brand-logo" onClick={() => setSidebarOpen(false)}>
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

        <div className="dash-sidebar-body">
          <div className="dash-nav-section">
            <span className="dash-nav-heading">UTAMA</span>
            <Link href="/dashboard" className="dash-nav-link" onClick={() => setSidebarOpen(false)}>
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
            </Link>

            <Link href="/dashboard/hosting" className="dash-nav-link" onClick={() => setSidebarOpen(false)}>
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
            </Link>

            <Link href="/dashboard/domain" className="dash-nav-link" onClick={() => setSidebarOpen(false)}>
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
            </Link>
          </div>

          <div className="dash-nav-section">
            <span className="dash-nav-heading">TRANSAKSI &amp; BILLING</span>
            <Link href="/dashboard/invoices" className="dash-nav-link" onClick={() => setSidebarOpen(false)}>
              <div className="dash-nav-link-left">
                <span className="dash-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </span>
                <span>Tagihan / Invoice</span>
              </div>
            </Link>

            <Link href="/dashboard/orders" className="dash-nav-link" onClick={() => setSidebarOpen(false)}>
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
            </Link>
          </div>

          <div className="dash-nav-section">
            <span className="dash-nav-heading">AKUN &amp; PREFERENSI</span>
            <Link href="/dashboard/profile" className="dash-nav-link" onClick={() => setSidebarOpen(false)}>
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

            <Link href="/dashboard/security" className="dash-nav-link" onClick={() => setSidebarOpen(false)}>
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
                href="https://wa.me/6285333555976"
                target="_blank"
                rel="noopener noreferrer"
                className="dash-help-link"
              >
                Hubungi via WhatsApp →
              </a>
            </div>
          </div>
        </div>

        <div className="dash-sidebar-user">
          <div className="dash-user-profile-left">
            <div className="dash-avatar-square">{userName.charAt(0).toUpperCase()}</div>
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

      {/* MAIN */}

      <div className="dashboard-main">

        {/* TOPBAR */}

        <header className="dashboard-topbar">

          <div className="dashboard-topbar-left">

            <button
              className="dashboard-mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div>
              <span className="dashboard-page-label">
                CART
              </span>

              <h1>
                Keranjang
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
                onClick={() => {
                  setNotificationOpen(
                    (value) => !value
                  );

                  setProfileOpen(false);
                  setCartOpen(false);
                }}
              >
                🔔

                <span className="notification-badge">
                  2
                </span>
              </button>

              {notificationOpen && (
                <div className="dashboard-dropdown notification-dropdown">

                  <div className="dropdown-header">

                    <div>
                      <strong>
                        Notifikasi
                      </strong>

                      <span>
                        2 belum dibaca
                      </span>
                    </div>

                  </div>

                  <div className="notification-list">

                    {notifications.map(
                      (notification) => (
                        <div
                          className="notification-item unread"
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
                onClick={() => {
                  setProfileOpen(
                    (value) => !value
                  );

                  setNotificationOpen(false);
                  setCartOpen(false);
                }}
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
                    onClick={closeAllDropdowns}
                  >
                    <span>◯</span>
                    Edit Account Details
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={closeAllDropdowns}
                  >
                    <span>♙</span>
                    Contacts / Sub-Accounts
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={closeAllDropdowns}
                  >
                    <span>🔑</span>
                    Change Password
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={closeAllDropdowns}
                  >
                    <span>🛡</span>
                    Security Settings
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={closeAllDropdowns}
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
                className="dashboard-cart cart-active"
                onClick={() => {
                  setCartOpen(
                    (value) => !value
                  );

                  setNotificationOpen(false);
                  setProfileOpen(false);
                }}
              >
                🛒

              <span className="cart-badge">
                {checkout?.items?.length || 0}
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
                        {checkout?.items?.length || 0} produk
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
                      Belum ada produk atau
                      layanan yang ditambahkan.
                    </p>

                  </div>

                  <Link
                    href="/cart"
                    className="cart-button"
                    onClick={closeAllDropdowns}
                  >
                    Lihat Keranjang
                  </Link>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* CART CONTENT */}

        <div className="cart-page-content">

          {/* BREADCRUMB */}

          <nav className="cart-breadcrumb">

            <Link href="/dashboard">
              Dashboard
            </Link>

            <span>/</span>

            <Link href="/dashboard">
              Client Area
            </Link>

            <span>/</span>

            <strong>
              Shopping Cart
            </strong>

          </nav>

          {/* CART CARD */}

       <section className="cart-main-card">

        <div className="cart-title">
          REVIEW & CHECKOUT
        </div>

        <div className="cart-title-line" />

        <div className="cart-layout">

          {/* LEFT */}

          <div className="cart-products">

            <div className="cart-product-header">
              <span>
                Product/Options
              </span>

              <span>
                Price/Cycle
              </span>
            </div>

            {/* DATA CHECKOUT */}

            {checkoutLoading && (
              <div className="cart-message">
                Memuat data checkout...
              </div>
            )}

            {!checkoutLoading && checkoutError && (
              <div className="cart-message cart-error">
                {checkoutError}
              </div>
            )}

            {!checkoutLoading &&
              !checkoutError &&
              checkout &&
              checkout.items.length === 0 && (
                <div className="cart-message">
                  Keranjang Anda masih kosong.
                </div>
              )}

            {!checkoutLoading &&
              !checkoutError &&
              checkout &&
              checkout.items.map((item) => (

                <div
                  key={item.cart_id}
                  className="cart-product-row"
                >

                  {/* INFORMASI PRODUK */}

                  <div className="cart-product-info">

                    <div className="cart-product-name">
                      {item.domain_name}
                    </div>

                    <div className="cart-product-extension">
                      Domain {item.extension}
                    </div>

                  </div>

                  {/* HARGA */}

                  <div className="cart-product-price">
                    {formatRupiah(item.price)}
                  </div>

                </div>

              ))}

          </div>


         {/* RIGHT */}

            <aside className="cart-summary">

              <div className="cart-summary-title">
                Order Summary
              </div>

              <div className="cart-summary-body">

                {/* SUBTOTAL */}

                <div className="cart-summary-row">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatRupiah(subtotalAmount)}
                  </strong>

                </div>


                {/* DISKON */}

                {discountAmount > 0 && (

                  <div className="cart-summary-row">

                    <span>
                      Diskon{" "}
                      <small>
                        ({appliedCoupon})
                      </small>
                    </span>

                    <strong className="discount-value">
                      -{formatRupiah(discountAmount)}
                    </strong>

                  </div>

                )}


                {/* PPN */}

                <div className="cart-summary-row">

                  <span>
                    PPN
                  </span>

                  <strong>
                    {formatRupiah(ppnAmount)}
                  </strong>

                </div>


                {/* TOTAL LABEL */}

                <div className="cart-summary-total-label">
                  Totals
                </div>


                {/* TOTAL */}

                <div className="cart-total">

                  <strong>
                    {formatRupiah(totalAmount)}
                  </strong>

                  <span>
                    Total Due Today
                  </span>

                </div>


                <button
                  className="cart-checkout-button"
                  onClick={() => {
                    router.push("/checkout");
                  }}
                  disabled={
                    checkoutLoading ||
                    !checkout ||
                    checkout.items.length === 0
                  }
                >
                  Checkout →
                </button>


                {/* CONTINUE SHOPPING */}

                <Link
                  href="/dashboard"
                  className="continue-shopping"
                >
                  Continue Shopping
                </Link>

              </div>

            </aside>

        </div>

      </section>

        </div>

      </div>

      {/* MOBILE NAV */}

      <nav className="dashboard-mobile-nav">

        <Link href="/dashboard">
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

        <Link
          href="/dashboard/orders"
          className="mobile-nav-active"
        >
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