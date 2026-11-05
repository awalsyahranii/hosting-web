"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import {
  getSeoPackages,
  saveSeoPackages,
  addSeoPackage,
  updateSeoPackage,
  deleteSeoPackage,
  SeoPackage,
  DEFAULT_SEO_PACKAGES,
} from "@/app/lib/seoStore";

export default function AdminSeoPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [packages, setPackages] = useState<SeoPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<SeoPackage | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    rating: 5,
    image: "/images/seo-package.jpg",
    badge: "",
    description: "",
    featuresText: "",
    status: "active" as "active" | "inactive",
  });

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/seo");
      return;
    }
    try {
      const u = JSON.parse(savedUser);
      if (
        u.role !== "admin" &&
        u.role !== "super_admin" &&
        u.role !== "superadmin"
      ) {
        router.push("/dashboard");
        return;
      }
      setCurrentUser(u);
    } catch {
      router.push("/login?redirect=/admin/seo");
    }
  }, [router]);

  useEffect(() => {
    loadData();
    window.addEventListener("seo_packages_updated", loadData);
    return () => {
      window.removeEventListener("seo_packages_updated", loadData);
    };
  }, []);

  function loadData() {
    setLoading(true);
    const list = getSeoPackages();
    setPackages(list);
    setLoading(false);
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function rupiah(val: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  }

  // Open Create Modal
  function handleOpenCreate() {
    setEditingPkg(null);
    setFormData({
      name: "",
      category: "PBN Authority",
      price: "",
      originalPrice: "",
      rating: 5,
      image: "/images/seo-package.jpg",
      badge: "⭐ Populer",
      description: "",
      featuresText:
        "PBN High DA/PA Relevan\nDofollow Backlink HQ\nGaransi Index Google Cepat\nLaporan Backlink Live",
      status: "active",
    });
    setModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(pkg: SeoPackage) {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name,
      category: pkg.category,
      price: String(pkg.price),
      originalPrice: pkg.originalPrice ? String(pkg.originalPrice) : "",
      rating: pkg.rating || 5,
      image: pkg.image || "/images/seo-package.jpg",
      badge: pkg.badge || "",
      description: pkg.description || "",
      featuresText: (pkg.features || []).join("\n"),
      status: pkg.status,
    });
    setModalOpen(true);
  }

  // Handle Save Form (Create / Update)
  function handleSaveForm(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price) {
      showToast("Nama paket dan harga wajib diisi!");
      return;
    }

    const priceNum = Number(formData.price.replace(/[^0-9]/g, "")) || 0;
    const origPriceNum = formData.originalPrice
      ? Number(formData.originalPrice.replace(/[^0-9]/g, "")) || 0
      : undefined;

    const featuresArray = formData.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingPkg) {
      // Update existing
      updateSeoPackage(editingPkg.id, {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: priceNum,
        originalPrice: origPriceNum,
        rating: Number(formData.rating) || 5,
        image: formData.image.trim() || "/images/seo-package.jpg",
        badge: formData.badge.trim() || undefined,
        description: formData.description.trim(),
        features: featuresArray,
        status: formData.status,
      });
      showToast(`Paket "${formData.name}" berhasil diperbarui! ✅`);
    } else {
      // Create new
      addSeoPackage({
        name: formData.name.trim(),
        category: formData.category.trim() || "PBN Authority",
        price: priceNum,
        originalPrice: origPriceNum,
        rating: Number(formData.rating) || 5,
        image: formData.image.trim() || "/images/seo-package.jpg",
        badge: formData.badge.trim() || undefined,
        description: formData.description.trim(),
        features: featuresArray,
        status: formData.status,
      });
      showToast(`Paket "${formData.name}" berhasil ditambahkan! `);
    }

    setModalOpen(false);
    loadData();
  }

  // Handle Delete
  function handleDelete(id: string) {
    const success = deleteSeoPackage(id);
    if (success) {
      showToast("Paket SEO berhasil dihapus!");
      setDeleteConfirmId(null);
      loadData();
    }
  }

  // Handle Toggle Status
  function handleToggleStatus(pkg: SeoPackage) {
    const newStatus = pkg.status === "active" ? "inactive" : "active";
    updateSeoPackage(pkg.id, { status: newStatus });
    showToast(
      `Status paket diubah ke ${newStatus === "active" ? "Aktif" : "Nonaktif"}!`
    );
    loadData();
  }

  // Handle Reset to Default
  function handleResetDefault() {
    if (confirm("Kembalikan daftar paket SEO ke pengaturan default?")) {
      saveSeoPackages(DEFAULT_SEO_PACKAGES);
      showToast("Daftar paket berhasil direset ke default.");
      loadData();
    }
  }

  const isSuperAdmin =
    currentUser?.role === "super_admin" || currentUser?.role === "superadmin";

  const totalActive = packages.filter((p) => p.status === "active").length;
  const totalInactive = packages.length - totalActive;

  const filteredPackages = packages.filter((p) => {
    if (statusFilter === "active" && p.status !== "active") return false;
    if (statusFilter === "inactive" && p.status !== "inactive") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!currentUser) {
    return (
      <div className="p-8 text-slate-500 text-sm text-center">
        Memverifikasi akses admin...
      </div>
    );
  }

  return (
    <main className="admin-page">
      {/* SIDEBAR */}
      <AdminSidebar currentPath="/admin/seo" />

      {/* MAIN CONTENT */}
      <section className="admin-content">
        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold animate-fade-in flex items-center gap-2">
            <span></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <section className="admin-header-clean mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                  MANAJEMEN LAYANAN
                </span>
                {isSuperAdmin && (
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    FULL CRUD SUPER ADMIN
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                Jasa SEO, PBN &amp; Backlink
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Kelola paket layanan SEO publik yang tampil di halaman utama Jasa SEO.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/seo"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <span></span> Lihat Halaman Publik
              </Link>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <span>➕</span> Tambah Paket SEO Baru
              </button>
            </div>
          </div>
        </section>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">
              Total Paket
            </span>
            <strong className="text-2xl font-black text-slate-900 block mt-1">
              {packages.length}
            </strong>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase block">
              Paket Aktif (Live)
            </span>
            <strong className="text-2xl font-black text-emerald-600 block mt-1">
              {totalActive}
            </strong>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">
              Paket Nonaktif
            </span>
            <strong className="text-2xl font-black text-slate-400 block mt-1">
              {totalInactive}
            </strong>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-orange-600 uppercase block">
              Harga Mulai
            </span>
            <strong className="text-xl font-black text-orange-600 block mt-1">
              {packages.length > 0
                ? rupiah(Math.min(...packages.map((p) => p.price)))
                : "Rp 0"}
            </strong>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({packages.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Aktif ({totalActive})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === "inactive"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Nonaktif ({totalInactive})
            </button>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Cari paket SEO, PBN, harga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* SEO PACKAGES TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Memuat data paket SEO...
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada data paket SEO yang cocok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Foto &amp; Paket</th>
                    <th className="p-3.5">Kategori / Tier</th>
                    <th className="p-3.5">Harga Jual</th>
                    <th className="p-3.5">Rating &amp; Fitur</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPackages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      {/* FOTO & NAMA */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={pkg.image || "/images/seo-package.jpg"}
                            alt={pkg.name}
                            className="w-14 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 font-bold text-sm block">
                                {pkg.name}
                              </strong>
                              {pkg.badge && (
                                <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md">
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block line-clamp-1 max-w-xs">
                              {pkg.description || "Layanan PBN Backlink"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* KATEGORI */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]">
                          {pkg.category || "PBN Backlink"}
                        </span>
                      </td>

                      {/* HARGA */}
                      <td className="p-3.5">
                        <strong className="text-sm font-black text-slate-900 block">
                          {rupiah(pkg.price)}
                        </strong>
                        {pkg.originalPrice && (
                          <span className="text-[10.5px] text-slate-400 line-through">
                            {rupiah(pkg.originalPrice)}
                          </span>
                        )}
                      </td>

                      {/* RATING & FITUR */}
                      <td className="p-3.5">
                        <div className="text-amber-400 text-xs tracking-wider">
                          {"★".repeat(pkg.rating || 5)}
                        </div>
                        <span className="text-slate-500 text-[11px] mt-0.5 block">
                          {pkg.features?.length || 0} Poin Fitur Utama
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(pkg)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black transition ${
                            pkg.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              pkg.status === "active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {pkg.status === "active" ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>

                      {/* AKSI */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(pkg)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                          >
                            <span>✏️</span> Edit
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(pkg.id)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-[11px] transition flex items-center gap-1"
                          >
                            <span></span> Hapus
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

        {/* BOTTOM HELPER BAR */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {filteredPackages.length} paket SEO</span>
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-slate-400 hover:text-slate-600 underline font-medium"
          >
            Reset ke Pengaturan Default
          </button>
        </div>
      </section>

      {/* =========================================================
          MODAL: TAMBAH / EDIT PAKET SEO
      ========================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>{editingPkg ? "✏️ Edit Paket SEO" : "➕ Tambah Paket SEO Baru"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              {/* NAMA PAKET & KATEGORI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Paket <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SEO PBN 3"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kategori / Tier PBN
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PBN Authority Ultimate"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* HARGA JUAL & HARGA CORET */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Harga Jual (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 2000000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Harga Coret / Asli (Opsional)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 3500000"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* BADGE, RATING & STATUS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Badge Promosi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Best Seller"
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Rating Bintang (1-5)
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                    <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white"
                  >
                    <option value="active">Aktif (Tampil Publik)</option>
                    <option value="inactive">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
              </div>

              {/* URL GAMBAR */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  URL Gambar Paket
                </label>
                <input
                  type="text"
                  placeholder="/images/seo-package.jpg"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white font-mono"
                />
              </div>

              {/* DESKRIPSI SINGKAT */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Deskripsi Singkat Paket
                </label>
                <textarea
                  rows={2}
                  placeholder="Paket ultimate untuk dominasi ranking kata kunci..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white"
                />
              </div>

              {/* FITUR POIN (1 BARIS = 1 POIN) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Fitur / Keunggulan (1 baris = 1 poin)
                </label>
                <textarea
                  rows={4}
                  placeholder="50 PBN High DA 50+&#10;100% Index Google&#10;Contextual Backlink Dofollow&#10;Laporan Lengkap"
                  value={formData.featuresText}
                  onChange={(e) =>
                    setFormData({ ...formData, featuresText: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white font-mono"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-md transition"
                >
                  {editingPkg ? "Simpan Perubahan" : "Tambahkan Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: KONFIRMASI HAPUS
      ========================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto">
              </div>
            <div>
              <h4 className="text-base font-black text-slate-900">
                Hapus Paket SEO Ini?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini tidak dapat dibatalkan. Paket ini tidak akan muncul lagi di halaman publik Jasa SEO.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                Ya, Hapus Paket
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
