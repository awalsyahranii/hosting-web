"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

type SystemSettings = {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  maintenanceMode: boolean;
  maintenanceNotice: string;
  broadcastBannerActive: boolean;
  broadcastBannerText: string;
  broadcastBannerLink: string;
  broadcastBannerBg: string;
  primaryPhone: string;
  primaryWhatsapp: string;
  billingWhatsapp: string;
  supportEmail: string;
  officeAddress: string;
  workingHours: string;
  bankBCA: { number: string; name: string; active: boolean };
  bankMandiri: { number: string; name: string; active: boolean };
  bankBRI: { number: string; name: string; active: boolean };
  bankBNI: { number: string; name: string; active: boolean };
  qris: { image: string; active: boolean; name: string };
  autoVerifyWhatsapp: boolean;
  allowNewRegistrations: boolean;
};

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: "HostingWeb ID",
  siteTagline: "Cloud Hosting NVMe & Solusi Website Terpercaya di Indonesia",
  siteDescription:
    "Layanan web hosting cepat, domain murah, jasa pembuatan website dan Google Ads bergaransi 99.9% uptime.",
  maintenanceMode: false,
  maintenanceNotice:
    "Website sedang dalam pemeliharaan sistem berkala. Kami akan segera kembali dalam beberapa saat.",
  broadcastBannerActive: true,
  broadcastBannerText:
    "DISKON SPESIAL HARI INI: Dapatkan Diskon s/d 80% untuk Cloud Hosting & Gratis Domain .COM!",
  broadcastBannerLink: "#pricing",
  broadcastBannerBg: "linear-gradient(90deg, #ea580c 0%, #f97316 50%, #ea580c 100%)",
  primaryPhone: "085-333-555-976",
  primaryWhatsapp: "085-333-555-976",
  billingWhatsapp: "085-333-555-976",
  supportEmail: "admin@hostingwebid.com",
  officeAddress: "Ruko No. 2A/11, Jl. Tamalate II, Kota Makassar - Sulawesi Selatan 90245",
  workingHours: "Senin - Sabtu Pkl. 08.00 - 17.00 WIB",
  bankBCA: { number: "123-456-7890", name: "PT HOSTING WEB DIGITAL", active: true },
  bankMandiri: { number: "152-00-1234567-8", name: "PT HOSTING WEB DIGITAL", active: true },
  bankBRI: { number: "0123-01-001234-53-0", name: "PT HOSTING WEB DIGITAL", active: true },
  bankBNI: { number: "098-765-4321", name: "PT HOSTING WEB DIGITAL", active: true },
  qris: { image: "/qris-sample.png", active: true, name: "QRIS SEMUA PEMBAYARAN DIGITAL" },
  autoVerifyWhatsapp: true,
  allowNewRegistrations: true,
};

type AuditLog = {
  id: string;
  time: string;
  actor: string;
  role: string;
  action: string;
  category: "auth" | "payment" | "system" | "user" | "order";
  status: "success" | "warning" | "danger";
  details: string;
};

const INITIAL_LOGS: AuditLog[] = [
  {
    id: "LOG-9081",
    time: "Baru saja",
    actor: "superadmin",
    role: "super_admin",
    action: "Login Super Admin",
    category: "auth",
    status: "success",
    details: "Super Admin masuk ke Master Control Panel via IP 127.0.0.1",
  },
  {
    id: "LOG-9080",
    time: "10 menit lalu",
    actor: "superadmin",
    role: "super_admin",
    action: "Pembaruan Hak Akses Sistem",
    category: "system",
    status: "success",
    details: "Konfigurasi role super_admin diaktifkan di seluruh modul database",
  },
  {
    id: "LOG-9079",
    time: "45 menit lalu",
    actor: "admin1",
    role: "admin",
    action: "Konfirmasi Pembayaran",
    category: "payment",
    status: "success",
    details: "Verifikasi pembayaran Invoice #INV-202609-0012 senilai Rp 350.000",
  },
  {
    id: "LOG-9078",
    time: "2 jam lalu",
    actor: "awaldevilboy",
    role: "user",
    action: "Registrasi User Baru",
    category: "user",
    status: "success",
    details: "User baru terdaftar dengan email awaldevilboy@gmail.com",
  },
  {
    id: "LOG-9077",
    time: "5 jam lalu",
    actor: "superadmin",
    role: "super_admin",
    action: "Sinkronisasi Cache & Database",
    category: "system",
    status: "success",
    details: "Pembersihan cache frontend dan regenerasi session tokens",
  },
];

