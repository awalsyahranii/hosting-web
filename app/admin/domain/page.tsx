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

  // WhatsApp Reminder Modal State
  const [reminderModal, setReminderModal] = useState<{
    isOpen: boolean;
    client: string;
    domain: string;
    serviceType: string;
    expiryDate: string;
    daysRemaining: number | null;
    phone: string;
  } | null>(null);

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
          "/api/backend/admin/order/report.php",
          { method: "GET", credentials: "include" }
        );
        const jsonReport = await resReport.json().catch(() => null);
        const rawServices: any[] = jsonReport?.data?.services || [];

        // 2. Fetch from payments to include domain payments
        const resPayment = await fetch(
          "/api/backend/admin/payment/index.php",
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
                          <button
                            type="button"
                            onClick={() => {
                              setReminderModal({
                                isOpen: true,
                                client: item.username || "Pelanggan",
                                domain: item.domain_name,
                                serviceType: "Domain Registration",
                                expiryDate: exp.formattedDate,
                                daysRemaining: exp.daysRemaining,
                                phone: (item as any).phone || (item as any).whatsapp || (item as any).no_hp || "62",
                              });
                            }}
                            title="Kirim pesan pengingat perpanjangan domain ke WhatsApp klien"
                            className={`px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 transition ${
                              exp.isExpiringSoon || exp.isExpired
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                            }`}
                          >
                            <span>📱</span>
                            <span>Ingatkan WA</span>
                          </button>
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

      {/* MODAL PENGINGAT WHATSAPP */}
      {reminderModal && reminderModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-bold text-base leading-tight">Kirim Pengingat WhatsApp Klien</h3>
                  <p className="text-xs text-emerald-100">Kirim tagihan perpanjangan domain ke WhatsApp pelanggan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reminderModal) return;
                const cleanPhone = reminderModal.phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
                const url = generateWhatsAppReminderUrl({
                  clientName: reminderModal.client,
                  domainName: reminderModal.domain,
                  serviceType: reminderModal.serviceType,
                  expiryDate: reminderModal.expiryDate,
                  daysRemaining: reminderModal.daysRemaining,
                  phone: cleanPhone,
                });
                window.open(url, "_blank");
                setReminderModal(null);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Klien</span>
                  <strong className="text-slate-800 text-xs">{reminderModal.client}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Domain</span>
                  <strong className="text-slate-800 text-xs font-mono">{reminderModal.domain}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Layanan</span>
                  <span className="text-slate-700 font-semibold">{reminderModal.serviceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Masa Aktif</span>
                  <span className="text-slate-700 font-semibold">{reminderModal.expiryDate}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Klien <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 085333555976 atau 6285333555976"
                    value={reminderModal.phone}
                    onChange={(e) => setReminderModal({ ...reminderModal, phone: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold">📞</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  *Masukkan nomor WhatsApp klien tujuan (format 08xxx atau 62xxx).
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-950 font-sans leading-relaxed">
                <span className="font-bold text-emerald-800 block mb-1">Preview Format Pesan:</span>
                Halo Kak <strong>{reminderModal.client}</strong>,<br />
                Kami dari tim <strong>HostingWeb.id</strong> ingin menginformasikan bahwa layanan <strong>{reminderModal.serviceType}</strong> untuk domain <strong>{reminderModal.domain}</strong> akan berakhir pada <strong>{reminderModal.expiryDate}</strong>.<br />
                Akses perpanjangan: <em>https://hostingwebid.com/dashboard</em>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReminderModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md inline-flex items-center gap-1.5 transition"
                >
                  <span>💬</span>
                  <span>Buka Chat WhatsApp Klien</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}


