"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWhatsAppUrl } from "../../lib/siteConfig";
import { printOrDownloadInvoicePdf } from "@/app/lib/invoicePdf";

type OrderItem = {
  id: number;
  order_id: number;
  domain_id: number;
  domain_name: string;
  price: string;
};

type InvoiceDetail = {
  id: number;
  invoice_number: string;
  order_id: number;
  order_number: string;
  items: OrderItem[];
  subtotal: string;
  ppn: string;
  discount: string;
  total: string;
  status: string;
  due_date: string;
  created_at: string;
};

type InvoiceListItem = {
  id: number;
  order_id: number;
  invoice_number: string;
  subtotal: string;
  ppn: string;
  discount: string;
  total: string;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
};

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialInvoiceId = searchParams.get("id");

  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  function getDeletedSet(): Set<string> {
    const deletedSet = new Set<string>();
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("hostingweb_deleted_orders") : null;
      if (raw) {
        (JSON.parse(raw) as string[]).forEach((item) => {
          if (item) deletedSet.add(String(item).trim().toLowerCase());
        });
      }
    } catch {}
    return deletedSet;
  }

  useEffect(() => {
    let isMounted = true;
    async function fetchInvoices() {
      try {
        const response = await fetch(
          "/api/backend/invoice/index.php",
          { method: "GET", credentials: "include", cache: "no-store" }
        );
        const result = await response.json().catch(() => null);
        if (response.ok && result?.status === "success" && isMounted) {
          const deletedSet = getDeletedSet();
          const list: InvoiceListItem[] = (result.data || []).filter((inv: InvoiceListItem) => {
            const num = (inv.invoice_number || "").toLowerCase();
            const ordId = String(inv.order_id || "").toLowerCase();
            const invId = String(inv.id || "").toLowerCase();
            if (num && deletedSet.has(num)) return false;
            if (ordId && deletedSet.has(ordId)) return false;
            if (invId && deletedSet.has(invId)) return false;
            if (deletedSet.has(`ord-${ordId}`)) return false;
            if (deletedSet.has(`inv-${invId}`)) return false;
            return true;
          });
          setInvoices(list);
          if (list.length > 0 && !initialInvoiceId) {
            void fetchInvoiceDetail(list[0].id);
          }
        }
      } catch (err) {
        console.error("Fetch invoices error:", err);
        setError("Gagal mengambil data tagihan.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void fetchInvoices();

    const onStorageChange = () => {
      void fetchInvoices();
    };
    window.addEventListener("storage", onStorageChange);

    const interval = window.setInterval(() => {
      void fetchInvoices();
    }, 3000);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", onStorageChange);
      window.clearInterval(interval);
    };
  }, [initialInvoiceId]);

  useEffect(() => {
    if (initialInvoiceId) {
      void fetchInvoiceDetail(Number(initialInvoiceId));
    }
  }, [initialInvoiceId]);

  async function fetchInvoiceDetail(invoiceId: number) {
    try {
      setDetailLoading(true);
      const response = await fetch(
        `/api/backend/invoice/index.php?invoice_id=${invoiceId}`,
        { method: "GET", credentials: "include" }
      );
      const result = await response.json().catch(() => null);
      if (response.ok && result?.status === "success") {
        setSelectedInvoice(result.data);
      }
    } catch (err) {
      console.error("Fetch invoice detail error:", err);
    } finally {
      setDetailLoading(false);
    }
  }

  function rupiah(value: string | number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr.replace(" ", "T"));
      if (isNaN(date.getTime())) return dateStr;
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Memuat daftar tagihan...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: LIST OF INVOICES */}
        <div className="dash-table-card lg:col-span-1 p-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Semua Tagihan ({invoices.length})
            </h3>
          </div>

          <div className="flex flex-col gap-2.5 pt-3 max-h-[600px] overflow-y-auto">
            {invoices.length > 0 ? (
              invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                const isPaid =
                  inv.status?.toLowerCase() === "paid" ||
                  inv.status?.toLowerCase() === "lunas";
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => {
                      router.push(`/dashboard/invoices?id=${inv.id}`);
                      void fetchInvoiceDetail(inv.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-orange-50 border-orange-300 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        #{inv.invoice_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isPaid ? "Lunas" : "Belum Bayar"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {formatDate(inv.created_at)}
                      </span>
                      <strong className="text-slate-900">{rupiah(inv.total)}</strong>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Belum ada data tagihan.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INVOICE DETAIL */}
        <div className="dash-table-card lg:col-span-2 p-6">
          {detailLoading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Memuat detail tagihan...
            </div>
          ) : selectedInvoice ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    DETAIL TAGIHAN
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Invoice #{selectedInvoice.invoice_number}
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    Order ID: #{selectedInvoice.order_number || selectedInvoice.order_id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const savedUser = localStorage.getItem("hostingwebid_user");
                      let uName = "Pelanggan";
                      let uEmail = "";
                      if (savedUser) {
                        try {
                          const p = JSON.parse(savedUser);
                          uName = p.name || p.username || "Pelanggan";
                          uEmail = p.email || "";
                        } catch {}
                      }
                      printOrDownloadInvoicePdf({
                        invoice_number: selectedInvoice.invoice_number,
                        order_number: selectedInvoice.order_number || selectedInvoice.order_id,
                        created_at: selectedInvoice.created_at,
                        due_date: selectedInvoice.due_date,
                        status: selectedInvoice.status,
                        username: uName,
                        email: uEmail,
                        total: selectedInvoice.total,
                        subtotal: selectedInvoice.subtotal,
                        ppn: selectedInvoice.ppn,
                        items: selectedInvoice.items,
                      });
                    }}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span></span> Download PDF
                  </button>

                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      selectedInvoice.status?.toLowerCase() === "paid" ||
                      selectedInvoice.status?.toLowerCase() === "lunas"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }`}
                  >
                    ●{" "}
                    {selectedInvoice.status?.toLowerCase() === "paid" ||
                    selectedInvoice.status?.toLowerCase() === "lunas"
                      ? "Lunas"
                      : "Belum Dibayar"}
                  </span>
                </div>
              </div>

              {/* META INFO */}
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Tanggal Invoice:</span>
                  <strong className="text-slate-800 font-bold">
                    {formatDate(selectedInvoice.created_at)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Jatuh Tempo:</span>
                  <strong className="text-red-600 font-bold">
                    {formatDate(selectedInvoice.due_date)}
                  </strong>
                </div>
              </div>

              {/* ITEMS */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Item Layanan
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-100 font-bold text-slate-700">
                    <span>Deskripsi</span>
                    <span>Harga</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-white"
                        >
                          <div>
                            <strong className="text-slate-800 font-bold block">
                              {item.domain_name}
                            </strong>
                            <span className="text-[11px] text-slate-500">
                              Layanan Cloud Hosting / Domain
                            </span>
                          </div>
                          <strong className="text-slate-900 font-bold">
                            {rupiah(item.price)}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white">
                        <div>
                          <strong className="text-slate-800 font-bold block">
                            Paket Layanan Website &amp; Hosting
                          </strong>
                        </div>
                        <strong className="text-slate-900 font-bold">
                          {rupiah(selectedInvoice.subtotal || selectedInvoice.total)}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TOTALS */}
              <div className="flex flex-col gap-1.5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{rupiah(selectedInvoice.subtotal || selectedInvoice.total)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>PPN (11%):</span>
                  <span>{rupiah(selectedInvoice.ppn || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200 mt-1">
                  <span>Total Tagihan:</span>
                  <span className="text-orange-600">{rupiah(selectedInvoice.total)}</span>
                </div>
              </div>

              {/* ACTION: DOWNLOAD OFFICIAL INVOICE PDF */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Dokumen Tagihan Resmi:
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Unduh file PDF invoice resmi untuk arsip atau bukti transaksi Anda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const savedUser = localStorage.getItem("hostingwebid_user");
                    let uName = "Pelanggan";
                    let uEmail = "";
                    if (savedUser) {
                      try {
                        const p = JSON.parse(savedUser);
                        uName = p.name || p.username || "Pelanggan";
                        uEmail = p.email || "";
                      } catch {}
                    }
                    printOrDownloadInvoicePdf({
                      invoice_number: selectedInvoice.invoice_number,
                      order_number: selectedInvoice.order_number || selectedInvoice.order_id,
                      created_at: selectedInvoice.created_at,
                      due_date: selectedInvoice.due_date,
                      status: selectedInvoice.status,
                      username: uName,
                      email: uEmail,
                      total: selectedInvoice.total,
                      subtotal: selectedInvoice.subtotal,
                      ppn: selectedInvoice.ppn,
                      items: selectedInvoice.items,
                    });
                  }}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
                >
                  <span></span> Download PDF
                </button>
              </div>

              {/* PAYMENT INSTRUCTIONS */}
              {selectedInvoice.status?.toLowerCase() !== "paid" && selectedInvoice.status?.toLowerCase() !== "lunas" && (
                <div className="flex flex-col gap-3 p-4 bg-orange-50/70 border border-orange-200 rounded-xl">
                  <h4 className="text-xs font-bold text-orange-950">
                    Instruksi Pembayaran Transfer Bank:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-orange-100">
                      <span className="font-bold text-slate-800 block">Bank BCA</span>
                      <span className="font-mono font-bold text-orange-600 block text-sm">
                        123-456-7890
                      </span>
                      <span className="text-[10px] text-slate-500">
                        A/N HostingWeb Indonesia
                      </span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-orange-100">
                      <span className="font-bold text-slate-800 block">Bank Mandiri</span>
                      <span className="font-mono font-bold text-orange-600 block text-sm">
                        987-654-3210
                      </span>
                      <span className="text-[10px] text-slate-500">
                        A/N HostingWeb Indonesia
                      </span>
                    </div>
                  </div>

                  <a
                    href={getWhatsAppUrl(`Halo HostingWeb, saya sudah transfer untuk konfirmasi pembayaran invoice #${selectedInvoice.invoice_number}. Mohon diproses. Terima kasih!`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 mt-1"
                  >
                    <span></span> Konfirmasi Pembayaran via WhatsApp
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              Pilih invoice di sebelah kiri untuk melihat rincian tagihan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-slate-500">
          Memuat halaman invoice...
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