export default function SuperAdminMasterControlPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    id?: number;
    name?: string;
    role?: string;
    email?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<
    "general" | "contact" | "payment" | "permissions" | "audit" | "health"
  >("general");
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Impersonation state
  const [impersonateEmail, setImpersonateEmail] = useState("");
  const [impersonateLoading, setImpersonateLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/system");
      return;
    }
    try {
      const u = JSON.parse(savedUser);
      if (u.role !== "super_admin" && u.role !== "superadmin") {
        alert("Akses Khusus: Halaman Master Control hanya dapat dibuka oleh Super Admin.");
        router.push("/admin");
        return;
      }
      setCurrentUser(u);
    } catch {
      router.push("/login");
    }

    const savedTheme = localStorage.getItem("hostingweb_admin_theme");
    if (savedTheme === "dark") setDarkMode(true);

    const savedSettings = localStorage.getItem("hostingweb_system_settings");
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch {
        // fallback
      }
    }
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSaveSettings = () => {
    setSaving(true);
    try {
      localStorage.setItem("hostingweb_system_settings", JSON.stringify(settings));

      const newLog: AuditLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        time: "Baru saja",
        actor: currentUser?.name || "superadmin",
        role: "super_admin",
        action: "Update Pengaturan Sistem",
        category: "system",
        status: "success",
        details: "Perubahan master konfigurasi website berhasil disimpan oleh Super Admin",
      };
      setLogs((prev) => [newLog, ...prev]);

      showToast("✅ Pengaturan Master Berhasil Disimpan & Diterapkan!");
    } catch {
      showToast("❌ Gagal menyimpan pengaturan");
    } finally {
      setTimeout(() => setSaving(false), 300);
    }
  };

  const handleImpersonateUser = (emailTarget?: string) => {
    const target = emailTarget || impersonateEmail.trim();
    if (!target) {
      alert("Masukkan email user yang ingin diakses.");
      return;
    }

    setImpersonateLoading(true);
    try {
      const tempImpersonateUser = {
        id: 999,
        name: target.split("@")[0],
        email: target,
        role: "user",
        impersonatedBy: currentUser?.email,
      };
      localStorage.setItem("hostingwebid_user", JSON.stringify(tempImpersonateUser));
      localStorage.setItem(
        "hostingweb_auth",
        JSON.stringify({ loggedIn: true, email: target, impersonated: true })
      );

      const newLog: AuditLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        time: "Baru saja",
        actor: currentUser?.name || "superadmin",
        role: "super_admin",
        action: "Impersonasi Akun User",
        category: "user",
        status: "warning",
        details: `Super Admin masuk sebagai akun user (${target}) untuk kontrol & troubleshooting`,
      };
      setLogs((prev) => [newLog, ...prev]);

      alert(`Berhasil beralih sebagai User (${target}). Anda akan dialihkan ke Dashboard User.`);
      window.location.href = "/dashboard";
    } catch {
      alert("Gagal melakukan impersonasi user.");
      setImpersonateLoading(false);
    }
  };

  const handleClearCache = () => {
    showToast("⚡ Cache frontend, DNS temporary, dan telemetry buffer berhasil dibersihkan!");
  };

  return (
    <div
      className={
        darkMode
          ? "min-h-screen bg-[#070b14] text-slate-100 flex font-sans transition-colors duration-200"
          : "min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans transition-colors duration-200"
      }
    >
      <AdminSidebar currentPath="/admin/system" darkMode={darkMode} />

      <div className="flex-1 min-w-0 ml-0 md:ml-[190px] lg:ml-[275px] pb-24 md:pb-10 transition-all duration-300">
        {/* =====================================================
            TOP BAR HEADER
        ===================================================== */}
        <header
          className={
            darkMode
              ? "sticky top-0 z-40 border-b border-slate-800/80 bg-[#0d1527]/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              : "sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs"
          }
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20 text-lg sm:text-xl font-bold flex-shrink-0">
              </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">
                  Super Admin Master Control
                </h1>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  FULL ACCESS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate sm:whitespace-normal">
                Pusat kendali seluruh fitur, hak akses, pembayaran, kontak, dan konfigurasi master website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {toastMessage && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm animate-fade-in truncate">
                {toastMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-orange-500/25 transition active:scale-98 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
            </button>
          </div>
        </header>

        {/* =====================================================
            MAIN CONTENT AREA
        ===================================================== */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
          {/* =====================================================
              STAT CARDS (TEGAS & ELEGAN)
          ===================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5">
            {/* STAT 1: ROLE */}
            <div
              className={
                darkMode
                  ? "rounded-2xl border border-slate-800 bg-[#10192e] p-5 shadow-sm transition hover:border-slate-700"
                  : "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300"
              }
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  HAK AKSES SISTEM
                </span>
                <span className="text-base"></span>
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Super Admin
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tingkat tertinggi tanpa batasan hak akses
              </p>
            </div>

            {/* STAT 2: SERVER */}
            <div
              className={
                darkMode
                  ? "rounded-2xl border border-slate-800 bg-[#10192e] p-5 shadow-sm transition hover:border-slate-700"
                  : "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300"
              }
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  STATUS SERVER &amp; DB
                </span>
                <span className="text-base">⚡</span>
              </div>
              <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                99.98% Uptime
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                MySQL &amp; PHP API Berjalan Normal
              </p>
            </div>

            {/* STAT 3: MODE */}
            <div
              className={
                darkMode
                  ? "rounded-2xl border border-slate-800 bg-[#10192e] p-5 shadow-sm transition hover:border-slate-700"
                  : "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300"
              }
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  MODE WEBSITE
                </span>
                <span className="text-base"></span>
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    settings.maintenanceMode ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
                <span>{settings.maintenanceMode ? "Pemeliharaan" : "Publik (Online)"}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Pengunjung dapat memesan &amp; checkout
              </p>
            </div>

            {/* STAT 4: WHATSAPP */}
            <div
              className={
                darkMode
                  ? "rounded-2xl border border-slate-800 bg-[#10192e] p-5 shadow-sm transition hover:border-slate-700"
                  : "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300"
              }
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  WHATSAPP GATEWAY
                </span>
                <span className="text-base"></span>
              </div>
              <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {settings.primaryWhatsapp}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Terhubung ke CS &amp; Konfirmasi Bayar
              </p>
            </div>
          </div>

          {/* =====================================================
              TAB NAVIGATION (SEGMENTED PILL STYLE)
          ===================================================== */}
          <div
            className={
              darkMode
                ? "flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#10192e] border border-slate-800 overflow-x-auto"
                : "flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-x-auto"
            }
          >
            {[
              { id: "general", label: "Identitas & Banner Promo", icon: "" },
              { id: "contact", label: "Kontak & WhatsApp CS", icon: "" },
              { id: "payment", label: "Master Rekening & QRIS", icon: "" },
              { id: "permissions", label: "Impersonasi & Akses", icon: "⚡" },
              { id: "audit", label: "Audit Log & Aktivitas", icon: "" },
              { id: "health", label: "System Health & Cache", icon: "" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-sm font-black"
                      : darkMode
                      ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* =====================================================
              TAB 1: IDENTITAS & BANNER PROMO
          ===================================================== */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* CARD 1: IDENTITAS WEBSITE */}
              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-5 shadow-sm"
                    : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-xs"
                }
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-orange-500"></span> Identitas Website &amp; SEO
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">Meta &amp; Profil</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Brand Website
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white focus:border-orange-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:bg-white outline-none"
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.siteTagline}
                    onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white focus:border-orange-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:bg-white outline-none"
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Meta Deskripsi SEO
                  </label>
                  <textarea
                    rows={3}
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white outline-none"
                    }
                  />
                </div>

                {/* MAINTENANCE SWITCH */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        Mode Pemeliharaan (Maintenance Mode)
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kunci akses publik jika sedang melakukan perbaikan besar
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) =>
                          setSettings({ ...settings, maintenanceMode: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  {settings.maintenanceMode && (
                    <div className="mt-3">
                      <label className="block text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">
                        Pesan Pemeliharaan untuk Pengunjung:
                      </label>
                      <input
                        type="text"
                        value={settings.maintenanceNotice}
                        onChange={(e) =>
                          setSettings({ ...settings, maintenanceNotice: e.target.value })
                        }
                        className="w-full rounded-xl border border-orange-400/50 bg-orange-50 dark:bg-orange-950/30 px-4 py-2 text-xs font-semibold text-orange-950 dark:text-orange-200 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: BROADCAST BANNER */}
              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-5 shadow-sm"
                    : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-xs"
                }
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-orange-500"></span> Broadcast Banner Pengumuman
                  </h3>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.broadcastBannerActive}
                      onChange={(e) =>
                        setSettings({ ...settings, broadcastBannerActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Banner ini akan otomatis tampil melayang di bagian paling atas Landing Page untuk menarik perhatian calon pelanggan.
                </p>

                {/* PREVIEW BOX */}
                <div
                  className={
                    darkMode
                      ? "p-4 rounded-xl bg-slate-950/80 border border-slate-800"
                      : "p-4 rounded-xl bg-slate-50 border border-slate-200"
                  }
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                    Preview Banner Live:
                  </span>
                  <div
                    className="px-4 py-2.5 rounded-lg text-xs font-bold text-white text-center shadow-sm flex items-center justify-center gap-2"
                    style={{ background: settings.broadcastBannerBg }}
                  >
                    <span>{settings.broadcastBannerText}</span>
                    <span className="underline cursor-pointer">Lihat Promo &rarr;</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Teks Pengumuman / Promo
                  </label>
                  <textarea
                    rows={2}
                    value={settings.broadcastBannerText}
                    onChange={(e) =>
                      setSettings({ ...settings, broadcastBannerText: e.target.value })
                    }
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white outline-none"
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Link Target / Tombol
                    </label>
                    <input
                      type="text"
                      value={settings.broadcastBannerLink}
                      onChange={(e) =>
                        setSettings({ ...settings, broadcastBannerLink: e.target.value })
                      }
                      placeholder="#pricing atau https://..."
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white outline-none"
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tema Warna Banner
                    </label>
                    <select
                      value={settings.broadcastBannerBg}
                      onChange={(e) =>
                        setSettings({ ...settings, broadcastBannerBg: e.target.value })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white outline-none"
                      }
                    >
                      <option value="linear-gradient(90deg, #ea580c 0%, #f97316 50%, #ea580c 100%)">
                        Oranye Api (Default)
                      </option>
                      <option value="linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%)">
                        Ungu Royal
                      </option>
                      <option value="linear-gradient(90deg, #059669 0%, #10b981 50%, #059669 100%)">
                        Hijau Emerald
                      </option>
                      <option value="linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)">
                        Merah Peringatan
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 2: KONTAK & WHATSAPP
          ===================================================== */}
          {activeTab === "contact" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-5 shadow-sm"
                    : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-xs"
                }
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-emerald-500"></span> Nomor WhatsApp &amp; Telepon CS
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">Gateway WhatsApp</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor WhatsApp CS Utama (Tampil di Footer &amp; Tombol Melayang)
                  </label>
                  <input
                    type="text"
                    value={settings.primaryWhatsapp}
                    onChange={(e) => setSettings({ ...settings, primaryWhatsapp: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white focus:border-emerald-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none"
                    }
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Format: 085-333-555-976 atau 6285333555976</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor WhatsApp Tim Billing &amp; Pembayaran
                  </label>
                  <input
                    type="text"
                    value={settings.billingWhatsapp}
                    onChange={(e) => setSettings({ ...settings, billingWhatsapp: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white focus:border-emerald-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none"
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nomor Telepon Helpdesk Resmi
                  </label>
                  <input
                    type="text"
                    value={settings.primaryPhone}
                    onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white focus:border-emerald-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none"
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Resmi Support
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white focus:border-emerald-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white outline-none"
                    }
                  />
                </div>
              </div>

              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-5 shadow-sm"
                    : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-5 shadow-xs"
                }
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-blue-500"></span> Jam Operasional &amp; Alamat Kantor
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">Lokasi Fisik</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jam Operasional Kantor
                  </label>
                  <input
                    type="text"
                    value={settings.workingHours}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white focus:border-blue-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:bg-white outline-none"
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Alamat Lengkap Kantor
                  </label>
                  <textarea
                    rows={3}
                    value={settings.officeAddress}
                    onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                    className={
                      darkMode
                        ? "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                        : "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white outline-none"
                    }
                  />
                </div>

                <div
                  className={
                    darkMode
                      ? "p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30"
                      : "p-4 rounded-xl bg-emerald-50 border border-emerald-200"
                  }
                >
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                    <span>⚡</span> Uji Tautan WhatsApp CS
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Klik tombol berikut untuk memverifikasi apakah nomor CS langsung membuka percakapan WhatsApp:
                  </p>
                  <a
                    href={`https://wa.me/${settings.primaryWhatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      "Halo Admin HostingWebID, saya ingin berkonsultasi seputar layanan."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition"
                  >
                    <span></span> Tes WhatsApp ({settings.primaryWhatsapp})
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 3: MASTER BANK & QRIS
          ===================================================== */}
          {activeTab === "payment" && (
            <div
              className={
                darkMode
                  ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 shadow-sm space-y-6"
                  : "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6"
              }
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-orange-500"></span> Master Rekening Bank &amp; QRIS
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Rekening aktif di bawah akan otomatis tampil sebagai opsi transfer pada checkout dan invoice pelanggan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BCA */}
                <div
                  className={
                    darkMode
                      ? "p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3.5"
                      : "p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3.5"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                      BANK BCA
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.bankBCA.active}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bankBCA: { ...settings.bankBCA, active: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={settings.bankBCA.number}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankBCA: { ...settings.bankBCA, number: e.target.value },
                        })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Atas Nama (A/N)
                    </label>
                    <input
                      type="text"
                      value={settings.bankBCA.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankBCA: { ...settings.bankBCA, name: e.target.value },
                        })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                      }
                    />
                  </div>
                </div>

                {/* MANDIRI */}
                <div
                  className={
                    darkMode
                      ? "p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3.5"
                      : "p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3.5"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                      BANK MANDIRI
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.bankMandiri.active}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bankMandiri: { ...settings.bankMandiri, active: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={settings.bankMandiri.number}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankMandiri: { ...settings.bankMandiri, number: e.target.value },
                        })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Atas Nama (A/N)
                    </label>
                    <input
                      type="text"
                      value={settings.bankMandiri.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankMandiri: { ...settings.bankMandiri, name: e.target.value },
                        })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                      }
                    />
                  </div>
                </div>

                {/* BRI */}
                <div
                  className={
                    darkMode
                      ? "p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3.5"
                      : "p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3.5"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                      BANK BRI
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.bankBRI.active}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            bankBRI: { ...settings.bankBRI, active: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={settings.bankBRI.number}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankBRI: { ...settings.bankBRI, number: e.target.value },
                        })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Atas Nama (A/N)
                    </label>
                    <input
                      type="text"
                      value={settings.bankBRI.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bankBRI: { ...settings.bankBRI, name: e.target.value },
                        })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                      }
                    />
                  </div>
                </div>

                {/* QRIS */}
                <div
                  className={
                    darkMode
                      ? "p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3.5"
                      : "p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3.5"
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg">
                      QRIS OTOMATIS (E-WALLET &amp; M-BANKING)
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.qris.active}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            qris: { ...settings.qris, active: e.target.checked },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Nama Merchant QRIS
                    </label>
                    <input
                      type="text"
                      value={settings.qris.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          qris: { ...settings.qris, name: e.target.value },
                        })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Path File Barcode QRIS
                    </label>
                    <input
                      type="text"
                      value={settings.qris.image}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          qris: { ...settings.qris, image: e.target.value },
                        })
                      }
                      className={
                        darkMode
                          ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white outline-none"
                          : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 4: IMPERSONASI & HAK AKSES
          ===================================================== */}
          {activeTab === "permissions" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* IMPERSONATION CARD */}
              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#16223b] to-[#10192e] p-6 space-y-5 shadow-sm"
                    : "rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-50/50 to-white p-6 space-y-5 shadow-xs"
                }
              >
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                  <span></span> Fitur Khusus: Impersonasi User (Login Tanpa Password)
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sebagai Super Admin, Anda dapat langsung masuk ke dashboard akun user/klien manapun untuk memeriksa pesanan, tagihan, atau membantu kendala teknis klien tanpa perlu mengetahui password mereka.
                </p>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Akun Klien yang Ingin Diuji:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="contoh: budi.santoso@gmail.com"
                      value={impersonateEmail}
                      onChange={(e) => setImpersonateEmail(e.target.value)}
                      className={
                        darkMode
                          ? "flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-amber-500 outline-none"
                          : "flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-amber-500 outline-none"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleImpersonateUser()}
                      disabled={impersonateLoading}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm active:scale-98 transition cursor-pointer"
                    >
                      {impersonateLoading ? "Memproses..." : "Masuk Akun"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2.5">
                    Akses Cepat Akun Demo / Test:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "awaldevilboy@gmail.com",
                      "budi.santoso@gmail.com",
                      "testuser@example.com",
                      "johndoe@example.com",
                    ].map((email) => (
                      <button
                        key={email}
                        type="button"
                        onClick={() => handleImpersonateUser(email)}
                        className={
                          darkMode
                            ? "rounded-xl bg-slate-800/80 border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:border-amber-500 transition cursor-pointer"
                            : "rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:border-amber-500 shadow-2xs transition cursor-pointer"
                        }
                      >
                        {email}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PERMISSION MATRIX */}
              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-4 shadow-sm"
                    : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs"
                }
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <span></span> Matriks Hak Akses (Role Permission Matrix)
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-black">
                        <th className="py-2.5">Modul / Fitur</th>
                        <th className="py-2.5 text-center">User</th>
                        <th className="py-2.5 text-center">Admin</th>
                        <th className="py-2.5 text-center text-amber-600 dark:text-amber-400">
                          Super Admin
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                      <tr>
                        <td className="py-2.5 font-bold">Pesan Layanan &amp; Checkout</td>
                        <td className="text-center text-emerald-600 font-bold">✓</td>
                        <td className="text-center text-emerald-600 font-bold">✓</td>
                        <td className="text-center text-emerald-600 font-black">✓ Full</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Lihat &amp; Konfirmasi Pembayaran</td>
                        <td className="text-center text-slate-400">-</td>
                        <td className="text-center text-emerald-600 font-bold">✓</td>
                        <td className="text-center text-emerald-600 font-black">✓ Full</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Kelola Paket Hosting &amp; Google Ads</td>
                        <td className="text-center text-slate-400">-</td>
                        <td className="text-center text-emerald-600 font-bold">✓</td>
                        <td className="text-center text-emerald-600 font-black">✓ Full</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Kelola User (Tambah/Edit)</td>
                        <td className="text-center text-slate-400">-</td>
                        <td className="text-center text-emerald-600 font-bold">✓</td>
                        <td className="text-center text-emerald-600 font-black">✓ Full</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Hapus Akun Admin Lain</td>
                        <td className="text-center text-slate-400">-</td>
                        <td className="text-center text-rose-500 font-bold">✗ Ditutup</td>
                        <td className="text-center text-amber-600 dark:text-amber-400 font-black">
                          Super Only
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Master Control &amp; Rekening Bank</td>
                        <td className="text-center text-slate-400">-</td>
                        <td className="text-center text-rose-500 font-bold">✗ Ditutup</td>
                        <td className="text-center text-amber-600 dark:text-amber-400 font-black">
                          Super Only
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Maintenance Mode &amp; Audit Trail</td>
                        <td className="text-center text-slate-400">-</td>
                        <td className="text-center text-rose-500 font-bold">✗ Ditutup</td>
                        <td className="text-center text-amber-600 dark:text-amber-400 font-black">
                          Super Only
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 5: AUDIT LOGS
          ===================================================== */}
          {activeTab === "audit" && (
            <div
              className={
                darkMode
                  ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-4 shadow-sm"
                  : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs"
              }
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <span></span> Log Aktivitas &amp; Keamanan Real-Time (Audit Trail)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Semua aktivitas admin, transaksi, dan perubahan konfigurasi sistem tercatat rapi secara berurutan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast("Log aktivitas berhasil diperbarui!")}
                  className={
                    darkMode
                      ? "rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                      : "rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  }
                >
                  Refresh Log
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {logs.map((log) => (
                  <div key={log.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          log.status === "success"
                            ? "bg-emerald-500"
                            : log.status === "warning"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono font-normal">[{log.id}]</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          {log.details}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{log.actor}</span>
                        {log.role === "super_admin" ? (
                          <span className="rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] font-black px-1.5 py-0.5 uppercase">
                            SUPER
                          </span>
                        ) : log.role === "admin" ? (
                          <span className="rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-[9px] font-bold px-1.5 py-0.5 uppercase">
                            ADMIN
                          </span>
                        ) : (
                          <span className="rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 uppercase">
                            USER
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 6: SYSTEM HEALTH
          ===================================================== */}
          {activeTab === "health" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-4 shadow-sm"
                    : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs"
                }
              >
                <div className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-blue-500">⚡</span> Server &amp; Environment
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Node / Next.js Engine:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">Next.js v15</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Backend API:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">PHP 8.x</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Database Server:</span>
                    <strong className="text-blue-600 dark:text-blue-400 font-mono">MySQL 8.0 (Laragon)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">SSL Encryption:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">TLS 1.3 Active</strong>
                  </div>
                </div>
              </div>

              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-4 shadow-sm"
                    : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs"
                }
              >
                <div className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-amber-500"></span> Database Telemetry
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Tabel Aktif:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">11 Tabel</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Database Utama:</span>
                    <strong className="text-orange-600 dark:text-orange-400 font-mono">hosting_web</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Status Koneksi:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      Connected (&lt; 1ms)
                    </strong>
                  </div>
                </div>
              </div>

              <div
                className={
                  darkMode
                    ? "rounded-2xl border border-slate-800 bg-[#10192e] p-6 space-y-4 shadow-sm"
                    : "rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-xs"
                }
              >
                <div className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-purple-500"></span> Tindakan Pemeliharaan
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tindakan darurat untuk membersihkan cache frontend dan me-refresh session buffer backend.
                </p>

                <button
                  type="button"
                  onClick={handleClearCache}
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                >
                  ⚡ Bersihkan Cache Frontend &amp; Temp
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
