    "use client";

    import { useEffect, useMemo, useRef, useState } from "react";
    import { useRouter } from "next/navigation";
    import Link from "next/link";
    import AdminSidebar from "./components/AdminSidebar";

    /* ========================import=================================
    TYPE USER
    ========================================================= */

    type User = {
    id: number;
    name?: string;
    username?: string;
    email: string;
    role: string;
    };

    /* =========================================================
    TYPE ORDER DARI API
    ========================================================= */

    type RecentOrder = {
    id: number;
    customer: string;
    amount: string | number;
    status: string;
    created_at: string;
    };

    /* =========================================================
    TYPE REVENUE
    ========================================================= */

    type RevenueItem = {
    date: string;
    label: string;
    revenue: number;
    };

    /* =========================================================
    TYPE DASHBOARD API
    ========================================================= */

    type DashboardData = {
    total_users: number;
    total_domains: number;
    total_orders: number;
    total_invoices: number;
    total_revenue: number;
    active_hosting: number;
    active_domains: number;
    new_tickets: number;
    revenue_overview: RevenueItem[];
    recent_orders: RecentOrder[];
    };

    type PaymentSummary = {
    id?: number | string;
    payment_number?: string;
    order_number?: string;
    status?: string;
    };

    type PaymentSummaryResponse = {
    status: string;
    data?: {
        payments?: PaymentSummary[];
    };
    };

    /* =========================================================
    TYPE SERVICE SUMMARY
    ========================================================= */

    type ServiceSummary = {
    total_services: number | string;
    total_website: number | string;
    total_iklan: number | string;
    total_active: number | string;
    total_expired: number | string;
    total_cancelled: number | string;
    };


    /* =========================================================
    INTERFACE SERVICE SUMMARY API
    ========================================================= */

    interface ServiceSummaryResponse {
    status: string;
    code: number;
    message: string;
    data: {
        summary: ServiceSummary;
    };
    }

    /* =========================================================
    TYPE SERVICE REPORT
    ========================================================= */

    type ServiceReportItem = {
        id: number;
        order_id: number;
        order_number: string;

        user_id: number;

        username: string;
        email: string;

        domain_id: number;
        domain_name: string;

        service_category: string;
        billing_period: string;

        start_date: string | null;
        expiry_date: string | null;

        service_status: string;

        price: string | number;

        order_subtotal: string | number;
        order_discount: string | number;
        order_ppn: string | number;
        order_total: string | number;

        order_status: string;
        order_date: string;
    };

        interface ServiceReportResponse {
        status: string;
        code: number;
        message: string;
        data: {
            filters: {
                category: string | null;
                status: string | null;
            };
            services: ServiceReportItem[];
            total: number;
        };
    }


    /* =========================================================
    TYPE TRANSACTION FRONTEND
    ========================================================= */

    type TransactionData = {
    id: string;
    customer: string;
    service: string;
    amount: string;
    status: "Completed" | "Pending" | "Failed";
    };


        /* =========================================================
        STAT CARD
        ========================================================= */

        type StatCardProps = {
        title: string;
        value: string | number;
        change: string;
        icon: string;
        urgent?: boolean;
        };

        function StatCard({
        title,
        value,
        change,
        icon,
        urgent = false,
        }: StatCardProps) {
        return (
            <div className="admin-stat-card">

            <div className="stat-top">

                <div className="stat-icon">
                {icon}
                </div>

                <span
                className={
                    urgent
                    ? "stat-change urgent"
                    : "stat-change"
                }
                >
                {change}
                </span>

            </div>

            <span className="stat-title">
                {title}
            </span>

            <strong className="stat-value">
                {value}
            </strong>

            </div>
        );
        }


    /* =========================================================
    API URL
    ========================================================= */

    const DASHBOARD_API =
    "/api/backend/admin/dashboard/index.php";

    const SERVICE_SUMMARY_API =
    "/api/backend/admin/order/summary.php";

    const PAYMENT_API =
    "/api/backend/admin/payment/index.php";

    export default function AdminPage() {

    const router = useRouter();


        /* =======================================================
        USER
        ======================================================= */

        const [user, setUser] =
            useState<User | null>(null);


        /* =======================================================
        DASHBOARD API
        ======================================================= */

        const [dashboardData, setDashboardData] =
            useState<DashboardData | null>(null);

        const [dashboardLoading, setDashboardLoading] =
            useState(true);

        const [dashboardError, setDashboardError] =
            useState("");



        /* =======================================================
        SERVICE SUMMARY
        ======================================================= */

        const [serviceSummary, setServiceSummary] =
            useState<ServiceSummary | null>(null);

        const [serviceSummaryLoading, setServiceSummaryLoading] =
            useState(true);

        const [serviceSummaryError, setServiceSummaryError] =
            useState("");



        /* =======================================================
        SERVICE REPORT
        ======================================================= */

        const [serviceReport, setServiceReport] =
            useState<ServiceReportItem[]>([]);

        const [serviceReportLoading, setServiceReportLoading] =
            useState(false);

        const [serviceReportError, setServiceReportError] =
            useState("");

        const [serviceCategory, setServiceCategory] =
            useState("");

        const [serviceStatus, setServiceStatus] =
            useState("");


        /* =======================================================
        UI
        ======================================================= */

        const [darkMode, setDarkMode] =
            useState(false);

        const [search, setSearch] =
            useState("");

        const [showNotifications, setShowNotifications] =
            useState(false);

        const [showProfile, setShowProfile] =
            useState(false);

        const notifDropdownRef = useRef<HTMLDivElement>(null);
        const profileDropdownRef = useRef<HTMLDivElement>(null);

        const [pendingPaymentCount, setPendingPaymentCount] =
            useState(0);

        const [period, setPeriod] =
            useState("Last 7 Days");

        const [showPeriod, setShowPeriod] =
            useState(false);

        /* Click outside to close dropdowns */
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (
                    notifDropdownRef.current &&
                    !notifDropdownRef.current.contains(event.target as Node)
                ) {
                    setShowNotifications(false);
                }
                if (
                    profileDropdownRef.current &&
                    !profileDropdownRef.current.contains(event.target as Node)
                ) {
                    setShowProfile(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);



        /* =======================================================
        LOAD DASHBOARD
        ======================================================= */

        async function loadDashboardData() {

            try {

                setDashboardLoading(true);
                setDashboardError("");

                const response = await fetch(
                    DASHBOARD_API,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const result = await response.json();

                if (
                    !response.ok ||
                    result.status !== "success"
                ) {
                    throw new Error(
                        result.message ||
                        "Gagal mengambil data dashboard."
                    );
                }

                setDashboardData(
                    result.data
                );

            } catch (error) {

                console.error(
                    "Dashboard API Error:",
                    error
                );

                setDashboardError(
                    error instanceof Error
                        ? error.message
                        : "Tidak dapat mengambil data dashboard."
                );

            } finally {

                setDashboardLoading(false);

            }

        }



        /* =======================================================
        LOAD SERVICE SUMMARY
        ======================================================= */

        const loadServiceSummary = async () => {

            try {

                setServiceSummaryLoading(true);
                setServiceSummaryError("");

                const response = await fetch(
                    SERVICE_SUMMARY_API,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const result: ServiceSummaryResponse =
                    await response.json();

                if (
                    !response.ok ||
                    result.status !== "success"
                ) {
                    throw new Error(
                        result.message ||
                        "Gagal mengambil ringkasan layanan."
                    );
                }

                setServiceSummary(
                    result.data.summary
                );

            } catch (error) {

                console.error(
                    "Service Summary Error:",
                    error
                );

                setServiceSummaryError(
                    error instanceof Error
                        ? error.message
                        : "Gagal mengambil ringkasan layanan."
                );

            } finally {

                setServiceSummaryLoading(false);

            }

        };

        const loadPendingPayments = async () => {
            try {
                const response = await fetch(PAYMENT_API, {
                    credentials: "include",
                    cache: "no-store",
                    headers: { Accept: "application/json" },
                });
                const result = await response.json().catch(() => null);
                if (!response.ok || result?.status !== "success") return;
                const payments = Array.isArray(result.data)
                    ? result.data
                    : result.data?.payments || [];
                setPendingPaymentCount(
                    payments.filter((payment: any) =>
                        (payment.status || "pending").toLowerCase() === "pending"
                    ).length
                );
            } catch (error) {
                console.error("Payment notification error:", error);
            }
        };



        /* =======================================================
        LOAD SERVICE REPORT
        ======================================================= */

        const fetchServiceReport = async () => {
            try {
                setServiceReportLoading(true);
                setServiceReportError("");

                const params = new URLSearchParams();

                if (serviceCategory) {
                    params.append("category", serviceCategory);
                }

                if (serviceStatus) {
                    params.append("status", serviceStatus);
                }

                const response = await fetch(
                    `/api/backend/admin/order/report.php${
                        params.toString()
                            ? `?${params.toString()}`
                            : ""
                    }`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                const result: ServiceReportResponse =
                    await response.json();

                if (
                    !response.ok ||
                    result.status !== "success"
                ) {
                    throw new Error(
                        result.message ||
                        "Gagal mengambil laporan layanan"
                    );
                }

                setServiceReport(
                    result.data.services || []
                );

            } catch (error) {

                console.error(
                    "Service Report Error:",
                    error
                );

                setServiceReportError(
                    error instanceof Error
                        ? error.message
                        : "Gagal mengambil laporan layanan"
                );

                setServiceReport([]);

            } finally {

                setServiceReportLoading(false);

            }
        };

        /* =======================================================
        CEK LOGIN ADMIN
        ======================================================= */

        useEffect(() => {

            const savedUser =
                localStorage.getItem(
                    "hostingwebid_user"
                );

            if (!savedUser) {

                router.push("/login");

                return;

            }

            try {

                const parsed =
                    JSON.parse(savedUser);

                if (parsed.role !== "admin" && parsed.role !== "super_admin" && parsed.role !== "superadmin") {

                    router.push("/dashboard");

                    return;

                }

                setTimeout(() => setUser(parsed), 0);

            } catch (error) {

                console.error(
                    "Admin session error:",
                    error
                );

                router.push("/login");

            }

        }, [router]);



        /* =======================================================
        LOAD THEME
        ======================================================= */

        useEffect(() => {

            const savedTheme =
                localStorage.getItem(
                    "hostingweb_admin_theme"
                );

            if (savedTheme === "dark") {

                setTimeout(() => setDarkMode(true), 0);

            }

        }, []);



    /* =======================================================
    LOAD DATA API SAAT PAGE DIBUKA
    ======================================================= */

    useEffect(() => {

        setTimeout(() => {
            void loadDashboardData();
            void loadServiceSummary();
            void fetchServiceReport();
            void loadPendingPayments();
        }, 0);

        const paymentInterval = window.setInterval(
            loadPendingPayments,
            15000
        );

        return () => window.clearInterval(paymentInterval);

    }, []);

            

    /* =======================================================
        DARK / LIGHT MODE
    ======================================================= */

    function toggleDarkMode() {

        const newMode =
        !darkMode;


        setDarkMode(
        newMode
        );


        localStorage.setItem(
        "hostingweb_admin_theme",
        newMode
            ? "dark"
            : "light"
        );
    }


    /* =======================================================
        LOGOUT
    ======================================================= */

    function logout() {

        localStorage.removeItem(
        "hostingwebid_user"
        );


        localStorage.removeItem(
        "hostingweb_auth"
        );


        localStorage.removeItem(
        "hostingweb_admin_theme"
        );


        router.push(
        "/login"
        );
    }


    /* =======================================================
        FORMAT RUPIAH
    ======================================================= */

    function formatRupiah(
        value: string | number
    ) {

        return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }
        ).format(
        Number(value) || 0
        );
    }


    /* =======================================================
        FORMAT TANGGAL
    ======================================================= */

    function formatDate(
        value: string | null | undefined
    ) {

        if (!value) {
            return "-";
        }

        const date =
            new Date(
                value.replace(" ", "T")
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return new Intl.DateTimeFormat(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ).format(date);
    }

    /* =======================================================
        SISA HARI SERVICE
    ======================================================= */

    function getRemainingDays(
        expiryDate: string | null
    ) {

        if (!expiryDate) {
            return null;
        }


        const expiry =
            new Date(
                expiryDate.replace(" ", "T")
            );


        if (
            Number.isNaN(
                expiry.getTime()
            )
        ) {
            return null;
        }


        const now =
            new Date();


        const difference =
            expiry.getTime() -
            now.getTime();


        return Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );
    }


    /* =======================================================
        STATUS ORDER
    ======================================================= */

    function normalizeStatus(
        status: string
    ):
        | "Completed"
        | "Pending"
        | "Failed" {

        const normalized =
        status
            .toLowerCase()
            .trim();


        if (
        [
            "paid",
            "success",
            "successful",
            "completed",
            "lunas",
        ].includes(normalized)
        ) {

        return "Completed";
        }


        if (
        [
            "failed",
            "cancelled",
            "canceled",
            "gagal",
        ].includes(normalized)
        ) {

        return "Failed";
        }


        return "Pending";
    }


    /* =======================================================
        TRANSACTION DARI API
    ======================================================= */

    const transactions =
        useMemo<TransactionData[]>(
        () => {

            if (
            !dashboardData?.recent_orders
            ) {

            return [];
            }


            return dashboardData
            .recent_orders
            .map(
                (order) => ({

                id:
                    `#ORD-${order.id}`,

                customer:
                    order.customer ||
                    "Unknown",

                /*
                * Service belum dikirim
                * oleh API dashboard.
                *
                * Jadi jangan menggunakan
                * data dummy.
                */
                service:
                    "Order",

                amount:
                    formatRupiah(
                    order.amount
                    ),

                status:
                    normalizeStatus(
                    order.status
                    ),

                })
            );

        },
        [dashboardData]
        );


    /* =======================================================
        SEARCH TRANSACTIONS
    ======================================================= */

    const filteredTransactions =
        useMemo(() => {

        const keyword =
            search
            .toLowerCase()
            .trim();


        if (!keyword) {

            return transactions;
        }


        return transactions.filter(
            (item) =>
            [
                item.id,
                item.customer,
                item.service,
                item.amount,
                item.status,
            ]
                .join(" ")
                .toLowerCase()
                .includes(
                keyword
                )
        );

        }, [
        search,
        transactions,
        ]);


    /* =======================================================
        REVENUE DATA DARI API
    ======================================================= */

    const revenueData =
        useMemo(() => {

        if (
            !dashboardData?.revenue_overview
        ) {

            return [];
        }


        return dashboardData
            .revenue_overview
            .map(
            (item) => ({
                day: item.label,
                revenue:
                Number(
                    item.revenue
                ) || 0,
            })
            );

        }, [
        dashboardData,
        ]);


    /* =======================================================
        MAX REVENUE UNTUK CHART
    ======================================================= */

    const maxRevenue =
        useMemo(() => {

        if (
            revenueData.length === 0
        ) {

            return 1;
        }


        const max =
            Math.max(
            ...revenueData.map(
                (item) =>
                item.revenue
            )
            );


        return max > 0
            ? max
            : 1;

        }, [
        revenueData,
        ]);


    /* =======================================================
        NOTIFICATION COUNT
    ======================================================= */

    const pendingOrders =
        dashboardData?.recent_orders
        ?.filter(
            (item) =>
            normalizeStatus(
                item.status
            ) === "Pending"
        ).length || 0;


    const notificationCount =
        pendingPaymentCount +
        pendingOrders +
        (dashboardData?.new_tickets || 0);


    /* =======================================================
        LOADING USER
    ======================================================= */

    if (!user) {

        return (
        <div className="admin-loading">
            Memuat dashboard admin...
        </div>
        );
    }


    /* =======================================================
        MAIN
    ======================================================= */

    return (

        <main
        className={`admin-page ${
            darkMode
            ? "admin-dark"
            : ""
        }`}
        >


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <AdminSidebar
          currentPath="/admin"
          pendingPaymentCount={pendingPaymentCount}
          darkMode={darkMode}
          onLogout={logout}
        />


        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="admin-content">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="admin-header">

            <div>

                <div className="admin-breadcrumb">
                ADMIN PANEL
                </div>


                <h1>
                Dashboard Overview
                </h1>

            </div>


          <div className="admin-header-right">


            {/* SEARCH */}

            <div className="admin-search">

              <span>
                🔍
              </span>


              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />


              {search && (

                <button
                  className="search-clear"
                  onClick={() =>
                    setSearch("")
                  }
                  type="button"
                >
                  ×
                </button>

              )}

            </div>


            {/* DARK MODE */}

            <button
              className="admin-icon-btn"
              onClick={
                toggleDarkMode
              }
              title={
                darkMode
                  ? "Mode terang"
                  : "Mode gelap"
              }
              type="button"
            >
              {darkMode
                ? "☀️"
                : "🌙"}
            </button>


            {/* NOTIFICATION */}

            <div className="admin-dropdown-wrapper" ref={notifDropdownRef}>

              <button
                className="admin-icon-btn notification-button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                title="Notifikasi"
                type="button"
              >
                🔔
                {notificationCount > 0 && (
                  <span className="notification-badge">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="admin-dropdown notification-dropdown">
                  <div className="dropdown-title">
                    <strong>Notifikasi Admin</strong>
                    <small>{notificationCount} baru</small>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "8px 0" }}>
                    {pendingPaymentCount > 0 && (
                      <Link
                        href="/admin/payment"
                        onClick={() => setShowNotifications(false)}
                        className="notification-item"
                        style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                      >
                        <span style={{ fontSize: "16px" }}>💳</span>
                        <div>
                          <strong>{pendingPaymentCount} Pembayaran Menunggu</strong>
                          <small>Ada pembayaran pelanggan perlu diverifikasi.</small>
                        </div>
                      </Link>
                    )}

                    {pendingOrders > 0 && (
                      <Link
                        href="/admin/order"
                        onClick={() => setShowNotifications(false)}
                        className="notification-item"
                        style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                      >
                        <span style={{ fontSize: "16px" }}>🧾</span>
                        <div>
                          <strong>{pendingOrders} Pesanan Pending</strong>
                          <small>Pesanan pelanggan menunggu diproses.</small>
                        </div>
                      </Link>
                    )}

                    {(dashboardData?.new_tickets || 0) > 0 && (
                      <Link
                        href="/admin/system"
                        onClick={() => setShowNotifications(false)}
                        className="notification-item"
                        style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                      >
                        <span style={{ fontSize: "16px" }}>🎫</span>
                        <div>
                          <strong>{dashboardData?.new_tickets} Tiket Baru</strong>
                          <small>Tiket bantuan pelanggan perlu direspon.</small>
                        </div>
                      </Link>
                    )}

                    {notificationCount === 0 && (
                      <div className="notification-item">
                        <span>✓</span>
                        <div>
                          <strong>Tidak ada notifikasi baru</strong>
                          <small>Semua pesanan dan pembayaran sudah beres.</small>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eeeeee", paddingTop: "8px", marginTop: "4px", fontSize: "11px" }}>
                    <Link
                      href="/admin/payment"
                      onClick={() => setShowNotifications(false)}
                      style={{ color: "#ea580c", fontWeight: 700, textDecoration: "none" }}
                    >
                      Buka Pembayaran →
                    </Link>
                    <Link
                      href="/admin/order"
                      onClick={() => setShowNotifications(false)}
                      style={{ color: "#64748b", fontWeight: 600, textDecoration: "none" }}
                    >
                      Buka Pesanan →
                    </Link>
                  </div>
                </div>
              )}

            </div>


            {/* PROFILE */}

            <div className="admin-dropdown-wrapper" ref={profileDropdownRef}>

              <button
                className="admin-profile"
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                type="button"
              >
                <div className="admin-avatar">
                  {(user.name || user.username || "A")?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <strong>{user.name || user.username || "Admin"}</strong>
                  <small>{user.email}</small>
                </div>

                <span className="profile-arrow">▾</span>
              </button>

              {showProfile && (
                <div className="admin-dropdown profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="admin-avatar large">
                      {(user.name || user.username || "A")?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{user.name || user.username || "Admin"}</strong>
                      <small>{user.email}</small>
                      <span>Role: {user.role}</span>
                    </div>
                  </div>

                  <Link href="/admin" onClick={() => setShowProfile(false)}>
                    ⚙️ Admin Dashboard
                  </Link>

                  <Link href="/admin/payment" onClick={() => setShowProfile(false)}>
                    💳 Manajemen Pembayaran
                  </Link>

                  <Link href="/dashboard" onClick={() => setShowProfile(false)}>
                    👤 Dashboard User
                  </Link>

                  <button onClick={logout} type="button">
                    ↪ Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>


        {/* =================================================
            WELCOME
        ================================================= */}

        <div className="admin-welcome">

          <div>

            <span>
              SELAMAT DATANG 👋
            </span>


            <h2>
              Halo,{" "}
              {user.name ||
                user.username ||
                "Admin"}!
            </h2>


            <p>
              Kelola hosting, domain,
              pesanan, dan layanan website
              dari satu tempat.
            </p>

          </div>


          {/* PERIOD */}

          <div className="period-wrapper">

            <button
              className="admin-period"
              onClick={() =>
                setShowPeriod(
                  !showPeriod
                )
              }
              type="button"
            >
              ▣ {period} ▾
            </button>


            {showPeriod && (

              <div className="period-dropdown">

                {[
                  "Last 7 Days",
                  "Last 30 Days",
                  "Last 90 Days",
                  "This Year",
                ].map(
                  (item) => (

                    <button
                      key={item}
                      type="button"
                      onClick={() => {

                        setPeriod(
                          item
                        );

                        setShowPeriod(
                          false
                        );

                      }}
                      className={
                        period === item
                          ? "selected"
                          : ""
                      }
                    >
                      {item}
                    </button>

                  )
                )}

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            ERROR & SESSION EXPIRED BANNER
        ================================================= */}

        {dashboardError && (
          <div className="admin-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "14px 20px", borderRadius: "14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <div>
                <strong style={{ display: "block", fontSize: "14px", fontWeight: "700" }}>
                  {dashboardError.toLowerCase().includes("belum login")
                    ? "Sesi Login Admin Telah Berakhir"
                    : "Gagal Mengambil Data Dashboard"}
                </strong>
                <span style={{ fontSize: "12.5px", color: "#b91c1c" }}>
                  {dashboardError.toLowerCase().includes("belum login")
                    ? "Sesi server Anda telah kedaluwarsa. Silakan masuk / login ulang untuk memuat seluruh data dashboard."
                    : dashboardError}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {dashboardError.toLowerCase().includes("belum login") ? (
                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    textDecoration: "none",
                  }}
                >
                  <span>🔐 Login Ulang Sekarang</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={loadDashboardData}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#dc2626",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Coba Lagi
                </button>
              )}
            </div>
          </div>
        )}


        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="admin-main-grid">


          {/* =================================================
              REVENUE
          ================================================= */}

          <section className="admin-card revenue-card">

            <div className="card-header">

              <div>

                <h3>
                  Revenue Overview
                </h3>

                <p>
                  Data pendapatan dari API
                </p>

              </div>


              <button
                type="button"
              >
                {period}
              </button>

            </div>


            <div className="revenue-chart">

              {dashboardLoading ? (

                <div className="chart-empty">

                  Memuat data revenue...

                </div>

              ) : revenueData.length >
                0 ? (

                revenueData.map(
                  (item) => {

                    const height =
                      item.revenue <=
                      0
                        ? 3
                        : (
                            item.revenue /
                            maxRevenue
                          ) * 100;


                    return (

                      <div
                        className="chart-column"
                        key={item.day}
                      >

                        <div
                          className="chart-bar"
                          style={{
                            height:
                              `${height}%`,
                          }}
                          title={
                            formatRupiah(
                              item.revenue
                            )
                          }
                        />


                        <span>
                          {item.day}
                        </span>

                      </div>

                    );

                  }
                )

              ) : (

                <div className="chart-empty">

                  Belum ada data revenue.

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              INFRASTRUCTURE
          ================================================= */}

          <section className="admin-card">

            <div className="card-header">

              <div>

                <h3>
                Service Overview
                </h3>

                <p>
                Ringkasan layanan website dan iklan
                </p>

              </div>

            </div>


            <div className="infrastructure-empty">

            {serviceSummaryLoading ? (

                <strong>
                Memuat data layanan...
                </strong>

            ) : serviceSummaryError ? (

                <>
                <strong>
                    Gagal mengambil data layanan
                </strong>

                <span>
                    {serviceSummaryError}
                </span>

                <button
                    type="button"
                    onClick={loadServiceSummary}
                >
                    Coba Lagi
                </button>
                </>

            ) : (

                <div>

                <div>
                    <strong>
                    Total Services
                    </strong>

                    <span>
                    {Number(
                        serviceSummary?.total_services || 0
                    )}
                    </span>
                </div>


                <div>
                    <strong>
                    Website
                    </strong>

                    <span>
                    {Number(
                        serviceSummary?.total_website || 0
                    )}
                    </span>
                </div>


                <div>
                    <strong>
                    Iklan
                    </strong>

                    <span>
                    {Number(
                        serviceSummary?.total_iklan || 0
                    )}
                    </span>
                </div>


                <div>
                    <strong>
                    Active
                    </strong>

                    <span>
                    {Number(
                        serviceSummary?.total_active || 0
                    )}
                    </span>
                </div>


                <div>
                    <strong>
                    Expired
                    </strong>

                    <span>
                    {Number(
                        serviceSummary?.total_expired || 0
                    )}
                    </span>
                </div>


                <div>
                    <strong>
                    Cancelled
                    </strong>

                    <span>
                    {Number(
                        serviceSummary?.total_cancelled || 0
                    )}
                    </span>
                </div>

                </div>

            )}

            </div>

          </section>

        </div>

        {/* =================================================
              SERVICE REPORT
            ================================================= */}

            <section className="admin-card">

                <div className="card-header">

                    <div>
                        <h3>
                            Service Report
                        </h3>

                        <p>
                            Daftar layanan website dan iklan
                        </p>
                    </div>

                </div>


                {/* FILTER */}

                <div className="service-report-filters">

                    <select
                        value={serviceCategory}
                        onChange={(e) =>
                            setServiceCategory(e.target.value)
                        }
                    >
                        <option value="">
                            Semua Kategori
                        </option>

                        <option value="website">
                            Website
                        </option>

                        <option value="iklan">
                            Iklan
                        </option>
                    </select>


                    <select
                        value={serviceStatus}
                        onChange={(e) =>
                            setServiceStatus(e.target.value)
                        }
                    >
                        <option value="">
                            Semua Status
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="expired">
                            Expired
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>
                    </select>


                    <button
                        type="button"
                        onClick={fetchServiceReport}
                        disabled={serviceReportLoading}
                    >
                        {serviceReportLoading
                            ? "Memuat..."
                            : "Filter"}
                    </button>

                </div>


                {/* ERROR */}

                {serviceReportError && (
                    <div className="chart-empty">
                        {serviceReportError}
                    </div>
                )}


                {/* TABLE */}

                {!serviceReportError && (
                    <div className="service-report-table">

                        {serviceReportLoading ? (

                            <div className="service-report-empty">
                                Memuat service report...
                            </div>

                        ) : serviceReportError ? (

                            <div className="service-report-empty service-report-error">
                                {serviceReportError}
                            </div>

                        ) : serviceReport.length === 0 ? (

                            <div className="service-report-empty">
                                Belum ada data layanan.
                            </div>

                        ) : (

                           <table>

                            <thead>

                                <tr>

                                    <th>Order</th>

                                    <th>Username</th>

                                    <th>Domain</th>

                                    <th>Kategori</th>

                                    <th>Periode</th>

                                    <th>Tanggal Order</th>

                                    <th>Tanggal Mulai</th>

                                    <th>Tanggal Expired</th>

                                    <th>Sisa Hari</th>

                                    <th>Status</th>

                                    <th>Harga</th>

                                    <th>Diskon</th>

                                    <th>PPN</th>

                                    <th>Total Bayar</th>

                                </tr>

                            </thead>


                            <tbody>

                                {serviceReport.length > 0 ? (

                                    serviceReport.map((item) => {

                                        const remainingDays =
                                            getRemainingDays(
                                                item.expiry_date
                                            );

                                        return (

                                            <tr key={item.id}>

                                                {/* =================================
                                                    ORDER
                                                ================================= */}

                                                <td>

                                                    <strong>
                                                        {item.order_number}
                                                    </strong>

                                                </td>


                                                {/* =================================
                                                    USERNAME
                                                ================================= */}

                                                <td>
                                                    {item.username}
                                                </td>


                                                {/* =================================
                                                    DOMAIN
                                                ================================= */}

                                                <td>
                                                    {item.domain_name}
                                                </td>


                                                {/* =================================
                                                    KATEGORI
                                                ================================= */}

                                                <td>

                                                    <span className="service-category">

                                                        {item.service_category}

                                                    </span>

                                                </td>


                                                {/* =================================
                                                    PERIODE
                                                ================================= */}

                                                <td>
                                                    {item.billing_period}
                                                </td>


                                                {/* =================================
                                                    TANGGAL ORDER
                                                ================================= */}

                                                <td>

                                                    {formatDate(
                                                        item.order_date
                                                    )}

                                                </td>


                                                {/* =================================
                                                    TANGGAL MULAI
                                                ================================= */}

                                                <td>

                                                    {formatDate(
                                                        item.start_date
                                                    )}

                                                </td>


                                                {/* =================================
                                                    TANGGAL EXPIRED
                                                ================================= */}

                                                <td>

                                                    {formatDate(
                                                        item.expiry_date
                                                    )}

                                                </td>


                                                {/* =================================
                                                    SISA HARI
                                                ================================= */}

                                                <td>

                                                    {remainingDays === null ? (

                                                        <span className="service-days unknown">
                                                            -
                                                        </span>

                                                    ) : remainingDays < 0 ? (

                                                        <span className="service-days expired">
                                                            Expired
                                                        </span>

                                                    ) : remainingDays <= 7 ? (

                                                        <span className="service-days warning">
                                                            {remainingDays} hari
                                                        </span>

                                                    ) : (

                                                        <span className="service-days active">
                                                            {remainingDays} hari
                                                        </span>

                                                    )}

                                                </td>


                                                {/* =================================
                                                    STATUS
                                                ================================= */}

                                                <td>

                                                    <span
                                                        className={
                                                            `service-status ${
                                                                item.service_status
                                                            }`
                                                        }
                                                    >

                                                        {item.service_status}

                                                    </span>

                                                </td>


                                                {/* =================================
                                                    HARGA ASLI
                                                ================================= */}

                                                <td>

                                                    <span className="service-price">

                                                        {formatRupiah(
                                                            Number(
                                                                item.price
                                                            ) || 0
                                                        )}

                                                    </span>

                                                </td>


                                                {/* =================================
                                                    DISKON
                                                ================================= */}

                                                <td>

                                                    {Number(
                                                        item.order_discount
                                                    ) > 0 ? (

                                                        <span className="service-discount">

                                                            -
                                                            {" "}
                                                            {formatRupiah(
                                                                Number(
                                                                    item.order_discount
                                                                ) || 0
                                                            )}

                                                        </span>

                                                    ) : (

                                                        <span className="service-no-discount">
                                                            -
                                                        </span>

                                                    )}

                                                </td>


                                                {/* =================================
                                                    PPN
                                                ================================= */}

                                                <td>

                                                    <span className="service-ppn">

                                                        {formatRupiah(
                                                            Number(
                                                                item.order_ppn
                                                            ) || 0
                                                        )}

                                                    </span>

                                                </td>


                                                {/* =================================
                                                    TOTAL BAYAR
                                                ================================= */}

                                                <td>

                                                    <strong className="service-total">

                                                        {formatRupiah(
                                                            Number(
                                                                item.order_total
                                                            ) || 0
                                                        )}

                                                    </strong>

                                                </td>

                                            </tr>

                                        );

                                    })

                                ) : (

                                    <tr>

                                        <td
                                            colSpan={14}
                                            style={{
                                                textAlign: "center",
                                                padding: "30px",
                                            }}
                                        >

                                            Belum ada data service.

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                        )}

                    </div>
                )}

            </section>

      </section>

    </main>
  );
} 


    /* =========================================================
    STAT CARD
    ========================================================= */

    function AdminStatCard({
    title,
    value,
    change,
    icon,
    urgent = false,
    }: {
    title: string;
    value: string | number;
    change: string;
    icon: React.ReactNode;
    urgent?: boolean;
    }) {
    return (
        <div className="admin-stat-card">

        <div className="stat-top">

            <div className="stat-icon">
            {icon}
            </div>

            <span
            className={
                urgent
                ? "stat-change urgent"
                : "stat-change"
            }
            >
            {change}
            </span>

        </div>

        <span className="stat-title">
            {title}
        </span>

        <strong className="stat-value">
            {value}
        </strong>

        </div>
    );
    }

/* =========================================================
   TRANSACTION
========================================================= */

function Transaction({
  id,
  customer,
  service,
  amount,
  status,
}: {
  id: string;
  customer: string;
  service: string;
  amount: string;
  status:
    | "Completed"
    | "Pending"
    | "Failed";
}) {

  return (

    <div className="transaction-row">

      <span>
        {id}
      </span>


      <span>
        {customer}
      </span>


      <span>
        {service}
      </span>


      <strong>
        {amount}
      </strong>


      <span
        className={`status ${status.toLowerCase()}`}
      >
        {status}
      </span>

    </div>
  );
}