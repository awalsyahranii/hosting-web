"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWhatsAppUrl } from "@/app/lib/siteConfig";
import { DEFAULT_THEMES } from "@/app/lib/themeStore";

function getResolvedDemoUrl(rawName: string, catalogDemo?: string): string {
  if (catalogDemo && catalogDemo !== "https://demo.hostingwebid.com" && catalogDemo.startsWith("http")) {
    return catalogDemo;
  }
  const lower = (rawName || "").toLowerCase();
  if (lower.includes("dealer") || lower.includes("showroom") || lower.includes("mobil") || lower.includes("motor") || lower.includes("otomotif")) {
    return "https://dealerv1.hostingwebid.com/";
  }
  if (lower.includes("toko") || lower.includes("shop") || lower.includes("commerce") || lower.includes("olshop") || lower.includes("retail")) {
    return "https://tokov1.hostingwebid.com/";
  }
  if (lower.includes("properti") || lower.includes("rumah") || lower.includes("cluster") || lower.includes("estate") || lower.includes("real")) {
    return "https://propertiv1.hostingwebid.com/";
  }
  if (lower.includes("resto") || lower.includes("kafe") || lower.includes("cafe") || lower.includes("kuliner") || lower.includes("makan") || lower.includes("menu")) {
    return "https://restov1.hostingwebid.com/";
  }
  if (lower.includes("berita") || lower.includes("portal") || lower.includes("media") || lower.includes("majalah") || lower.includes("news") || lower.includes("adsense")) {
    return "https://beritav1.hostingwebid.com/";
  }
  if (lower.includes("company") || lower.includes("corporate") || lower.includes("bisnis") || lower.includes("perusahaan")) {
    return "https://companyv1.hostingwebid.com/";
  }
  return "https://dealerv1.hostingwebid.com/";
}

type UserThemeItem = {
  id: string | number;
  order_number?: string;
  payment_number?: string;
  name: string;
  category: string;
  image: string;
  demoUrl?: string;
  price: number;
  purchase_date: string;
  status: "active" | "pending";
  description?: string;
  features?: string[];
  license_key?: string;
};

