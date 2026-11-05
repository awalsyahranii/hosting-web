"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "../components/AdminSidebar";

type User = {
  id: number;
  username: string;
  email: string;
  role: "super_admin" | "admin" | "user" | string;
  created_at?: string;
  updated_at?: string;
};

type ApiResponse = {
  status: string;
  code: number;
  message: string;
  data?: {
    users?: User[];
    total?: number;
    user?: User;
  };
};

const USER_API = "/api/backend/admin/user";

export default function AdminUserPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id?: number; name?: string; email?: string; role?: string } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" as "super_admin" | "admin" | "user" | string,
  });

  const [showPassword, setShowPassword] = useState(false);

  // =====================================================
  // AUTH & ROLE CHECK
  // =====================================================
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hostingwebid_user");
      if (saved) {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        const isSuper = u?.role === "super_admin" || u?.role === "superadmin";
        setIsSuperAdmin(isSuper);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setAuthChecked(true);
    }
  }, [router]);

  // =====================================================
  // DARK MODE
  // =====================================================
  useEffect(() => {
    const savedTheme = localStorage.getItem("hostingweb_admin_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hostingweb_admin_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // =====================================================
  // LOAD USERS (NO DUMMY DATA)
  // =====================================================
  const loadUsers = async (keyword = "") => {
    try {
      setLoading(true);
      setError("");

      const url =
        keyword.trim() !== ""
          ? `${USER_API}/index.php?search=${encodeURIComponent(keyword.trim())}`
          : `${USER_API}/index.php`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Gagal mengambil data user dari database");
      }

      setUsers(result.data?.users || []);
    } catch (err) {
      console.error("Load users error:", err);
      setError(
        err instanceof Error ? err.message : "Tidak dapat mengambil data user dari server."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) {
      loadUsers();
    }
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked) return;
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search, authChecked]);

  // =====================================================
  // STATISTICS
  // =====================================================
  const totalUsers = users.length;

  const totalSuperAdmin = useMemo(
    () => users.filter((u) => u.role === "super_admin" || u.role === "superadmin").length,
    [users]
  );

  const totalAdmin = useMemo(
    () => users.filter((u) => u.role === "admin").length,
    [users]
  );

  const totalRegularUser = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === "user" ||
          (!u.role || (u.role !== "admin" && u.role !== "super_admin" && u.role !== "superadmin"))
      ).length,
    [users]
  );

  // =====================================================
  // FILTERED USERS
  // =====================================================
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter === "all") return true;
      if (roleFilter === "super_admin") return u.role === "super_admin" || u.role === "superadmin";
      if (roleFilter === "admin") return u.role === "admin";
      if (roleFilter === "user")
        return (
          u.role === "user" ||
          (!u.role || (u.role !== "admin" && u.role !== "super_admin" && u.role !== "superadmin"))
        );
      return true;
    });
  }, [users, roleFilter]);

  // =====================================================
  // OPEN CREATE / EDIT MODAL
  // =====================================================
  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);
    setShowPassword(false);
    setForm({
      username: "",
      email: "",
      password: "",
      role: "user",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setShowPassword(false);
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role || "user",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // CREATE USER
  // =====================================================
  const createUser = async () => {
    if (!form.username.trim()) {
      alert("Username wajib diisi.");
      return;
    }

    if (!form.email.trim()) {
      alert("Email wajib diisi.");
      return;
    }

    if (!form.password || form.password.length < 6) {
      alert("Password wajib diisi minimal 6 karakter.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${USER_API}/create.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Gagal membuat user.");
      }

      showToast(`User "${form.username}" berhasil dibuat sebagai ${form.role}.`);
      setShowModal(false);
      await loadUsers(search);
    } catch (err) {
      console.error("Create user error:", err);
      alert(err instanceof Error ? err.message : "Gagal membuat user.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UPDATE USER
  // =====================================================
  const updateUser = async () => {
    if (!selectedUser) return;

    if (!form.username.trim()) {
      alert("Username wajib diisi.");
      return;
    }

    if (!form.email.trim()) {
      alert("Email wajib diisi.");
      return;
    }

    if (form.password && form.password.length < 6) {
      alert("Password baru minimal 6 karakter jika ingin diubah.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${USER_API}/update.php?id=${selectedUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password || undefined,
          role: form.role,
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Gagal memperbarui user.");
      }

      showToast(`User "${form.username}" berhasil diperbarui.`);
      setShowModal(false);
      await loadUsers(search);
    } catch (err) {
      console.error("Update user error:", err);
      alert(err instanceof Error ? err.message : "Gagal memperbarui user.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE USER (SUPER ADMIN PROTECTED)
  // =====================================================
  const deleteUser = async (user: User) => {
    // Protect self-deletion
    if (
      currentUser?.email?.toLowerCase() === user.email.toLowerCase() ||
      (currentUser?.id && Number(currentUser.id) === Number(user.id))
    ) {
      alert("⚠️ Anda tidak dapat menghapus akun Super Admin milik Anda sendiri!");
      return;
    }

    const isSuperAdminAccount = user.role === "super_admin" || user.role === "superadmin";
    const confirmMessage = isSuperAdminAccount
      ? `PERINGATAN SUPER ADMIN:\nAnda akan menghapus akun dengan hak akses Super Admin: "${user.username}" (${user.email}).\n\nLanjutkan penghapusan permanen?`
      : `Apakah Anda yakin ingin menghapus akun user "${user.username}" (${user.email}) dari database?`;

    const confirmation = window.confirm(confirmMessage);
    if (!confirmation) return;

    try {
      setSaving(true);

      const response = await fetch(`${USER_API}/delete.php?id=${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Gagal menghapus user.");
      }

      showToast(`Akun "${user.username}" berhasil dihapus permanen.`);
      await loadUsers(search);
    } catch (err) {
      console.error("Delete user error:", err);
      alert(err instanceof Error ? err.message : "Gagal menghapus user.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SUPER ADMIN IMPERSONATION (MASUK DASHBOARD USER)
  // =====================================================
  const handleDirectImpersonate = (user: User) => {
    if (
      !confirm(
        `[Super Admin Controller]\nApakah Anda ingin masuk ke dashboard sebagai "${user.username}" (${user.email}) untuk memeriksa layanannya?`
      )
    ) {
      return;
    }

    const tempImpersonateUser = {
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role,
      impersonatedBy: currentUser?.name || "superadmin",
    };

    localStorage.setItem("hostingwebid_user", JSON.stringify(tempImpersonateUser));
    localStorage.setItem(
      "hostingweb_auth",
      JSON.stringify({
        loggedIn: true,
        email: user.email,
        impersonated: true,
      })
    );

    window.location.href = "/dashboard";
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================
  const formatDate = (date?: string) => {
    if (!date) return "-";
    const parsed = new Date(date.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }
    return parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-[#0f172a] text-white transition-colors duration-300 flex"
          : "min-h-screen bg-[#f8fafc] text-slate-900 transition-colors duration-300 flex"
      }
    >
      <AdminSidebar currentPath="/admin/user" darkMode={darkMode} />
      <div className="flex-1 min-w-0 ml-0 md:ml-[190px] lg:ml-[275px] pb-24 md:pb-10 transition-all duration-300">
        {/* =================================================
            TOP NAVBAR
        ================================================= */}
        <header
          className={
            darkMode
              ? "sticky top-0 z-40 border-b border-slate-700 bg-[#111827]/95 backdrop-blur"
              : "sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"
          }
        >
          <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6">
            {/* LOGO & TITLE */}
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <img
                  src="/logo.png"
                  alt="HostingWebID"
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <div className="hidden sm:block pl-3 border-l border-slate-200 dark:border-slate-700">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
                  SUPER ADMIN CONTROL
                </span>
              </div>
            </div>

            {/* RIGHT PROFILE */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                className={
                  darkMode
                    ? "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-yellow-300 transition hover:bg-slate-700"
                    : "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                }
                title={darkMode ? "Mode terang" : "Mode gelap"}
              >
                {darkMode ? "☀" : "☾"}
              </button>

              <div
                className={
                  darkMode
                    ? "hidden h-9 w-px bg-slate-700 md:block"
                    : "hidden h-9 w-px bg-slate-200 md:block"
                }
              />

              <div className="hidden text-right md:block">
                <div className="text-sm font-bold">
                  {currentUser?.name || "Super Administrator"}
                </div>
                <div
                  className={
                    darkMode ? "text-xs text-amber-400 font-semibold" : "text-xs text-amber-600 font-semibold"
                  }
                >
                  {currentUser?.role === "super_admin" || currentUser?.role === "superadmin"
                    ? "Super Admin (Full Access)"
                    : "Administrator"}
                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 font-black text-white shadow-md">
                {(currentUser?.name || "S").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="fixed top-24 right-8 z-50 animate-bounce rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-white shadow-xl text-sm font-bold flex items-center gap-2">
            <span>✓</span> {toastMessage}
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}
        <main className="mx-auto max-w-[1500px] px-6 py-8">
          {/* HEADER BANNER */}
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div
                className={
                  darkMode
                    ? "mb-2 text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5"
                    : "mb-2 text-xs font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5"
                }
              >
                MASTER USER &amp; ADMIN MANAGEMENT
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Manajemen User &amp; Admin
              </h1>

              <p className={darkMode ? "mt-2 text-slate-400" : "mt-2 text-slate-500"}>
                Kelola hak akses, buat akun baru, edit role, ganti password, dan pantau seluruh pengguna aktif secara langsung dari database.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-600 hover:to-red-600 active:scale-[0.98] flex items-center gap-2"
            >
              <span className="text-lg font-black">+</span> Tambah User / Admin Baru
            </button>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              darkMode={darkMode}
              title="TOTAL SEMUA PENGGUNA"
              value={totalUsers}
              icon="users"
              subtitle="Tersimpan di database"
            />
            <StatCard
              darkMode={darkMode}
              title="SUPER ADMIN"
              value={totalSuperAdmin}
              icon="crown"
              subtitle="Hak akses penuh master"
            />
            <StatCard
              darkMode={darkMode}
              title="ADMIN OPERASIONAL"
              value={totalAdmin}
              icon="shield"
              subtitle="Pengelola sistem harian"
            />
            <StatCard
              darkMode={darkMode}
              title="USER / KLIEN"
              value={totalRegularUser}
              icon="user"
              subtitle="Pelanggan & pemilik akun"
            />
          </div>

          {/* =================================================
              TOOLBAR & TABS
          ================================================= */}
          <div
            className={
              darkMode
                ? "mb-5 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 space-y-3"
                : "mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
            }
          >
            {/* ROLE TABS */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: "all", label: "Semua Akun", count: totalUsers },
                  { key: "super_admin", label: "Super Admin", count: totalSuperAdmin },
                  { key: "admin", label: "Admin", count: totalAdmin },
                  { key: "user", label: "Regular User", count: totalRegularUser },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRoleFilter(tab.key)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      roleFilter === tab.key
                        ? darkMode
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                        : darkMode
                        ? "bg-slate-700/60 text-slate-300 hover:bg-slate-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                        roleFilter === tab.key
                          ? "bg-white/30 text-white"
                          : darkMode
                          ? "bg-slate-800 text-slate-400"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* REFRESH */}
              <button
                type="button"
                disabled={loading}
                onClick={() => loadUsers(search)}
                className={
                  darkMode
                    ? "rounded-xl border border-slate-600 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    : "rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                }
              >
                {loading ? "Memuat..." : "↻ Refresh Real-Time"}
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan username, email, ID, atau keyword..."
                className={
                  darkMode
                    ? "w-full rounded-xl border border-slate-600 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm"
                    : "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 text-sm"
                }
              />
            </div>
          </div>

          {/* =================================================
              ERROR DISPLAY
          ================================================= */}
          {error && (
            <div
              className={
                darkMode
                  ? "mb-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300 flex items-center justify-between"
                  : "mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between"
              }
            >
              <div>
                <div className="font-bold text-sm">Gagal Mengambil Data Database</div>
                <div className="mt-0.5 text-xs opacity-90">{error}</div>
              </div>
              <button
                type="button"
                onClick={() => loadUsers(search)}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* =================================================
              TABLE LIST
          ================================================= */}
          <div
            className={
              darkMode
                ? "overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 shadow-lg"
                : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            }
          >
            <div
              className={
                darkMode
                  ? "border-b border-slate-700 px-6 py-5 flex items-center justify-between"
                  : "border-b border-slate-200 px-6 py-5 flex items-center justify-between"
              }
            >
              <div>
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <span>Daftar Akun Pengguna</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                    Live Database
                  </span>
                </h2>
                <p className={darkMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>
                  Menampilkan {filteredUsers.length} dari total {users.length} akun terdaftar.
                </p>
              </div>

              <div
                className={
                  darkMode
                    ? "rounded-xl bg-slate-700/80 px-3 py-1.5 text-xs font-bold text-slate-200"
                    : "rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600"
                }
              >
                {filteredUsers.length} Data Terpilih
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-300 border-t-orange-500" />
                <p className={darkMode ? "text-slate-400 text-sm" : "text-slate-500 text-sm"}>
                  Memuat data user secara live dari database...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400"><svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                <h3 className="font-bold text-base">Tidak Ada User yang Sesuai</h3>
                <p className={darkMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>
                  {search ? `Tidak ditemukan data dengan kata kunci "${search}".` : "Belum ada akun terdaftar pada filter ini."}
                </p>
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setRoleFilter("all");
                    }}
                    className="mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                  >
                    Reset Filter Pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead
                    className={
                      darkMode
                        ? "bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-700"
                        : "bg-slate-50 text-xs uppercase font-extrabold text-slate-500 border-b border-slate-200"
                    }
                  >
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Pengguna / Username</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role Akun</th>
                      <th className="px-6 py-4">Tgl Registrasi</th>
                      <th className="px-6 py-4 text-right">Opsi Super Admin</th>
                    </tr>
                  </thead>

                  <tbody
                    className={
                      darkMode ? "divide-y divide-slate-700/80" : "divide-y divide-slate-100"
                    }
                  >
                    {filteredUsers.map((user) => {
                      const isSuper = user.role === "super_admin" || user.role === "superadmin";
                      const isAdmin = user.role === "admin";
                      const isSelf = Boolean(
                        (currentUser?.email && currentUser.email.toLowerCase() === user.email.toLowerCase()) ||
                        (currentUser?.id && Number(currentUser.id) === Number(user.id))
                      );

                      return (
                        <tr
                          key={user.id}
                          className={
                            darkMode
                              ? "transition hover:bg-slate-700/30"
                              : "transition hover:bg-slate-50/80"
                          }
                        >
                          {/* ID */}
                          <td className="px-6 py-4">
                            <span
                              className={
                                darkMode
                                  ? "font-mono text-xs font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded"
                                  : "font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded"
                              }
                            >
                              #{user.id}
                            </span>
                          </td>

                          {/* USERNAME */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm shadow-sm ${
                                  isSuper
                                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                                    : isAdmin
                                    ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {user.username.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <div className="font-bold text-sm flex items-center gap-1.5">
                                  <span>{user.username}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[9px] font-black uppercase">
                                      Anda
                                    </span>
                                  )}
                                </div>
                                <div className={darkMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                                  ID Akun #{user.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* EMAIL */}
                          <td className="px-6 py-4">
                            <span className={darkMode ? "text-sm text-slate-300 font-mono" : "text-sm text-slate-700 font-mono"}>
                              {user.email}
                            </span>
                          </td>

                          {/* ROLE BADGE */}
                          <td className="px-6 py-4">
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-black text-white shadow-sm">
                                SUPER ADMIN
                              </span>
                            ) : isAdmin ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-1 text-xs font-bold">
                                ADMIN
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-xs font-bold">
                                USER / KLIEN
                              </span>
                            )}
                          </td>

                          {/* CREATED AT */}
                          <td className="px-6 py-4">
                            <span className={darkMode ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                              {formatDate(user.created_at)}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-6 py-4">
                            <div className="flex justify-end items-center gap-2">
                              {/* IMPERSONATE (MASUK DASHBOARD) */}
                              {!isSuper && (
                                <button
                                  type="button"
                                  title="Masuk dan kontrol dashboard dari sudut pandang user ini"
                                  onClick={() => handleDirectImpersonate(user)}
                                  className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition flex items-center gap-1 shadow-sm"
                                >
                                  Masuk Akun
                                </button>
                              )}

                              {/* EDIT */}
                              <button
                                type="button"
                                onClick={() => openEditModal(user)}
                                className={
                                  darkMode
                                    ? "rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-1.5 text-xs font-bold text-slate-200 transition"
                                    : "rounded-lg bg-orange-50 hover:bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-600 transition"
                                }
                              >
                                Edit Role / Data
                              </button>

                              {/* DELETE */}
                              <button
                                type="button"
                                disabled={saving || isSelf}
                                onClick={() => deleteUser(user)}
                                title={isSelf ? "Tidak dapat menghapus akun Anda sendiri" : "Hapus user permanen"}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                  isSelf
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                    : "bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900"
                                }`}
                              >
                                Hapus
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
          </div>
        </main>

        {/* =================================================
            MODAL CREATE / EDIT
        ================================================= */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
            <div
              className={
                darkMode
                  ? "w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
                  : "w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
              }
            >
              {/* HEADER */}
              <div className="mb-6 flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <span>{modalMode === "create" ? "➕ Tambah User / Admin Baru" : "✏️ Edit Akun & Role"}</span>
                  </h2>
                  <p className={darkMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>
                    {modalMode === "create"
                      ? "Akun baru akan langsung aktif dan tersimpan ke database."
                      : `Mengubah data akun untuk "${selectedUser?.username}" (ID: #${selectedUser?.id}).`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className={
                    darkMode
                      ? "rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                      : "rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }
                >
                  ✕
                </button>
              </div>

              {/* FORM */}
              <div className="space-y-4">
                {/* USERNAME */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => handleFormChange("username", e.target.value)}
                    placeholder="Contoh: jono_hosting"
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                    }
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="nama@email.com"
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                    }
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Password
                      {modalMode === "edit" && (
                        <span className="ml-2 lowercase font-normal text-slate-400 text-[11px]">
                          (Kosongkan jika tidak diganti)
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      {showPassword ? "Sembunyikan" : "Tampilkan"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => handleFormChange("password", e.target.value)}
                    placeholder={modalMode === "create" ? "Minimal 6 karakter" : "Masukkan password baru"}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                    }
                  />
                </div>

                {/* ROLE SELECTION */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Role &amp; Hak Akses
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => handleFormChange("role", e.target.value)}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-bold"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 font-bold text-slate-800"
                    }
                  >
                    <option value="user">User / Klien (Akses Dashboard Klien Biasa)</option>
                    <option value="admin">Admin (Akses Panel Operasional &amp; Transaksi)</option>
                    <option value="super_admin">Super Admin (Akses Penuh Master &amp; Kelola Akun)</option>
                  </select>
                  <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    {form.role === "super_admin" && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Super Admin dapat menambah, mengedit, dan menghapus semua admin serta user.
                      </span>
                    )}
                    {form.role === "admin" && (
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        Admin dapat mengelola layanan hosting, invoice, konfirmasi pembayaran, dan kupon.
                      </span>
                    )}
                    {form.role === "user" && (
                      <span>
                        User hanya dapat mengakses dashboard pelanggan miliknya sendiri untuk order dan kelola layanan.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className={
                    darkMode
                      ? "rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
                      : "rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  }
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={modalMode === "create" ? createUser : updateUser}
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:from-orange-600 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Menyimpan ke Database..."
                    : modalMode === "create"
                    ? "✓ Simpan User Baru"
                    : "✓ Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// STAT CARD COMPONENT
// =========================================================
function StatCard({
  title,
  value,
  icon,
  subtitle,
  darkMode,
}: {
  title: string;
  value: number;
  icon: string;
  subtitle?: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={
        darkMode
          ? "rounded-2xl border border-slate-700 bg-slate-800/60 p-5 transition hover:border-slate-600"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
      }
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={
              darkMode
                ? "text-xs font-bold tracking-wider text-slate-400"
                : "text-xs font-bold tracking-wider text-slate-500"
            }
          >
            {title}
          </div>

          <div className="mt-2 text-3xl font-black">{value}</div>

          {subtitle && (
            <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {subtitle}
            </div>
          )}
        </div>

        <div
          className={
            darkMode
              ? "flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-xl"
              : "flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl"
          }
        >
          {icon}
        </div>
      </div>
    </div>
  );
}