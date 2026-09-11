"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";

type WebProject = {
  id: number;
  client: string;
  websiteType: string;
  domain: string;
  progress: number;
  stage: string;
  deadline: string;
  status: "In Progress" | "Review" | "Completed" | "Pending";
};

type AdsCampaign = {
  id: number;
  client: string;
  campaignName: string;
  budget: string;
  spent: string;
  clicks: number;
  impressions: number;
  status: "Running" | "Paused" | "Completed";
};

const initialWebProjects: WebProject[] = [
  {
    id: 1,
    client: "PT Maju Bersama",
    websiteType: "Company Profile & Hosting",
    domain: "majubersama.co.id",
    progress: 75,
    stage: "Development Frontend & CMS",
    deadline: "20 Sep 2026",
    status: "In Progress",
  },
  {
    id: 2,
    client: "Nusantara Art Studio",
    websiteType: "Toko Online & E-Commerce",
    domain: "nusantaraart.id",
    progress: 90,
    stage: "Testing & Payment Gateway QA",
    deadline: "15 Sep 2026",
    status: "Review",
  },
  {
    id: 3,
    client: "Klinik Sehat Utama",
    websiteType: "Web Booking & Landing Page",
    domain: "kliniksehat.com",
    progress: 40,
    stage: "UI/UX Figma Design Approval",
    deadline: "28 Sep 2026",
    status: "In Progress",
  },
];

const initialAdsCampaigns: AdsCampaign[] = [
  {
    id: 1,
    client: "PT Maju Bersama",
    campaignName: "Google Search Ads - Jasa Konstruksi",
    budget: "Rp 5.000.000",
    spent: "Rp 3.420.000",
    clicks: 1420,
    impressions: 28400,
    status: "Running",
  },
  {
    id: 2,
    client: "Nusantara Art Studio",
    campaignName: "Google Shopping - Kerajinan Tangan",
    budget: "Rp 3.000.000",
    spent: "Rp 2.890.000",
    clicks: 2150,
    impressions: 45200,
    status: "Running",
  },
];

export default function AdminServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"web" | "ads">("web");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/services");
      return;
    }
    try {
      const u = JSON.parse(savedUser);
      if (u.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setUser(u);
    } catch {
      router.push("/login");
    }
  }, [router]);

  if (!user) return <div className="p-8 text-sm text-slate-500">Memuat data...</div>;

  return (
    <main className="admin-page">
      <AdminSidebar currentPath="/admin/services" />

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <div className="admin-breadcrumb">ADMIN PANEL / LAYANAN KHUSUS</div>
            <h1>Layanan Jasa Web &amp; Google Ads</h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama klien / project..."
              />
            </div>
          </div>
        </header>

        {/* TABS HEADER */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("web")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "web"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>💻</span> Progres Pembuatan Website ({initialWebProjects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ads")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "ads"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>📈</span> Kampanye Google Ads ({initialAdsCampaigns.length})
          </button>
        </div>

        {/* TAB 1: WEB DEVELOPMENT */}
        {activeTab === "web" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {initialWebProjects.map((project) => (
                <div key={project.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                        {project.websiteType}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        {project.status}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{project.client}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{project.domain}</p>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-600 font-medium">Progres Pengerjaan</span>
                        <strong className="text-slate-900 font-bold">{project.progress}%</strong>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-orange-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        Tahap: <strong>{project.stage}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Target: {project.deadline}</span>
                    <button type="button" className="text-orange-600 font-bold hover:underline">
                      Update Progres →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE ADS */}
        {activeTab === "ads" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="p-3.5">Klien &amp; Kampanye</th>
                    <th className="p-3.5">Budget</th>
                    <th className="p-3.5">Terpakai</th>
                    <th className="p-3.5">Klik (CTR)</th>
                    <th className="p-3.5">Impresi</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {initialAdsCampaigns.map((ads) => (
                    <tr key={ads.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <strong className="text-slate-900 block font-bold">{ads.client}</strong>
                        <small className="text-slate-500">{ads.campaignName}</small>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{ads.budget}</td>
                      <td className="p-3.5 text-orange-600 font-bold">{ads.spent}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{ads.clicks.toLocaleString()} Klik</td>
                      <td className="p-3.5 text-slate-600">{ads.impressions.toLocaleString()} Tayang</td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                          ● {ads.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
