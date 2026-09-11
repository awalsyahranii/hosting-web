"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

type InvoiceItem = {
  id: number;
  invoice_number: string;
  order_number: string;
  username: string;
  email: string;
  total: string | number;
  subtotal: string | number;
  status: string;
  due_date: string;
  created_at: string;
};

export default function AdminInvoicePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/invoice");
      return;
    }
    try {
      const u = JSON.parse(savedUser);
      if (u.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setUser(u);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const res = await fetch(
          "http://localhost/hosting_webid/api/v1/invoice/index.php",
          { method: "GET", credentials: "include" }
        );
        const json = await res.json().catch(() => null);
        if (res.ok && json?.status === "success") {
          setInvoices(json.data || []);
        }
      } catch (err) {
        console.error("Fetch invoices error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      void fetchInvoices();
    }
  }, [user]);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.order_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (inv.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
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
      <AdminSidebar currentPath="/admin/invoice" />

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">ADMIN PANEL / BILLING</div>
            <h1>Tagihan &amp; Invoice</h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor invoice / email..."
              />
            </div>
          </div>
        </header>
        {/* OVERVIEW STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Invoice Diterbitkan</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{invoices.length}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-emerald-600 uppercase">Tagihan Lunas</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {invoices.filter((i) => (i.status || "").toLowerCase() === "paid" || (i.status || "").toLowerCase() === "lunas").length}
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-red-600 uppercase">Belum Dibayar / Menunggu</span>
            <div className="text-2xl font-extrabold text-red-700 mt-1">
              {invoices.filter((i) => (i.status || "").toLowerCase() !== "paid" && (i.status || "").toLowerCase() !== "lunas").length}
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            {["all", "paid", "pending", "unpaid"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${statusFilter === st
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {st === "all" ? "Semua Status" : st === "paid" ? "Lunas" : "Belum Bayar"}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            onClick={() => alert("Form buat tagihan manual siap digunakan.")}
          >
            + Buat Tagihan Manual
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Memuat data invoice...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">Tidak ada tagihan invoice ditemukan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="p-3.5">No. Invoice</th>
                    <th className="p-3.5">Pelanggan</th>
                    <th className="p-3.5">Tanggal Terbit</th>
                    <th className="p-3.5">Jatuh Tempo</th>
                    <th className="p-3.5">Total Nominal</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((inv, idx) => {
                    const isPaid =
                      (inv.status || "").toLowerCase() === "paid" ||
                      (inv.status || "").toLowerCase() === "lunas";
                    return (
                      <tr key={`inv-${inv.id}-${inv.invoice_number}-${idx}`} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <strong className="text-slate-900 block font-bold font-mono">
                            #{inv.invoice_number}
                          </strong>
                          <small className="text-slate-400">Order: #{inv.order_number || inv.id}</small>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{inv.username || "Customer"}</span>
                          <small className="text-slate-400">{inv.email || "-"}</small>
                        </td>
                        <td className="p-3.5 text-slate-600">{inv.created_at || "-"}</td>
                        <td className="p-3.5 text-red-600 font-medium">{inv.due_date || "-"}</td>
                        <td className="p-3.5 font-bold text-slate-900">{rupiah(inv.total)}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isPaid
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                              }`}
                          >
                            {isPaid ? "LUNAS" : "BELUM BAYAR"}
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
