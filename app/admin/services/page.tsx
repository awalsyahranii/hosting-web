"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/AdminSidebar";
import { getWhatsAppUrl } from "@/app/lib/siteConfig";
import { getExpiryInfo, generateWhatsAppReminderUrl } from "@/app/lib/expiryHelper";

type WebProject = {
  id: number;
  order_id?: number;
  order_number: string;
  payment_number?: string;
  client: string;
  email: string;
  phone: string;
  websiteType: string;
  domain: string;
  price: number;
  progress: number;
  stage: string;
  startDate: string;
  expiryDate: string;
  deadline: string;
  status: "active" | "in progress" | "review" | "completed" | "pending" | "suspended";
  notes?: string;
};

type AdsCampaign = {
  id: number;
  order_id?: number;
  order_number: string;
  payment_number?: string;
  client: string;
  email: string;
  phone: string;
  domain: string;
  packageType: string;
  durationDays: number;
  dailyBudget: number;
  totalBudget: number;
  spent: number;
  clicks: number;
  impressions: number;
  keywords: string[];
  startDate: string;
  expiryDate: string;
  status: "active" | "running" | "review" | "paused" | "completed" | "pending" | "suspended";
  notes?: string;
};

const defaultWebProjects: WebProject[] = [
  {
    id: 1,
    order_number: "ORD-WEB-001",
    client: "PT Maju Bersama",
    email: "majubersama@gmail.com",
    phone: "6281234567801",
    websiteType: "Company Profile & Hosting",
    domain: "majubersama.co.id",
    price: 2500000,
    progress: 75,
    stage: "Development Frontend & CMS",
    startDate: "01 Sep 2026",
    expiryDate: "01 Sep 2027",
    deadline: "20 Sep 2026",
    status: "in progress",
    notes: "Integrasi formulir kontak dan company profile selesai.",
  },
  {
    id: 2,
    order_number: "ORD-WEB-002",
    client: "Nusantara Art Studio",
    email: "nusantaraart@gmail.com",
    phone: "6281234567802",
    websiteType: "Toko Online & E-Commerce",
    domain: "nusantaraart.id",
    price: 3500000,
    progress: 90,
    stage: "Testing & Payment Gateway QA",
    startDate: "25 Agu 2026",
    expiryDate: "25 Agu 2027",
    deadline: "15 Sep 2026",
    status: "review",
    notes: "Menunggu approval client untuk modul invoice otomatis.",
  },
  {
    id: 3,
    order_number: "ORD-WEB-003",
    client: "Klinik Sehat Utama",
    email: "kliniksehat@gmail.com",
    phone: "6281234567803",
    websiteType: "Web Booking & Landing Page",
    domain: "kliniksehat.com",
    price: 1800000,
    progress: 40,
    stage: "UI/UX Figma Design Approval",
    startDate: "05 Sep 2026",
    expiryDate: "05 Sep 2027",
    deadline: "28 Sep 2026",
    status: "in progress",
    notes: "Revisi wireframe halaman appointment dokter.",
  },
];

const defaultAdsCampaigns: AdsCampaign[] = [
  {
    id: 1,
    order_number: "ORD-ADS-001",
    client: "PT Maju Bersama",
    email: "majubersama@gmail.com",
    phone: "6281234567801",
    domain: "majubersama.co.id",
    packageType: "Paket Bisnis 30 Hari",
    durationDays: 30,
    dailyBudget: 100000,
    totalBudget: 3000000,
    spent: 1420000,
    clicks: 1420,
    impressions: 28400,
    keywords: ["kontraktor bangunan jakarta", "jasa renovasi rumah", "arsitek profesional"],
    startDate: "01 Sep 2026",
    expiryDate: "30 Sep 2026",
    status: "active",
    notes: "Iklan stabil di Posisi 1 Google Search. CTR mencapai 5.0%.",
  },
  {
    id: 2,
    order_number: "ORD-ADS-002",
    client: "Nusantara Art Studio",
    email: "nusantaraart@gmail.com",
    phone: "6281234567802",
    domain: "nusantaraart.id",
    packageType: "Paket Bisnis 15 Hari",
    durationDays: 15,
    dailyBudget: 100000,
    totalBudget: 1500000,
    spent: 1290000,
    clicks: 950,
    impressions: 18200,
    keywords: ["kerajinan kayu ukir", "souvenir kayu custom", "art studio bali"],
    startDate: "05 Sep 2026",
    expiryDate: "20 Sep 2026",
    status: "active",
    notes: "Conversion rate tinggi dari direct call WhatsApp extension.",
  },
  {
    id: 3,
    order_number: "ORD-ADS-003",
    client: "Klinik Sehat Utama",
    email: "kliniksehat@gmail.com",
    phone: "6281234567803",
    domain: "kliniksehat.com",
    packageType: "Paket Pemula 14 Hari",
    durationDays: 14,
    dailyBudget: 50000,
    totalBudget: 700000,
    spent: 700000,
    clicks: 620,
    impressions: 11400,
    keywords: ["klinik gigi terdekat", "scaling gigi promo", "dokter gigi surabaya"],
    startDate: "20 Agu 2026",
    expiryDate: "03 Sep 2026",
    status: "completed",
    notes: "Campaign selesai sukses, klien rencana renewal ke Paket Bisnis 30 Hari.",
  },
  {
    id: 4,
    order_number: "ORD-ADS-004",
    client: "Bintang Coffee Roastery",
    email: "bintangcoffee@gmail.com",
    phone: "6281234567804",
    domain: "bintangcoffee.id",
    packageType: "Paket Pemula 30 Hari",
    durationDays: 30,
    dailyBudget: 50000,
    totalBudget: 1500000,
    spent: 450000,
    clicks: 480,
    impressions: 9800,
    keywords: ["biji kopi arabika gayo", "supplier coffee shop", "green beans murah"],
    startDate: "08 Sep 2026",
    expiryDate: "08 Okt 2026",
    status: "active",
    notes: "Negatif keyword 'resep kopi' telah ditambahkan untuk efisiensi budget.",
  },
];

