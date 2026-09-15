"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  author: string;
  status: "published" | "draft" | string;
  views: number;
  created_at: string;
  updated_at: string;
}

interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  views: number;
  categories: string[];
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    total: 0,
    published: 0,
    draft: 0,
    views: 0,
    categories: [],
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Notification Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  // Form Fields
  const [formId, setFormId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Web Hosting");
  const [customCategory, setCustomCategory] = useState("");
  const [formAuthor, setFormAuthor] = useState("Tim HostingWeb ID");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState<"published" | "draft">("published");

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<ArticleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Auth Check
  useEffect(() => {
    const raw = localStorage.getItem("hostingwebid_user");
    if (!raw) {
      router.push("/login");
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (!["admin", "super_admin", "superadmin"].includes(u.role?.toLowerCase())) {
        router.push("/dashboard");
        return;
      }
      setCurrentUser(u);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backend/admin/article/index.php", {
        credentials: "include",
      });
      const json = await res.json();
      if (json.status === "success" && json.data) {
        setArticles(json.data.articles || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error("Gagal memuat artikel admin:", err);
      showToast("error", "Gagal memuat data artikel dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      void loadArticles();
    }
  }, [currentUser]);

  // Auto-generate slug from title during Create mode
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (modalMode === "create") {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormSlug(generated);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormId(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("Web Hosting");
    setCustomCategory("");
    setFormAuthor(currentUser?.name || "Tim HostingWeb ID");
    setFormThumbnail("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80");
    setFormExcerpt("");
    setFormContent(`<h2>1. Pengantar</h2>\n<p>Tulis paragraf pembuka artikel Anda di sini dengan bahasa yang informatif dan menarik pembaca.</p>\n\n<h2>2. Pembahasan Utama</h2>\n<p>Jelaskan langkah-langkah, tips praktis, atau solusi yang Anda tawarkan secara terstruktur.</p>\n\n<h2>3. Kesimpulan</h2>\n<p>Berikan ringkasan poin penting dan ajakan untuk mencoba layanan terbaik.</p>`);
    setFormStatus("published");
    setActiveTab("editor");
    setIsModalOpen(true);
  };

  const openEditModal = (art: ArticleItem) => {
    setModalMode("edit");
    setFormId(art.id);
    setFormTitle(art.title);
    setFormSlug(art.slug);
    setFormCategory(art.category);
    setCustomCategory("");
    setFormAuthor(art.author);
    setFormThumbnail(art.thumbnail);
    setFormExcerpt(art.excerpt);
    setFormContent(art.content);
    setFormStatus(art.status === "published" ? "published" : "draft");
    setActiveTab("editor");
    setIsModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast("error", "Judul artikel wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      const finalCategory = customCategory.trim() ? customCategory.trim() : formCategory;

      const payload = {
        id: formId,
        title: formTitle.trim(),
        slug: formSlug.trim(),
        category: finalCategory,
        author: formAuthor.trim(),
        thumbnail: formThumbnail.trim(),
        excerpt: formExcerpt.trim(),
        content: formContent.trim(),
        status: formStatus,
      };

      const endpoint =
        modalMode === "create"
          ? "/api/backend/admin/article/create.php"
          : "/api/backend/admin/article/update.php";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.message || "Gagal menyimpan artikel.");
      }

      showToast("success", modalMode === "create" ? "Artikel baru berhasil diterbitkan!" : "Artikel berhasil diperbarui!");
      setIsModalOpen(false);
      void loadArticles();
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan saat menyimpan artikel.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (art: ArticleItem) => {
    try {
      const res = await fetch("/api/backend/admin/article/toggle-status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: art.id }),
      });
      const json = await res.json();
      if (json.status === "success") {
        showToast("success", `Status artikel diubah menjadi: ${json.data?.status?.toUpperCase()}`);
        void loadArticles();
      }
    } catch {
      showToast("error", "Gagal mengubah status artikel.");
    }
  };

  const handleDeleteArticle = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const res = await fetch("/api/backend/admin/article/delete.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const json = await res.json();
      if (json.status === "success") {
        showToast("success", "Artikel berhasil dihapus.");
        setDeleteTarget(null);
        void loadArticles();
      } else {
        throw new Error(json.message || "Gagal menghapus.");
      }
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghapus artikel.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter & Search
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat =
        categoryFilter === "Semua" ||
        art.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchStatus =
        statusFilter === "all" ||
        art.status.toLowerCase() === statusFilter.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.slug.toLowerCase().includes(q) ||
        art.author.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q);

      return matchCat && matchStatus && matchSearch;
    });
  }, [articles, categoryFilter, statusFilter, searchQuery]);

  const presetThumbnails = [
    { label: "Server & Cloud", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80" },
    { label: "SEO & Traffic", url: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop&q=80" },
    { label: "Bisnis & UMKM", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80" },
    { label: "Domain & DNS", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80" },
    { label: "Keamanan Cyber", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80" },
    { label: "Google Ads", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="admin-wrapper flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <AdminSidebar currentPath="/admin/articles" />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20"
                : "bg-rose-600 text-white border-rose-500 shadow-rose-600/20"
            }`}
          >
            <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="admin-main-content flex-1 min-w-0 ml-0 md:ml-[190px] lg:ml-[275px] p-6 sm:p-10 space-y-8 overflow-y-auto pb-24 md:pb-10">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Manajemen Artikel &amp; Blog
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kelola postingan artikel, panduan website, tips SEO, dan publikasi konten untuk pengunjung Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              target="_blank"
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs transition flex items-center gap-1.5"
            >
              <span>👁️</span> Buka Halaman Blog ↗
            </Link>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20 transition transform active:scale-95 flex items-center gap-2"
            >
              <span className="text-sm">+</span> Tambah Artikel Baru
            </button>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Artikel</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</strong>
              <span className="text-xl">📚</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Tayang (Published)</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.published}</strong>
              <span className="text-xl">✅</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Konsep (Draft)</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-amber-700">{stats.draft}</strong>
              <span className="text-xl">📝</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Total Pembaca</span>
            <div className="flex items-baseline justify-between">
              <strong className="text-2xl sm:text-3xl font-black text-blue-700">{stats.views.toLocaleString("id-ID")}</strong>
              <span className="text-xl">👁️</span>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR: SEARCH & FILTERS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* SEARCH INPUT */}
            <div className="relative w-full md:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Cari judul, kategori, atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            {/* STATUS TABS */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Semua ({articles.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === "published" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Published ({articles.filter((a) => a.status === "published").length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === "draft" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Draft ({articles.filter((a) => a.status === "draft").length})
              </button>
            </div>

            {/* CATEGORY SELECT */}
            <div className="w-full md:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Semua">Semua Kategori</option>
                {stats.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ARTICLES TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Memuat artikel...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <span className="text-4xl block">🔍</span>
              <strong className="text-base text-slate-800">Tidak ada artikel yang cocok</strong>
              <p className="text-xs text-slate-400">Silakan ubah kata kunci pencarian atau tambah artikel baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Artikel</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Penulis</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-slate-50/70 transition">
                      {/* ARTIKEL INFO */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5 max-w-md">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-xs">
                            <img
                              src={art.thumbnail || "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200"}
                              alt={art.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <strong className="text-slate-900 block font-bold text-xs line-clamp-2 hover:text-orange-600 transition">
                              {art.title}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              /{art.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* KATEGORI */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px]">
                          {art.category}
                        </span>
                      </td>

                      {/* PENULIS */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {art.author}
                      </td>

                      {/* STATUS & TOGGLE */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(art)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition ${
                            art.status === "published"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200"
                          }`}
                          title="Klik untuk mengubah status tayang"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${art.status === "published" ? "bg-emerald-600" : "bg-amber-600"}`} />
                          <span>{art.status === "published" ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* VIEWS */}
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        👁️ {art.views}
                      </td>

                      {/* TANGGAL */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {art.created_at.slice(0, 10)}
                      </td>

                      {/* AKSI BUTTONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/blog/${art.slug}`}
                            target="_blank"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="Preview di Halaman Blog"
                          >
                            👁️
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(art)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition font-bold"
                            title="Edit Artikel"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(art)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition font-bold"
                            title="Hapus Artikel"
                          >
                            🗑️
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

      {/* =========================================================
          MODAL: TAMBAH / EDIT ARTIKEL
      ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {modalMode === "create" ? "➕ Tulis Artikel Baru" : "✏️ Edit Artikel"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi informasi judul, kategori, thumbnail, dan isi artikel website Anda.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveTab("editor")}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeTab === "editor" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Editor HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1 rounded-lg transition ${
                      activeTab === "preview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto flex-1 space-y-5">
              {activeTab === "editor" ? (
                <>
                  {/* JUDUL & SLUG */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Artikel <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Panduan Memilih Hosting Terbaik 2026"
                        value={formTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        URL Slug (Alamat Link) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="contoh-panduan-memilih-hosting"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* KATEGORI & PENULIS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kategori</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      >
                        <option value="Web Hosting">Web Hosting</option>
                        <option value="Tips SEO">Tips SEO</option>
                        <option value="Bisnis & Digital">Bisnis &amp; Digital</option>
                        <option value="Domain & DNS">Domain &amp; DNS</option>
                        <option value="Keamanan Web">Keamanan Web</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Tutorial">Tutorial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Baru (Opsional)</label>
                      <input
                        type="text"
                        placeholder="Ketik kategori custom..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penulis (Author)</label>
                      <input
                        type="text"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* THUMBNAIL URL & PRESETS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      URL Gambar Thumbnail (Unsplash / Gambar Web)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={formThumbnail}
                        onChange={(e) => setFormThumbnail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    {/* PRESET CHIPS */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                      <span className="text-[10px] text-slate-400 font-bold">Pilih Cepat:</span>
                      {presetThumbnails.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setFormThumbnail(p.url)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-100 hover:text-orange-700 border border-slate-200 text-[10px] font-semibold text-slate-600 transition"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* EXCERPT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ringkasan Singkat (Excerpt) <span className="text-slate-400 text-[10px] font-normal">(Muncul di card &amp; cuplikan Google)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ringkasan 1-2 kalimat untuk menarik minat pembaca..."
                      value={formExcerpt}
                      onChange={(e) => setFormExcerpt(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* CONTENT (HTML FORMAT) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Isi Konten Artikel <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-1.5 text-[10px] text-slate-500">
                        <span>Mendukung tag: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;code&gt;</span>
                      </div>
                    </div>
                    <textarea
                      rows={10}
                      placeholder="Tulis artikel menggunakan format HTML..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      required
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* STATUS RADIO */}
                  <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700">Status Publikasi:</span>
                    <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={formStatus === "published"}
                        onChange={() => setFormStatus("published")}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span>🚀 Published (Tayang Langsung)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-amber-700 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formStatus === "draft"}
                        onChange={() => setFormStatus("draft")}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span>📝 Draft (Simpan sebagai Konsep)</span>
                    </label>
                  </div>
                </>
              ) : (
                /* LIVE PREVIEW TAB */
                <div className="space-y-6 max-w-2xl mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                      {customCategory || formCategory}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      {formTitle || "Judul Artikel Anda"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Ditulis oleh <strong>{formAuthor}</strong>
                    </p>
                  </div>

                  {formThumbnail && (
                    <div className="rounded-2xl overflow-hidden max-h-64 bg-slate-200">
                      <img src={formThumbnail} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {formExcerpt && (
                    <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl">
                      <p className="text-xs font-semibold text-slate-700 italic">{formExcerpt}</p>
                    </div>
                  )}

                  <div
                    className="article-preview-content text-xs sm:text-sm text-slate-800 space-y-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formContent }}
                  />
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition transform active:scale-95 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : modalMode === "create" ? "🚀 Terbitkan Artikel" : "💾 Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          CONFIRM DELETE MODAL
      ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl text-center space-y-4">
            <span className="text-4xl block">🗑️</span>
            <h3 className="text-lg font-black text-slate-900">Hapus Artikel?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus artikel: <br />
              <strong className="text-slate-800">&ldquo;{deleteTarget.title}&rdquo;</strong>?
              <br />Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteArticle}
                disabled={deleting}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
