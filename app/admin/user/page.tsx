"use client";

import { useEffect, useMemo, useState } from "react";

type User = {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
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

const USER_API =
  "http://localhost/hosting_webid/api/v1/admin/user";

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
  });

  // =====================================================
  // DARK MODE
  // =====================================================

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      "hostingweb_admin_theme"
    );

    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "hostingweb_admin_theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // =====================================================
  // LOAD USERS
  // =====================================================

  const loadUsers = async (keyword = "") => {
    try {
      setLoading(true);
      setError("");

      const url =
        keyword.trim() !== ""
          ? `${USER_API}/index.php?search=${encodeURIComponent(
              keyword.trim()
            )}`
          : `${USER_API}/index.php`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message || "Gagal mengambil data user"
        );
      }

      setUsers(result.data?.users || []);
    } catch (err) {
      console.error("Load users error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Tidak dapat mengambil data user."
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadUsers();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalUsers = users.length;

  const totalAdmin = useMemo(
    () =>
      users.filter(
        (user) => user.role === "admin"
      ).length,
    [users]
  );

  const totalRegularUser = useMemo(
    () =>
      users.filter(
        (user) => user.role === "user"
      ).length,
    [users]
  );

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUser(null);

    setForm({
      username: "",
      email: "",
      password: "",
      role: "user",
    });

    setError("");
    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);

    setForm({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
    });

    setError("");
    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedUser(null);
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleFormChange = (
    field: keyof typeof form,
    value: string
  ) => {
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

    if (!form.password) {
      alert("Password wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${USER_API}/create.php`,
        {
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
        }
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message ||
            "Gagal membuat user."
        );
      }

      alert("User berhasil dibuat.");

      setShowModal(false);

      await loadUsers(search);
    } catch (err) {
      console.error("Create user error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Gagal membuat user."
      );
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

    try {
      setSaving(true);

      const response = await fetch(
        `${USER_API}/update.php?id=${selectedUser.id}`,
        {
          method: "PUT",
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
        }
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message ||
            "Gagal memperbarui user."
        );
      }

      alert("User berhasil diperbarui.");

      setShowModal(false);

      await loadUsers(search);
    } catch (err) {
      console.error("Update user error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui user."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const deleteUser = async (user: User) => {
    const confirmation = window.confirm(
      `Apakah kamu yakin ingin menghapus user "${user.username}"?`
    );

    if (!confirmation) return;

    try {
      setSaving(true);

      const response = await fetch(
        `${USER_API}/delete.php?id=${user.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(
          result.message ||
            "Gagal menghapus user."
        );
      }

      alert("User berhasil dihapus.");

      await loadUsers(search);
    } catch (err) {
      console.error("Delete user error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Gagal menghapus user."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsed = new Date(
      date.replace(" ", "T")
    );

    if (Number.isNaN(parsed.getTime())) {
      return date;
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

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-[#0f172a] text-white transition-colors duration-300"
          : "min-h-screen bg-[#f8fafc] text-slate-900 transition-colors duration-300"
      }
    >
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

            {/* LOGO */}
            <div className="flex items-center">
            <img
                src="/logo.png"
                alt="HostingWebID"
                className="h-14 w-auto object-contain"
            />
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

            <button
                type="button"
                onClick={() =>
                setDarkMode((prev) => !prev)
                }
                className={
                darkMode
                    ? "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-yellow-300 transition hover:bg-slate-700"
                    : "flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                }
                title={
                darkMode
                    ? "Mode terang"
                    : "Mode gelap"
                }
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
                Administrator
                </div>

                <div
                className={
                    darkMode
                    ? "text-xs text-slate-400"
                    : "text-xs text-slate-500"
                }
                >
                Admin
                </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 font-bold text-white shadow-sm">
                A
            </div>

            </div>
        </div>
        </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="mx-auto max-w-[1500px] px-6 py-8">
        {/* TITLE */}

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div
              className={
                darkMode
                  ? "mb-2 text-sm font-semibold text-orange-400"
                  : "mb-2 text-sm font-semibold text-orange-600"
              }
            >
              ADMINISTRATION
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              User Management
            </h1>

            <p
              className={
                darkMode
                  ? "mt-2 text-slate-400"
                  : "mt-2 text-slate-500"
              }
            >
              Kelola seluruh akun pengguna
              HostingWebID.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:from-red-600 hover:to-orange-600 active:scale-[0.98]"
          >
            + Tambah User
          </button>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            darkMode={darkMode}
            title="TOTAL USER"
            value={totalUsers}
            icon="👥"
          />

          <StatCard
            darkMode={darkMode}
            title="ADMIN"
            value={totalAdmin}
            icon="🛡"
          />

          <StatCard
            darkMode={darkMode}
            title="USER"
            value={totalRegularUser}
            icon="👤"
          />

          <StatCard
            darkMode={darkMode}
            title="HASIL PENCARIAN"
            value={users.length}
            icon="🔎"
          />
        </div>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div
          className={
            darkMode
              ? "mb-5 rounded-2xl border border-slate-700 bg-slate-800/60 p-4"
              : "mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          }
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cari username, email, atau role..."
                className={
                  darkMode
                    ? "w-full rounded-xl border border-slate-600 bg-slate-900 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    : "w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                }
              />
            </div>

            {/* REFRESH */}

            <button
              type="button"
              disabled={loading}
              onClick={() => loadUsers(search)}
              className={
                darkMode
                  ? "rounded-xl border border-slate-600 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  : "rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              }
            >
              {loading
                ? "Memuat..."
                : "↻ Refresh Data"}
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className={
              darkMode
                ? "mb-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300"
                : "mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            }
          >
            <div className="font-bold">
              Gagal mengambil data
            </div>

            <div className="mt-1 text-sm">
              {error}
            </div>

            <button
              type="button"
              onClick={() => loadUsers(search)}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div
          className={
            darkMode
              ? "overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60"
              : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          }
        >
          <div
            className={
              darkMode
                ? "border-b border-slate-700 px-6 py-5"
                : "border-b border-slate-200 px-6 py-5"
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">
                  Daftar User
                </h2>

                <p
                  className={
                    darkMode
                      ? "mt-1 text-sm text-slate-400"
                      : "mt-1 text-sm text-slate-500"
                  }
                >
                  Data diambil langsung dari
                  database.
                </p>
              </div>

              <div
                className={
                  darkMode
                    ? "rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-bold text-slate-200"
                    : "rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600"
                }
              >
                {users.length} user
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-orange-500" />

              <p
                className={
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }
              >
                Memuat data user...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mb-3 text-5xl">
                🔎
              </div>

              <h3 className="font-bold">
                User tidak ditemukan
              </h3>

              <p
                className={
                  darkMode
                    ? "mt-1 text-sm text-slate-400"
                    : "mt-1 text-sm text-slate-500"
                }
              >
                Tidak ada data yang cocok
                dengan pencarian.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead
                  className={
                    darkMode
                      ? "bg-slate-900/60 text-xs uppercase text-slate-400"
                      : "bg-slate-50 text-xs uppercase text-slate-500"
                  }
                >
                  <tr>
                    <th className="px-6 py-4">
                      ID
                    </th>

                    <th className="px-6 py-4">
                      Username
                    </th>

                    <th className="px-6 py-4">
                      Email
                    </th>

                    <th className="px-6 py-4">
                      Role
                    </th>

                    <th className="px-6 py-4">
                      Dibuat
                    </th>

                    <th className="px-6 py-4 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody
                  className={
                    darkMode
                      ? "divide-y divide-slate-700"
                      : "divide-y divide-slate-100"
                  }
                >
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={
                        darkMode
                          ? "transition hover:bg-slate-700/30"
                          : "transition hover:bg-slate-50"
                      }
                    >
                      <td className="px-6 py-5">
                        <span
                          className={
                            darkMode
                              ? "font-mono text-sm text-slate-300"
                              : "font-mono text-sm text-slate-600"
                          }
                        >
                          #{user.id}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100 font-bold text-orange-600">
                            {user.username
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div className="font-bold">
                              {user.username}
                            </div>

                            <div
                              className={
                                darkMode
                                  ? "text-xs text-slate-500"
                                  : "text-xs text-slate-400"
                              }
                            >
                              User ID {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={
                            darkMode
                              ? "text-slate-300"
                              : "text-slate-600"
                          }
                        >
                          {user.email}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {user.role === "admin" ? (
                          <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                            USER
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={
                            darkMode
                              ? "text-sm text-slate-400"
                              : "text-sm text-slate-500"
                          }
                        >
                          {formatDate(
                            user.created_at
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(user)
                            }
                            className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-orange-600 transition hover:bg-orange-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              deleteUser(user)
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className={
              darkMode
                ? "w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
                : "w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            }
          >
            {/* HEADER */}

            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black">
                  {modalMode === "create"
                    ? "Tambah User"
                    : "Edit User"}
                </h2>

                <p
                  className={
                    darkMode
                      ? "mt-1 text-sm text-slate-400"
                      : "mt-1 text-sm text-slate-500"
                  }
                >
                  {modalMode === "create"
                    ? "Buat akun pengguna baru."
                    : "Perbarui data pengguna."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className={
                  darkMode
                    ? "rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }
              >
                ✕
              </button>
            </div>

            {/* FORM */}

            <div className="space-y-4">
              {/* USERNAME */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Username
                </label>

                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    handleFormChange(
                      "username",
                      e.target.value
                    )
                  }
                  placeholder="Masukkan username"
                  className={
                    darkMode
                      ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  }
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    handleFormChange(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="nama@email.com"
                  className={
                    darkMode
                      ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  }
                />
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Password
                  {modalMode === "edit" && (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      Kosongkan jika tidak diubah
                    </span>
                  )}
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    handleFormChange(
                      "password",
                      e.target.value
                    )
                  }
                  placeholder={
                    modalMode === "create"
                      ? "Minimal 6 karakter"
                      : "Password baru"
                  }
                  className={
                    darkMode
                      ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  }
                />
              </div>

              {/* ROLE */}

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Role
                </label>

                <select
                  value={form.role}
                  onChange={(e) =>
                    handleFormChange(
                      "role",
                      e.target.value
                    )
                  }
                  className={
                    darkMode
                      ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      : "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  }
                >
                  <option value="user">
                    User
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>
            </div>

            {/* FOOTER */}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                className={
                  darkMode
                    ? "rounded-xl border border-slate-700 px-5 py-3 font-bold text-slate-300 transition hover:bg-slate-800"
                    : "rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
                }
              >
                Batal
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={
                  modalMode === "create"
                    ? createUser
                    : updateUser
                }
                className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-5 py-3 font-bold text-white shadow-md shadow-orange-500/20 transition hover:from-red-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Menyimpan..."
                  : modalMode === "create"
                  ? "Tambah User"
                  : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  icon,
  darkMode,
}: {
  title: string;
  value: number;
  icon: string;
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

          <div className="mt-2 text-3xl font-black">
            {value}
          </div>
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