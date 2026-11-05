"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getExpiryInfo } from "@/app/lib/expiryHelper";

type UserService = {
  id: number;
  domain_name: string;
  service_category: string;
  billing_period: string;
  service_status: string;
  start_date: string | null;
  expiry_date: string | null;
  order_number?: string;
};

export default function DomainPage() {
  const router = useRouter();
  const [services, setServices] = useState<UserService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchDomains() {
      try {
        const response = await fetch(
          "/api/backend/service/index.php?type=domain",
          { method: "GET", credentials: "include" }
        );
        const result = await response.json().catch(() => null);
        if (response.ok && result?.status === "success") {
          setServices(result.data || []);
        }
      } catch (err) {
        console.error("Gagal load domain:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchDomains();
  }, [router]);

  const domainList = services.filter((s) =>
    !search
      ? true
      : s.domain_name?.toLowerCase().includes(search.toLowerCase())
  );

  const expiringList = services.filter((s) => {
    const exp = getExpiryInfo(s.expiry_date);
    return exp.isExpiringSoon || exp.isExpired;
  });

  return (
    <div className="space-y-6">
      {/* WARNING BANNER JIKA ADA DOMAIN KEDALUWARSA / SISA <= 7 HARI */}
      {expiringList.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-l-4 border-amber-500 p-4 rounded-xl bg-amber-50 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                Pemberitahuan Perpanjangan Domain ({expiringList.length} Domain Perlu Perhatian)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Domain Anda akan segera berakhir dalam 7 hari atau sudah kedaluwarsa. Perpanjang sekarang untuk mencegah domain dilepas ke publik atau disuspend registrar.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/invoices"
            className="whitespace-nowrap px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow transition"
          >
            Perpanjang Domain →
          </Link>
        </div>
      )}

      <div className="dash-table-card">
        <div className="dash-table-header">
          <div className="dash-table-title-group">
            <span className="dash-table-pretitle">KELOLA DOMAIN</span>
            <h3 className="dash-table-title">Daftar Domain Terdaftar</h3>
          </div>

          <div className="dash-header-center-search" style={{ margin: 0 }}>
            <input
              type="text"
              className="dash-header-search-input"
              placeholder="Cari domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="dash-services-list">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Memuat data domain...
            </div>
          ) : domainList.length > 0 ? (
            domainList.map((item) => {
              const exp = getExpiryInfo(item.expiry_date);

              return (
                <div key={item.id} className="dash-service-item">
                  <div className="dash-service-left">
                    <div className="dash-service-icon-box yellow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <div className="dash-service-info">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="dash-service-name font-bold text-slate-900">{item.domain_name}</span>
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
                        Masa Aktif Berakhir: <strong className="text-slate-700">{exp.formattedDate}</strong>
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
                      onClick={() => alert("Mengatur DNS Management untuk " + item.domain_name)}
                      className="dash-service-action-btn"
                    >
                      Atur DNS
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="dash-empty-state">
              <div className="dash-empty-icon"></div>
              <h4>Belum Ada Domain Terdaftar</h4>
              <p>Anda belum memiliki nama domain terdaftar saat ini.</p>
              <a href="/?scroll=domain#domain" className="dash-empty-action-btn">
                Cari &amp; Daftarkan Domain
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

