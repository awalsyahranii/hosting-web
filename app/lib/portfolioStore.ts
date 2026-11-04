export interface PortfolioItem {
  id: string;
  domain: string;
  url?: string;
  category: string;
  categoryTag: string;
  promoTag: string;
  gradient?: string;
  bannerTitle: string;
  bannerDesc: string;
  rating: string;
  originalPrice: string;
  discountBadge: string;
  price: string;
  orderPrice: string;
  packageTitle: string;
  feat1: string;
  feat2: string;
  image?: string;
  useScreenshot?: boolean;
  status?: "active" | "inactive";
  created_at?: string;
}

export function getCleanUrl(domainOrUrl: string): string {
  if (!domainOrUrl) return "";
  let clean = domainOrUrl.trim();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = `https://${clean}`;
  }
  return clean;
}

export function getCleanDomain(domainOrUrl: string): string {
  if (!domainOrUrl) return "";
  let clean = domainOrUrl.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\//i, "");
  clean = clean.replace(/\/.*$/, "");
  return clean;
}

export function getScreenshotUrl(domainOrUrl: string): string {
  const url = getCleanUrl(domainOrUrl);
  if (!url) return "";
  return `https://image.thum.io/get/width/800/crop/600/${url}`;
}

export const DEFAULT_PORTFOLIOS: PortfolioItem[] = [
  {
    id: "portfolio-tukangaluminiumkaca-my-id",
    domain: "tukangaluminiumkaca.my.id",
    url: "https://www.tukangaluminiumkaca.my.id/",
    category: "Bisnis & Jasa",
    categoryTag: "PRODUKSI & JASA",
    promoTag: "Hemat 50%",
    gradient: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
    bannerTitle: "Jasa Aluminium & Kaca Tempered",
    bannerDesc: "Kusen aluminium, pintu sliding, partisi kantor & etalase kaca custom",
    rating: "4.9/5 - 42 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Usaha Aluminium",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Termasuk Domain .my.id + Cloud Server",
    image: "https://image.thum.io/get/width/800/crop/600/https://www.tukangaluminiumkaca.my.id/",
    useScreenshot: true,
    status: "active",
    created_at: "2026-10-01",
  },
  {
    id: "portfolio-terbaruindo-com",
    domain: "terbaruindo.com",
    url: "https://terbaruindo.com/",
    category: "Media & Berita",
    categoryTag: "NEWS FLASH",
    promoTag: "SEO & AdSense Ready",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #2563eb 50%, #1e40af 100%)",
    bannerTitle: "Portal Berita & Media Online Multi-Kategori",
    bannerDesc: "Support slot iklan, trending tags, dan amp speed",
    rating: "5.0/5 - 58 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Media Berita",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Autoshare Medsos & Optimasi SEO",
    image: "https://image.thum.io/get/width/800/crop/600/https://terbaruindo.com/",
    useScreenshot: true,
    status: "active",
    created_at: "2026-10-01",
  },
  {
    id: "portfolio-aionjakarta-id",
    domain: "aionjakarta.id",
    url: "https://aionjakarta.id/",
    category: "Otomotif",
    categoryTag: "FLEET & DEALER",
    promoTag: "Fast Booking",
    gradient: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
    bannerTitle: "Dealer Resmi Mobil Listrik GAC AION",
    bannerDesc: "List varian unit, simulasi cicilan & form booking test drive",
    rating: "4.9/5 - 36 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Hemat 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Dealer Mobil",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Form Reservasi Langsung ke WhatsApp",
    image: "https://image.thum.io/get/width/800/crop/600/https://aionjakarta.id/",
    useScreenshot: true,
    status: "active",
    created_at: "2026-10-01",
  },
  {
    id: "portfolio-hunianjabodetabek-com",
    domain: "hunianjabodetabek.com",
    url: "https://hunianjabodetabek.com/",
    category: "Properti",
    categoryTag: "PROPERTI & HUNIAN",
    promoTag: "Hemat 50%",
    gradient: "linear-gradient(135deg, #881337 0%, #be123c 50%, #9f1239 100%)",
    bannerTitle: "Listing Hunian, Rumah & Apartemen Baru",
    bannerDesc: "Katalog properti, galeri virtual tour & kalkulator simulasi KPR",
    rating: "5.0/5 - 51 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Properti",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Integrasi Google Maps & Brosur PDF",
    image: "https://image.thum.io/get/width/800/crop/600/https://hunianjabodetabek.com/",
    useScreenshot: true,
    status: "active",
    created_at: "2026-10-01",
  },
];

const LOCAL_STORAGE_KEY = "hostingwebid_portfolios_v5";

export function getPortfolios(): PortfolioItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_PORTFOLIOS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_PORTFOLIOS));
      return DEFAULT_PORTFOLIOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Error reading portfolios from localStorage:", err);
  }
  return DEFAULT_PORTFOLIOS;
}

export function savePortfolios(portfolios: PortfolioItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(portfolios));
  } catch (err) {
    console.error("Error saving portfolios to localStorage:", err);
  }
}

