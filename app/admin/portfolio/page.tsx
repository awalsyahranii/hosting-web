"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import {
  fetchPortfoliosAsync,
  addPortfolioAsync,
  updatePortfolioAsync,
  deletePortfolioAsync,
  generatePortfolioDefaultsFromUrl,
  getScreenshotUrl,
  getCleanDomain,
  getCleanUrl,
  PortfolioItem,
} from "@/app/lib/portfolioStore";

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    url: "",
    domain: "",
    category: "Bisnis & Jasa",
    categoryTag: "PRODUKSI & JASA",
    promoTag: "Hemat 50%",
    gradient: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
    bannerTitle: "",
    bannerDesc: "",
    rating: "5.0/5 - 40 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Hemat 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Profesional",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Termasuk Domain & Cloud Server NVMe",
    image: "",
    useScreenshot: true,
    status: "active" as "active" | "inactive",
  });

  // Color preset options
  const gradientPresets = [
    { label: "Emerald Green", val: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)" },
    { label: "Royal Blue", val: "linear-gradient(135deg, #1e1b4b 0%, #2563eb 50%, #1e40af 100%)" },
    { label: "Deep Orange", val: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)" },
    { label: "Rose Magenta", val: "linear-gradient(135deg, #881337 0%, #be123c 50%, #9f1239 100%)" },
    { label: "Purple Indigo", val: "linear-gradient(135deg, #3b0764 0%, #7e22ce 50%, #6b21a8 100%)" },
    { label: "Ocean Teal", val: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0369a1 100%)" },
    { label: "Crimson Red", val: "linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #b91c1c 100%)" },
    { label: "Dark Slate", val: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)" },
  ];

  const categoryPresets = [
    "Bisnis & Jasa",
    "Otomotif",
    "Media & Berita",
    "Industri",
    "Teknologi",
    "Properti",
    "Toko Online",
    "Kuliner & Kafe",
    "Kesehatan & Klinik",
  ];

  // Auth Guard
  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/portfolio");
      return;
    }
    try {
      const u = JSON.parse(savedUser);
      if (
        u.role !== "admin" &&
        u.role !== "super_admin" &&
        u.role !== "superadmin"
      ) {
        alert("Akses Ditolak. Anda bukan admin / super admin.");
        router.push("/dashboard");
        return;
      }
      setCurrentUser(u);
    } catch {
      router.push("/login");
      return;
    }

    loadData();
  }, [router]);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchPortfoliosAsync();
      setPortfolios(data);
    } catch (err) {
      console.error("Gagal load data portfolio:", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Handle URL change with auto screenshot generation
  function handleUrlChange(rawUrl: string) {
    const clean = rawUrl.trim();
    const cleanDomain = getCleanDomain(clean);
    const screenshot = getScreenshotUrl(clean);

    setFormData((prev) => {
      const next = {
        ...prev,
        url: clean,
        domain: prev.domain && prev.domain !== getCleanDomain(prev.url) ? prev.domain : cleanDomain,
        image: prev.image && !prev.image.includes("wp.com/mshots") ? prev.image : screenshot,
      };
      return next;
    });
  }

  // Trigger quick autofill from URL
  function handleAutoFill() {
    if (!formData.url.trim()) {
      alert("Silakan masukkan URL atau domain website klien terlebih dahulu.");
      return;
    }
    const defaults = generatePortfolioDefaultsFromUrl(formData.url);
    setFormData((prev) => ({
      ...prev,
      domain: defaults.domain,
      url: defaults.url,
      category: defaults.category,
      categoryTag: defaults.categoryTag,
      promoTag: defaults.promoTag,
      gradient: defaults.gradient,
      bannerTitle: defaults.bannerTitle,
      bannerDesc: defaults.bannerDesc,
      packageTitle: defaults.packageTitle,
      feat1: defaults.feat1,
      feat2: defaults.feat2,
      rating: defaults.rating,
      originalPrice: defaults.originalPrice,
      discountBadge: defaults.discountBadge,
      price: defaults.price,
      orderPrice: defaults.orderPrice,
      image: defaults.image,
      useScreenshot: true,
    }));
    showToast("✨ Data dan Layar Home website otomatis terisi!");
  }

  // Open Create Modal
  function handleOpenCreate() {
    setEditingItem(null);
    setFormData({
      url: "",
      domain: "",
      category: "Bisnis & Jasa",
      categoryTag: "PRODUKSI & JASA",
      promoTag: "Hemat 50%",
      gradient: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
      bannerTitle: "",
      bannerDesc: "",
      rating: "5.0/5 - 40 Ulasan",
      originalPrice: "Rp 1.500.000",
      discountBadge: "Hemat 50%",
      price: "Mulai Rp 750.000",
      orderPrice: "Pesan Rp 750rb",
      packageTitle: "Jasa Pembuatan Website Bisnis",
      feat1: "Tampilan Bisa Request/Custom",
      feat2: "Termasuk Domain & Cloud Server NVMe",
      image: "",
      useScreenshot: true,
      status: "active",
    });
    setModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(item: PortfolioItem) {
    setEditingItem(item);
    setFormData({
      url: item.url || (item.domain ? `https://${item.domain}` : ""),
      domain: item.domain || "",
      category: item.category || "Bisnis & Jasa",
      categoryTag: item.categoryTag || "PRODUKSI & JASA",
      promoTag: item.promoTag || "Hemat 50%",
      gradient: item.gradient || "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
      bannerTitle: item.bannerTitle || "",
      bannerDesc: item.bannerDesc || "",
      rating: item.rating || "5.0/5 - 40 Ulasan",
      originalPrice: item.originalPrice || "Rp 1.500.000",
      discountBadge: item.discountBadge || "Hemat 50%",
      price: item.price || "Mulai Rp 750.000",
      orderPrice: item.orderPrice || "Pesan Rp 750rb",
      packageTitle: item.packageTitle || "Jasa Pembuatan Website Bisnis",
      feat1: item.feat1 || "Tampilan Bisa Request/Custom",
      feat2: item.feat2 || "Termasuk Domain & Cloud Server NVMe",
      image: item.image || (item.domain ? getScreenshotUrl(item.domain) : ""),
      useScreenshot: item.useScreenshot !== false,
      status: item.status || "active",
    });
    setModalOpen(true);
  }

  // Save (Create / Update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const domainClean = getCleanDomain(formData.domain || formData.url);
    if (!domainClean) {
      alert("Nama domain atau Link website wajib diisi.");
      return;
    }

    const cleanUrl = getCleanUrl(formData.url || domainClean);
    const finalImage = formData.image.trim() || getScreenshotUrl(cleanUrl);

    setIsSaving(true);
    try {
      const payload: Omit<PortfolioItem, "id"> & { id?: string } = {
        domain: domainClean,
        url: cleanUrl,
        category: formData.category,
        categoryTag: formData.categoryTag || "WEBSITE KLIEN",
        promoTag: formData.promoTag || "Hemat 50%",
        gradient: formData.gradient,
        bannerTitle: formData.bannerTitle || `Website ${domainClean}`,
        bannerDesc: formData.bannerDesc || "Website profesional, responsif dan siap pakai",
        rating: formData.rating || "5.0/5 - 40 Ulasan",
        originalPrice: formData.originalPrice || "Rp 1.500.000",
        discountBadge: formData.discountBadge || "Hemat 50%",
        price: formData.price || "Mulai Rp 750.000",
        orderPrice: formData.orderPrice || "Pesan Rp 750rb",
        packageTitle: formData.packageTitle || "Jasa Pembuatan Website",
        feat1: formData.feat1 || "Tampilan Bisa Request/Custom",
        feat2: formData.feat2 || "Termasuk Domain & Cloud Server",
        image: finalImage,
        useScreenshot: formData.useScreenshot,
        status: formData.status,
      };

      if (editingItem) {
        const res = await updatePortfolioAsync(editingItem.id, payload);
        if (res.success) {
          showToast("✅ Portofolio berhasil diperbarui!");
        } else {
          alert("Gagal memperbarui: " + (res.message || "Error"));
        }
      } else {
        const res = await addPortfolioAsync(payload);
        if (res.success) {
          showToast("🎉 Portofolio website klien baru berhasil ditambahkan!");
        } else {
          alert("Gagal menambahkan: " + (res.message || "Error"));
        }
      }

      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert("Terjadi kesalahan: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  }

  // Delete
  async function handleDelete(id: string) {
    setIsSaving(true);
    try {
      const res = await deletePortfolioAsync(id);
      if (res.success) {
        showToast("🗑️ Portofolio berhasil dihapus.");
      } else {
        alert("Gagal menghapus: " + (res.message || "Error"));
      }
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      alert("Gagal menghapus portofolio: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  }

  // Toggle Status
  async function handleToggleStatus(item: PortfolioItem) {
    const nextStatus = item.status === "inactive" ? "active" : "inactive";
    await updatePortfolioAsync(item.id, { status: nextStatus });
    showToast(`Status website diubah menjadi: ${nextStatus.toUpperCase()}`);
    await loadData();
  }

  // Filter Data
  const categoriesList = Array.from(
    new Set([...categoryPresets, ...portfolios.map((p) => p.category).filter(Boolean)])
  );

  const filteredPortfolios = portfolios.filter((item) => {
    const matchSearch =
      !search ||
      item.domain.toLowerCase().includes(search.toLowerCase()) ||
      item.bannerTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.packageTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.categoryTag.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    const matchStatus =
      statusFilter === "all" || (item.status || "active") === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const activeCount = portfolios.filter((p) => (p.status || "active") === "active").length;

  // Real-time preview data for the modal
  const previewDomain = getCleanDomain(formData.domain || formData.url) || "contohdomain.com";
  const previewScreenshot = formData.image.trim() || getScreenshotUrl(formData.url || previewDomain);

  return (
    <div className="admin-page">
      <AdminSidebar currentPath="/admin/portfolio" />

      <main className="admin-content">
        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* TOP HEADER */}
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">LAYANAN &amp; PRODUK / PORTOFOLIO KLIEN</div>
            <h1>Manajemen Portofolio &amp; Website Klien</h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola daftar website klien karya &amp; optimasi Google Ads yang tampil di halaman beranda.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/#portfolio"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>👁️</span> Lihat di Beranda ↗
            </Link>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25"
            >
              <span>➕</span> Tambah Portofolio Klien
            </button>
          </div>
        </header>

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 text-2xl">
              🌐
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{portfolios.length}</div>
              <div className="text-xs font-semibold text-slate-500">Total Website Klien</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl">
              ✅
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{activeCount}</div>
              <div className="text-xs font-semibold text-slate-500">Tayang Online (Aktif)</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
              📸
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {portfolios.filter((p) => p.useScreenshot !== false).length}
              </div>
              <div className="text-xs font-semibold text-slate-500">Layar Home Otomatis</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-2xl">
              🏷️
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{categoriesList.length}</div>
              <div className="text-xs font-semibold text-slate-500">Kategori Bisnis</div>
            </div>
          </div>
        </div>

        {/* CONTROLS (SEARCH, FILTERS, VIEW TOGGLE) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* SEARCH */}
            <div className="relative flex-1 min-w-[220px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Cari domain, judul website, atau paket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* CATEGORY FILTER */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="all">Semua Kategori</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif Saja</option>
              <option value="inactive">Non-Aktif Saja</option>
            </select>
          </div>

          {/* VIEW MODE TOGGLE */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              📱 Grid Card
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              📋 Tabel
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-sm font-bold text-slate-700">Memuat data portofolio...</div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredPortfolios.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <span className="text-4xl mb-3 block">🌐</span>
            <h3 className="text-base font-black text-slate-800">Tidak ada portofolio ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Coba sesuaikan kata kunci pencarian atau filter kategori, atau tambahkan portofolio website baru sekarang.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25"
            >
              ➕ Tambah Portofolio Baru
            </button>
          </div>
        )}

        {/* GRID VIEW */}
        {!loading && viewMode === "grid" && filteredPortfolios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredPortfolios.map((item) => {
              const liveUrl = item.url || `https://${item.domain}`;
              const screenshotImg = item.image || getScreenshotUrl(liveUrl);
              const isActive = (item.status || "active") === "active";

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all hover:shadow-lg flex flex-col overflow-hidden relative ${
                    isActive ? "border-slate-200/90" : "border-rose-200 opacity-75 bg-slate-50"
                  }`}
                >
                  {/* BROWSER TOP FRAME WITH MOCKUP */}
                  <div
                    className="relative h-44 p-3 text-white flex flex-col justify-between overflow-hidden group"
                    style={{
                      background: item.gradient || "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
                      backgroundImage: item.useScreenshot !== false && screenshotImg
                        ? `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.85)), url(${screenshotImg})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "top center",
                    }}
                  >
                    {/* BROWSER BAR */}
                    <div className="flex items-center justify-between gap-2 z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm truncate max-w-[170px]">
                        {item.domain}
                      </span>
                    </div>

                    {/* BADGES */}
                    <div className="flex items-center justify-between gap-2 z-10 mt-1">
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/20 backdrop-blur-md">
                        {item.categoryTag}
                      </span>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                        {item.promoTag}
                      </span>
                    </div>

                    {/* BANNER TEXT */}
                    <div className="z-10 mt-auto pt-2">
                      <h4 className="text-xs font-black line-clamp-1 text-white leading-tight">
                        {item.bannerTitle}
                      </h4>
                      <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                        {item.bannerDesc}
                      </p>
                    </div>

                    {/* LIVE PREVIEW HOVER PILL */}
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs z-20"
                    >
                      <span>🌐 Buka Website Asli ↗</span>
                    </a>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* RATING & STATUS */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="text-amber-500 text-xs font-bold flex items-center gap-1">
                          <span>★★★★★</span>
                          <span className="text-slate-500 text-[10px]">({item.rating})</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {isActive ? "● Aktif" : "○ Non-Aktif"}
                        </span>
                      </div>

                      {/* PRICING */}
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <del className="text-slate-400 text-xs">{item.originalPrice}</del>
                          <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded">
                            {item.discountBadge}
                          </span>
                        </div>
                        <div className="text-sm font-black text-slate-900 mt-0.5">{item.price}</div>
                      </div>

                      {/* PACKAGE TITLE */}
                      <div className="text-xs font-bold text-slate-800 line-clamp-1 mb-2">
                        {item.packageTitle}
                      </div>

                      {/* FEATURES LIST */}
                      <ul className="text-[11px] text-slate-600 space-y-1 mb-3">
                        <li className="flex items-start gap-1.5 line-clamp-1">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{item.feat1}</span>
                        </li>
                        <li className="flex items-start gap-1.5 line-clamp-1">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>{item.feat2}</span>
                        </li>
                      </ul>
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                          isActive
                            ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                        title={isActive ? "Non-aktifkan portofolio ini" : "Aktifkan portofolio ini"}
                      >
                        {isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                          title="Edit Portofolio"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
                          title="Hapus Portofolio"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE VIEW */}
        {!loading && viewMode === "table" && filteredPortfolios.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Layar Home / Domain</th>
                    <th className="py-3.5 px-4">Kategori &amp; Tag</th>
                    <th className="py-3.5 px-4">Judul Banner &amp; Paket</th>
                    <th className="py-3.5 px-4">Harga / Promo</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPortfolios.map((item) => {
                    const liveUrl = item.url || `https://${item.domain}`;
                    const screenshotImg = item.image || getScreenshotUrl(liveUrl);
                    const isActive = (item.status || "active") === "active";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-16 h-11 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-900 relative"
                              style={{
                                backgroundImage: `url(${screenshotImg})`,
                                backgroundSize: "cover",
                                backgroundPosition: "top",
                              }}
                            >
                              <div className="absolute inset-0 bg-black/20" />
                            </div>
                            <div>
                              <div className="font-black text-slate-900">{item.domain}</div>
                              <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-orange-600 hover:underline flex items-center gap-1 font-semibold"
                              >
                                Buka Link ↗
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{item.category}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.categoryTag}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 max-w-xs truncate">
                            {item.bannerTitle}
                          </div>
                          <div className="text-[10px] text-slate-500 max-w-xs truncate">
                            {item.packageTitle}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-black text-slate-900">{item.price}</div>
                          <del className="text-[10px] text-slate-400">{item.originalPrice}</del>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {isActive ? "● Aktif" : "○ Non-Aktif"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs"
                              title={isActive ? "Non-aktifkan" : "Aktifkan"}
                            >
                              {isActive ? "⏸️" : "▶️"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            ADD / EDIT MODAL (WITH LIVE SCREENSHOT HOMEPAGE PREVIEW)
        ======================================================== */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
              {/* MODAL HEADER */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingItem ? "✏️ Edit Portofolio Website Klien" : "➕ Tambah Portofolio Klien Baru"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan URL / link website, sistem akan otomatis mengambil tampilan layar home website klien.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 font-bold flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              {/* MODAL BODY */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* LEFT COLUMN: FORM INPUTS (7 COLS) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* URL INPUT & AUTOFILL BUTTON */}
                    <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200/60">
                      <label className="block text-xs font-black text-slate-800 mb-1">
                        Link / URL Website Klien <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Contoh: https://tukangaluminiumkaca.my.id"
                          value={formData.url}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs font-medium rounded-xl border border-orange-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          type="button"
                          onClick={handleAutoFill}
                          className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm whitespace-nowrap"
                        >
                          ⚡ Auto-Lengkapi
                        </button>
                      </div>
                      <p className="text-[10px] text-orange-700 mt-1.5">
                        💡 Masukkan URL lengkap atau nama domain untuk langsung memunculkan preview Layar Home secara otomatis.
                      </p>
                    </div>

                    {/* DOMAIN & KATEGORI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Domain Website <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="tukangaluminiumkaca.my.id"
                          value={formData.domain}
                          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Kategori Bisnis
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                          {categoryPresets.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* BADGES ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Category Badge (Kiri Atas)
                        </label>
                        <input
                          type="text"
                          placeholder="PRODUKSI & JASA"
                          value={formData.categoryTag}
                          onChange={(e) => setFormData({ ...formData, categoryTag: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Promo Tag (Kanan Atas)
                        </label>
                        <input
                          type="text"
                          placeholder="Hemat 50% atau SEO Ready"
                          value={formData.promoTag}
                          onChange={(e) => setFormData({ ...formData, promoTag: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* BANNER TITLE & DESC */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Banner Website <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Jasa Aluminium & Kaca Tempered"
                        value={formData.bannerTitle}
                        onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Deskripsi Singkat Banner
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Kusen aluminium, pintu sliding, partisi kantor & etalase kaca custom"
                        value={formData.bannerDesc}
                        onChange={(e) => setFormData({ ...formData, bannerDesc: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* RATING & DISKON */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Rating Ulasan
                        </label>
                        <input
                          type="text"
                          placeholder="4.9/5 - 42 Ulasan"
                          value={formData.rating}
                          onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Harga Coret (Asli)
                        </label>
                        <input
                          type="text"
                          placeholder="Rp 1.500.000"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Badge Diskon
                        </label>
                        <input
                          type="text"
                          placeholder="Save 50%"
                          value={formData.discountBadge}
                          onChange={(e) => setFormData({ ...formData, discountBadge: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* PRICING & BUTTON */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Label Harga Promo
                        </label>
                        <input
                          type="text"
                          placeholder="Mulai Rp 750.000"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Teks Tombol Pesan
                        </label>
                        <input
                          type="text"
                          placeholder="Pesan Rp 750rb"
                          value={formData.orderPrice}
                          onChange={(e) => setFormData({ ...formData, orderPrice: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* PACKAGE & FEATURES */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Paket Pembuatan
                      </label>
                      <input
                        type="text"
                        placeholder="Jasa Pembuatan Website Usaha Aluminium"
                        value={formData.packageTitle}
                        onChange={(e) => setFormData({ ...formData, packageTitle: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Fitur Unggulan 1
                        </label>
                        <input
                          type="text"
                          placeholder="Tampilan Bisa Request/Custom"
                          value={formData.feat1}
                          onChange={(e) => setFormData({ ...formData, feat1: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Fitur Unggulan 2
                        </label>
                        <input
                          type="text"
                          placeholder="Termasuk Domain .my.id + Cloud Server"
                          value={formData.feat2}
                          onChange={(e) => setFormData({ ...formData, feat2: e.target.value })}
                          className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* STATUS SELECT */}
                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-xs font-bold text-slate-700">Status Tayang:</span>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formData.status === "active"}
                          onChange={() => setFormData({ ...formData, status: "active" })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-emerald-700">Aktif (Tampil di Beranda)</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold">
                        <input
                          type="radio"
                          name="status"
                          value="inactive"
                          checked={formData.status === "inactive"}
                          onChange={() => setFormData({ ...formData, status: "inactive" })}
                          className="text-slate-500 focus:ring-slate-400"
                        />
                        <span className="text-slate-500">Non-Aktif (Draft)</span>
                      </label>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: LIVE SCREENSHOT & CARD PREVIEW (5 COLS) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <span>📸</span> Live Layar Home &amp; Mockup
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Real-time
                        </span>
                      </div>

                      {/* TOGGLE SCREENSHOT VS GRADIENT */}
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 mb-3">
                        <span className="text-[11px] font-bold text-slate-700">
                          Tampilkan Layar Home:
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, useScreenshot: !formData.useScreenshot })}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                            formData.useScreenshot
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {formData.useScreenshot ? "ON (Aktif)" : "OFF"}
                        </button>
                      </div>

                      {/* CARD MOCKUP PREVIEW */}
                      <div className="rounded-2xl border border-slate-300 shadow-md bg-white overflow-hidden text-left max-w-sm mx-auto">
                        {/* BANNER PREVIEW WITH LIVE SCREENSHOT */}
                        <div
                          className="relative h-44 p-3 text-white flex flex-col justify-between overflow-hidden"
                          style={{
                            background: formData.gradient,
                            backgroundImage: formData.useScreenshot && previewScreenshot
                              ? `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.85)), url(${previewScreenshot})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "top center",
                          }}
                        >
                          {/* TOP BROWSER DOTS & DOMAIN */}
                          <div className="flex items-center justify-between gap-2 z-10">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-rose-400" />
                              <span className="w-2 h-2 rounded-full bg-amber-400" />
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            </div>
                            <span className="text-[10px] font-mono text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm truncate max-w-[170px]">
                              {previewDomain}
                            </span>
                          </div>

                          {/* BADGES */}
                          <div className="flex items-center justify-between gap-2 z-10">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/20 backdrop-blur-md">
                              {formData.categoryTag || "PRODUKSI & JASA"}
                            </span>
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                              {formData.promoTag || "Hemat 50%"}
                            </span>
                          </div>

                          {/* TEXT OVERLAY */}
                          <div className="z-10 mt-auto pt-2">
                            <h4 className="text-xs font-black line-clamp-1 text-white">
                              {formData.bannerTitle || `Website ${previewDomain}`}
                            </h4>
                            <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                              {formData.bannerDesc || "Kusen aluminium, pintu sliding & partisi kantor"}
                            </p>
                          </div>
                        </div>

                        {/* CARD BODY PREVIEW */}
                        <div className="p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-amber-500 text-xs font-bold">
                              ★★★★★ <span className="text-slate-500 text-[10px]">({formData.rating})</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <del className="text-slate-400 text-xs">{formData.originalPrice}</del>
                              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded">
                                {formData.discountBadge}
                              </span>
                            </div>
                            <div className="text-sm font-black text-slate-900">{formData.price}</div>
                          </div>

                          <div className="text-xs font-bold text-slate-800 line-clamp-1">
                            {formData.packageTitle}
                          </div>

                          <ul className="text-[10px] text-slate-600 space-y-0.5">
                            <li className="flex items-center gap-1">
                              <span className="text-emerald-500 font-bold">✓</span> {formData.feat1}
                            </li>
                            <li className="flex items-center gap-1">
                              <span className="text-emerald-500 font-bold">✓</span> {formData.feat2}
                            </li>
                          </ul>

                          <div className="pt-2 flex items-center gap-2">
                            <div className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-bold text-center">
                              👁️ Lihat Detail
                            </div>
                            <div className="flex-1 py-1.5 rounded-lg bg-orange-600 text-white text-[11px] font-bold text-center">
                              {formData.orderPrice}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* GRADIENT PRESETS */}
                      <div className="mt-4">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Pilihan Warna Tema / Gradient Banner:
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {gradientPresets.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setFormData({ ...formData, gradient: preset.val })}
                              className={`h-7 rounded-lg transition-transform border-2 ${
                                formData.gradient === preset.val
                                  ? "border-orange-500 scale-105 shadow-sm"
                                  : "border-transparent hover:scale-102"
                              }`}
                              style={{ background: preset.val }}
                              title={preset.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* CUSTOM SCREENSHOT / IMAGE URL */}
                      <div className="mt-3">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Custom Gambar / Screenshot URL (Opsional):
                        </label>
                        <input
                          type="text"
                          placeholder="https://... atau biarkan kosong untuk screenshot otomatis"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* MODAL ACTIONS */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>{editingItem ? "💾 Simpan Perubahan" : "➕ Tambah Portofolio"}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            DELETE CONFIRM MODAL
        ======================================================== */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
              <span className="text-4xl block mb-2">🗑️</span>
              <h3 className="text-base font-black text-slate-900">Hapus Portofolio Klien?</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Data portofolio ini akan dihapus dari sistem dan tidak akan tampil lagi di halaman beranda.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/25"
                >
                  {isSaving ? "Menghapus..." : "Ya, Hapus Sekarang"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

