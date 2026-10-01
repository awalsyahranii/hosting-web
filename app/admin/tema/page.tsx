"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import {
  getThemes,
  addTheme,
  updateTheme,
  deleteTheme,
  generateThemeDefaultsFromUrl,
  ThemeItem,
} from "@/app/lib/themeStore";

export default function AdminTemaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [themes, setThemes] = useState<ThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    demoUrl: "",
    name: "",
    category: "Otomotif & Rental",
    price: "350000",
    originalPrice: "700000",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
    badge: "LIVE DEMO READY",
    description: "",
    featuresText: "",
    status: "active" as "active" | "inactive",
  });

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Auth Guard
  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/tema");
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
      router.push("/login?redirect=/admin/tema");
    }
  }, [router]);

  // Load Data
  useEffect(() => {
    loadData();
    window.addEventListener("themes_updated", loadData);
    return () => {
      window.removeEventListener("themes_updated", loadData);
    };
  }, []);

  function loadData() {
    setLoading(true);
    const list = getThemes();
    setThemes(list);
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
    setEditingTheme(null);
    setFormData({
      demoUrl: "",
      name: "",
      category: "Otomotif & Rental",
      price: "350000",
      originalPrice: "700000",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
      badge: "LIVE DEMO READY",
      description: "",
      featuresText: "Katalog Unit & Simulasi Kredit\nGaleri Spesifikasi & Download Brosur\nForm Booking Test Drive Online\nTombol WhatsApp Sales Otomatis",
      status: "active",
    });
    setModalOpen(true);
  }

  // When admin pastes demo URL, auto-fill suggestion
  function handleDemoUrlChange(url: string) {
    setFormData((prev) => {
      const next = { ...prev, demoUrl: url };
      if (url.trim().length > 7 && !editingTheme) {
        const defaults = generateThemeDefaultsFromUrl(url);
        next.name = prev.name || defaults.name;
        next.category = prev.category === "Otomotif & Rental" ? defaults.category : prev.category;
        next.description = prev.description || defaults.description;
        next.price = prev.price || String(defaults.price);
        next.originalPrice = prev.originalPrice || String(defaults.originalPrice);
        next.image = prev.image.includes("unsplash") ? defaults.image : prev.image;
        next.badge = prev.badge || defaults.badge;
        next.featuresText = prev.featuresText || defaults.features.join("\n");
      }
      return next;
    });
  }

  // Open Edit Modal
  function handleOpenEdit(theme: ThemeItem) {
    setEditingTheme(theme);
    setFormData({
      demoUrl: theme.demoUrl || "",
      name: theme.name,
      category: theme.category,
      price: String(theme.price),
      originalPrice: String(theme.originalPrice || theme.price * 2),
      image: theme.image,
      badge: theme.badge || "",
      description: theme.description,
      featuresText: (theme.features || []).join("\n"),
      status: theme.status || "active",
    });
    setModalOpen(true);
  }

  // Save (Create / Update)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Nama tema wajib diisi.");
      return;
    }

    if (!formData.demoUrl.trim()) {
      alert("Link demo tema wajib diisi.");
      return;
    }

    let validUrl = formData.demoUrl.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = `https://${validUrl}`;
    }

    const features = formData.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const priceNum = parseInt(formData.price.replace(/\D/g, "")) || 0;
    const origPriceNum = parseInt(formData.originalPrice.replace(/\D/g, "")) || priceNum * 2;

    if (editingTheme) {
      updateTheme(editingTheme.id, {
        demoUrl: validUrl,
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        originalPrice: origPriceNum,
        image: formData.image.trim() || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
        badge: formData.badge.trim(),
        description: formData.description.trim(),
        features: features.length > 0 ? features : ["Fitur Premium Siap Pakai", "Mobile Friendly 100%", "Integrasi WhatsApp"],
        status: formData.status,
      });
      showToast("✅ Tema berhasil diperbarui!");
    } else {
      addTheme({
        demoUrl: validUrl,
        name: formData.name.trim(),
        category: formData.category,
        price: priceNum,
        originalPrice: origPriceNum,
        image: formData.image.trim() || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
        badge: formData.badge.trim() || "LIVE DEMO READY",
        description: formData.description.trim() || "Template website bisnis profesional, siap pakai, dan mudah dikelola.",
        features: features.length > 0 ? features : ["Fitur Premium Siap Pakai", "Mobile Friendly 100%", "Integrasi WhatsApp"],
        status: formData.status,
      });
      showToast("🎉 Tema baru berhasil ditambahkan!");
    }

    setModalOpen(false);
    loadData();
  }

  // Delete
  function handleDelete(id: string) {
    deleteTheme(id);
    setDeleteConfirmId(null);
    showToast("🗑️ Tema berhasil dihapus.");
    loadData();
  }

  // Toggle Status
  function handleToggleStatus(theme: ThemeItem) {
    const nextStatus = theme.status === "inactive" ? "active" : "inactive";
    updateTheme(theme.id, { status: nextStatus });
    showToast(`Status tema diubah menjadi: ${nextStatus.toUpperCase()}`);
    loadData();
  }

  // Filter Data
  const categoriesList = Array.from(new Set(themes.map((t) => t.category).filter(Boolean)));

  const filteredThemes = themes.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.demoUrl || "").toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      categoryFilter === "all" || t.category === categoryFilter;

    const matchStatus =
      statusFilter === "all" || (t.status || "active") === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const activeCount = themes.filter((t) => (t.status || "active") === "active").length;

  return (
    <div className="admin-page">
      <AdminSidebar currentPath="/admin/tema" />

      <main className="admin-content">
        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
            {toastMessage}
          </div>
        )}

        {/* TOP HEADER */}
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">LAYANAN &amp; PRODUK / TEMA WEBSITE</div>
            <h1>Manajemen Tema &amp; Template Website</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tema"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>👁️</span> Lihat Halaman Publik ↗
            </Link>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25"
            >
              <span>➕</span> Tambah Tema Baru
            </button>
          </div>
        </header>

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Tema Terdaftar
            </span>
            <strong className="text-2xl font-black text-slate-800">{themes.length}</strong>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tema Aktif Tayang
            </span>
            <strong className="text-2xl font-black text-emerald-600">{activeCount}</strong>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Live Demo Siap Beli
            </span>
            <strong className="text-2xl font-black text-orange-600">
              {themes.filter((t) => t.demoUrl).length}
            </strong>
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* SEARCH */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Cari tema, kategori, link..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
              />
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            </div>

            {/* CATEGORY FILTER */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* STATUS FILTER */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif Tayang</option>
              <option value="inactive">Nonaktif (Draft)</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium self-end md:self-center">
            Menampilkan <strong>{filteredThemes.length}</strong> dari {themes.length} tema
          </span>
        </div>

        {/* THEMES TABLE / GRID */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {filteredThemes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Info Tema</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Harga</th>
                    <th className="py-3.5 px-4">Demo URL</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredThemes.map((theme) => (
                    <tr key={theme.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* INFO TEMA */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={theme.image}
                            alt={theme.name}
                            className="w-14 h-11 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                          <div>
                            <strong className="text-sm font-bold text-slate-900 block">
                              {theme.name}
                            </strong>
                            <span className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                              {theme.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* KATEGORI */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {theme.category}
                        </span>
                      </td>

                      {/* HARGA */}
                      <td className="py-3 px-4">
                        <div>
                          <del className="text-[10px] text-slate-400 block">{rupiah(theme.originalPrice)}</del>
                          <strong className="text-sm font-bold text-slate-900">{rupiah(theme.price)}</strong>
                        </div>
                      </td>

                      {/* DEMO URL */}
                      <td className="py-3 px-4">
                        {theme.demoUrl ? (
                          <a
                            href={theme.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline"
                          >
                            <span>👁️ Buka Demo</span>
                            <span className="text-slate-400">↗</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(theme)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition-colors ${
                            (theme.status || "active") === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {(theme.status || "active") === "active" ? "● AKTIF" : "○ NONAKTIF"}
                        </button>
                      </td>

                      {/* AKSI */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(theme)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(theme.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <span className="text-3xl block mb-2">🎨</span>
              <strong className="text-slate-700 text-sm block">Tidak ada tema ditemukan</strong>
              <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau tambah tema baru.</p>
            </div>
          )}
        </div>

        {/* MODAL FORM: CREATE / EDIT */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
              {/* MODAL HEADER */}
              <div className="px-6 py-5 bg-gradient-to-r from-orange-50 to-amber-50/50 border-b border-orange-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingTheme ? "✏️ Edit Tema Website" : "⚡ Tambah Tema Website Baru"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Masukkan link demo website Anda, sistem akan otomatis mengisi detail template.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* MODAL BODY */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* 1. LINK DEMO UTAMA */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Link Demo Website (URL) <span className="text-orange-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      placeholder="https://dealerv1.hostingwebid.com/"
                      value={formData.demoUrl}
                      onChange={(e) => handleDemoUrlChange(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                    {formData.demoUrl && (
                      <a
                        href={formData.demoUrl.startsWith("http") ? formData.demoUrl : `https://${formData.demoUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shrink-0 flex items-center gap-1"
                      >
                        <span>👁️ Uji Link</span>
                      </a>
                    )}
                  </div>
                  <small className="text-[11px] text-slate-400 mt-1 block">
                    Contoh: <code>https://dealerv1.hostingwebid.com/</code> atau subdomain tema WordPress Anda.
                  </small>
                </div>

                {/* 2. NAMA TEMA & KATEGORI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nama Tema Website <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Dealer V1 - Showroom & Sales Mobil"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Kategori Bisnis
                    </label>
                    <input
                      type="text"
                      placeholder="Otomotif & Rental"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* 3. HARGA & HARGA CORET */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Harga Jual (Rp) <span className="text-orange-600">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="350000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Harga Normal / Coret (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="700000"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      placeholder="LIVE DEMO READY"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* 4. GAMBAR PREVIEW & STATUS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      URL Gambar Thumbnail
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Status Tayang
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                    >
                      <option value="active">🟢 Aktif (Tampil di Katalog)</option>
                      <option value="inactive">⚪ Nonaktif (Draft / Sembunyikan)</option>
                    </select>
                  </div>
                </div>

                {/* 5. DESKRIPSI SINGKAT */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Deskripsi Singkat Tema
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Template dealer resmi, showroom mobil baru/bekas, simulasi kredit..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* 6. FITUR UNGGULAN (1 PER BARIS) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Daftar Fitur Unggulan (1 Fitur per Baris)
                  </label>
                  <textarea
                    rows={3}
                    placeholder={"Katalog Unit & Simulasi Kredit Cicilan\nGaleri Spesifikasi & Download Brosur\nForm Booking Test Drive Online\nTombol WhatsApp Sales Otomatis"}
                    value={formData.featuresText}
                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* MODAL FOOTER */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25"
                  >
                    {editingTheme ? "💾 Simpan Perubahan" : "🚀 Publikasikan Tema"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
              <span className="text-4xl block mb-3">🗑️</span>
              <h4 className="text-base font-bold text-slate-900 mb-1">Hapus Tema Ini?</h4>
              <p className="text-xs text-slate-500 mb-5">
                Tema ini akan dihapus dari katalog publik dan tidak dapat dikembalikan.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
