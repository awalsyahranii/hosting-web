export interface ThemeItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  badge?: string;
  demoUrl: string;
  features: string[];
  status?: "active" | "inactive";
  created_at?: string;
}

export const DEFAULT_THEMES: ThemeItem[] = [
  {
    id: "tema-otomotif-dealer",
    name: "Dealer V1 - Showroom & Sales Mobil",
    category: "Otomotif & Rental",
    description: "Template dealer resmi, showroom mobil baru/bekas, simulasi kredit, dan booking test drive.",
    price: 350000,
    originalPrice: 700000,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
    badge: "LIVE DEMO READY",
    demoUrl: "https://dealerv1.hostingwebid.com/",
    features: [
      "Katalog Unit & Simulasi Kredit Cicilan",
      "Galeri Spesifikasi & Download Brosur",
      "Form Booking Test Drive Online",
      "Tombol WhatsApp Sales Otomatis",
    ],
    status: "active",
    created_at: "2026-10-01",
  },
  {
    id: "tema-toko-online-pro",
    name: "Toko Online & E-Commerce Pro",
    category: "Toko Online & Retail",
    description: "Template toko online modern lengkap dengan keranjang belanja, variasi produk, dan checkout WhatsApp instan.",
    price: 450000,
    originalPrice: 900000,
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80",
    badge: "BEST SELLER",
    demoUrl: "https://tokov1.hostingwebid.com/",
    features: [
      "Checkout Otomatis via WhatsApp & Payment",
      "Katalog Produk & Variasi Ukuran/Warna",
      "Kupon Diskon & Banner Promo",
      "Notifikasi Pesanan Real-time",
    ],
    status: "active",
    created_at: "2026-10-01",
  },
  {
    id: "tema-properti-prime",
    name: "Listing & Agen Properti Prime",
    category: "Properti & Real Estate",
    description: "Desain eksklusif untuk listing perumahan, agen properti, cluster hunian, dan kalkulator simulasi KPR.",
    price: 400000,
    originalPrice: 800000,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    badge: "HIGH CONVERSION",
    demoUrl: "https://propertiv1.hostingwebid.com/",
    features: [
      "Galeri Foto Unit & Denah Bangunan",
      "Download Brosur PDF Otomatis",
      "Simulasi Angsuran & Kalkulator KPR",
      "Integrasi Google Maps Lokasi",
    ],
    status: "active",
    created_at: "2026-10-01",
  },
  {
    id: "tema-resto-kafe",
    name: "Restoran & Kafe Digital Menu",
    category: "Kuliner & Resto",
    description: "Template menarik untuk restoran, cafe, bakery, dan catering dengan buku menu online QR code.",
    price: 300000,
    originalPrice: 600000,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    badge: "MENU DIGITAL",
    demoUrl: "https://restov1.hostingwebid.com/",
    features: [
      "Buku Menu Digital QR Code Ringan",
      "Form Reservasi & Booking Meja",
      "Daftar Promo & Paket Menu Favorit",
      "Integrasi Tombol Order WhatsApp",
    ],
    status: "active",
    created_at: "2026-10-01",
  },
  {
    id: "tema-portal-berita",
    name: "Portal Berita & Majalah Online",
    category: "Media & Berita",
    description: "Template media online multi-kategori dengan slot banner iklan Google AdSense siap pasang dan fast-loading.",
    price: 350000,
    originalPrice: 700000,
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
    badge: "ADSENSE READY",
    demoUrl: "https://beritav1.hostingwebid.com/",
    features: [
      "Slot Iklan Siap Pakai (AdSense Ready)",
      "Trending Tags & Kategori Berita",
      "Loading Ultra Ringan (AMP Ready)",
      "Share Otomatis ke Media Sosial",
    ],
    status: "active",
    created_at: "2026-10-01",
  },
  {
    id: "tema-company-profile",
    name: "Corporate & Business Pro",
    category: "Bisnis & Perusahaan",
    description: "Template website profesional, responsif, dan elegan untuk profil perusahaan, instansi, dan jasa legalitas.",
    price: 350000,
    originalPrice: 700000,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    badge: "POPULER",
    demoUrl: "https://companyv1.hostingwebid.com/",
    features: [
      "Desain Modern, Clean & Elegan",
      "Mobile Friendly 100%",
      "Integrasi Tombol WhatsApp Direct",
      "Fast Loading Speed NVMe",
    ],
    status: "active",
    created_at: "2026-10-01",
  },
];

