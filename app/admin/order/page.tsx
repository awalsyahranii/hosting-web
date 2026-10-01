"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

type OrderLog = {
  id: number;
  order_id?: number;
  order_number: string;
  username: string;
  email: string;
  domain_name?: string;
  service_category?: string;
  order_total: string | number;
  order_status: string;
  order_date: string;
};

export default function AdminOrderPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<OrderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/order");
      return;
    }
    try {
      const u = JSON.parse(savedUser);
      if (u.role !== "admin" && u.role !== "super_admin" && u.role !== "superadmin") {
        router.push("/dashboard");
        return;
      }
      setUser(u);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        const resReport = await fetch(
          "/api/backend/admin/order/report.php",
          { method: "GET", credentials: "include" }
        );
        const jsonReport = await resReport.json().catch(() => null);
        const rawServices: any[] = jsonReport?.data?.services || [];

        const resPayment = await fetch(
          "/api/backend/admin/payment/index.php",
          { method: "GET", credentials: "include" }
        );
        const jsonPayment = await resPayment.json().catch(() => null);
        const rawPayments: any[] = Array.isArray(jsonPayment?.data)
          ? jsonPayment.data
          : jsonPayment?.data?.payments || [];

        const combinedList: OrderLog[] = [];
        const seenOrderNumbers = new Set<string>();

        rawServices.forEach((s: any) => {
          const ordNum = s.order_number || (s.order_id ? `ORD-${s.order_id}` : "-");
          combinedList.push({
            id: Number(s.id || Math.floor(Math.random() * 10000)),
            order_id: s.order_id,
            order_number: ordNum,
            username: s.username || s.user_name || "Pelanggan",
            email: s.email || "-",
            domain_name: s.domain_name || "Paket Hosting / Domain",
            service_category: s.service_category || "Hosting",
            order_total: s.order_total || s.price || 0,
            order_status: s.order_status || s.service_status || "active",
            order_date: s.order_date || s.start_date || "-",
          });
          if (ordNum !== "-") seenOrderNumbers.add(ordNum);
        });

        rawPayments.forEach((p: any) => {
          const ordNum = p.order_number || (p.order_id ? `ORD-${p.order_id}` : "-");
          if (!seenOrderNumbers.has(ordNum) && ordNum !== "-") {
            const isPaid = (p.status || "").toLowerCase() === "paid";
            combinedList.push({
              id: Number(p.payment_id || p.id || Math.floor(Math.random() * 10000)),
              order_id: p.order_id,
              order_number: ordNum,
              username: p.username || p.user_name || "Pelanggan",
              email: p.email || "-",
              domain_name: p.domain_name || p.domain || "Paket Hosting NVMe",
              service_category: "Cloud Hosting NVMe",
              order_total: p.amount || p.total || 0,
              order_status: isPaid ? "completed" : "pending",
              order_date: p.paid_at || p.created_at || "-",
            });
            seenOrderNumbers.add(ordNum);
          }
        });

        setOrders(combinedList);
      } catch (err) {
        console.error("Fetch orders error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      void fetchOrders();
    }
  }, [user]);

  const [catFilter, setCatFilter] = useState("all");

  function detectOrderCategory(o: OrderLog): "hosting" | "domain" | "google_ads" | "seo" | "website" | "theme" {
    const text = `${o.service_category || ""} ${o.domain_name || ""}`.toLowerCase();
    if (text.includes("tema") || text.includes("theme") || text.includes("template")) return "theme";
    if (text.includes("ads") || text.includes("iklan") || text.includes("google") || text.includes("pemula-") || text.includes("bisnis-") || text.includes("paket pemula")) return "google_ads";
    if (text.includes("seo") || text.includes("backlink")) return "seo";
    if (text.includes("website") || text.includes("desain web")) return "website";
    if (text.includes("domain") || text.includes(".com") || text.includes(".id")) return "domain";
    return "hosting";
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      (o.order_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.domain_name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (o.order_status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchCat =
      catFilter === "all" ||
      detectOrderCategory(o) === catFilter;
    return matchSearch && matchStatus && matchCat;
  });

  function rupiah(val: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  }

  if (!user) return <div className="p-8 text-sm text-slate-500">Memuat data...</div>;

  return (
    <main className="admin-page">
      <AdminSidebar currentPath="/admin/order" />

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">ADMIN PANEL / TRANSAKSI</div>
            <h1>Riwayat Pesanan (Order Logs)</h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor pesanan, user..."
              />
            </div>
          </div>
        </header>

        {/* OVERVIEW STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Pesanan Masuk</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{orders.length}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-emerald-600 uppercase">Pesanan Selesai (Completed)</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {orders.filter((o) => (o.order_status || "").toLowerCase() === "completed").length}
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-amber-600 uppercase">Menunggu Proses / Pending</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">
              {orders.filter((o) => (o.order_status || "").toLowerCase() === "pending").length}
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "Semua Kategori" },
              { key: "hosting", label: "🔥 Hosting" },
              { key: "domain", label: "🌐 Domain" },
              { key: "google_ads", label: "🎯 Google Ads" },
              { key: "seo", label: "🚀 SEO" },
              { key: "website", label: "💻 Website" },
              { key: "theme", label: "🎨 Tema" },
            ].map((ct) => (
              <button
                key={ct.key}
                type="button"
                onClick={() => setCatFilter(ct.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  catFilter === ct.key
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {["all", "completed", "pending", "cancelled"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                  statusFilter === st
                    ? "bg-orange-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {st === "all" ? "Semua Status" : st}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Memuat log transaksi pesanan...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">Tidak ada riwayat pesanan ditemukan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="p-3.5">No. Pesanan</th>
                    <th className="p-3.5">Pelanggan</th>
                    <th className="p-3.5">Layanan / Item</th>
                    <th className="p-3.5">Waktu Transaksi</th>
                    <th className="p-3.5">Total Bayar</th>
                    <th className="p-3.5">Status Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((o, idx) => {
                    const isCompleted = (o.order_status || "").toLowerCase() === "completed";
                    return (
                      <tr key={`order-${o.id}-${o.order_number}-${idx}`} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          #{o.order_number}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{o.username || "-"}</span>
                          <small className="text-slate-400">{o.email || "-"}</small>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700">
                          {o.domain_name || o.service_category || "Layanan Hosting / Domain"}
                        </td>
                        <td className="p-3.5 text-slate-600">{o.order_date || "-"}</td>
                        <td className="p-3.5 font-bold text-slate-900">{rupiah(o.order_total)}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                : "bg-amber-100 text-amber-700 border border-amber-300"
                            }`}
                          >
                            {o.order_status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
