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

  function isOrderPaid(status?: string) {
    const s = (status || "").toLowerCase().trim();
    return [
      "paid",
      "lunas",
      "completed",
      "success",
      "aktif",
      "active",
      "settlement",
      "verified",
      "terbayar",
      "accept",
      "approved",
      "done",
    ].includes(s);
  }

  function getDeletedOrderSet(): Set<string> {
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

  function deduplicateOrders(orderList: OrderItem[]): OrderItem[] {
    const deletedSet = getDeletedOrderSet();
    const map = new Map<string, OrderItem>();

    for (const order of orderList) {
      const ordNum = order.order_number ? String(order.order_number).trim().toLowerCase() : "";
      const ordId = String(order.id).trim().toLowerCase();

      // Automatically omit if deleted by admin
      if (ordNum && deletedSet.has(ordNum)) continue;
      if (ordId && deletedSet.has(ordId)) continue;
      if (deletedSet.has(`ord-${ordId}`)) continue;

      const key = order.order_number ? String(order.order_number).trim() : `id_${order.id}`;
      if (!map.has(key)) {
        map.set(key, order);
      } else {
        // If one duplicate has paid status, prioritize the paid status
        const existing = map.get(key)!;
        if (isOrderPaid(order.status) && !isOrderPaid(existing.status)) {
          map.set(key, order);
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const timeA = new Date(String(a.created_at || "").replace(" ", "T")).getTime() || Number(a.id) || 0;
      const timeB = new Date(String(b.created_at || "").replace(" ", "T")).getTime() || Number(b.id) || 0;
      return timeB - timeA;
    });
  }

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const savedUser = typeof window !== "undefined" ? localStorage.getItem("hostingwebid_user") : null;
        let userId = null;
        if (savedUser) {
          try {
            userId = JSON.parse(savedUser).id;
          } catch {}
        }

        const url = userId 
          ? `/api/backend/dashboardusers/order/index.php?user_id=${userId}`
          : "/api/backend/dashboardusers/order/index.php";

        const response = await fetch(url, { method: "GET", credentials: "include", cache: "no-store" });
        const result = await response.json().catch(() => null);
        if (response.ok && result?.status === "success" && isMounted) {
          const list = result.data?.orders || (Array.isArray(result.data) ? result.data : []);
          setOrders(deduplicateOrders(list));
        } else if (isMounted) {
          // Fallback to invoice endpoint if order endpoint is empty
          const resInv = await fetch("/api/backend/invoice/index.php", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          });
          const resInvData = await resInv.json().catch(() => null);
          if (resInv.ok && resInvData?.status === "success" && Array.isArray(resInvData.data) && isMounted) {
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
            setOrders(deduplicateOrders(mapped));
          }
        }
      } catch (err) {
        console.error("Gagal load orders:", err);
      } finally {
        if (isMounted && isInitial) {
          setLoading(false);
        }
      }
    }

    void fetchOrders(true);

    const onStorageChange = () => {
      void fetchOrders(false);
    };
    window.addEventListener("storage", onStorageChange);

    const interval = window.setInterval(() => {
      void fetchOrders(false);
    }, 3000);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", onStorageChange);
      window.clearInterval(interval);
    };
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

  const paidCount = orders.filter((o) => isOrderPaid(o.status)).length;
  const pendingCount = orders.filter((o) => !isOrderPaid(o.status)).length;
  const totalCount = orders.length;

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.total).includes(search);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && isOrderPaid(o.status)) ||
      (statusFilter === "pending" && !isOrderPaid(o.status));
    return matchSearch && matchStatus;
  });

  return (
    <div className="dash-table-card">
      <div className="dash-table-header flex-wrap gap-4">
        <div className="dash-table-title-group">
          <span className="dash-table-pretitle">RIWAYAT TRANSAKSI</span>
          <h3 className="dash-table-title">
            {statusFilter === "paid"
              ? `Pesanan Lunas (${filteredOrders.length})`
              : statusFilter === "pending"
              ? `Pesanan Menunggu Pembayaran (${filteredOrders.length})`
              : `Daftar Semua Pesanan (${totalCount})`}
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* TAB FILTER BUTTONS */}
          <div className="flex gap-1 p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl text-xs font-semibold shadow-inner">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm font-bold scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <span>Semua</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("paid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                statusFilter === "paid"
                  ? "bg-emerald-600 text-white shadow-sm font-bold scale-[1.02]"
                  : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <span>● Lunas</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === "paid"
                    ? "bg-white text-emerald-700 font-bold"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {paidCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white shadow-sm font-bold scale-[1.02]"
                  : "text-slate-600 hover:text-amber-700 hover:bg-amber-50"
              }`}
            >
              <span>● Menunggu</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === "pending"
                    ? "bg-white text-amber-800 font-bold"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {pendingCount}
              </span>
            </button>
          </div>

          {/* SEARCH INPUT */}
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
                <div
                  className="dash-service-icon-box"
                  style={{
                    background: isOrderPaid(item.status) ? "#ecfdf5" : "#fff7ed",
                    color: isOrderPaid(item.status) ? "#059669" : "#ea580c",
                  }}
                >
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
                    isOrderPaid(item.status) ? "active" : "pending"
                  }`}
                >
                  ● {isOrderPaid(item.status) ? "Lunas" : "Menunggu Pembayaran"}
                </span>

                {isOrderPaid(item.status) ? (
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
            <div className="dash-empty-icon">
              {statusFilter === "paid" ? "" : statusFilter === "pending" ? "⏳" : ""}
            </div>
            <h4>
              {statusFilter === "paid"
                ? "Belum Ada Pesanan Lunas"
                : statusFilter === "pending"
                ? "Tidak Ada Pesanan Menunggu Pembayaran"
                : "Belum Ada Riwayat Pesanan"}
            </h4>
            <p>
              {statusFilter === "paid"
                ? "Pesanan Anda yang telah selesai dikonfirmasi akan muncul di tab ini."
                : statusFilter === "pending"
                ? "Semua pesanan Anda saat ini telah lunas dan diproses."
                : "Anda belum memiliki riwayat transaksi pesanan pada pencarian ini."}
            </p>
            <Link href="/#pricing" className="dash-empty-action-btn">
              + Mulai Berlangganan Sekarang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