export default function DashboardTemaPage() {
  const [themes, setThemes] = useState<UserThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "active" | "pending">("all");
  const [selectedThemeModal, setSelectedThemeModal] = useState<UserThemeItem | null>(null);
  const [modalTab, setModalTab] = useState<"download" | "guide" | "license">("download");

  function getDeletedOrderSet(): Set<string> {
    const deletedSet = new Set<string>();
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("hostingweb_deleted_orders");
        if (raw) {
          (JSON.parse(raw) as string[]).forEach((item) => {
            if (item) deletedSet.add(String(item).trim().toLowerCase());
          });
        }
      }
    } catch {}
    return deletedSet;
  }

  async function fetchUserThemes() {
    try {
      setLoading(true);
      const deletedSet = getDeletedOrderSet();

      // 1. Fetch available catalog themes for rich metadata (images, demoUrls, descriptions)
      let catalogThemes: any[] = DEFAULT_THEMES;
      try {
        const resCat = await fetch("/api/themes", { cache: "no-store" });
        const jsonCat = await resCat.json().catch(() => null);
        if (jsonCat?.status === "success" && Array.isArray(jsonCat.data) && jsonCat.data.length > 0) {
          catalogThemes = jsonCat.data;
        } else if (jsonCat?.success && Array.isArray(jsonCat.themes) && jsonCat.themes.length > 0) {
          catalogThemes = jsonCat.themes;
        }
      } catch {}

      const userThemeMap = new Map<string, UserThemeItem>();

      // 2. Fetch from /api/orders (Unified server-side order store)
      try {
        const resOrders = await fetch("/api/orders", { cache: "no-store" });
        const jsonOrders = await resOrders.json().catch(() => null);
        const orderList: any[] = jsonOrders?.data || [];

        orderList.forEach((o) => {
          const ordNum = String(o.order_number || "").trim().toLowerCase();
          const ordId = String(o.id || o.order_id || "").trim().toLowerCase();
          const payNum = String(o.payment_number || "").trim().toLowerCase();

          // Check if deleted
          if (ordNum && deletedSet.has(ordNum)) return;
          if (ordId && (deletedSet.has(ordId) || deletedSet.has(`ord-${ordId}`))) return;
          if (payNum && deletedSet.has(payNum)) return;

          const cat = String(o.service_category || "").toLowerCase();
          const dom = String(o.domain_name || o.domain || o.package_name || "").toLowerCase();
          const isTheme =
            cat.includes("tema") ||
            cat.includes("theme") ||
            cat.includes("template") ||
            dom.includes("tema") ||
            dom.includes("theme");

          if (isTheme) {
            const cleanName = (o.domain_name || o.package_name || "Tema Website")
              .replace(/^Tema:\s*/i, "")
              .replace(/^Tema Website:\s*/i, "")
              .trim();

            const matchedCatalog =
              catalogThemes.find(
                (ct) =>
                  ct.name.toLowerCase() === cleanName.toLowerCase() ||
                  cleanName.toLowerCase().includes(ct.name.toLowerCase()) ||
                  ct.name.toLowerCase().includes(cleanName.toLowerCase()) ||
                  (ct.id && cleanName.toLowerCase().includes(ct.id.toLowerCase()))
              ) ||
              DEFAULT_THEMES.find(
                (dt) =>
                  dt.name.toLowerCase() === cleanName.toLowerCase() ||
                  cleanName.toLowerCase().includes(dt.name.toLowerCase()) ||
                  dt.name.toLowerCase().includes(cleanName.toLowerCase())
              );

            const key = o.order_number || String(o.id);
            userThemeMap.set(key, {
              id: o.id,
              order_number: o.order_number,
              payment_number: o.payment_number,
              name: matchedCatalog?.name || cleanName,
              category: matchedCatalog?.category || "Website Bisnis & Toko",
              image:
                matchedCatalog?.image ||
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
              demoUrl: getResolvedDemoUrl(cleanName, matchedCatalog?.demoUrl),
              price: Number(o.amount || o.total || matchedCatalog?.price || 350000),
              purchase_date: o.created_at || new Date().toISOString(),
              status: ["paid", "active", "success", "completed"].includes((o.status || "").toLowerCase())
                ? "active"
                : "pending",
              description:
                matchedCatalog?.description ||
                "Template website premium siap pakai dengan desain responsif, optimasi SEO, dan integrasi WhatsApp.",
              features: matchedCatalog?.features || [
                "Desain 100% Responsif (Mobile & Desktop)",
                "Akses Source Code Lengkap",
                "Integrasi Formulir & Tombol WhatsApp",
                "Optimasi Kecepatan & SEO-Ready",
              ],
              license_key: `HW-THM-${String(o.order_number || o.id).replace(/[^A-Z0-9]/gi, "").slice(-8).toUpperCase()}-LIFETIME`,
            });
          }
        });
      } catch {}

      // 3. Merge from localStorage (Instant offline/local cache)
      try {
        if (typeof window !== "undefined") {
          const localOrders: any[] = JSON.parse(localStorage.getItem("hostingweb_all_orders") || "[]");
          const activePay = localStorage.getItem("hostingweb_checkout_payment");
          if (activePay) {
            try {
              localOrders.unshift(JSON.parse(activePay));
            } catch {}
          }

          localOrders.forEach((lo) => {
            const ordNum = String(lo.orderNumber || lo.order_number || (lo.orderId ? `ORD-${lo.orderId}` : `ORD-${lo.id}`)).trim().toLowerCase();
            const ordId = String(lo.orderId || lo.id || "").trim().toLowerCase();
            const payNum = String(lo.paymentNumber || lo.payment_number || "").trim().toLowerCase();

            // Check if deleted
            if (ordNum && deletedSet.has(ordNum)) return;
            if (ordId && (deletedSet.has(ordId) || deletedSet.has(`ord-${ordId}`))) return;
            if (payNum && deletedSet.has(payNum)) return;

            const cat = String(lo.service_category || "").toLowerCase();
            const dom = String(lo.itemName || lo.domain_name || lo.package_name || "").toLowerCase();
            const isTheme =
              cat.includes("tema") ||
              cat.includes("theme") ||
              cat.includes("template") ||
              dom.includes("tema") ||
              dom.includes("theme");

            if (isTheme) {
              const cleanName = (lo.itemName || lo.domain_name || lo.package_name || "Tema Website")
                .replace(/^Tema:\s*/i, "")
                .replace(/^Tema Website:\s*/i, "")
                .trim();

              const realOrdNum = lo.orderNumber || lo.order_number || (lo.orderId ? `ORD-${lo.orderId}` : `ORD-${lo.id}`);
              if (realOrdNum && !userThemeMap.has(realOrdNum)) {
                const matchedCatalog =
                  catalogThemes.find(
                    (ct) =>
                      ct.name.toLowerCase() === cleanName.toLowerCase() ||
                      cleanName.toLowerCase().includes(ct.name.toLowerCase()) ||
                      ct.name.toLowerCase().includes(cleanName.toLowerCase()) ||
                      (ct.id && cleanName.toLowerCase().includes(ct.id.toLowerCase()))
                  ) ||
                  DEFAULT_THEMES.find(
                    (dt) =>
                      dt.name.toLowerCase() === cleanName.toLowerCase() ||
                      cleanName.toLowerCase().includes(dt.name.toLowerCase()) ||
                      dt.name.toLowerCase().includes(cleanName.toLowerCase())
                  );

                userThemeMap.set(realOrdNum, {
                  id: lo.id || lo.orderId || Date.now(),
                  order_number: realOrdNum,
                  payment_number: lo.paymentNumber || lo.payment_number,
                  name: matchedCatalog?.name || cleanName,
                  category: matchedCatalog?.category || "Website Bisnis & Toko",
                  image:
                    matchedCatalog?.image ||
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
                  demoUrl: getResolvedDemoUrl(cleanName, matchedCatalog?.demoUrl),
                  price: Number(lo.amount || lo.total || matchedCatalog?.price || 350000),
                  purchase_date: lo.created_at || new Date().toISOString(),
                  status: ["paid", "active", "success", "completed"].includes((lo.status || "").toLowerCase())
                    ? "active"
                    : "pending",
                  description:
                    matchedCatalog?.description ||
                    "Template website premium siap pakai dengan desain responsif, optimasi SEO, dan integrasi WhatsApp.",
                  features: matchedCatalog?.features || [
                    "Desain 100% Responsif (Mobile & Desktop)",
                    "Akses Source Code Lengkap",
                    "Integrasi Formulir & Tombol WhatsApp",
                    "Optimasi Kecepatan & SEO-Ready",
                  ],
                  license_key: `HW-THM-${String(realOrdNum).replace(/[^A-Z0-9]/gi, "").slice(-8).toUpperCase()}-LIFETIME`,
                });
              }
            }
          });
        }
      } catch {}

      setThemes(Array.from(userThemeMap.values()));
    } catch (err) {
      console.error("Gagal memuat tema user:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchUserThemes();

    const handleStorage = () => void fetchUserThemes();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleDeleteDraftTheme = (orderNumber?: string, id?: string | number) => {
    if (!orderNumber && !id) return;
    try {
      const deletedOrders: string[] = JSON.parse(localStorage.getItem("hostingweb_deleted_orders") || "[]");
      if (orderNumber) deletedOrders.push(orderNumber.toLowerCase().trim());
      if (id) deletedOrders.push(String(id).toLowerCase().trim());
      localStorage.setItem("hostingweb_deleted_orders", JSON.stringify(Array.from(new Set(deletedOrders))));

      // Clean active checkout payment cache
      const cachedPay = localStorage.getItem("hostingweb_checkout_payment");
      if (cachedPay) {
        const p = JSON.parse(cachedPay);
        if (p.orderNumber === orderNumber || String(p.orderId) === String(id)) {
          localStorage.removeItem("hostingweb_checkout_payment");
        }
      }

      setThemes((prev) => prev.filter((t) => t.order_number !== orderNumber && String(t.id) !== String(id)));
      window.dispatchEvent(new Event("storage"));
    } catch {}
  };

  const activeThemesCount = themes.filter((t) => t.status === "active").length;
  const pendingThemesCount = themes.filter((t) => t.status === "pending").length;

  const filteredThemes = themes.filter((t) => {
    // Status tab filter
    if (statusTab === "active" && t.status !== "active") return false;
    if (statusTab === "pending" && t.status !== "pending") return false;

    // Search query
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.order_number && t.order_number.toLowerCase().includes(q))
    );
  });

  function rupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(isoStr: string) {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  }

  return (
    <div className="space-y-6">
      {/* TOP HERO BANNER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
            <span>🎨</span> TEMA &amp; TEMPLATE WEBSITE SAYA
          </div>
          <h1 className="text-2xl font-black">Koleksi Tema Website</h1>
          <p className="text-sm text-white/90 mt-1 max-w-xl">
            Kelola template website siap pakai Anda, unduh paket aset/source code, dan nikmati lisensi resmi dengan akses selamanya tanpa biaya perpanjangan.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={getWhatsAppUrl("Halo Tim Support HostingWeb, saya butuh bantuan instalasi tema website yang telah saya beli.")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-md"
          >
            <span>💬</span> Bantuan Instalasi WA
          </a>
          <Link
            href="/tema"
            className="px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-black transition shadow-md flex items-center gap-2"
          >
            <span>✨</span> Jelajahi Tema Lainnya
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
            🎨
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">TEMA TERVERIFIKASI AKTIF</span>
            <strong className="text-2xl font-black text-slate-900 block mt-0.5">{activeThemesCount} Tema</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
            ✓
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">STATUS LISENSI</span>
            <strong className="text-lg font-black text-emerald-700 block mt-0.5">
              Siap Pakai (Lifetime)
            </strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
            ♾️
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">MASA BERLAKU</span>
            <strong className="text-lg font-black text-slate-800 block mt-0.5">
              Akses Selamanya
            </strong>
          </div>
        </div>
      </div>

      {/* THEMES CARD SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* HEADER TOOLBAR WITH FILTER TABS */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({themes.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                statusTab === "active"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span>●</span> Aktif ({activeThemesCount})
            </button>
            {pendingThemesCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusTab("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  statusTab === "pending"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                <span>⏳</span> Menunggu Bayar ({pendingThemesCount})
              </button>
            )}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Cari tema / nomor order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <span className="animate-spin text-2xl block mb-2">⏳</span>
              Memuat data tema website Anda...
            </div>
          ) : filteredThemes.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-3xl mx-auto mb-3">
                🎨
              </div>
              <h3 className="text-base font-bold text-slate-900">Tidak Ada Tema pada Kategori Ini</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {statusTab === "pending"
                  ? "Tidak ada pesanan tema yang menunggu pembayaran."
                  : "Anda belum memiliki tema website aktif."}
              </p>
              <div className="mt-5">
                <Link
                  href="/tema"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition"
                >
                  <span>✨</span> Jelajahi Katalog Tema Web →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredThemes.map((item) => {
                const isActive = item.status === "active";
                return (
                  <div
                    key={`theme-card-${item.id}-${item.order_number}`}
                    className="bg-slate-50/70 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-orange-200 transition-all group"
                  >
                    <div>
                      {/* PREVIEW IMAGE */}
                      <div className="relative h-44 bg-slate-200 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                          {item.category}
                        </span>
                        <span
                          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {isActive ? "● Aktif (Lifetime)" : "⏳ Menunggu Bayar"}
                        </span>
                      </div>

                      {/* CARD BODY */}
                      <div className="p-5">
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-[11px] text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Nomor Order:</span>
                            <span className="font-mono font-bold text-slate-800">{item.order_number || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Tanggal Beli:</span>
                            <span>{formatDate(item.purchase_date)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Lisensi:</span>
                            <span className="text-emerald-700 font-bold">
                              {isActive ? "Akses Selamanya (1 Domain)" : "Menunggu Verifikasi"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="p-5 pt-0">
                      {isActive ? (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {item.demoUrl ? (
                            <a
                              href={item.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-center text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                            >
                              <span>👁️</span> Demo Web
                            </a>
                          ) : (
                            <a
                              href={getWhatsAppUrl(`Halo Admin HostingWeb, saya ingin melihat demo tema ${item.name}.`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-center text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                            >
                              <span>👁️</span> Demo
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedThemeModal(item);
                              setModalTab("download");
                            }}
                            className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-center text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
                          >
                            <span>📥</span> Kelola &amp; Unduh
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-2">
                          <Link
                            href={`/checkout?type=theme&package=${encodeURIComponent(item.name)}&order_number=${item.order_number || ""}`}
                            className="flex-1 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-center text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
                          >
                            <span>💳</span> Bayar Sekarang
                          </Link>
                          <button
                            type="button"
                            title="Hapus draf pesanan yang belum dibayar ini"
                            onClick={() => handleDeleteDraftTheme(item.order_number, item.id)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-bold transition border border-slate-200"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DETAIL / DOWNLOAD MODAL */}
      {selectedThemeModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedThemeModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                  <span>🎨</span> Template &amp; Source Assets
                </div>
                <h3 className="text-lg font-black text-white">{selectedThemeModal.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Order ID: {selectedThemeModal.order_number || "-"} • Lisensi Resmi Aktif
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedThemeModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition text-sm"
              >
                ✕
              </button>
            </div>

            {/* MODAL TABS */}
            <div className="flex border-b border-slate-100 bg-slate-50 px-6">
              <button
                type="button"
                onClick={() => setModalTab("download")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
                  modalTab === "download"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                📥 Unduh Paket Tema
              </button>
              <button
                type="button"
                onClick={() => setModalTab("guide")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
                  modalTab === "guide"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                📖 Panduan Instalasi
              </button>
              <button
                type="button"
                onClick={() => setModalTab("license")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
                  modalTab === "license"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                🔑 Kunci Lisensi
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6">
              {modalTab === "download" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200/60 flex items-start gap-3">
                    <span className="text-2xl">📦</span>
                    <div>
                      <h4 className="text-xs font-bold text-orange-950">
                        Paket Source Code &amp; Aset Siap Pakai (.zip)
                      </h4>
                      <p className="text-[11px] text-orange-800 mt-0.5 leading-relaxed">
                        Berisi seluruh file template HTML, CSS, JavaScript, gambar aset HD, dan konfigurasi form WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <a
                      href={getWhatsAppUrl(`Halo Tim Support HostingWeb, saya ingin meminta link download file master ZIP dan paket instalasi untuk tema *${selectedThemeModal.name}* (Order: ${selectedThemeModal.order_number}).`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition flex items-center justify-center gap-2"
                    >
                      <span>📥</span> Unduh File Master Tema (.ZIP) via Admin
                    </a>

                    {selectedThemeModal.demoUrl && (
                      <a
                        href={selectedThemeModal.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
                      >
                        <span>👁️</span> Buka Demo Live Preview
                      </a>
                    )}
                  </div>
                </div>
              )}

              {modalTab === "guide" && (
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-72 overflow-y-auto pr-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">Langkah 1: Ekstrak File ZIP</strong>
                    <p>Ekstrak arsip .zip tema yang telah diunduh ke folder root hosting Anda (misal: <code>public_html</code> pada cPanel).</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">Langkah 2: Hubungkan Domain &amp; SSL</strong>
                    <p>Pastikan nama domain Anda sudah terhubung ke nameserver/IP hosting dan sertifikat SSL gratis telah aktif.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-1">Langkah 3: Sesuaikan Teks &amp; Nomor WhatsApp</strong>
                    <p>Buka file konfigurasi untuk mengubah nomor WhatsApp tujuan, teks kontak, logo bisnis, dan katalog produk Anda.</p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                    <strong className="block mb-0.5">💡 Butuh Bantuan Instalasi?</strong>
                    <p className="text-[11px]">Tim teknis HostingWeb siap membantu upload &amp; setting hingga website Anda live 100%.</p>
                  </div>
                </div>
              )}

              {modalTab === "license" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 text-white">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      KODE LISENSI RESMI (LIFETIME)
                    </span>
                    <strong className="font-mono text-base font-bold text-amber-400 block mt-1 select-all">
                      {selectedThemeModal.license_key}
                    </strong>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>• <strong>Tipe Lisensi:</strong> Lisensi Tunggal (Single Domain Lifetime Access)</p>
                    <p>• <strong>Masa Berlaku:</strong> Selamanya (Tanpa biaya langganan bulanan / tahunan)</p>
                    <p>• <strong>Dukungan Teknis:</strong> Garansi bantuan perbaikan &amp; panduan teknis</p>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <a
                href={getWhatsAppUrl(`Halo Tim Support HostingWeb, saya butuh bantuan teknis terkait tema *${selectedThemeModal.name}*.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
              >
                <span>💬</span> Hubungi Support WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setSelectedThemeModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