const LOCAL_STORAGE_KEY = "hostingwebid_themes_catalog";

/**
 * Fetch themes directly from server API with automatic local storage sync
 */
export async function fetchThemesAsync(): Promise<ThemeItem[]> {
  try {
    const res = await fetch(`/api/themes?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.themes)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.themes));
        }
        return data.themes;
      }
    }
  } catch (err) {
    console.warn("Could not fetch themes from API, falling back to local storage:", err);
  }
  return getThemes();
}

/**
 * Synchronous read from local storage / defaults
 */
export function getThemes(): ThemeItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_THEMES;
  }
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_THEMES));
      return DEFAULT_THEMES;
    }
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_THEMES;
  } catch (err) {
    console.error("Error reading themes from localStorage:", err);
    return DEFAULT_THEMES;
  }
}

/**
 * Save themes to local storage and broadcast event
 */
export function saveThemes(themes: ThemeItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(themes));
    window.dispatchEvent(new Event("themes_updated"));
  } catch (err) {
    console.error("Error saving themes:", err);
  }
}

/**
 * Add Theme API (Persistent on Server & Local)
 */
export async function addThemeAsync(
  theme: Omit<ThemeItem, "id"> & { id?: string }
): Promise<{ success: boolean; theme?: ThemeItem; message?: string }> {
  try {
    const res = await fetch("/api/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });
    const data = await res.json();
    if (data.success && data.theme) {
      if (Array.isArray(data.themes)) {
        saveThemes(data.themes);
      }
      return { success: true, theme: data.theme };
    }
    return { success: false, message: data.message || "Gagal menambah tema" };
  } catch (err: any) {
    console.error("Error creating theme via API:", err);
    // Local fallback
    const local = addTheme(theme);
    return { success: true, theme: local };
  }
}

/**
 * Update Theme API (Persistent on Server & Local)
 */
export async function updateThemeAsync(
  id: string,
  updatedFields: Partial<ThemeItem>
): Promise<{ success: boolean; theme?: ThemeItem; message?: string }> {
  try {
    const res = await fetch("/api/themes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updatedFields }),
    });
    const data = await res.json();
    if (data.success) {
      if (Array.isArray(data.themes)) {
        saveThemes(data.themes);
      }
      return { success: true, theme: data.theme };
    }
    return { success: false, message: data.message || "Gagal memperbarui tema" };
  } catch (err: any) {
    console.error("Error updating theme via API:", err);
    // Local fallback
    updateTheme(id, updatedFields);
    return { success: true };
  }
}

/**
 * Delete Theme API (Persistent on Server & Local)
 */
export async function deleteThemeAsync(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`/api/themes?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      if (Array.isArray(data.themes)) {
        saveThemes(data.themes);
      }
      return { success: true };
    }
    return { success: false, message: data.message || "Gagal menghapus tema" };
  } catch (err: any) {
    console.error("Error deleting theme via API:", err);
    deleteTheme(id);
    return { success: true };
  }
}

