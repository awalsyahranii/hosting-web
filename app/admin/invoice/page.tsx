"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import { printOrDownloadInvoicePdf, InvoicePdfData } from "@/app/lib/invoicePdf";

type InvoiceItem = {
  id: number;
  invoice_number: string;
  order_number: string;
  username: string;
  email: string;
  phone?: string;
  total: string | number;
  subtotal: string | number;
  ppn?: string | number;
  discount?: string | number;
  status: string;
  due_date: string;
  created_at: string;
  items?: Array<{
    id?: number | string;
    domain_name?: string;
    description?: string;
    price: number | string;
  }>;
};

export default function AdminInvoicePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Invoice for detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/invoice");
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
      router.push("/login?redirect=/admin/invoice");
    }
  }, [router]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const combined: InvoiceItem[] = [];

      // 1. Fetch from Admin Payment API (Where confirmed & pending payments reside)
      try {
        const payRes = await fetch("/api/backend/admin/payment/index.php", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (payRes.ok) {
          const payJson = await payRes.json();
          const list = Array.isArray(payJson.data)
            ? payJson.data
            : payJson.data?.payments || (payJson.data && typeof payJson.data === "object" && "payment_id" in payJson.data ? [payJson.data] : []);

          list.forEach((p: any) => {
            const rawId = p.payment_id || p.id || "1";
            const ordNum = p.order_number || p.order_id || rawId;
            const rawInvStr = p.invoice_number || (p.payment_number ? String(p.payment_number).replace(/^PAY-/, "INV-") : null);
            const invNum =
              rawInvStr ||
              `INV-${(p.created_at || p.payment_date || new Date().toISOString()).slice(0, 10).replace(/-/g, "")}-${String(ordNum).padStart(4, "0")}`;

            const isPaid =
              p.status === "success" ||
              p.status === "paid" ||
              p.status === "lunas" ||
              p.status === "completed" ||
              p.status === "active" ||
              p.status === "confirmed";

            const rawItems = p.items && Array.isArray(p.items) && p.items.length > 0
              ? p.items.map((it: any) => ({
                  description: it.domain_name || it.description || it.item_name || "Layanan Hosting & Domain",
                  price: it.price || it.amount || p.amount || p.total || 0,
                }))
              : [
                  {
                    description: p.domain_name || p.domain || p.domains || (p.payment_type ? `Pembayaran Layanan (${p.payment_type.toUpperCase()})` : "Paket Layanan Cloud Hosting & Domain Website"),
                    price: p.amount || p.total || 0,
                  },
                ];

            combined.push({
              id: Number(rawId),
              invoice_number: invNum,
              order_number: String(ordNum),
              username: p.username || p.user_name || p.name || "Pelanggan",
              email: p.email || p.user_email || "",
              phone: p.phone || p.whatsapp || "",
              total: p.amount || p.total || 0,
              subtotal: p.subtotal || p.amount || p.total || 0,
              ppn: p.ppn || 0,
              discount: p.discount || 0,
              status: isPaid ? "paid" : (p.status || "unpaid"),
              due_date: p.due_date || (p.created_at ? p.created_at.slice(0, 10) : "-"),
              created_at: p.created_at || p.payment_date || p.paid_at || "-",
              items: rawItems,
            });
          });
        }
      } catch (err) {
        console.warn("Failed fetching /api/backend/admin/payment/index.php:", err);
      }

      // 2. Fetch from Invoice API (/api/backend/invoice/index.php)
      try {
        const invRes = await fetch("/api/backend/invoice/index.php", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (invRes.ok) {
          const invJson = await invRes.json();
          const invList = Array.isArray(invJson.data)
            ? invJson.data
            : invJson.data?.invoices || [];

          invList.forEach((inv: any) => {
            const invNum = inv.invoice_number || `INV-${inv.id}`;
            const exists = combined.some(
              (c) => c.invoice_number === invNum || String(c.order_number) === String(inv.order_id || inv.order_number)
            );
            if (!exists) {
              const isPaid =
                inv.status === "paid" ||
                inv.status === "lunas" ||
                inv.status === "success" ||
                inv.status === "completed" ||
                inv.status === "active";
              combined.push({
                id: Number(inv.id || 0),
                invoice_number: invNum,
                order_number: String(inv.order_number || inv.order_id || inv.id),
                username: inv.username || inv.user_name || "Pelanggan",
                email: inv.email || "",
                phone: inv.phone || "",
                total: inv.total || inv.amount || 0,
                subtotal: inv.subtotal || inv.total || inv.amount || 0,
                ppn: inv.ppn || 0,
                discount: inv.discount || 0,
                status: isPaid ? "paid" : (inv.status || "unpaid"),
                due_date: inv.due_date || "-",
                created_at: inv.created_at || "-",
                items: inv.items || [
                  {
                    description: inv.description || "Layanan Web Hosting & Domain",
                    price: inv.total || 0,
                  },
                ],
              });
            }
          });
        }
      } catch (err) {
        console.warn("Failed fetching /api/backend/invoice/index.php:", err);
      }

      // 3. Fetch from User Orders API (/api/backend/dashboardusers/order/index.php)
      try {
        const ordRes = await fetch("/api/backend/dashboardusers/order/index.php", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (ordRes.ok) {
          const ordJson = await ordRes.json();
          const ordList = Array.isArray(ordJson.data)
            ? ordJson.data
            : ordJson.data?.orders || [];

          ordList.forEach((ord: any) => {
            const invNum =
              ord.invoice_number ||
              `INV-${(ord.created_at || "").slice(0, 10).replace(/-/g, "")}-${String(ord.order_number || ord.id).padStart(4, "0")}`;
            const exists = combined.some(
              (c) => c.invoice_number === invNum || String(c.order_number) === String(ord.order_number || ord.id)
            );
            if (!exists) {
              const isPaid =
                ord.status === "paid" ||
                ord.status === "completed" ||
                ord.status === "success" ||
                ord.status === "active" ||
                ord.status === "lunas";
              combined.push({
                id: Number(ord.id || 0),
                invoice_number: invNum,
                order_number: String(ord.order_number || ord.id),
                username: ord.username || ord.user_name || "Pelanggan",
                email: ord.email || ord.user_email || "",
                phone: ord.phone || "",
                total: ord.total_amount || ord.total || ord.amount || 0,
                subtotal: ord.total_amount || ord.total || ord.amount || 0,
                ppn: ord.ppn || 0,
                discount: ord.discount || 0,
                status: isPaid ? "paid" : (ord.status || "unpaid"),
                due_date: ord.due_date || ord.created_at || "-",
                created_at: ord.created_at || "-",
                items: [
                  {
                    description: ord.package_name || ord.domain_name || "Paket Layanan Website",
                    price: ord.total_amount || ord.total || ord.amount || 0,
                  },
                ],
              });
            }
          });
        }
      } catch (err) {
        console.warn("Failed fetching /api/backend/dashboardusers/order/index.php:", err);
      }

      // Sort newest first
      combined.sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });

      setInvoices(combined);
    } catch (err) {
      console.error("Gagal mengambil data tagihan:", err);
    } finally {
      setLoading(false);
    }
  };

  const rupiah = (val: number | string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  const handleDownloadPdf = (inv: InvoiceItem) => {
    const pdfData: InvoicePdfData = {
      invoice_number: inv.invoice_number,
      order_number: inv.order_number || inv.id,
      created_at: inv.created_at,
      due_date: inv.due_date,
      status: inv.status,
      username: inv.username,
      email: inv.email,
      phone: inv.phone,
      total: inv.total,
      subtotal: inv.subtotal,
      ppn: inv.ppn,
      discount: inv.discount,
      items: inv.items,
    };
    printOrDownloadInvoicePdf(pdfData);
  };

  if (!user) return <div className="p-8 text-sm text-slate-500">Memuat data...</div>;

  const totalPaid = invoices.filter(
    (i) =>
      (i.status || "").toLowerCase() === "paid" ||
      (i.status || "").toLowerCase() === "lunas" ||
      (i.status || "").toLowerCase() === "success" ||
      (i.status || "").toLowerCase() === "completed" ||
      (i.status || "").toLowerCase() === "active"
  ).length;

  const totalUnpaid = invoices.length - totalPaid;

  const filteredInvoices = invoices.filter((inv) => {
    const isPaid =
      (inv.status || "").toLowerCase() === "paid" ||
      (inv.status || "").toLowerCase() === "lunas" ||
      (inv.status || "").toLowerCase() === "success" ||
      (inv.status || "").toLowerCase() === "completed" ||
      (inv.status || "").toLowerCase() === "active";

    if (statusFilter === "paid" && !isPaid) return false;
    if (statusFilter === "unpaid" && isPaid) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inv.invoice_number?.toLowerCase().includes(q) ||
        String(inv.order_number)?.toLowerCase().includes(q) ||
        inv.username?.toLowerCase().includes(q) ||
        inv.email?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <main className="admin-page">
      {/* Sidebar Admin */}
      <AdminSidebar currentPath="/admin/invoice" />

      {/* Main Content Area */}
      <section className="admin-content">
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">ADMIN PANEL / BILLING</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Manajemen Tagihan &amp; Invoice
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pantau seluruh invoice tagihan klien, unduh langsung file PDF resmi, dan pantau status pelunasan.
            </p>
          </div>

          <div className="admin-header-right">
            <button
              onClick={fetchInvoices}
              disabled={loading}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Refresh Data</span>
            </button>
          </div>
        </header>

        {/* METRICS / STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Total Tagihan</span>
              <strong className="text-2xl font-black text-slate-900 mt-0.5 block">
                {invoices.length}
              </strong>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-500 block">Lunas (Paid)</span>
              <strong className="text-2xl font-black text-emerald-700 mt-0.5 block">
                {totalPaid}
              </strong>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              ✓
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-red-500 block">Belum Bayar (Unpaid)</span>
              <strong className="text-2xl font-black text-red-700 mt-0.5 block">
                {totalUnpaid}
              </strong>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
              ⏳
            </div>
          </div>
        </div>

        {/* FILTER & SEARCH */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === "paid"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Lunas ({totalPaid})
            </button>
            <button
              onClick={() => setStatusFilter("unpaid")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === "unpaid"
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Belum Bayar ({totalUnpaid})
            </button>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Cari no invoice, user, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* INVOICE TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Memuat daftar tagihan invoice...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              Belum ada data invoice yang sesuai.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Pelanggan</th>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Jatuh Tempo</th>
                    <th className="p-3.5">Total Nominal</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => {
                    const isPaid =
                      (inv.status || "").toLowerCase() === "paid" ||
                      (inv.status || "").toLowerCase() === "lunas" ||
                      (inv.status || "").toLowerCase() === "success" ||
                      (inv.status || "").toLowerCase() === "completed" ||
                      (inv.status || "").toLowerCase() === "active";

                    return (
                      <tr key={inv.id || inv.invoice_number} className="hover:bg-slate-50/50 transition">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-orange-600 block">
                            #{inv.invoice_number}
                          </span>
                          <small className="text-slate-400">Order: #{inv.order_number || "-"}</small>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{inv.username || "Customer"}</span>
                          <small className="text-slate-400">{inv.email || "-"}</small>
                        </td>
                        <td className="p-3.5 text-slate-600">{inv.created_at || "-"}</td>
                        <td className="p-3.5 text-slate-600">{inv.due_date || "-"}</td>
                        <td className="p-3.5 font-bold text-slate-900">{rupiah(inv.total)}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {isPaid ? "LUNAS" : "BELUM BAYAR"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* DOWNLOAD PDF BUTTON */}
                            <button
                              type="button"
                              title="Download File PDF Langsung"
                              onClick={() => handleDownloadPdf(inv)}
                              className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg font-bold text-[11px] transition flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                              <span>Download PDF</span>
                            </button>

                            {/* DETAIL MODAL BUTTON */}
                            <button
                              type="button"
                              title="Lihat Rincian"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition"
                            >
                              Detail
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
      </section>

      {/* MODAL DETAIL */}
      {modalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Detail Invoice #{selectedInvoice.invoice_number}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Pelanggan</span>
                  <strong className="text-slate-800">{selectedInvoice.username}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Email</span>
                  <strong className="text-slate-800">{selectedInvoice.email || "-"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Tanggal Terbit</span>
                  <strong className="text-slate-800">{selectedInvoice.created_at}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Jatuh Tempo</span>
                  <strong className="text-slate-800">{selectedInvoice.due_date}</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Rincian Item</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="p-2.5">Deskripsi</th>
                        <th className="p-2.5 text-right">Harga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 text-slate-700">
                              {it.description || it.domain_name || "Layanan Website"}
                            </td>
                            <td className="p-2.5 text-right font-medium text-slate-900">
                              {rupiah(it.price)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-2.5 text-slate-500">Layanan Website / Hosting</td>
                          <td className="p-2.5 text-right font-medium text-slate-900">
                            {rupiah(selectedInvoice.total)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <span className="font-bold text-slate-700">Total Pembayaran</span>
                <strong className="text-base font-black text-orange-600">
                  {rupiah(selectedInvoice.total)}
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedInvoice)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
