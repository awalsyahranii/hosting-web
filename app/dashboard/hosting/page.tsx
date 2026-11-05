"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getExpiryInfo } from "@/app/lib/expiryHelper";

type UserService = {
  id: number;
  plan_name?: string;
  plan_slug?: string;
  disk_space?: string;
  bandwidth?: string;
  cpu_cores?: string;
  ram?: string;
  domain_name: string;
  cpanel_username?: string;
  server_ip?: string;
  service_category?: string;
  billing_period?: string;
  billing_cycle?: string;
  service_status: string;
  start_date: string | null;
  expiry_date: string | null;
  order_number?: string;
  price?: string | number;
};

export default function HostingPage() {
  const router = useRouter();
  const [services, setServices] = useState<UserService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedHosting, setSelectedHosting] = useState<UserService | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch(
          "/api/backend/service/index.php?type=hosting",
          { method: "GET", credentials: "include" }
        );
        const result = await response.json().catch(() => null);
        if (response.ok && result?.status === "success") {
          setServices(result.data || []);
        }
      } catch (err) {
        console.error("Gagal load hosting:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchServices();
  }, [router]);

  const hostingList = services.filter((s) => {
    const text = `${s.domain_name || ""} ${s.plan_name || ""} ${s.service_category || ""}`.toLowerCase();
    if (
      text.includes("google") ||
      text.includes("ads") ||
      text.includes("iklan") ||
      text.includes("kampanye") ||
      text.includes("tema") ||
      text.includes("theme") ||
      text.includes("template")
    ) {
      return false;
    }
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.domain_name?.toLowerCase().includes(q) ||
      s.plan_name?.toLowerCase().includes(q) ||
      s.cpanel_username?.toLowerCase().includes(q) ||
      s.order_number?.toLowerCase().includes(q)
    );
  });

  const expiringList = services.filter((s) => {
    const exp = getExpiryInfo(s.expiry_date);
    return exp.isExpiringSoon || exp.isExpired;
  });

  return (
    <div className="space-y-6">
      {/* WARNING BANNER JIKA ADA LAYANAN KEDALUWARSA / SISA <= 7 HARI */}
      {expiringList.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-l-4 border-amber-500 p-4 rounded-xl bg-amber-50 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                Pemberitahuan Masa Aktif Layanan ({expiringList.length} Layanan Perlu Perhatian)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Ada layanan hosting Anda yang akan berakhir dalam 7 hari atau telah lewat masa aktif. Segera lakukan perpanjangan agar website dan email bisnis Anda tetap online tanpa kendala.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/invoices"
            className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow transition"
          >
            Lihat Tagihan / Perpanjang →
          </Link>
        </div>
      )}

      <div className="dash-table-card">
        <div className="dash-table-header">
          <div className="dash-table-title-group">
            <span className="dash-table-pretitle">LAYANAN HOSTING</span>
            <h3 className="dash-table-title">Daftar Paket Hosting Aktif</h3>
          </div>

          <div className="dash-header-center-search" style={{ margin: 0 }}>
            <input
              type="text"
              className="dash-header-search-input"
              placeholder="Cari domain, paket, cPanel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="dash-services-list">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Memuat data hosting...
            </div>
          ) : hostingList.length > 0 ? (
            hostingList.map((item) => {
              const exp = getExpiryInfo(item.expiry_date);

              return (
                <div key={item.id} className="dash-service-item">
                  <div className="dash-service-left">
                    <div className="dash-service-icon-box" style={{ background: "#fff7ed", color: "#ea580c" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                        <line x1="6" y1="6" x2="6.01" y2="6" />
                        <line x1="6" y1="18" x2="6.01" y2="18" />
                      </svg>
                    </div>
                    <div className="dash-service-info">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="dash-service-name font-bold text-slate-900">{item.domain_name}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">
                          {item.plan_name || "Paket Cloud Hosting"}
                        </span>
                        {/* WARNING BADGE */}
                        {exp.isExpired && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-300">
                            ⛔ {exp.statusText}
                          </span>
                        )}
                        {exp.isExpiringSoon && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            ⚠️ {exp.statusText} (Segera Perpanjang)
                          </span>
                        )}
                      </div>
                      <span className="dash-service-sub">
                        NVMe {item.disk_space || "10 GB"} • RAM {item.ram || "2 GB"} • CPU {item.cpu_cores || "2 Cores"} • IP: {item.server_ip || "103.147.154.21"} • Berakhir: <strong className="text-slate-700">{exp.formattedDate}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="dash-service-right">
                    <span
                      className={`dash-service-status-pill ${
                        item.service_status?.toLowerCase() === "active" ? "active" : "pending"
                      }`}
                    >
                      ● {item.service_status?.toLowerCase() === "active" ? "Aktif" : "Menunggu"}
                    </span>
                    {(exp.isExpiringSoon || exp.isExpired) && (
                      <Link
                        href="/dashboard/invoices"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
                      >
                        Perpanjang
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedHosting(item)}
                      className="dash-service-action-btn"
                    >
                      Kelola / cPanel
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="dash-empty-state">
              <div className="dash-empty-icon"></div>
              <h4>Belum Ada Layanan Hosting</h4>
              <p>Anda belum memiliki paket cloud hosting aktif.</p>
              <a href="/?scroll=pricing#pricing" className="dash-empty-action-btn">
                + Beli Paket Hosting Sekarang
              </a>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CPANEL & SERVER DETAILS */}
      {selectedHosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Kontrol Panel Hosting</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedHosting.domain_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHosting(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Paket Hosting</span>
                <strong className="text-slate-900 font-semibold">{selectedHosting.plan_name || "Cloud Hosting"}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Username cPanel</span>
                <strong className="text-slate-900 font-mono">{selectedHosting.cpanel_username || "cp_user"}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Alamat IP Server</span>
                <strong className="text-slate-900 font-mono">{selectedHosting.server_ip || "103.147.154.21"}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Nameserver 1</span>
                <strong className="text-slate-900 font-mono">ns1.hostingweb.id</strong>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Nameserver 2</span>
                <strong className="text-slate-900 font-mono">ns2.hostingweb.id</strong>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500">Masa Aktif Berakhir</span>
                <strong className="text-slate-900 font-semibold">{getExpiryInfo(selectedHosting.expiry_date).formattedDate}</strong>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <a
                href={`https://${selectedHosting.domain_name}:2083`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-center font-bold text-xs shadow-md transition"
              >
                Buka Web cPanel (Port 2083) →
              </a>
              <button
                type="button"
                onClick={() => setSelectedHosting(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
