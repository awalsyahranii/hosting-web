"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import { getExpiryInfo, generateWhatsAppReminderUrl } from "@/app/lib/expiryHelper";

type ServiceItem = {
  id: number;
  order_number: string;
  username: string;
  email: string;
  domain_name: string;
  service_category: string;
  billing_period: string;
  start_date: string | null;
  expiry_date: string | null;
  service_status: string;
  price: string | number;
};

export default function AdminHostingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/hosting");
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
    async function fetchHosting() {
      try {
        setLoading(true);

        const res = await fetch(
          "http://localhost/hosting_webid/api/v1/admin/hosting/index.php",
          { method: "GET", credentials: "include" }
        );
        const json = await res.json().catch(() => null);

        const isAdsOrWeb = (item: any) => {
          const text = `${item.package_name || ""} ${item.plan_name || ""} ${item.domain_name || ""} ${item.service_category || ""}`.toLowerCase();
          return (
            text.includes("google") ||
            text.includes("ads") ||
            text.includes("iklan") ||
            text.includes("kampanye") ||
            text.includes("company profile") ||
            text.includes("toko online")
          );
        };

        const isDomainOnly = (item: any) => {
          const cat = (item.service_category || "").toLowerCase();
          const dom = (item.domain_name || "").toLowerCase();
          const price = Number(item.price || item.order_total || 0);
          return cat.includes("domain") || (dom.includes(".") && !dom.includes("hosting") && !cat.includes("hosting") && price < 400000);
        };

        if (res.ok && json?.status === "success" && Array.isArray(json.data) && json.data.length > 0) {
          const filtered = json.data.filter((h: any) => !isAdsOrWeb(h) && !isDomainOnly(h));
          setServices(
            filtered.map((h: any) => ({
              id: Number(h.id),
              order_number: h.order_number || `ORD-${h.order_id || h.id}`,
              username: h.username || (h.email ? h.email.split("@")[0] : "-"),
              email: h.email || "-",
              domain_name: h.domain_name || "Paket Hosting",
              service_category: h.plan_name || "Cloud Hosting NVMe",
              billing_period: h.billing_period || "Tahunan",
              start_date: h.start_date || "-",
              expiry_date: h.expiry_date || "-",
              service_status: h.service_status || "active",
              price: Number(h.price || 0),
            }))
          );
          return;
        }

        // Fallback to order report API
        const resReport = await fetch(
          "http://localhost/hosting_webid/api/v1/admin/order/report.php",
          { method: "GET", credentials: "include" }
        );
        const jsonReport = await resReport.json().catch(() => null);
        const rawServices: any[] = jsonReport?.data?.services || [];

        const combinedList: ServiceItem[] = [];
        rawServices.forEach((s: any, idx: number) => {
          if (isAdsOrWeb(s) || isDomainOnly(s)) return;
          combinedList.push({
            id: Number(s.id || s.order_id || idx + 1),
            order_number: s.order_number || (s.order_id ? `ORD-${s.order_id}` : "-"),
            username: s.username || s.user_name || (s.email ? s.email.split("@")[0] : "-"),
            email: s.email || "-",
            domain_name: s.domain_name || "Paket Hosting Cloud",
            service_category: s.service_category || "Cloud Hosting NVMe",
            billing_period: s.billing_period || "Tahunan",
            start_date: s.start_date || s.order_date || "-",
            expiry_date: s.expiry_date || "-",
            service_status: s.service_status || s.order_status || "active",
            price: Number(s.price || s.order_total || 0),
          });
        });

        setServices(combinedList);
      } catch (err) {
        console.error("Fetch hosting error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      void fetchHosting();
    }
  }, [user]);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus.toLowerCase() === "active" ? "suspended" : "active";
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, service_status: nextStatus } : item))
    );

    try {
      await fetch("http://localhost/hosting_webid/api/v1/admin/hosting/toggle-status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
    } catch (err) {
      console.error("Gagal toggle status:", err);
    }
  };

  const filtered = services.filter((s) => {
    const matchSearch =
      (s.domain_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.order_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase());

    const exp = getExpiryInfo(s.expiry_date);
    let matchStatus = true;
    if (statusFilter === "active") {
      matchStatus = (s.service_status || "").toLowerCase() === "active";
    } else if (statusFilter === "expiring") {
      matchStatus = exp.isExpiringSoon;
    } else if (statusFilter === "expired") {
      matchStatus = exp.isExpired;
    } else if (statusFilter === "suspended") {
      matchStatus = (s.service_status || "").toLowerCase() === "suspended";
    } else if (statusFilter === "pending") {
      matchStatus = (s.service_status || "").toLowerCase() === "pending";
    }

    return matchSearch && matchStatus;
  });

  const activeCount = services.filter(
    (s) => (s.service_status || "").toLowerCase() === "active"
  ).length;
  
  const expiringSoonCount = services.filter((s) => {
    const exp = getExpiryInfo(s.expiry_date);
    return exp.isExpiringSoon;
  }).length;

  const expiredCount = services.filter((s) => {
    const exp = getExpiryInfo(s.expiry_date);
    return exp.isExpired;
  }).length;

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
      <AdminSidebar currentPath="/admin/hosting" />

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">ADMIN PANEL / LAYANAN</div>
            <h1>Hosting Management</h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari domain, user, email, order..."
              />
            </div>
          </div>
        </header>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Akun Hosting</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{services.length}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-emerald-600 uppercase">Hosting Aktif</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">{activeCount}</div>
          </div>
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-sm">
            <span className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1">
              ⚠️ Segera Berakhir (≤ 7 Hari)
            </span>
            <div className="text-2xl font-extrabold text-amber-800 mt-1">{expiringSoonCount}</div>
          </div>
          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 shadow-sm">
            <span className="text-xs font-bold text-rose-700 uppercase flex items-center gap-1">
              ⛔ Kedaluwarsa
            </span>
            <div className="text-2xl font-extrabold text-rose-800 mt-1">{expiredCount}</div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "Semua Status", count: services.length },
              { id: "active", label: "Aktif", count: activeCount },
              { id: "expiring", label: "⚠️ Segera Berakhir (≤ 7 Hari)", count: expiringSoonCount, isWarning: true },
              { id: "expired", label: "⛔ Kedaluwarsa", count: expiredCount, isDanger: true },
              { id: "suspended", label: "Suspended", count: services.filter(s => s.service_status?.toLowerCase() === "suspended").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? tab.isWarning
                      ? "bg-amber-500 text-white shadow-sm"
                      : tab.isDanger
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-orange-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Memuat data server &amp; hosting...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">Tidak ada data hosting ditemukan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="p-3.5">Domain / Server</th>
                    <th className="p-3.5">Pengguna</th>
                    <th className="p-3.5">Billing</th>
                    <th className="p-3.5">Masa Aktif &amp; Peringatan</th>
                    <th className="p-3.5">Biaya</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi &amp; Notifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item, idx) => {
                    const exp = getExpiryInfo(item.expiry_date);
                    const waUrl = generateWhatsAppReminderUrl({
                      clientName: item.username || "Pelanggan",
                      domainName: item.domain_name || "Hosting",
                      serviceType: item.service_category || "Cloud Hosting",
                      expiryDate: exp.formattedDate,
                      daysRemaining: exp.daysRemaining,
                    });

                    return (
                      <tr key={`hosting-${item.id}-${item.order_number}-${idx}`} className={`hover:bg-slate-50 transition ${exp.isExpiringSoon ? "bg-amber-50/20" : exp.isExpired ? "bg-rose-50/20" : ""}`}>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block font-bold">
                            {item.domain_name && item.domain_name !== "-" ? item.domain_name : `Server Order #${item.order_number}`}
                          </strong>
                          <span className="text-[11px] text-slate-500">{item.service_category || "Cloud Hosting"}</span>
                          <small className="text-slate-400 font-mono block">#{item.order_number}</small>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{item.username || "-"}</span>
                          <small className="text-slate-400">{item.email}</small>
                        </td>
                        <td className="p-3.5 font-medium text-slate-600 capitalize">
                          {item.billing_period || "Tahunan"}
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800 mb-1">{exp.formattedDate}</div>
                          {exp.isExpired && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                              ⛔ {exp.statusText}
                            </span>
                          )}
                          {exp.isExpiringSoon && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              ⚠️ {exp.statusText}
                            </span>
                          )}
                          {!exp.isExpired && !exp.isExpiringSoon && exp.daysRemaining !== null && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                              🟢 {exp.statusText}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {rupiah(item.price)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.service_status?.toLowerCase() === "active"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                : item.service_status?.toLowerCase() === "pending"
                                ? "bg-amber-100 text-amber-700 border border-amber-300"
                                : "bg-rose-100 text-rose-700 border border-rose-300"
                            }`}
                          >
                            {item.service_status?.toUpperCase() || "ACTIVE"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* TOMBOL WA INGATKAN CLIENT */}
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Kirim pesan pengingat perpanjangan ke WhatsApp klien"
                              className={`px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 transition ${
                                exp.isExpiringSoon || exp.isExpired
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                              }`}
                            >
                              <span>📱</span>
                              <span>Ingatkan WA</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item.id, item.service_status)}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                item.service_status?.toLowerCase() === "active"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              }`}
                            >
                              {item.service_status?.toLowerCase() === "active" ? "Suspend" : "Aktifkan"}
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
    </main>
  );
}