export async function fetchPortfoliosAsync(): Promise<PortfolioItem[]> {
  try {
    const res = await fetch(`/api/portfolios?_t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.portfolios) && data.portfolios.length > 0) {
      savePortfolios(data.portfolios);
      return data.portfolios;
    }
  } catch (err) {
    console.warn("fetchPortfoliosAsync API fallback to local:", err);
  }
  return getPortfolios();
}

export async function addPortfolioAsync(
  item: Omit<PortfolioItem, "id"> & { id?: string }
): Promise<{ success: boolean; portfolio?: PortfolioItem; message?: string }> {
  try {
    const res = await fetch("/api/portfolios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (data.success && data.portfolio) {
      if (Array.isArray(data.portfolios)) {
        savePortfolios(data.portfolios);
      }
      return { success: true, portfolio: data.portfolio };
    }
    return { success: false, message: data.message || "Gagal menambah portofolio" };
  } catch (err: any) {
    console.error("Error creating portfolio via API:", err);
    const local = addPortfolio(item);
    return { success: true, portfolio: local };
  }
}

export async function updatePortfolioAsync(
  id: string,
  updatedFields: Partial<PortfolioItem>
): Promise<{ success: boolean; portfolio?: PortfolioItem; message?: string }> {
  try {
    const res = await fetch("/api/portfolios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updatedFields }),
    });
    const data = await res.json();
    if (data.success) {
      if (Array.isArray(data.portfolios)) {
        savePortfolios(data.portfolios);
      }
      return { success: true, portfolio: data.portfolio };
    }
    return { success: false, message: data.message || "Gagal memperbarui portofolio" };
  } catch (err: any) {
    console.error("Error updating portfolio via API:", err);
    updatePortfolio(id, updatedFields);
    return { success: true };
  }
}

export async function deletePortfolioAsync(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/portfolios?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      if (Array.isArray(data.portfolios)) {
        savePortfolios(data.portfolios);
      }
      return { success: true };
    }
    return { success: false, message: data.message || "Gagal menghapus portofolio" };
  } catch (err: any) {
    console.error("Error deleting portfolio via API:", err);
    deletePortfolio(id);
    return { success: true };
  }
}

export function addPortfolio(item: Omit<PortfolioItem, "id"> & { id?: string }): PortfolioItem {
  const current = getPortfolios();
  const newPortfolio: PortfolioItem = {
    ...item,
    id: item.id || `portfolio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: item.status || "active",
    created_at: item.created_at || new Date().toISOString().split("T")[0],
  };
  const updated = [newPortfolio, ...current];
  savePortfolios(updated);
  return newPortfolio;
}

export function updatePortfolio(id: string, updatedFields: Partial<PortfolioItem>): boolean {
  const current = getPortfolios();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return false;

  current[index] = { ...current[index], ...updatedFields };
  savePortfolios(current);
  return true;
}

export function deletePortfolio(id: string): boolean {
  const current = getPortfolios();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === current.length) return false;
  savePortfolios(filtered);
  return true;
}

export function generatePortfolioDefaultsFromUrl(rawUrl: string): {
  domain: string;
  url: string;
  category: string;
  categoryTag: string;
  promoTag: string;
  gradient: string;
  bannerTitle: string;
  bannerDesc: string;
  packageTitle: string;
  feat1: string;
  feat2: string;
  rating: string;
  originalPrice: string;
  discountBadge: string;
  price: string;
  orderPrice: string;
  image: string;
} {
  const cleanUrl = getCleanUrl(rawUrl);
  const domain = getCleanDomain(rawUrl);
  const nameBase = domain.replace(/\.(com|id|my\.id|co\.id|net|org|xyz|io|biz|site)$/i, "");
  const words = nameBase.replace(/[-_.]/g, " ").trim();
  const capitalized = words
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const gradients = [
    "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
    "linear-gradient(135deg, #1e1b4b 0%, #2563eb 50%, #1e40af 100%)",
    "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
    "linear-gradient(135deg, #881337 0%, #be123c 50%, #9f1239 100%)",
    "linear-gradient(135deg, #3b0764 0%, #7e22ce 50%, #6b21a8 100%)",
    "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0369a1 100%)",
  ];
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return {
    domain: domain || "contohdomain.com",
    url: cleanUrl || `https://${domain}`,
    category: "Bisnis & Jasa",
    categoryTag: "PRODUKSI & JASA",
    promoTag: "Hemat 50%",
    gradient: randomGradient,
    bannerTitle: capitalized ? `Website Profesional ${capitalized}` : "Layanan & Produk Berkualitas",
    bannerDesc: "Desain responsif, mobile-friendly & optimasi iklan Google Ads siap pakai",
    packageTitle: capitalized ? `Jasa Pembuatan Website ${capitalized}` : "Jasa Pembuatan Website Bisnis",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Termasuk Domain & Cloud Server NVMe",
    rating: "4.9/5 - 38 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Hemat 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    image: getScreenshotUrl(cleanUrl || domain),
  };
}
