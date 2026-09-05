"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Coupon = {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number | string;
  min_purchase: number | string;
  max_discount: number | string | null;
  usage_limit: number | string | null;
  used_count: number | string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
};

type User = {
  id: number;
  username?: string;
  name?: string;
  email: string;
  role: string;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost/hosting_webid/api/v1";

export default function AdminCouponPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const [selectedCoupon, setSelectedCoupon] =
    useState<Coupon | null>(null);

  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(
    null
  );

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase: "",
    max_discount: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
    status: "active",
  });

  // =========================================================
  // CEK LOGIN ADMIN
  // =========================================================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("hostingwebid_user");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);

      if (parsed.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setUser(parsed);
    } catch {
      router.push("/login");
      return;
    }

    setLoading(false);
  }, [router]);

  // =========================================================
  // LOAD COUPON
  // =========================================================

  const loadCoupons = async () => {
    try {
      setLoadingData(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/admin/coupon/index.php`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message ||
            "Gagal mengambil data coupon"
        );
      }

      const data = result.data;

      if (Array.isArray(data)) {
        setCoupons(data);
      } else if (Array.isArray(data?.coupons)) {
        setCoupons(data.coupons);
      } else {
        setCoupons([]);
      }
    } catch (err: any) {
      console.error("Coupon Error:", err);

      setError(
        err?.message ||
          "Tidak dapat terhubung ke server"
      );

      setCoupons([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadCoupons();
    }
  }, [loading, user]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem(
      "hostingwebid_user"
    );

    localStorage.removeItem(
      "hostingweb_auth"
    );

    router.push("/login");
  };

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  const rupiah = (
    value: number | string | null | undefined
  ) => {
    const numberValue = Number(value || 0);

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numberValue);
  };

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  const formatDate = (
    value: string | null | undefined
  ) => {
    if (!value) {
      return "-";
    }

    const parsed = new Date(
      value.replace(" ", "T")
    );

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // FORMAT DISCOUNT
  // =========================================================

  const formatDiscount = (
    coupon: Coupon
  ) => {
    const value = Number(
      coupon.discount_value || 0
    );

    if (
      coupon.discount_type ===
      "percentage"
    ) {
      return `${value}%`;
    }

    return rupiah(value);
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredCoupons = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return coupons;
    }

    return coupons.filter((coupon) =>
      [
        coupon.code,
        coupon.discount_type,
        coupon.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [coupons, search]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter(
    (coupon) =>
      coupon.status?.toLowerCase() ===
      "active"
  ).length;

  const inactiveCoupons = coupons.filter(
    (coupon) =>
      coupon.status?.toLowerCase() !==
      "active"
  ).length;

  const totalUsed = coupons.reduce(
    (total, coupon) =>
      total +
      Number(coupon.used_count || 0),
    0
  );

  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreate = () => {
    setModalMode("create");
    setSelectedCoupon(null);

    setForm({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_purchase: "",
      max_discount: "",
      start_date: "",
      end_date: "",
      usage_limit: "",
      status: "active",
    });

    setModalOpen(true);
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEdit = (
    coupon: Coupon
  ) => {
    setModalMode("edit");
    setSelectedCoupon(coupon);

    setForm({
      code: coupon.code || "",
      discount_type:
        coupon.discount_type ||
        "percentage",
      discount_value:
        String(
          coupon.discount_value ?? ""
        ),
      min_purchase:
        String(
          coupon.min_purchase ?? ""
        ),
      max_discount:
        coupon.max_discount === null ||
        coupon.max_discount === undefined
          ? ""
          : String(coupon.max_discount),
      start_date:
        coupon.start_date
          ? coupon.start_date.slice(0, 10)
          : "",
      end_date:
        coupon.end_date
          ? coupon.end_date.slice(0, 10)
          : "",
      usage_limit:
        coupon.usage_limit === null ||
        coupon.usage_limit === undefined
          ? ""
          : String(coupon.usage_limit),
      status:
        coupon.status || "active",
    });

    setModalOpen(true);
  };

  // =========================================================
  // HANDLE FORM
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert("Kode coupon wajib diisi.");
      return;
    }

    if (!form.discount_value) {
      alert(
        "Nilai discount wajib diisi."
      );
      return;
    }

    if (
      form.discount_type ===
        "percentage" &&
      Number(form.discount_value) > 100
    ) {
      alert(
        "Discount percentage tidak boleh lebih dari 100%."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        code: form.code
          .trim()
          .toUpperCase(),

        discount_type:
          form.discount_type,

        discount_value:
          Number(form.discount_value),

        min_purchase:
          Number(form.min_purchase || 0),

        max_discount:
          form.max_discount
            ? Number(form.max_discount)
            : null,

        start_date:
          form.start_date || null,

        end_date:
          form.end_date || null,

        usage_limit:
          form.usage_limit
            ? Number(form.usage_limit)
            : null,

        status: form.status,
      };

      let url =
        `${API_BASE}/admin/coupon/create.php`;

      let method = "POST";

      if (
        modalMode === "edit" &&
        selectedCoupon
      ) {
        url =
          `${API_BASE}/admin/coupon/update.php?id=${selectedCoupon.id}`;

        method = "PUT";
      }

      const response = await fetch(
        url,
        {
          method,
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.status !== "success"
      ) {
        throw new Error(
          result.message ||
            "Gagal menyimpan coupon"
        );
      }

      setModalOpen(false);

      await loadCoupons();

      alert(
        modalMode === "create"
          ? "Coupon berhasil dibuat."
          : "Coupon berhasil diperbarui."
      );
    } catch (err: any) {
      console.error(
        "Save Coupon Error:",
        err
      );

      alert(
        err?.message ||
          "Gagal menyimpan coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const toggleStatus = async (
    coupon: Coupon
  ) => {
    const action =
      coupon.status === "active"
        ? "menonaktifkan"
        : "mengaktifkan";

    const confirmed =
      window.confirm(
        `Apakah kamu yakin ingin ${action} coupon ${coupon.code}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(coupon.id);

      const response = await fetch(
        `${API_BASE}/admin/coupon/toggle-status.php?id=${coupon.id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.status !== "success"
      ) {
        throw new Error(
          result.message ||
            "Gagal mengubah status coupon"
        );
      }

      await loadCoupons();
    } catch (err: any) {
      console.error(
        "Toggle Coupon Error:",
        err
      );

      alert(
        err?.message ||
          "Gagal mengubah status coupon."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // DEACTIVATE
  // =========================================================

  const deactivateCoupon = async (
    coupon: Coupon
  ) => {
    const confirmed =
      window.confirm(
        `Nonaktifkan coupon ${coupon.code}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(coupon.id);

      const response = await fetch(
        `${API_BASE}/admin/coupon/deactivate.php?id=${coupon.id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        result.status !== "success"
      ) {
        throw new Error(
          result.message ||
            "Gagal menonaktifkan coupon"
        );
      }

      await loadCoupons();
    } catch (err: any) {
      console.error(
        "Deactivate Coupon Error:",
        err
      );

      alert(
        err?.message ||
          "Gagal menonaktifkan coupon."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Memuat Admin Coupon...
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#12233f]">
      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside className="hidden lg:flex w-[245px] shrink-0 bg-white border-r border-slate-200 flex-col">

          {/* LOGO */}

          <div className="h-[95px] px-6 flex items-center border-b border-slate-100">
            <img
              src="/logo.png"
              alt="HostingWebID"
              className="w-[175px] h-auto object-contain"
            />
          </div>

          {/* MENU */}

          <nav className="flex-1 p-4">

            <div className="px-3 pt-3 pb-4 text-[11px] font-bold tracking-[0.18em] text-slate-400">
              MENU UTAMA
            </div>

            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <span className="w-6 text-center">
                ⌂
              </span>
              Dashboard
            </Link>

            <Link
              href="/admin/hosting"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <span className="w-6 text-center">
                ▣
              </span>
              Hosting
            </Link>

            <Link
              href="/admin/domain"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <span className="w-6 text-center">
                ◎
              </span>
              Domain
            </Link>

            <Link
              href="/admin/coupon"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-orange-200"
            >
              <span className="w-6 text-center font-bold">
                %
              </span>
              Coupon
            </Link>

            <Link
              href="/admin/user"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <span className="w-6 text-center">
                ♟
              </span>
              User
            </Link>

            <Link
              href="/admin/order"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <span className="w-6 text-center">
                ▣
              </span>
              Pesanan
            </Link>

            <Link
              href="/admin/invoice"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <span className="w-6 text-center">
                ▤
              </span>
              Invoice
            </Link>

            <Link
              href="/admin/payment"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <span className="w-6 text-center">
                ▣
              </span>
              Payment
            </Link>
          </nav>

          {/* BOTTOM */}

          <div className="p-4 border-t border-slate-100">

            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              <span>←</span>
              Dashboard User
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
            >
              <span>↪</span>
              Keluar
            </button>

          </div>
        </aside>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <section className="flex-1 min-w-0">

          {/* HEADER */}

          <header className="h-[95px] bg-white border-b border-slate-200 px-5 md:px-8 flex items-center justify-between">

            <div className="lg:hidden">
              <img
                src="/logo.png"
                alt="HostingWebID"
                className="w-[145px] h-auto"
              />
            </div>

            <div className="hidden lg:block">
              <div className="text-[11px] font-bold tracking-[0.18em] text-orange-500">
                ADMIN PANEL
              </div>

              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Coupon Management
              </h1>
            </div>

            <div className="flex items-center gap-4">

              <button
                type="button"
                className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center"
              >
                ◐
              </button>

              <button
                type="button"
                className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center"
              >
                🔔
              </button>

              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">

                <div className="text-right">
                  <strong className="block text-sm text-slate-900">
                    {user.username ||
                      user.name ||
                      "Administrator"}
                  </strong>

                  <span className="text-xs text-slate-400">
                    {user.role}
                  </span>
                </div>

                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center font-bold">
                  {(
                    user.username ||
                    user.name ||
                    "A"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

              </div>
            </div>
          </header>

          {/* MAIN */}

          <div className="p-5 md:p-8">

            {/* TITLE */}

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

              <div>
                <div className="text-xs font-bold tracking-[0.15em] text-orange-500 mb-2">
                  ADMINISTRATION
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                  Coupon Management
                </h2>

                <p className="text-slate-500 mt-2">
                  Kelola voucher dan promo
                  HostingWebID.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="self-start md:self-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 transition"
              >
                + Tambah Coupon
              </button>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">
                ⚠ {error}
              </div>
            )}

            {/* STATISTICS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

              <StatCard
                title="TOTAL COUPON"
                value={totalCoupons}
                icon="%"
                badge="Database"
              />

              <StatCard
                title="COUPON AKTIF"
                value={activeCoupons}
                icon="✓"
                badge="Aktif"
              />

              <StatCard
                title="COUPON NONAKTIF"
                value={inactiveCoupons}
                icon="!"
                badge="Status"
              />

              <StatCard
                title="TOTAL DIGUNAKAN"
                value={totalUsed}
                icon="↗"
                badge="Usage"
              />

            </div>

            {/* SEARCH */}

            <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm mb-6">

              <div className="flex flex-col md:flex-row gap-3">

                <div className="relative flex-1">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔍
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Cari kode coupon..."
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />

                </div>

                <button
                  type="button"
                  onClick={loadCoupons}
                  className="h-12 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-orange-50 hover:text-orange-600 transition"
                >
                  ↻ Refresh Data
                </button>

              </div>

            </section>

            {/* TABLE */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              <div className="px-5 md:px-6 py-5 border-b border-slate-100 flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Daftar Coupon
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Data coupon langsung dari database.
                  </p>
                </div>

                <span className="px-3 py-2 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold">
                  {filteredCoupons.length} coupon
                </span>

              </div>

              {loadingData ? (

                <div className="py-20 text-center text-slate-400">
                  <div className="text-3xl mb-3">
                    ⏳
                  </div>
                  Memuat data coupon...
                </div>

              ) : filteredCoupons.length === 0 ? (

                <div className="py-20 text-center">

                  <div className="text-5xl mb-4">
                    %
                  </div>

                  <h4 className="font-bold text-slate-700">
                    Belum ada coupon
                  </h4>

                  <p className="text-sm text-slate-400 mt-1">
                    Tambahkan coupon baru untuk
                    mulai membuat promo.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1100px]">

                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">

                        <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                          ID
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                          KODE
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                          DISCOUNT
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                          MIN. PEMBELIAN
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                          DIGUNAKAN
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                          PERIODE
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-bold text-slate-500">
                          STATUS
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-bold text-slate-500">
                          AKSI
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredCoupons.map(
                        (coupon) => {

                          const active =
                            coupon.status?.toLowerCase() ===
                            "active";

                          const usageLimit =
                            coupon.usage_limit ===
                              null ||
                            coupon.usage_limit ===
                              undefined
                              ? "∞"
                              : coupon.usage_limit;

                          return (
                            <tr
                              key={coupon.id}
                              className="border-b border-slate-100 last:border-0 hover:bg-orange-50/30 transition"
                            >

                              {/* ID */}

                              <td className="px-5 py-5 text-sm font-semibold text-slate-500">
                                #{coupon.id}
                              </td>

                              {/* CODE */}

                              <td className="px-5 py-5">

                                <div className="flex items-center gap-3">

                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 text-white flex items-center justify-center font-black">
                                    %
                                  </div>

                                  <div>
                                    <div className="font-black text-slate-900">
                                      {coupon.code}
                                    </div>

                                    <div className="text-xs text-slate-400 mt-0.5">
                                      Coupon ID {coupon.id}
                                    </div>
                                  </div>

                                </div>

                              </td>

                              {/* DISCOUNT */}

                              <td className="px-5 py-5">

                                <span className="inline-flex px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 font-bold text-sm">
                                  {formatDiscount(
                                    coupon
                                  )}
                                </span>

                                <div className="text-xs text-slate-400 mt-1">
                                  {coupon.discount_type ===
                                  "percentage"
                                    ? "Percentage"
                                    : "Nominal"}
                                </div>

                              </td>

                              {/* MIN PURCHASE */}

                              <td className="px-5 py-5 text-sm text-slate-700">
                                {rupiah(
                                  coupon.min_purchase
                                )}

                                {coupon.max_discount !==
                                  null &&
                                  coupon.max_discount !==
                                    undefined && (
                                    <div className="text-xs text-slate-400 mt-1">
                                      Maks.{" "}
                                      {rupiah(
                                        coupon.max_discount
                                      )}
                                    </div>
                                  )}
                              </td>

                              {/* USED */}

                              <td className="px-5 py-5">

                                <div className="text-sm font-bold text-slate-800">
                                  {coupon.used_count ||
                                    0}{" "}
                                  /{" "}
                                  {usageLimit}
                                </div>

                                {coupon.usage_limit && (
                                  <div className="mt-2 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          (Number(
                                            coupon.used_count ||
                                              0
                                          ) /
                                            Number(
                                              coupon.usage_limit
                                            )) *
                                            100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                )}

                              </td>

                              {/* PERIODE */}

                              <td className="px-5 py-5 text-sm text-slate-600">

                                <div>
                                  {formatDate(
                                    coupon.start_date
                                  )}
                                </div>

                                <div className="text-xs text-slate-400 my-1">
                                  sampai
                                </div>

                                <div>
                                  {formatDate(
                                    coupon.end_date
                                  )}
                                </div>

                              </td>

                              {/* STATUS */}

                              <td className="px-5 py-5">

                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                    active
                                      ? "bg-green-50 text-green-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      active
                                        ? "bg-green-500"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  {active
                                    ? "AKTIF"
                                    : "NONAKTIF"}
                                </span>

                              </td>

                              {/* ACTION */}

                              <td className="px-5 py-5">

                                <div className="flex justify-end gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEdit(
                                        coupon
                                      )
                                    }
                                    className="px-3.5 py-2 rounded-lg bg-orange-50 text-orange-600 text-sm font-bold hover:bg-orange-100 transition"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      actionLoading ===
                                      coupon.id
                                    }
                                    onClick={() =>
                                      toggleStatus(
                                        coupon
                                      )
                                    }
                                    className="px-3.5 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition disabled:opacity-50"
                                  >
                                    {actionLoading ===
                                    coupon.id
                                      ? "..."
                                      : active
                                      ? "Nonaktif"
                                      : "Aktifkan"}
                                  </button>

                                  {active && (
                                    <button
                                      type="button"
                                      disabled={
                                        actionLoading ===
                                        coupon.id
                                      }
                                      onClick={() =>
                                        deactivateCoupon(
                                          coupon
                                        )
                                      }
                                      className="px-3.5 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition disabled:opacity-50"
                                    >
                                      Matikan
                                    </button>
                                  )}

                                </div>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </div>
        </section>
      </div>

      {/* =====================================================
          MODAL CREATE / EDIT
      ====================================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between z-10">

              <div>
                <div className="text-xs font-bold tracking-[0.15em] text-orange-500">
                  COUPON
                </div>

                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {modalMode ===
                  "create"
                    ? "Tambah Coupon"
                    : "Edit Coupon"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(false)
                }
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* CODE */}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Kode Coupon
                </label>

                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Contoh: DISKON20"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 uppercase"
                  required
                />
              </div>

              {/* TYPE + VALUE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Jenis Discount
                  </label>

                  <select
                    name="discount_type"
                    value={
                      form.discount_type
                    }
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-orange-400"
                  >
                    <option value="percentage">
                      Percentage (%)
                    </option>

                    <option value="fixed">
                      Nominal (Rp)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nilai Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="discount_value"
                    value={
                      form.discount_value
                    }
                    onChange={handleChange}
                    placeholder={
                      form.discount_type ===
                      "percentage"
                        ? "20"
                        : "50000"
                    }
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400"
                    required
                  />
                </div>

              </div>

              {/* MIN + MAX */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Minimum Pembelian
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="min_purchase"
                    value={
                      form.min_purchase
                    }
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Maksimum Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="max_discount"
                    value={
                      form.max_discount
                    }
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak ada"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400"
                  />
                </div>

              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mulai
                  </label>

                  <input
                    type="date"
                    name="start_date"
                    value={
                      form.start_date
                    }
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Berakhir
                  </label>

                  <input
                    type="date"
                    name="end_date"
                    value={
                      form.end_date
                    }
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400"
                  />
                </div>

              </div>

              {/* LIMIT + STATUS */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Batas Penggunaan
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="usage_limit"
                    value={
                      form.usage_limit
                    }
                    onChange={handleChange}
                    placeholder="Kosongkan = tanpa batas"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-orange-400"
                  >
                    <option value="active">
                      Aktif
                    </option>

                    <option value="inactive">
                      Nonaktif
                    </option>
                  </select>
                </div>

              </div>

              {/* BUTTON */}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() =>
                    setModalOpen(false)
                  }
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg shadow-orange-200 disabled:opacity-50"
                >
                  {saving
                    ? "Menyimpan..."
                    : modalMode ===
                      "create"
                    ? "Simpan Coupon"
                    : "Update Coupon"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  icon,
  badge,
}: {
  title: string;
  value: number;
  icon: string;
  badge: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

      <div className="flex items-center justify-between mb-6">

        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 text-orange-600 flex items-center justify-center font-black text-lg">
          {icon}
        </div>

        <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
          {badge}
        </span>

      </div>

      <div className="text-xs font-bold tracking-[0.12em] text-slate-500">
        {title}
      </div>

      <div className="text-3xl font-black text-slate-900 mt-2">
        {value}
      </div>

    </div>
  );
}