export default function AdminServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"ads" | "web">("ads");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [webProjects, setWebProjects] = useState<WebProject[]>(defaultWebProjects);
  const [adsCampaigns, setAdsCampaigns] = useState<AdsCampaign[]>(defaultAdsCampaigns);

  // Modal States
  const [selectedWeb, setSelectedWeb] = useState<WebProject | null>(null);
  const [selectedAds, setSelectedAds] = useState<AdsCampaign | null>(null);
  const [isNewAdsModalOpen, setIsNewAdsModalOpen] = useState(false);

  // Daily Report WhatsApp Modal State (Laporan Tayang Harian Google Ads)
  const [dailyReportModal, setDailyReportModal] = useState<{
    isOpen: boolean;
    client: string;
    website: string;
    phone: string;
    date: string;
    statusTayang: string;
    keterangan: string;
  } | null>(null);

  // Web Project Progress WhatsApp Modal State (Laporan Progres Website)
  const [webProgressModal, setWebProgressModal] = useState<{
    isOpen: boolean;
    client: string;
    domain: string;
    phone: string;
    progress: number;
    stage: string;
    deadline: string;
    notes: string;
  } | null>(null);

  const openWebProgressModal = (item: WebProject) => {
    setWebProgressModal({
      isOpen: true,
      client: item.client ? item.client.toUpperCase() : "PELANGGAN",
      domain: item.domain || "website-klien.id",
      phone: item.phone || "",
      progress: item.progress || 50,
      stage: item.stage || "Pengerjaan Desain & Integrasi Fitur",
      deadline: item.deadline || "14 Hari Kerja",
      notes: item.notes || "Struktur halaman utama & company profile sudah siap di-review.",
    });
  };

  const handleSendWebProgressWA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webProgressModal) return;
    const cleanPhone = webProgressModal.phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
    const message = `Halo Kak/Tim *${webProgressModal.client}*, Berikut *Update Progres Pengerjaan Website* Anda:
*Domain:* ${webProgressModal.domain}

*Progres:* ${webProgressModal.progress}% Selesai
*Tahapan Saat Ini:* ${webProgressModal.stage}
*Target Selesai:* ${webProgressModal.deadline}
*Catatan:* ${webProgressModal.notes || "-"}
────────────────────────
Website Anda terus kami kerjakan dengan standar kecepatan dan keamanan terbaik. ⚡

Terima kasih atas kepercayaannya bersama *HostingWeb.id*! ✨`;

    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waLink, "_blank");
    setWebProgressModal(null);
  };

  const openDailyReportModal = (item: { client: string; domain: string; phone?: string }) => {
    const todayStr = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

    let domainUrl = (item.domain || "").trim();
    if (domainUrl && !domainUrl.startsWith("http://") && !domainUrl.startsWith("https://")) {
      domainUrl = `https://${domainUrl}/`;
    }

    setDailyReportModal({
      isOpen: true,
      client: item.client ? item.client.toUpperCase() : "PELANGGAN",
      website: domainUrl || "https://website-klien.id/",
      phone: item.phone || "",
      date: todayStr,
      statusTayang: "Ya",
      keterangan: "-",
    });
  };


  const handleSendDailyReportWA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyReportModal) return;
    const cleanPhone = dailyReportModal.phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
    const statusLabel =
      dailyReportModal.statusTayang === "Ya"
        ? "✅ AKTIF & TAYANG (Halaman 1 Google)"
        : `⚡ ${dailyReportModal.statusTayang}`;

    const message = `Halo Kak/Tim *${dailyReportModal.client}*, Berikut *Update Laporan Harian Iklan Google Ads* untuk website Anda:
*Website:* ${dailyReportModal.website}

*Tanggal:* ${dailyReportModal.date}
*Status Iklan Tayang:* ${statusLabel}
⚡ *Performa:* Berjalan Optimal & Menjangkau Calon Pembeli
*Keterangan:* ${dailyReportModal.keterangan || "-"}
────────────────────────
Kampanye iklan Anda terus kami pantau & optimasi agar menghasilkan leads dan penjualan maksimal. Terima kasih atas kepercayaannya bersama *HostingWeb.id*! ✨`;

    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waLink, "_blank");
    setDailyReportModal(null);
  };

  // New Ads Form State
  const [newAdsForm, setNewAdsForm] = useState({
    client: "",
    email: "",
    phone: "",
    domain: "",
    packageType: "Paket Pemula 14 Hari",
    durationDays: 14,
    dailyBudget: 50000,
    totalBudget: 700000,
    keywords: "",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  function rupiah(val: number | string) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  }

  useEffect(() => {
    const savedUser = localStorage.getItem("hostingwebid_user");
    if (!savedUser) {
      router.push("/login?redirect=/admin/services");
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

    async function fetchRealServices() {
      try {
        setLoading(true);

        // 1. Fetch from order report
        const resReport = await fetch(
          "/api/backend/admin/order/report.php",
          { method: "GET", credentials: "include" }
        ).catch(() => null);
        const jsonReport = resReport ? await resReport.json().catch(() => null) : null;
        const rawServices: any[] = jsonReport?.data?.services || [];

        // 2. Fetch from payments to include newly created / pending / confirmed orders
        const resPayment = await fetch(
          "/api/backend/admin/payment/index.php",
          { method: "GET", credentials: "include" }
        ).catch(() => null);
        const jsonPayment = resPayment ? await resPayment.json().catch(() => null) : null;
        const rawPayments: any[] = Array.isArray(jsonPayment?.data)
          ? jsonPayment.data
          : jsonPayment?.data?.payments || [];

        const dynamicAds: AdsCampaign[] = [];
        const dynamicWeb: WebProject[] = [];
        const seenOrderKeys = new Set<string>();

        const parseItemToAdsOrWeb = (item: any, idx: number) => {
          const pkg = (item.package_name || item.service_category || "").toLowerCase();
          const dom = (item.domain_name || item.domain || "").toLowerCase();
          const ordNum = item.order_number || (item.order_id ? `ORD-${item.order_id}` : `ORD-REAL-${idx}`);
          const payNum = item.payment_number || "";
          const fullText = `${pkg} ${dom} ${ordNum} ${payNum}`.toLowerCase();

          if (seenOrderKeys.has(ordNum) || (payNum && seenOrderKeys.has(payNum))) return;

          const isAds =
            fullText.includes("ads") ||
            fullText.includes("google") ||
            fullText.includes("iklan") ||
            fullText.includes("kampanye") ||
            fullText.includes("pemula 14") ||
            fullText.includes("pemula 20") ||
            fullText.includes("pemula 30") ||
            fullText.includes("bisnis 10") ||
            fullText.includes("bisnis 15") ||
            fullText.includes("bisnis 30");

          const isWeb =
            fullText.includes("starter website") ||
            fullText.includes("bisnis pro") ||
            fullText.includes("elite enterprise") ||
            fullText.includes("company profile") ||
            fullText.includes("toko online") ||
            fullText.includes("web booking") ||
            (pkg.includes("website") && !isAds);

          const clientName = item.username || item.user_name || (item.email ? item.email.split("@")[0] : `Pelanggan #${item.order_id || idx + 1}`);
          const clientEmail = item.email || "-";
          const statusStr = (item.status || item.order_status || item.service_status || "").toLowerCase();
          const isPaid = statusStr === "paid" || statusStr === "active" || statusStr === "completed";

          if (isAds) {
            seenOrderKeys.add(ordNum);
            if (payNum) seenOrderKeys.add(payNum);

            const isBisnis = fullText.includes("bisnis");
            const is30 = fullText.includes("30");
            const is20 = fullText.includes("20");
            const is15 = fullText.includes("15");
            const is10 = fullText.includes("10");

            let dur = 14;
            let pkgTitle = "Paket Pemula 14 Hari Google Ads";
            let daily = 50000;
            let total = 700000;

            if (isBisnis && is30) {
              dur = 30; pkgTitle = "Paket Bisnis 30 Hari Google Ads"; daily = 100000; total = 3000000;
            } else if (isBisnis && is15) {
              dur = 15; pkgTitle = "Paket Bisnis 15 Hari Google Ads"; daily = 100000; total = 1500000;
            } else if (isBisnis && is10) {
              dur = 10; pkgTitle = "Paket Bisnis 10 Hari Google Ads"; daily = 100000; total = 1000000;
            } else if (is30) {
              dur = 30; pkgTitle = "Paket Pemula 30 Hari Google Ads"; daily = 50000; total = 1500000;
            } else if (is20) {
              dur = 20; pkgTitle = "Paket Pemula 20 Hari Google Ads"; daily = 50000; total = 1000000;
            }

            const rawAmt = Number(item.amount ?? item.total ?? item.price ?? item.order_total ?? total);
            const domainVal = item.domain_name && !item.domain_name.includes("Google Search") && item.domain_name.includes(".") ? item.domain_name : "google-search-ad.com";

            // Calculate expiry date string
            let expDateStr = item.expiry_date || "";
            if (!expDateStr || expDateStr === "-") {
              const expDateObj = new Date();
              expDateObj.setDate(expDateObj.getDate() + dur);
              expDateStr = expDateObj.toISOString().split("T")[0];
            }

            dynamicAds.push({
              id: Number(item.order_id || item.payment_id || item.id || 100 + idx),
              order_id: item.order_id,
              order_number: ordNum,
              payment_number: payNum,
              client: clientName,
              email: clientEmail,
              phone: item.phone || "6281234567890",
              domain: domainVal,
              packageType: item.package_name || pkgTitle,
              durationDays: dur,
              dailyBudget: daily,
              totalBudget: rawAmt > 0 ? rawAmt : total,
              spent: isPaid ? Math.round(total * 0.15) : 0,
              clicks: isPaid ? 65 : 0,
              impressions: isPaid ? 1340 : 0,
              keywords: ["google search ads", "promosi bisnis online", "target halaman 1 google"],
              startDate: item.created_at || item.order_date || item.paid_at || new Date().toISOString().split("T")[0],
              expiryDate: expDateStr,
              status: isPaid ? "active" : "review",
              notes: isPaid ? `Konfirmasi pembayaran terverifikasi (${payNum || ordNum}). Kampanye aktif tayang.` : `Pesanan baru masuk (${ordNum}). Menunggu verifikasi pembayaran.`,
            });
          } else if (isWeb) {
            seenOrderKeys.add(ordNum);
            if (payNum) seenOrderKeys.add(payNum);

            let expDateStr = item.expiry_date || "";
            if (!expDateStr || expDateStr === "-") {
              const expDateObj = new Date();
              expDateObj.setFullYear(expDateObj.getFullYear() + 1);
              expDateStr = expDateObj.toISOString().split("T")[0];
            }

            dynamicWeb.push({
              id: Number(item.order_id || item.payment_id || item.id || 100 + idx),
              order_id: item.order_id,
              order_number: ordNum,
              payment_number: payNum,
              client: clientName,
              email: clientEmail,
              phone: item.phone || "6281234567890",
              websiteType: item.package_name || "Website Siap Pakai & SEO",
              domain: item.domain_name || "website-klien.id",
              price: Number(item.amount ?? item.total ?? item.price ?? 1500000),
              progress: isPaid ? 35 : 10,
              stage: isPaid ? "Penyusunan Konten & Desain Layout" : "Menunggu Konfirmasi Pembayaran",
              startDate: item.created_at || item.order_date || item.paid_at || new Date().toISOString().split("T")[0],
              expiryDate: expDateStr,
              deadline: "14 Hari Kerja",
              status: isPaid ? "in progress" : "pending",
              notes: `Order ${ordNum} masuk dari checkout web.`,
            });
          }
        };

        // Process payments first (includes most recent orders)
        rawPayments.forEach((p: any, idx: number) => parseItemToAdsOrWeb(p, idx));

        // Process report services
        rawServices.forEach((s: any, idx: number) => parseItemToAdsOrWeb(s, idx + 100));

        if (dynamicAds.length > 0) {
          setAdsCampaigns((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = dynamicAds.filter((d) => !existingIds.has(d.id));
            return [...fresh, ...prev];
          });
        }

        if (dynamicWeb.length > 0) {
          setWebProjects((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = dynamicWeb.filter((d) => !existingIds.has(d.id));
            return [...fresh, ...prev];
          });
        }
      } catch (err) {
        console.error("Fetch services real orders error:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchRealServices();
    const interval = window.setInterval(() => {
      void fetchRealServices();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [router]);

  // Filtered Ads Campaigns
  const filteredAds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return adsCampaigns.filter((a) => {
      const exp = getExpiryInfo(a.expiryDate);
      let matchStatus = true;
      if (statusFilter === "active") {
        matchStatus = a.status === "active" || a.status === "running";
      } else if (statusFilter === "expiring") {
        matchStatus = exp.isExpiringSoon;
      } else if (statusFilter === "expired") {
        matchStatus = exp.isExpired || a.status === "completed";
      } else if (statusFilter === "review") {
        matchStatus = a.status === "review" || a.status === "pending";
      } else if (statusFilter === "suspended") {
        matchStatus = a.status === "suspended" || a.status === "paused";
      }

      if (!matchStatus) return false;
      if (!q) return true;
      return (
        a.client.toLowerCase().includes(q) ||
        a.domain.toLowerCase().includes(q) ||
        a.order_number.toLowerCase().includes(q) ||
        (a.payment_number && a.payment_number.toLowerCase().includes(q)) ||
        a.packageType.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    });
  }, [adsCampaigns, search, statusFilter]);

  // Filtered Web Projects
  const filteredWeb = useMemo(() => {
    const q = search.trim().toLowerCase();
    return webProjects.filter((p) => {
      const exp = getExpiryInfo(p.expiryDate);
      let matchStatus = true;
      if (statusFilter === "active") {
        matchStatus = p.status === "active" || p.status === "in progress";
      } else if (statusFilter === "expiring") {
        matchStatus = exp.isExpiringSoon;
      } else if (statusFilter === "expired") {
        matchStatus = exp.isExpired || p.status === "completed";
      } else if (statusFilter === "review") {
        matchStatus = p.status === "review" || p.status === "pending";
      } else if (statusFilter === "suspended") {
        matchStatus = p.status === "suspended";
      }

      if (!matchStatus) return false;
      if (!q) return true;
      return (
        p.client.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        p.order_number.toLowerCase().includes(q) ||
        p.websiteType.toLowerCase().includes(q) ||
        p.stage.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
      );
    });
  }, [webProjects, search, statusFilter]);

  // Ads Metrics Calculation
  const activeAdsCount = adsCampaigns.filter((c) => c.status === "active" || c.status === "running").length;
  const expiringAdsCount = adsCampaigns.filter((c) => getExpiryInfo(c.expiryDate).isExpiringSoon).length;
  const expiredAdsCount = adsCampaigns.filter((c) => getExpiryInfo(c.expiryDate).isExpired || c.status === "completed").length;
  const reviewAdsCount = adsCampaigns.filter((c) => c.status === "review" || c.status === "pending").length;

  // Web Metrics Calculation
  const activeWebCount = webProjects.filter((p) => p.status === "active" || p.status === "in progress").length;
  const reviewWebCount = webProjects.filter((p) => p.status === "review" || p.status === "pending").length;
  const completedWebCount = webProjects.filter((p) => p.status === "completed").length;
  const expiringWebCount = webProjects.filter((p) => getExpiryInfo(p.expiryDate).isExpiringSoon).length;

  const handleToggleAdsStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" || currentStatus === "running" ? "paused" : "active";
    setAdsCampaigns((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus as any } : item))
    );
  };

  const handleToggleWebStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" || currentStatus === "in progress" ? "suspended" : "active";
    setWebProjects((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus as any } : item))
    );
  };

  const handleUpdateAdsCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAds) return;
    setAdsCampaigns((prev) =>
      prev.map((item) => (item.id === selectedAds.id ? selectedAds : item))
    );
    setSelectedAds(null);
  };

  const handleUpdateWebProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeb) return;
    setWebProjects((prev) =>
      prev.map((item) => (item.id === selectedWeb.id ? selectedWeb : item))
    );
    setSelectedWeb(null);
  };

  const handleCreateNewAds = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = adsCampaigns.length > 0 ? Math.max(...adsCampaigns.map((a) => a.id)) + 1 : 1;
    const kwList = newAdsForm.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const dur = Number(newAdsForm.durationDays) || 14;
    const expDateObj = new Date();
    expDateObj.setDate(expDateObj.getDate() + dur);

    const newCampaign: AdsCampaign = {
      id: newId,
      order_number: `ORD-ADS-${newId}`,
      client: newAdsForm.client || "Klien Baru",
      email: newAdsForm.email || "klien@gmail.com",
      phone: newAdsForm.phone || "6281234567890",
      domain: newAdsForm.domain || "website-klien.com",
      packageType: newAdsForm.packageType,
      durationDays: dur,
      dailyBudget: Number(newAdsForm.dailyBudget) || 50000,
      totalBudget: Number(newAdsForm.totalBudget) || 700000,
      spent: 0,
      clicks: 0,
      impressions: 0,
      keywords: kwList.length > 0 ? kwList : ["target keyword utama"],
      startDate: newAdsForm.startDate,
      expiryDate: expDateObj.toISOString().split("T")[0],
      status: "review",
      notes: newAdsForm.notes || "Setup kampanye baru dibuat dari admin.",
    };

    setAdsCampaigns([newCampaign, ...adsCampaigns]);
    setIsNewAdsModalOpen(false);
    setNewAdsForm({
      client: "",
      email: "",
      phone: "",
      domain: "",
      packageType: "Paket Pemula 14 Hari",
      durationDays: 14,
      dailyBudget: 50000,
      totalBudget: 700000,
      keywords: "",
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  if (!user) return <div className="p-8 text-sm text-slate-500">Memuat data...</div>;

  return (
    <main className="admin-page">
      <AdminSidebar currentPath="/admin/services" />

      <section className="admin-content">
        {/* HEADER */}
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
                placeholder="Cari domain, user, order, paket..."
              />
            </div>
          </div>
        </header>

        {/* TOP TABS & VIEW TOGGLE */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab("ads");
                setStatusFilter("all");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === "ads"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span></span> Kampanye Google Ads ({adsCampaigns.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("web");
                setStatusFilter("all");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                activeTab === "web"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span></span> Progres Pembuatan Website ({webProjects.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>☰</span> Tabel
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  viewMode === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>▦</span> Kartu &amp; Metrik
              </button>
            </div>

            {activeTab === "ads" && (
              <button
                type="button"
                onClick={() => setIsNewAdsModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <span>+</span> Tambah Kampanye
              </button>
            )}
          </div>
        </div>

        {/* =========================================================
            TAB 1: GOOGLE ADS MANAGEMENT
        ========================================================= */}
        {activeTab === "ads" && (
          <>
            {/* 4 STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Kampanye Iklan</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{adsCampaigns.length}</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-emerald-600 uppercase">Kampanye Aktif (Running)</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">{activeAdsCount}</div>
              </div>
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-sm">
                <span className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1">
                  ⚠️ Segera Berakhir (≤ 7 Hari)
                </span>
                <div className="text-2xl font-extrabold text-amber-800 mt-1">{expiringAdsCount}</div>
              </div>
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 shadow-sm">
                <span className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
                  Menunggu Tayang / Review
                </span>
                <div className="text-2xl font-extrabold text-blue-800 mt-1">{reviewAdsCount}</div>
              </div>
            </div>

            {/* STATUS FILTER TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Semua Status", count: adsCampaigns.length },
                  { id: "active", label: "Aktif (Running)", count: activeAdsCount },
                  { id: "review", label: "Review / Pending", count: reviewAdsCount },
                  { id: "expiring", label: "⚠️ Segera Berakhir", count: expiringAdsCount, isWarning: true },
                  { id: "expired", label: "⛔ Selesai / Expired", count: expiredAdsCount, isDanger: true },
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
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        statusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* VIEW MODE: TABLE (LIKE HOSTING MANAGEMENT) */}
            {viewMode === "table" ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-500">Memuat data kampanye iklan...</div>
                ) : filteredAds.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Tidak ada data kampanye Google Ads ditemukan.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                          <th className="p-3.5">Kampanye &amp; Domain</th>
                          <th className="p-3.5">Pengguna</th>
                          <th className="p-3.5">Durasi &amp; Saldo Harian</th>
                          <th className="p-3.5">Masa Aktif &amp; Peringatan</th>
                          <th className="p-3.5">Total Biaya</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Aksi &amp; Notifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAds.map((item, idx) => {
                          const exp = getExpiryInfo(item.expiryDate);
                          const ctr =
                            item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(1) : "0.0";
                          const waUrl = getWhatsAppUrl(
                            `Halo Kak *${item.client}*,\n\nBerikut laporan update performa iklan *${item.packageType}* untuk domain *${item.domain}*:\n- Status: ${item.status.toUpperCase()}\n- Impresi Tayang: ${item.impressions.toLocaleString()}x\n- Jumlah Klik: ${item.clicks.toLocaleString()} (CTR ${ctr}%)\n- Saldo Terpakai: Rp ${item.spent.toLocaleString("id-ID")} / Rp ${item.totalBudget.toLocaleString("id-ID")}\n- Masa Aktif: ${exp.formattedDate} (${exp.statusText})\n\nTerima kasih atas kepercayaannya bersama HostingWeb.id!`
                          );

                          return (
                            <tr
                              key={`ads-${item.id}-${item.order_number}-${idx}`}
                              className={`hover:bg-slate-50 transition ${
                                exp.isExpiringSoon ? "bg-amber-50/20" : exp.isExpired ? "bg-rose-50/20" : ""
                              }`}
                            >
                              {/* KAMPANYE & DOMAIN */}
                              <td className="p-3.5">
                                <strong className="text-slate-900 block font-bold">
                                  {item.packageType}
                                </strong>
                                <span className="text-[11px] text-orange-600 font-mono font-semibold">
                                  {item.domain}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <small className="text-slate-400 font-mono">#{item.order_number}</small>
                                  {item.payment_number && (
                                    <small className="text-slate-400 font-mono">({item.payment_number})</small>
                                  )}
                                </div>
                              </td>

                              {/* PENGGUNA */}
                              <td className="p-3.5">
                                <span className="font-semibold text-slate-800 block">{item.client}</span>
                                <small className="text-slate-400">{item.email}</small>
                              </td>

                              {/* DURASI & SALDO */}
                              <td className="p-3.5">
                                <div className="font-bold text-slate-800">{item.durationDays} Hari</div>
                                <span className="text-[11px] text-orange-600 font-medium">
                                  Saldo: Rp {item.dailyBudget.toLocaleString("id-ID")}/hr
                                </span>
                              </td>

                              {/* MASA AKTIF & PERINGATAN */}
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
                                    {exp.statusText}
                                  </span>
                                )}
                              </td>

                              {/* BIAYA */}
                              <td className="p-3.5 font-bold text-slate-900">
                                {rupiah(item.totalBudget)}
                              </td>

                              {/* STATUS */}
                              <td className="p-3.5">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.status === "active" || item.status === "running"
                                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                      : item.status === "review" || item.status === "pending"
                                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                                      : "bg-slate-100 text-slate-700 border border-slate-300"
                                  }`}
                                >
                                  {item.status.toUpperCase()}
                                </span>
                              </td>

                              {/* AKSI & NOTIFIKASI */}
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {/* TOMBOL LAPORAN TAYANG WA (FORMAT KHUSUS ADMIN) */}
                                  <button
                                    type="button"
                                    onClick={() => openDailyReportModal(item)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 shadow-sm transition"
                                    title="Kirim Laporan Harian Iklan Tayang ke WhatsApp Pelanggan"
                                  >
                                    <span></span>
                                    <span>Laporan Tayang WA</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedAds(item)}
                                    className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 rounded text-[11px] font-bold transition"
                                  >
                                    Kelola →
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleAdsStatus(item.id, item.status)}
                                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                                      item.status === "active" || item.status === "running"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                    }`}
                                  >
                                    {item.status === "active" || item.status === "running" ? "Pause" : "Aktifkan"}
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
            ) : (
              /* VIEW MODE: CARDS (METRICS & GRAPHICS) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAds.map((ads) => {
                  const exp = getExpiryInfo(ads.expiryDate);
                  const ctr = ads.impressions > 0 ? ((ads.clicks / ads.impressions) * 100).toFixed(1) : "0.0";
                  const spentPercent =
                    ads.totalBudget > 0 ? Math.min(100, Math.round((ads.spent / ads.totalBudget) * 100)) : 0;

                  return (
                    <div
                      key={ads.id}
                      className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-orange-200 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold text-[11px] border border-orange-200">
                            {ads.packageType}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              ads.status === "active" || ads.status === "running"
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                : ads.status === "review" || ads.status === "pending"
                                ? "bg-amber-100 text-amber-700 border border-amber-300"
                                : "bg-slate-100 text-slate-700 border border-slate-300"
                            }`}
                          >
                            ● {ads.status.toUpperCase()}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 mt-1">{ads.client}</h3>
                        <p className="text-xs text-orange-600 font-mono font-bold mt-0.5">{ads.domain}</p>
                        <small className="text-slate-400 font-mono block">#{ads.order_number}</small>

                        {/* METRICS ROW */}
                        <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Impresi</span>
                            <strong className="text-sm font-bold text-slate-800">{ads.impressions.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Klik</span>
                            <strong className="text-sm font-bold text-slate-800">{ads.clicks.toLocaleString()}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">CTR</span>
                            <strong className="text-sm font-bold text-emerald-600">{ctr}%</strong>
                          </div>
                        </div>

                        {/* BUDGET SPENT PROGRESS */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600 font-medium">Penggunaan Saldo Iklan</span>
                            <span className="text-slate-900 font-bold">
                              Rp {ads.spent.toLocaleString("id-ID")} / {rupiah(ads.totalBudget)} ({spentPercent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                spentPercent >= 90 ? "bg-rose-500" : "bg-orange-500"
                              }`}
                              style={{ width: `${spentPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* KEYWORDS TAGS */}
                        <div className="mt-3">
                          <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Kata Kunci Utama:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ads.keywords.map((kw, kIdx) => (
                              <span
                                key={kIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>

                        {ads.notes && (
                          <div className="mt-3 p-2.5 bg-amber-50/50 rounded-lg border border-amber-100 text-[11px] text-amber-900">
                            <strong>Catatan:</strong> {ads.notes}
                          </div>
                        )}
                      </div>

                      {/* BOTTOM ACTIONS */}
                      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Masa Aktif: <strong className="text-slate-800">{exp.formattedDate}</strong> ({exp.statusText})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDailyReportModal(ads)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                          >
                            <span></span> Laporan Tayang WA
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedAds(ads)}
                            className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold text-[11px]"
                          >
                            Kelola &amp; Update →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* =========================================================
            TAB 2: WEB DEVELOPMENT MANAGEMENT
        ========================================================= */}
        {activeTab === "web" && (
          <>
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Proyek Website</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{webProjects.length}</div>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-emerald-600 uppercase">Dalam Pengerjaan (Active)</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">{activeWebCount}</div>
              </div>
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 shadow-sm">
                <span className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1">
                  Review &amp; Approval
                </span>
                <div className="text-2xl font-extrabold text-amber-800 mt-1">{reviewWebCount}</div>
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-sm">
                <span className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1">
                  ✅ Selesai (Completed)
                </span>
                <div className="text-2xl font-extrabold text-emerald-800 mt-1">{completedWebCount}</div>
              </div>
            </div>

            {/* STATUS FILTER TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Semua Status", count: webProjects.length },
                  { id: "active", label: "Dalam Pengerjaan", count: activeWebCount },
                  { id: "review", label: "Review & Testing", count: reviewWebCount },
                  { id: "expired", label: "✅ Selesai", count: completedWebCount },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                      statusFilter === tab.id
                        ? "bg-orange-600 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        statusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* VIEW MODE: TABLE (LIKE HOSTING MANAGEMENT) */}
            {viewMode === "table" ? (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {filteredWeb.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Tidak ada data proyek website ditemukan.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                          <th className="p-3.5">Proyek &amp; Domain</th>
                          <th className="p-3.5">Pengguna</th>
                          <th className="p-3.5">Progres &amp; Tahapan</th>
                          <th className="p-3.5">Target Selesai</th>
                          <th className="p-3.5">Biaya Proyek</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Aksi &amp; Notifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredWeb.map((item, idx) => {
                          const waUrl = getWhatsAppUrl(
                            `Halo Kak *${item.client}*,\n\nBerikut update pengerjaan website *${item.websiteType}* (${item.domain}):\n- Progres: ${item.progress}%\n- Tahap Pengerjaan: ${item.stage}\n- Target Selesai: ${item.deadline}\n\nTerima kasih!`
                          );

                          return (
                            <tr key={`web-${item.id}-${idx}`} className="hover:bg-slate-50 transition">
                              <td className="p-3.5">
                                <strong className="text-slate-900 block font-bold">{item.websiteType}</strong>
                                <span className="text-[11px] text-orange-600 font-mono font-semibold">
                                  {item.domain}
                                </span>
                                <small className="text-slate-400 font-mono block">#{item.order_number}</small>
                              </td>

                              <td className="p-3.5">
                                <span className="font-semibold text-slate-800 block">{item.client}</span>
                                <small className="text-slate-400">{item.email}</small>
                              </td>

                              <td className="p-3.5">
                                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                                  <span className="text-slate-700">{item.stage}</span>
                                  <span className="text-orange-600">{item.progress}%</span>
                                </div>
                                <div className="w-36 bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      item.progress === 100 ? "bg-emerald-500" : "bg-orange-500"
                                    }`}
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              </td>

                              <td className="p-3.5 font-medium text-slate-800">
                                <div>{item.deadline}</div>
                                <small className="text-slate-400 block mt-0.5">Mulai: {item.startDate}</small>
                              </td>

                              <td className="p-3.5 font-bold text-slate-900">{rupiah(item.price)}</td>

                              <td className="p-3.5">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    item.status === "completed"
                                      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                      : item.status === "review"
                                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                                      : "bg-orange-100 text-orange-700 border border-orange-300"
                                  }`}
                                >
                                  {item.status.toUpperCase()}
                                </span>
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => openWebProgressModal(item)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition inline-flex items-center gap-1 shadow-sm"
                                    title="Kirim Laporan Progres Website ke WhatsApp Klien"
                                  >
                                    <span></span>
                                    <span>Update Progres WA</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedWeb(item)}
                                    className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 rounded text-[11px] font-bold transition"
                                  >
                                    Edit Data →
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
            ) : (
              /* VIEW MODE: CARDS (PROGRESS CARDS) */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredWeb.map((project) => (
                  <div
                    key={project.id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-orange-200 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                          {project.websiteType}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            project.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : project.status === "review"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {project.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{project.client}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{project.domain}</p>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-600 font-medium">Progres Pengerjaan</span>
                          <strong className="text-slate-900 font-bold">{project.progress}%</strong>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              project.progress === 100 ? "bg-emerald-500" : "bg-orange-600"
                            }`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">
                          Tahap: <strong className="text-slate-700">{project.stage}</strong>
                        </p>
                        {project.notes && (
                          <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                            &ldquo;{project.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Target: {project.deadline}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openWebProgressModal(project)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                        >
                          <span></span> Update Progres WA
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedWeb(project)}
                          className="text-orange-600 font-bold hover:underline text-[11px]"
                        >
                          Edit Data →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* =========================================================
          MODAL 1: UPDATE PROGRES WEB
      ========================================================= */}
      {selectedWeb && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Update Progres Website</h2>
            <p className="text-xs text-slate-500 mb-4">{selectedWeb.client} • {selectedWeb.domain}</p>

            <form onSubmit={handleUpdateWebProject} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Persentase Progres ({selectedWeb.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedWeb.progress}
                  onChange={(e) => setSelectedWeb({ ...selectedWeb, progress: Number(e.target.value) })}
                  className="w-full accent-orange-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tahap Pengerjaan</label>
                <input
                  type="text"
                  value={selectedWeb.stage}
                  onChange={(e) => setSelectedWeb({ ...selectedWeb, stage: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Proyek</label>
                <select
                  value={selectedWeb.status}
                  onChange={(e) => setSelectedWeb({ ...selectedWeb, status: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="in progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Selesai (Deadline)</label>
                <input
                  type="text"
                  value={selectedWeb.deadline}
                  onChange={(e) => setSelectedWeb({ ...selectedWeb, deadline: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Internal / Klien</label>
                <textarea
                  value={selectedWeb.notes || ""}
                  onChange={(e) => setSelectedWeb({ ...selectedWeb, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedWeb(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: UPDATE KAMPANYE GOOGLE ADS
      ========================================================= */}
      {selectedAds && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Kelola Kampanye Google Ads</h2>
            <p className="text-xs text-slate-500 mb-4">{selectedAds.client} • {selectedAds.domain}</p>

            <form onSubmit={handleUpdateAdsCampaign} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Kampanye</label>
                  <select
                    value={selectedAds.status}
                    onChange={(e) => setSelectedAds({ ...selectedAds, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="active">Active (Running Tayang)</option>
                    <option value="review">Review (Menunggu Verifikasi)</option>
                    <option value="paused">Paused (Jeda)</option>
                    <option value="completed">Completed (Selesai)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dana Harian (Rp)</label>
                  <input
                    type="number"
                    value={selectedAds.dailyBudget}
                    onChange={(e) => setSelectedAds({ ...selectedAds, dailyBudget: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Impresi (Tayang)</label>
                  <input
                    type="number"
                    value={selectedAds.impressions}
                    onChange={(e) => setSelectedAds({ ...selectedAds, impressions: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Klik</label>
                  <input
                    type="number"
                    value={selectedAds.clicks}
                    onChange={(e) => setSelectedAds({ ...selectedAds, clicks: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Saldo Terpakai (Rp)</label>
                  <input
                    type="number"
                    value={selectedAds.spent}
                    onChange={(e) => setSelectedAds({ ...selectedAds, spent: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Anggaran (Rp)</label>
                  <input
                    type="number"
                    value={selectedAds.totalBudget}
                    onChange={(e) => setSelectedAds({ ...selectedAds, totalBudget: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Kata Kunci (Pisahkan koma)</label>
                <input
                  type="text"
                  value={selectedAds.keywords.join(", ")}
                  onChange={(e) =>
                    setSelectedAds({
                      ...selectedAds,
                      keywords: e.target.value.split(",").map((k) => k.trim()),
                    })
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Kampanye</label>
                <textarea
                  value={selectedAds.notes || ""}
                  onChange={(e) => setSelectedAds({ ...selectedAds, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedAds(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: TAMBAH KAMPANYE GOOGLE ADS BARU
      ========================================================= */}
      {isNewAdsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Daftarkan Kampanye Google Ads Baru</h2>
            <p className="text-xs text-slate-500 mb-4">Input data klien dan paket Google Ads yang dipesan.</p>

            <form onSubmit={handleCreateNewAds} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Klien / Bisnis</label>
                <input
                  type="text"
                  placeholder="Contoh: Toko Kopi Nusantara"
                  value={newAdsForm.client}
                  onChange={(e) => setNewAdsForm({ ...newAdsForm, client: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Klien</label>
                <input
                  type="email"
                  placeholder="Contoh: klien@gmail.com"
                  value={newAdsForm.email}
                  onChange={(e) => setNewAdsForm({ ...newAdsForm, email: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Website / Landing Page</label>
                <input
                  type="text"
                  placeholder="Contoh: kopinusantara.com"
                  value={newAdsForm.domain}
                  onChange={(e) => setNewAdsForm({ ...newAdsForm, domain: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilihan Paket Google Ads</label>
                <select
                  value={newAdsForm.packageType}
                  onChange={(e) => {
                    const val = e.target.value;
                    let dur = 14;
                    let daily = 50000;
                    let total = 700000;
                    if (val === "Paket Pemula 20 Hari") {
                      dur = 20; daily = 50000; total = 1000000;
                    } else if (val === "Paket Pemula 30 Hari") {
                      dur = 30; daily = 50000; total = 1500000;
                    } else if (val === "Paket Bisnis 10 Hari") {
                      dur = 10; daily = 100000; total = 1000000;
                    } else if (val === "Paket Bisnis 15 Hari") {
                      dur = 15; daily = 100000; total = 1500000;
                    } else if (val === "Paket Bisnis 30 Hari") {
                      dur = 30; daily = 100000; total = 3000000;
                    }
                    setNewAdsForm({
                      ...newAdsForm,
                      packageType: val,
                      durationDays: dur,
                      dailyBudget: daily,
                      totalBudget: total,
                    });
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Paket Pemula 14 Hari">Paket Pemula 14 Hari (Rp 700.000)</option>
                  <option value="Paket Pemula 20 Hari">Paket Pemula 20 Hari (Rp 1.000.000)</option>
                  <option value="Paket Pemula 30 Hari">Paket Pemula 30 Hari (Rp 1.500.000)</option>
                  <option value="Paket Bisnis 10 Hari">Paket Bisnis 10 Hari (Rp 1.000.000)</option>
                  <option value="Paket Bisnis 15 Hari">Paket Bisnis 15 Hari (Rp 1.500.000)</option>
                  <option value="Paket Bisnis 30 Hari">Paket Bisnis 30 Hari (Rp 3.000.000)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Kata Kunci (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Contoh: jual kopi gayo, supplier biji kopi"
                  value={newAdsForm.keywords}
                  onChange={(e) => setNewAdsForm({ ...newAdsForm, keywords: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                <textarea
                  placeholder="Instruksi khusus target lokasi / kata kunci negatif..."
                  value={newAdsForm.notes}
                  onChange={(e) => setNewAdsForm({ ...newAdsForm, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsNewAdsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  Tambah Kampanye
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* =========================================================
          MODAL 4: KIRIM LAPORAN HARIAN IKLAN TAYANG KE WA KLIEN
      ========================================================= */}
      {dailyReportModal && dailyReportModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl"></span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Kirim Laporan Harian Iklan Tayang</h3>
                  <p className="text-[11px] text-slate-500">Format otomatis ke WhatsApp Pelanggan (Admin Only)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDailyReportModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendDailyReportWA} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Klien / Brand</label>
                <input
                  type="text"
                  value={dailyReportModal.client}
                  onChange={(e) => setDailyReportModal({ ...dailyReportModal, client: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">URL Website Klien</label>
                  <input
                    type="text"
                    value={dailyReportModal.website}
                    onChange={(e) => setDailyReportModal({ ...dailyReportModal, website: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Klien</label>
                  <input
                    type="text"
                    placeholder="Contoh: 6285333555976"
                    value={dailyReportModal.phone}
                    onChange={(e) => setDailyReportModal({ ...dailyReportModal, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Laporan</label>
                  <input
                    type="text"
                    value={dailyReportModal.date}
                    onChange={(e) => setDailyReportModal({ ...dailyReportModal, date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Iklan Tayang ?</label>
                  <select
                    value={dailyReportModal.statusTayang}
                    onChange={(e) => setDailyReportModal({ ...dailyReportModal, statusTayang: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 focus:bg-white"
                  >
                    <option value="Ya">✅ Ya (Tayang Normal di Google)</option>
                    <option value="Sedang Optimasi">⚡ Sedang Optimasi Bid / Target</option>
                    <option value="Review Google">⏳ Sedang Ditinjau Google</option>
                    <option value="Jadwal Jam Tayang">⏰ Berdasarkan Jadwal Jam Kerja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: - atau Iklan aktif di posisi 1 Google"
                  value={dailyReportModal.keterangan}
                  onChange={(e) => setDailyReportModal({ ...dailyReportModal, keterangan: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* PREVIEW PESAN WA */}
              <div className="mt-2 p-3.5 bg-emerald-950 text-emerald-100 rounded-xl font-mono text-[11px] leading-relaxed border border-emerald-800 shadow-inner">
                <div className="flex items-center justify-between text-emerald-400 font-bold mb-2 pb-1 border-b border-emerald-800">
                  <span>Preview Teks WhatsApp:</span>
                  <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-200">Auto-Format</span>
                </div>
                <div className="whitespace-pre-line text-xs">
                  {`Halo Kak/Tim *${dailyReportModal.client || "PELANGGAN"}*, Berikut *Update Laporan Harian Iklan Google Ads* untuk website Anda:
*Website:* ${dailyReportModal.website || "https://..."}

*Tanggal:* ${dailyReportModal.date}
*Status Iklan Tayang:* ${
                    dailyReportModal.statusTayang === "Ya"
                      ? "✅ AKTIF & TAYANG (Halaman 1 Google)"
                      : `⚡ ${dailyReportModal.statusTayang}`
                  }
⚡ *Performa:* Berjalan Optimal & Menjangkau Calon Pembeli
*Keterangan:* ${dailyReportModal.keterangan || "-"}
────────────────────────
Kampanye iklan Anda terus kami pantau & optimasi agar menghasilkan leads dan penjualan maksimal. Terima kasih atas kepercayaannya bersama *HostingWeb.id*! ✨`}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDailyReportModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md transition"
                >
                  <span></span>
                  <span>Kirim ke WhatsApp (Buka Chat)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* =========================================================
          MODAL 5: KIRIM UPDATE PROGRES WEBSITE KE WA KLIEN
      ========================================================= */}
      {webProgressModal && webProgressModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-in max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl"></span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Kirim Update Progres Website</h3>
                  <p className="text-[11px] text-slate-500">Format milestone otomatis ke WhatsApp Klien</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWebProgressModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendWebProgressWA} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Klien / Instansi</label>
                  <input
                    type="text"
                    value={webProgressModal.client}
                    onChange={(e) => setWebProgressModal({ ...webProgressModal, client: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Domain Website</label>
                  <input
                    type="text"
                    value={webProgressModal.domain}
                    onChange={(e) => setWebProgressModal({ ...webProgressModal, domain: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Klien</label>
                  <input
                    type="text"
                    placeholder="Contoh: 6285333555976"
                    value={webProgressModal.phone}
                    onChange={(e) => setWebProgressModal({ ...webProgressModal, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Progres Pengerjaan (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={webProgressModal.progress}
                      onChange={(e) => setWebProgressModal({ ...webProgressModal, progress: Number(e.target.value) })}
                      className="flex-1 accent-orange-600 cursor-pointer"
                    />
                    <strong className="text-orange-600 font-extrabold w-10 text-right">{webProgressModal.progress}%</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahapan Saat Ini</label>
                  <input
                    type="text"
                    value={webProgressModal.stage}
                    onChange={(e) => setWebProgressModal({ ...webProgressModal, stage: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Selesai / Deadline</label>
                  <input
                    type="text"
                    value={webProgressModal.deadline}
                    onChange={(e) => setWebProgressModal({ ...webProgressModal, deadline: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Progres</label>
                <input
                  type="text"
                  placeholder="Contoh: Struktur halaman utama & company profile sudah siap di-review."
                  value={webProgressModal.notes}
                  onChange={(e) => setWebProgressModal({ ...webProgressModal, notes: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* PREVIEW PESAN WA */}
              <div className="mt-2 p-3.5 bg-slate-950 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between text-orange-400 font-bold mb-2 pb-1 border-b border-slate-800">
                  <span>Preview Teks WhatsApp:</span>
                  <span className="text-[10px] bg-orange-950 px-1.5 py-0.5 rounded text-orange-200">Auto-Format</span>
                </div>
                <div className="whitespace-pre-line text-xs">
                  {`Halo Kak/Tim *${webProgressModal.client || "PELANGGAN"}*, Berikut *Update Progres Pengerjaan Website* Anda:
*Domain:* ${webProgressModal.domain || "website-klien.id"}

*Progres:* ${webProgressModal.progress}% Selesai
*Tahapan Saat Ini:* ${webProgressModal.stage}
*Target Selesai:* ${webProgressModal.deadline}
*Catatan:* ${webProgressModal.notes || "-"}
────────────────────────
Website Anda terus kami kerjakan dengan standar kecepatan dan keamanan terbaik. ⚡

Terima kasih atas kepercayaannya bersama *HostingWeb.id*! ✨`}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWebProgressModal(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md transition"
                >
                  <span></span>
                  <span>Kirim Update ke WhatsApp Klien</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
