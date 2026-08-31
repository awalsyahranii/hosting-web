"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
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


  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {

    const savedUser =
      localStorage.getItem("hostingwebid_user");

    if (savedUser) {

      try {

        setUser(JSON.parse(savedUser));

      } catch {

        setUser({
          name: "Demo User",
          email: "demo@hostingweb.id",
        });

      }

    } else {

      // Frontend sementara
      setUser({
        name: "Demo User",
        email: "demo@hostingweb.id",
      });

    }

    setLoading(false);

  }, []);


  // =========================
  // FETCH CHECKOUT
  // =========================

  useEffect(() => {

    async function fetchCheckout() {

      try {

        setCheckoutLoading(true);
        setCheckoutError("");

        const response = await fetch(
          "http://localhost/hosting_webid/api/v1/checkout/index.php",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {

          setCheckoutError(
            result.message ||
            "Gagal mengambil data checkout"
          );

          return;
        }

        setCheckout(result.data);

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

  }, []);


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
          "http://localhost/hosting_webid/api/v1/auth/logout.php",
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
    user?.name || "Demo User";

  const userEmail =
    user?.email || "demo@hostingweb.id";


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
            "http://localhost/hosting_webid/api/v1/coupon/validate.php",
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
            className="dashboard-nav-item"
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

              <div className="cart-bottom-line" />

                <label className="coupon-checkbox">

                  <input
                    type="checkbox"
                    checked={couponOpen}
                    onChange={(e) => {
                      setCouponOpen(e.target.checked);

                      if (!e.target.checked) {
                        setCouponCode("");
                      }
                    }}
                  />

                  <span>
                    Saya punya kode kupon
                  </span>

                </label>

                {couponOpen && (
                  <div className="coupon-form">

                    <label htmlFor="coupon">
                      Kode Kupon
                    </label>

                    <div className="coupon-input-row">

                      <input
                        id="coupon"
                        type="text"
                        placeholder="Masukkan kode kupon"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value)
                        }
                      />

                        <button
                          type="button"
                          className="coupon-button"
                          disabled={
                            !couponCode.trim() ||
                            couponLoading ||
                            !checkout
                          }
                          onClick={handleApplyCoupon}
                        >
                          {couponLoading
                            ? "Memeriksa..."
                            : "Gunakan"}
                        </button>

                    </div>
                    {couponError && (
                        <div className="coupon-error">
                          {couponError}
                        </div>
                      )}

                      {couponSuccess && (
                        <div className="coupon-success">
                          {couponSuccess}
                        </div>
                      )}

                  </div>
                )}

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


                {/* CHECKOUT BUTTON */}

                <button
                  className="cart-checkout-button"
                  onClick={() => router.push("/checkout")}
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