export function addTheme(theme: Omit<ThemeItem, "id"> & { id?: string }): ThemeItem {
  const current = getThemes();
  const newTheme: ThemeItem = {
    ...theme,
    id: theme.id || `theme-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: theme.status || "active",
    created_at: theme.created_at || new Date().toISOString().split("T")[0],
  };
  const updated = [newTheme, ...current];
  saveThemes(updated);
  return newTheme;
}

export function updateTheme(id: string, updatedFields: Partial<ThemeItem>): boolean {
  const current = getThemes();
  const index = current.findIndex((t) => t.id === id);
  if (index === -1) return false;

  current[index] = { ...current[index], ...updatedFields };
  saveThemes(current);
  return true;
}

export function deleteTheme(id: string): boolean {
  const current = getThemes();
  const filtered = current.filter((t) => t.id !== id);
  if (filtered.length === current.length) return false;
  saveThemes(filtered);
  return true;
}

/**
 * Auto-detect and generate default template metadata from a given Theme URL
 */
export function generateThemeDefaultsFromUrl(rawUrl: string): {
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  features: string[];
} {
  let cleanUrl = rawUrl.trim();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let hostname = "";
  try {
    const parsed = new URL(cleanUrl);
    hostname = parsed.hostname.toLowerCase();
  } catch {
    hostname = cleanUrl.toLowerCase();
  }

  // Extract keywords from subdomain / path
  const lower = hostname.replace(/\./g, " ").replace(/-/g, " ");

  if (lower.includes("dealer") || lower.includes("mobil") || lower.includes("motor") || lower.includes("rental") || lower.includes("otomotif")) {
    return {
      name: "Dealer & Showroom Mobil V" + (Math.floor(Math.random() * 5) + 1),
      category: "Otomotif & Rental",
      description: "Template profesional untuk dealer resmi, showroom mobil baru/bekas, simulasi kredit, dan booking test drive.",
      price: 350000,
      originalPrice: 700000,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
      badge: "LIVE DEMO READY",
      features: [
        "Katalog Unit & Simulasi Kredit Cicilan",
        "Galeri Spesifikasi & Download Brosur",
        "Form Booking Test Drive Online",
        "Tombol WhatsApp Sales Otomatis",
      ],
    };
  }

  if (lower.includes("toko") || lower.includes("shop") || lower.includes("store") || lower.includes("olshop") || lower.includes("market") || lower.includes("commerce")) {
    return {
      name: "Toko Online & E-Commerce Pro",
      category: "Toko Online & Retail",
      description: "Template toko online modern lengkap dengan keranjang belanja, variasi produk, dan checkout WhatsApp instan.",
      price: 450000,
      originalPrice: 900000,
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80",
      badge: "BEST SELLER",
      features: [
        "Checkout Otomatis via WhatsApp & Payment",
        "Katalog Produk & Variasi Ukuran/Warna",
        "Kupon Diskon & Banner Promo",
        "Notifikasi Pesanan Real-time",
      ],
    };
  }

  if (lower.includes("properti") || lower.includes("rumah") || lower.includes("estate") || lower.includes("cluster") || lower.includes("perumahan") || lower.includes("apartemen")) {
    return {
      name: "Listing & Agen Properti Prime",
      category: "Properti & Real Estate",
      description: "Desain eksklusif untuk listing perumahan, agen properti, cluster hunian, dan kalkulator simulasi KPR.",
      price: 400000,
      originalPrice: 800000,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
      badge: "HIGH CONVERSION",
      features: [
        "Galeri Foto Unit & Denah Bangunan",
        "Download Brosur PDF Otomatis",
        "Simulasi Angsuran & Kalkulator KPR",
        "Integrasi Google Maps Lokasi",
      ],
    };
  }

  if (lower.includes("resto") || lower.includes("cafe") || lower.includes("kuliner") || lower.includes("food") || lower.includes("kopi") || lower.includes("bakery")) {
    return {
      name: "Restoran & Kafe Digital Menu",
      category: "Kuliner & Resto",
      description: "Template menarik untuk restoran, cafe, bakery, dan catering dengan buku menu online QR code.",
      price: 300000,
      originalPrice: 600000,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
      badge: "MENU DIGITAL",
      features: [
        "Buku Menu Digital QR Code Ringan",
        "Form Reservasi & Booking Meja",
        "Daftar Promo & Paket Menu Favorit",
        "Integrasi Tombol Order WhatsApp",
      ],
    };
  }

  if (lower.includes("news") || lower.includes("berita") || lower.includes("media") || lower.includes("portal") || lower.includes("blog")) {
    return {
      name: "Portal Berita & Majalah Online",
      category: "Media & Berita",
      description: "Template media online multi-kategori dengan slot banner iklan Google AdSense siap pasang dan fast-loading.",
      price: 350000,
      originalPrice: 700000,
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80",
      badge: "ADSENSE READY",
      features: [
        "Slot Iklan Siap Pakai (AdSense Ready)",
        "Trending Tags & Kategori Berita",
        "Loading Ultra Ringan (AMP Ready)",
        "Share Otomatis ke Media Sosial",
      ],
    };
  }

  // Default Company / Business
  const capitalized = hostname.split(".")[0]?.toUpperCase() || "WEB";
  return {
    name: `${capitalized} Corporate & Business Pro`,
    category: "Bisnis & Perusahaan",
    description: "Template website profesional, responsif, dan elegan untuk profil perusahaan, instansi, dan jasa legalitas.",
    price: 350000,
    originalPrice: 700000,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    badge: "POPULER",
    features: [
      "Desain Modern, Clean & Elegan",
      "Mobile Friendly 100%",
      "Integrasi Tombol WhatsApp Direct",
      "Fast Loading Speed NVMe",
    ],
  };
}
