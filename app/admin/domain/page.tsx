"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import { getExpiryInfo, generateWhatsAppReminderUrl } from "@/app/lib/expiryHelper";

type DomainItem = {
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

export default function AdminDomainPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tldFilter, setTldFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/domain");
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
    async function fetchDomains() {
      try {
        setLoading(true);

        // 1. Fetch from services/report
        const resReport = await fetch(
          "http://localhost/hosting_webid/api/v1/admin/order/report.php",
          { method: "GET", credentials: "include" }
        );
        const jsonReport = await resReport.json().catch(() => null);
        const rawServices: any[] = jsonReport?.data?.services || [];

        // 2. Fetch from payments to include domain payments
        const resPayment = await fetch(
          "http://localhost/hosting_webid/api/v1/admin/payment/index.php",
          { method: "GET", credentials: "include" }
        );
        const jsonPayment = await resPayment.json().catch(() => null);
        const rawPayments: any[] = Array.isArray(jsonPayment?.data)
          ? jsonPayment.data
          : jsonPayment?.data?.payments || [];

        const combinedList: DomainItem[] = [];
        const seenDomains = new Set<string>();

        const isAdsOrWeb = (item: any) => {
          const text = `${item.package_name || ""} ${item.plan_name || ""} ${item.domain_name || item.domain || ""} ${item.service_category || ""}`.toLowerCase();
          return (
            text.includes("google") ||
            text.includes("ads") ||
            text.includes("iklan") ||
            text.includes("kampanye") ||
            text.includes("company profile") ||
            text.includes("toko online")
          );
        };

        // Add from services/report (Strictly Domains)
        rawServices.forEach((s: any, idx: number) => {
          if (isAdsOrWeb(s)) return;
          const cat = (s.service_category || "").toLowerCase();
          const dom = (s.domain_name || "").toLowerCase();
          const isHosting =
            cat.includes("hosting") ||
            cat.includes("paket") ||
            cat.includes("server") ||
            dom.includes("paket") ||
            dom.includes("hosting") ||
            Number(s.price || s.order_total) >= 500000;

          if (!isHosting && dom && (cat.includes("domain") || dom.includes("."))) {
            combinedList.push({
              id: Number(s.id || s.order_id || idx + 1),
              order_number: s.order_number || (s.order_id ? `ORD-${s.order_id}` : "-"),
              username: s.username || s.user_name || (s.email ? s.email.split("@")[0] : "-"),
              email: s.email || "-",
              domain_name: s.domain_name || s.domain || "-",
              service_category: "Domain Registration",
              billing_period: s.billing_period || "Tahunan",
              start_date: s.start_date || s.order_date || "-",
              expiry_date: s.expiry_date || "-",
              service_status: s.service_status || s.order_status || "active",
              price: Number(s.price || s.order_total || 0),
            });
            if (s.domain_name) seenDomains.add(s.domain_name.toLowerCase());
          }
        });

        // Add from payments (Strictly Domains)
        rawPayments.forEach((p: any, idx: number) => {
          if (isAdsOrWeb(p)) return;
          const pName = (p.domain_name || p.domain || "").toLowerCase();
          const pAmount = Number(p.amount || p.total || 0);
          const isHosting =
            pAmount >= 500000 ||
            pName.includes("hosting") ||
            pName.includes("paket") ||
            pName.includes("server");

          if (!isHosting && pName && pName.includes(".") && !seenDomains.has(pName)) {
            const isPaid = (p.status || "").toLowerCase() === "paid";
            combinedList.push({
              id: Number(p.payment_id || p.id || idx + 100),
              order_number: p.order_number || (p.order_id ? `ORD-${p.order_id}` : "-"),
              username: p.username || p.user_name || (p.email ? p.email.split("@")[0] : "-"),
              email: p.email || "-",
              domain_name: p.domain_name || p.domain || "-",
              service_category: "Domain Registration",
              billing_period: p.billing_period || "Tahunan",
              start_date: p.paid_at || p.created_at || "-",
              expiry_date: p.expiry_date || "-",
              service_status: isPaid ? "active" : "pending",
              price: pAmount,
            });
            seenDomains.add(pName);
          }
        });

        setDomains(combinedList);
      } catch (err) {
        console.error("Fetch domains error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      void fetchDomains();
    }
  }, [user]);

  const filtered = domains.filter((d) => {
    const matchSearch =
      (d.domain_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.email || "").toLowerCase().includes(search.toLowerCase());
    const matchTld =
      tldFilter === "all" ||
      (d.domain_name || "").toLowerCase().endsWith(tldFilter.toLowerCase());

    const exp = getExpiryInfo(d.expiry_date);
    let matchStatus = true;
    if (statusFilter === "expiring") {
      matchStatus = exp.isExpiringSoon;
    } else if (statusFilter === "expired") {
      matchStatus = exp.isExpired;
    } else if (statusFilter === "active") {
      matchStatus = (d.service_status || "").toLowerCase() === "active";
    }

    return matchSearch && matchTld && matchStatus;
  });

  const expiringSoonCount = domains.filter((d) => {
    const exp = getExpiryInfo(d.expiry_date);
    return exp.isExpiringSoon;
  }).length;

  const expiredCount = domains.filter((d) => {
    const exp = getExpiryInfo(d.expiry_date);
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
      <AdminSidebar currentPath="/admin/domain" />

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">ADMIN PANEL / LAYANAN</div>
            <h1>Domain Management</h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari domain, email, atau pemilik..."
              />
            </div>
          </div>
        </header>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Domain Terdaftar</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{domains.length}</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-emerald-600 uppercase">Domain Aktif</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {domains.filter((d) => (d.service_status || "").toLowerCase() === "active").length}
            </div>
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
              { id: "all", label: "Semua Domain", count: domains.length },
              { id: "expiring", label: "⚠️ Segera Berakhir (≤ 7 Hari)", count: expiringSoonCount, isWarning: true },
              { id: "expired", label: "⛔ Kedaluwarsa", count: expiredCount, isDanger: true },
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

          <div className="flex flex-wrap gap-1.5">
            {["all", ".com", ".id", ".co.id", ".my.id", ".net"].map((tld) => (
              <button
                key={tld}
                type="button"
                onClick={() => setTldFilter(tld)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition ${
                  tldFilter === tld
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tld === "all" ? "Semua TLD" : tld}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Memuat data domain terdaftar...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">Tidak ada domain ditemukan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="p-3.5">Nama Domain</th>
                    <th className="p-3.5">Pemilik (User)</th>
                    <th className="p-3.5">Periode</th>
                    <th className="p-3.5">Masa Aktif &amp; Peringatan</th>
                    <th className="p-3.5">Harga</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi Notifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item, idx) => {
                    const exp = getExpiryInfo(item.expiry_date);
                    const waUrl = generateWhatsAppReminderUrl({
                      clientName: item.username || "Pelanggan",
                      domainName: item.domain_name || "Domain",
                      serviceType: "Domain Registration",
                      expiryDate: exp.formattedDate,
                      daysRemaining: exp.daysRemaining,
                    });

                    return (
                      <tr key={`domain-${item.id}-${item.domain_name}-${idx}`} className={`hover:bg-slate-50 transition ${exp.isExpiringSoon ? "bg-amber-50/20" : exp.isExpired ? "bg-rose-50/20" : ""}`}>
                        <td className="p-3.5">
                          <strong className="text-orange-600 block font-bold text-sm">
                            🌐 {item.domain_name}
                          </strong>
                          <small className="text-slate-400 font-mono">Order #{item.order_number}</small>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{item.username || "-"}</span>
                          <small className="text-slate-400">{item.email}</small>
                        </td>
                        <td className="p-3.5 font-medium text-slate-600">
                          {item.billing_period || "1 Tahun"}
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
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                            Active &amp; Synced
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Kirim pesan pengingat perpanjangan domain ke WhatsApp klien"
                            className={`px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 transition ${
                              exp.isExpiringSoon || exp.isExpired
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            }`}
                          >
                            <span>📱</span>
                            <span>Ingatkan WA</span>
                          </a>
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

