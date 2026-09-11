"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWhatsAppUrl } from "@/app/lib/siteConfig";

type AdsCampaign = {
  id: number;
  package_name: string;
  target_keywords: string;
  daily_budget: string;
  total_budget: string;
  duration: string;
  clicks: number;
  impressions: number;
  status: "Running" | "Review" | "Paused" | "Completed";
  start_date: string;
  end_date: string;
};

const dummyCampaigns: AdsCampaign[] = [
  {
    id: 1,
    package_name: "Paket Bisnis 30 Hari Google Ads",
    target_keywords: "jasa pembuatan website, hosting murah indonesia, domain murah",
    daily_budget: "Rp 100.000 / hari",
    total_budget: "Rp 3.000.000",
    duration: "30 Hari",
    clicks: 1840,
    impressions: 34200,
    status: "Running",
    start_date: "01 Sep 2026",
    end_date: "30 Sep 2026",
  },
  {
    id: 2,
    package_name: "Paket Pemula 14 Hari Google Ads",
    target_keywords: "toko online jakarta, baju muslim terlaris",
    daily_budget: "Rp 50.000 / hari",
    total_budget: "Rp 700.000",
    duration: "14 Hari",
    clicks: 650,
    impressions: 12800,
    status: "Completed",
    start_date: "10 Agu 2026",
    end_date: "24 Agu 2026",
  },
];

export default function DashboardAdsPage() {
  const [campaigns, setCampaigns] = useState<AdsCampaign[]>(dummyCampaigns);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchUserAds() {
      try {
        const response = await fetch(
          "http://localhost/hosting_webid/api/v1/service/index.php",
          { method: "GET", credentials: "include" }
        );
        const result = await response.json().catch(() => null);
        if (response.ok && result?.status === "success" && Array.isArray(result.data)) {
          const userAds = result.data.filter((s: any) => {
            const text = `${s.plan_name || ""} ${s.domain_name || ""} ${s.service_category || ""}`.toLowerCase();
            return text.includes("google") || text.includes("ads") || text.includes("iklan");
          });

          if (userAds.length > 0) {
            const formatted: AdsCampaign[] = userAds.map((s: any, idx: number) => {
              const isBisnis = (s.plan_name || "").toLowerCase().includes("bisnis");
              const is30 = (s.plan_name || "").toLowerCase().includes("30");
              const dur = is30 ? "30 Hari" : isBisnis ? "10 Hari" : "14 Hari";
              const daily = isBisnis ? "Rp 100.000 / hari" : "Rp 50.000 / hari";
              const total = s.price ? `Rp ${Number(s.price).toLocaleString("id-ID")}` : isBisnis ? "Rp 1.000.000" : "Rp 700.000";

              return {
                id: Number(s.id || 100 + idx),
                package_name: s.plan_name || s.domain_name || "Paket Google Ads",
                target_keywords: "google search ads, website promo, kata kunci potensial",
                daily_budget: daily,
                total_budget: total,
                duration: dur,
                clicks: 350,
                impressions: 7200,
                status: s.service_status === "active" ? "Running" : "Review",
                start_date: s.start_date || "Hari Ini",
                end_date: s.expiry_date || "Sesuai Durasi",
              };
            });
            setCampaigns((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const fresh = formatted.filter((f) => !existingIds.has(f.id));
              return [...fresh, ...prev];
            });
          }
        }
      } catch (err) {
        console.error("Gagal load user ads:", err);
      }
    }

    void fetchUserAds();
  }, []);

  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const runningCount = campaigns.filter((c) => c.status === "Running").length;

  const filteredCampaigns = campaigns.filter((c) => {
    if (filter === "all") return true;
    return c.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
            <span>●</span> GOOGLE SEARCH CAMPAIGNS
          </div>
          <h1 className="text-2xl font-black">Kampanye Iklan Google Ads</h1>
          <p className="text-sm text-white/90 mt-1 max-w-xl">
            Pantau performa tayang iklan, jumlah klik, impresi halaman 1 Google, dan alokasi saldo harian Anda secara transparan.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <a
            href={getWhatsAppUrl("Halo Tim Ads HostingWeb, saya ingin konsultasi performa iklan Google Ads saya.")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-md"
          >
            <span>💬</span> Konsultasi Optimasi
          </a>
          <Link
            href="/#google-ads"
            className="px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-black transition shadow-md flex items-center gap-2"
          >
            <span>⚡</span> Pasang Iklan Baru
          </Link>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">KAMPANYE AKTIF</span>
          <strong className="text-2xl font-black text-slate-900 mt-1 block">{runningCount}</strong>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <span>●</span> Sedang Tayang di Google
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">TOTAL KLIK TERTARGET</span>
          <strong className="text-2xl font-black text-slate-900 mt-1 block">
            {totalClicks.toLocaleString("id-ID")}
          </strong>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Pengunjung langsung ke web
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">TOTAL IMPRESI</span>
          <strong className="text-2xl font-black text-slate-900 mt-1 block">
            {totalImpressions.toLocaleString("id-ID")}
          </strong>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Muncul di Halaman 1 Google
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 block">GARANSI LAYANAN</span>
          <strong className="text-lg font-black text-orange-600 mt-1 block">Halaman 1 Google</strong>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Garansi tayang 100% aman
          </span>
        </div>
      </div>

      {/* CAMPAIGN LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Daftar Kampanye Iklan Anda</h2>
            <p className="text-xs text-slate-500">Rincian status dan durasi masa tayang Google Search Ads</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {["all", "running", "completed"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                  filter === st
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "all" ? "Semua Status" : st === "running" ? "Sedang Tayang" : "Selesai"}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredCampaigns.map((camp) => {
            const isRunning = camp.status === "Running";
            const ctr = ((camp.clicks / camp.impressions) * 100).toFixed(1);

            return (
              <div key={camp.id} className="p-5 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-extrabold tracking-wide uppercase">
                      🎯 GOOGLE SEARCH
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isRunning
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isRunning ? "● SEDANG TAYANG" : "SELESAI"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{camp.package_name}</h3>
                  
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Target Kata Kunci:</span> {camp.target_keywords}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>📅 Periode: <strong>{camp.start_date} - {camp.end_date}</strong></span>
                    <span>💰 Dana Harian: <strong>{camp.daily_budget}</strong></span>
                  </div>
                </div>

                {/* METRICS & ACTIONS */}
                <div className="flex items-center gap-6 self-end lg:self-center">
                  <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">KLIK</span>
                      <strong className="text-sm font-black text-slate-800">{camp.clicks}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">IMPRESI</span>
                      <strong className="text-sm font-black text-slate-800">
                        {(camp.impressions / 1000).toFixed(1)}k
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">CTR</span>
                      <strong className="text-sm font-black text-emerald-600">{ctr}%</strong>
                    </div>
                  </div>

                  <a
                    href={getWhatsAppUrl(`Halo Admin, saya ingin request update kata kunci / cek laporan iklan untuk ${camp.package_name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Laporan Lengkap →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
