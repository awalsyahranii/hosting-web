export interface SeoPackage {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  badge?: string;
  features: string[];
  description: string;
  status: "active" | "inactive";
  created_at?: string;
}

export const DEFAULT_SEO_PACKAGES: SeoPackage[] = [
  {
    id: "seo-pbn-3",
    name: "SEO PBN 3",
    category: "PBN Authority Ultimate",
    price: 2000000,
    originalPrice: 3500000,
    rating: 5,
    image: "/images/seo-package.jpg",
    badge: "Best Seller",
    features: [
      "50 PBN High DA 50+ & PA 40+",
      "100% Index Google Cepat & Permanen",
      "Contextual Dofollow Backlink 1000+ Kata",
      "Riset Keyword Kompetitor Mendalam",
      "Garansi Kenaikan Traffic & Ranking Google",
      "Laporan Backlink & Live Ranking Bulanan",
    ],
    description: "Paket ultimate untuk dominasi ranking kata kunci persaingan tinggi di Google Indonesia.",
    status: "active",
    created_at: "2026-09-01",
  },
  {
    id: "seo-pbn-2",
    name: "SEO PBN 2",
    category: "PBN Authority Pro",
    price: 1300000,
    originalPrice: 2200000,
    rating: 5,
    image: "/images/seo-package.jpg",
    badge: "⭐ Populer",
    features: [
      "30 PBN High DA 35+ & PA 30+",
      "Dofollow Backlink Berkualitas Tinggi",
      "Optimasi 3-5 Kata Kunci Utama",
      "Artikel Relevan 700+ Kata",
      "Index Google Cepat & Aman",
      "Laporan Transparan File Excel",
    ],
    description: "Paket ideal untuk website bisnis UMKM & company profile yang ingin mendongkrak omset penjualan.",
    status: "active",
    created_at: "2026-09-05",
  },
  {
    id: "seo-pbn-1",
    name: "SEO PBN 1",
    category: "PBN Starter",
    price: 650000,
    originalPrice: 1200000,
    rating: 5,
    image: "/images/seo-package.jpg",
    badge: "✨ Hemat",
    features: [
      "15 PBN DA 20+ Relevan",
      "100% Dofollow Backlink",
      "Optimasi 1-2 Kata Kunci Utama",
      "Teknik White-hat & Aman Algoritma Google",
      "Laporan Lengkap Live URLs",
    ],
    description: "Paket pemula untuk website baru yang ingin mulai masuk halaman 1 pencarian Google.",
    status: "active",
    created_at: "2026-09-10",
  },
];

const LOCAL_STORAGE_KEY = "hostingwebid_seo_packages";

export function getSeoPackages(): SeoPackage[] {
  if (typeof window === "undefined") {
    return DEFAULT_SEO_PACKAGES;
  }
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SEO_PACKAGES));
      return DEFAULT_SEO_PACKAGES;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SEO_PACKAGES;
  } catch (err) {
    console.error("Error reading SEO packages:", err);
    return DEFAULT_SEO_PACKAGES;
  }
}

export function saveSeoPackages(packages: SeoPackage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(packages));
    window.dispatchEvent(new Event("seo_packages_updated"));
  } catch (err) {
    console.error("Error saving SEO packages:", err);
  }
}

export function addSeoPackage(pkg: Omit<SeoPackage, "id">): SeoPackage {
  const list = getSeoPackages();
  const id = `seo-${Date.now()}`;
  const newPkg: SeoPackage = {
    ...pkg,
    id,
    created_at: new Date().toISOString().split("T")[0],
  };
  const updated = [newPkg, ...list];
  saveSeoPackages(updated);
  return newPkg;
}

export function updateSeoPackage(id: string, updates: Partial<SeoPackage>): boolean {
  const list = getSeoPackages();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return false;
  list[index] = { ...list[index], ...updates };
  saveSeoPackages(list);
  return true;
}

export function deleteSeoPackage(id: string): boolean {
  const list = getSeoPackages();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length === list.length) return false;
  saveSeoPackages(filtered);
  return true;
}
