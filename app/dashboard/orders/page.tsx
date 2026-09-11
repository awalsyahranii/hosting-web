"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type OrderItem = {
  id: number;
  order_number: string;
  subtotal: string | number;
  ppn: string | number;
  discount: string | number;
  total: string | number;
  status: string;
  created_at: string;
  items_count?: number;
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const savedUser = typeof window !== "undefined" ? localStorage.getItem("hostingwebid_user") : null;
        let userId = null;
        if (savedUser) {
          try {
            userId = JSON.parse(savedUser).id;
          } catch {}
        }

        const url = userId 
          ? `http://localhost/hosting_webid/api/v1/dashboardusers/order/index.php?user_id=${userId}`
          : "http://localhost/hosting_webid/api/v1/dashboardusers/order/index.php";

        const response = await fetch(url, { method: "GET", credentials: "include" });
        const result = await response.json().catch(() => null);
        if (response.ok && result?.status === "success") {
          const list = result.data?.orders || (Array.isArray(result.data) ? result.data : []);
          setOrders(list);
        } else {
          // Fallback to invoice endpoint if order endpoint is empty
          const resInv = await fetch("http://localhost/hosting_webid/api/v1/invoice/index.php", {
            method: "GET",
            credentials: "include",
          });
          const resInvData = await resInv.json().catch(() => null);
          if (resInv.ok && resInvData?.status === "success" && Array.isArray(resInvData.data)) {
            const mapped = resInvData.data.map((inv: any) => ({
              id: inv.id,
              order_number: inv.invoice_number ? `ORD-${inv.invoice_number.replace('INV-', '')}` : `ORD-${inv.id}`,
              subtotal: inv.subtotal || inv.total,
              ppn: inv.ppn || 0,
              discount: inv.discount || 0,
              total: inv.total,
              status: inv.status,
              created_at: inv.created_at,
            }));
            setOrders(mapped);
          }
        }
      } catch (err) {
        console.error("Gagal load orders:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchOrders();
  }, [router]);

  function rupiah(val: string | number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
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

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.total).includes(search);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && (o.status?.toLowerCase() === "paid" || o.status?.toLowerCase() === "lunas")) ||
      (statusFilter === "pending" && (o.status?.toLowerCase() === "pending" || o.status?.toLowerCase() === "menunggu"));
    return matchSearch && matchStatus;
  });

  return (
    <div className="dash-table-card">
      <div className="dash-table-header flex-wrap gap-4">
        <div className="dash-table-title-group">
          <span className="dash-table-pretitle">RIWAYAT TRANSAKSI</span>
          <h3 className="dash-table-title">Daftar Semua Pesanan ({orders.length})</h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-md font-medium transition ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1 rounded-md font-medium transition ${
                statusFilter === "paid" ? "bg-emerald-600 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lunas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-md font-medium transition ${
                statusFilter === "pending" ? "bg-amber-600 text-white shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Menunggu
            </button>
          </div>

          <div className="dash-header-center-search" style={{ margin: 0 }}>
            <input
              type="text"
              className="dash-header-search-input"
              placeholder="Cari nomor pesanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="dash-services-list">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Memuat riwayat pesanan...
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((item) => (
            <div key={item.id} className="dash-service-item">
              <div className="dash-service-left">
                <div className="dash-service-icon-box" style={{ background: "#eff6ff", color: "#2563eb" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <div className="dash-service-info">
                  <span className="dash-service-name font-mono font-bold text-slate-900">#{item.order_number}</span>
                  <span className="dash-service-sub">
                    Tanggal: {formatDate(item.created_at)} • Total Pembayaran: <strong className="text-slate-900 font-semibold">{rupiah(item.total)}</strong>
                  </span>
                </div>
              </div>

              <div className="dash-service-right flex items-center gap-3">
                <span
                  className={`dash-service-status-pill ${
                    item.status?.toLowerCase() === "paid" ? "active" : "pending"
                  }`}
                >
                  ● {item.status?.toLowerCase() === "paid" ? "Lunas" : "Menunggu Pembayaran"}
                </span>

                {item.status?.toLowerCase() === "paid" ? (
                  <Link
                    href={`/dashboard/invoices?id=${item.id}`}
                    className="dash-service-action-btn"
                  >
                    Lihat Invoice →
                  </Link>
                ) : (
                  <Link
                    href={`/checkout?order_number=${item.order_number}&amount=${item.total}`}
                    className="dash-service-action-btn"
                    style={{ background: "#ea580c", color: "#fff", borderColor: "#ea580c" }}
                  >
                    Bayar Sekarang →
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="dash-empty-state">
            <div className="dash-empty-icon">🛒</div>
            <h4>Belum Ada Riwayat Pesanan</h4>
            <p>Anda belum memiliki riwayat transaksi pesanan pada filter ini.</p>
            <Link href="/#pricing" className="dash-empty-action-btn">
              + Mulai Berlangganan Sekarang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
