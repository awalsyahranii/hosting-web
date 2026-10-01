import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store",
};

function getDataFilePath() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return path.join(dir, "themes.json");
}

function readThemesFromFile(): ThemeItem[] {
  try {
    const filePath = getDataFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_THEMES, null, 2), "utf-8");
      return DEFAULT_THEMES;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_THEMES;
  } catch (err) {
    console.error("Error reading themes file:", err);
    return DEFAULT_THEMES;
  }
}

function writeThemesToFile(themes: ThemeItem[]): boolean {
  try {
    const filePath = getDataFilePath();
    fs.writeFileSync(filePath, JSON.stringify(themes, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing themes file:", err);
    return false;
  }
}

// GET: /api/themes (fetch all themes)
export async function GET() {
  const themes = readThemesFromFile();
  return NextResponse.json(
    { success: true, count: themes.length, themes },
    { headers: NO_CACHE_HEADERS }
  );
}

// POST: /api/themes (create a new theme or bulk save)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = readThemesFromFile();

    // If bulk array passed
    if (Array.isArray(body)) {
      writeThemesToFile(body);
      return NextResponse.json(
        { success: true, count: body.length, themes: body },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const {
      name,
      category = "Bisnis & Perusahaan",
      description = "",
      price = 350000,
      originalPrice = 700000,
      image = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
      badge = "LIVE DEMO READY",
      demoUrl = "",
      features = [],
      status = "active",
      id,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Nama tema wajib diisi." }, { status: 400 });
    }

    const newTheme: ThemeItem = {
      id: id || `theme-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      originalPrice: Number(originalPrice) || Number(price) * 2 || 0,
      image: image.trim(),
      badge: badge ? badge.trim() : undefined,
      demoUrl: demoUrl.trim(),
      features: Array.isArray(features) && features.length > 0 ? features : ["Fitur Premium Siap Pakai", "Mobile Friendly 100%", "Integrasi WhatsApp"],
      status: status === "inactive" ? "inactive" : "active",
      created_at: new Date().toISOString().split("T")[0],
    };

    const updated = [newTheme, ...current];
    writeThemesToFile(updated);

    return NextResponse.json(
      {
        success: true,
        message: "Tema berhasil ditambahkan",
        theme: newTheme,
        themes: updated,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Server Error" }, { status: 500 });
  }
}

// PUT: /api/themes (update theme by ID or upsert)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updatedFields } = body;

    const current = readThemesFromFile();
    let index = -1;

    if (id) {
      index = current.findIndex((t) => t.id === id);
    }

    // Fallback search by Name if ID is different
    if (index === -1 && updatedFields.name) {
      index = current.findIndex(
        (t) => t.name.toLowerCase().trim() === updatedFields.name.toLowerCase().trim()
      );
    }

    // Fallback search by demoUrl if provided
    if (index === -1 && updatedFields.demoUrl) {
      index = current.findIndex(
        (t) => (t.demoUrl || "").toLowerCase().trim() === updatedFields.demoUrl.toLowerCase().trim()
      );
    }

    if (updatedFields.price !== undefined) {
      updatedFields.price = Number(updatedFields.price);
    }
    if (updatedFields.originalPrice !== undefined) {
      updatedFields.originalPrice = Number(updatedFields.originalPrice);
    }

    // If still not found, upsert as new item!
    if (index === -1) {
      const newTheme: ThemeItem = {
        id: id || `theme-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: updatedFields.name?.trim() || "Tema Baru",
        category: updatedFields.category?.trim() || "Bisnis & Perusahaan",
        description: updatedFields.description?.trim() || "",
        price: Number(updatedFields.price) || 350000,
        originalPrice: Number(updatedFields.originalPrice) || (Number(updatedFields.price) * 2) || 700000,
        image: updatedFields.image?.trim() || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
        badge: updatedFields.badge?.trim() || "LIVE DEMO READY",
        demoUrl: updatedFields.demoUrl?.trim() || "",
        features: Array.isArray(updatedFields.features) && updatedFields.features.length > 0 ? updatedFields.features : ["Fitur Premium Siap Pakai", "Mobile Friendly 100%", "Integrasi WhatsApp"],
        status: updatedFields.status === "inactive" ? "inactive" : "active",
        created_at: new Date().toISOString().split("T")[0],
      };
      const updated = [newTheme, ...current];
      writeThemesToFile(updated);
      return NextResponse.json(
        {
          success: true,
          message: "Tema berhasil disimpan ke server",
          theme: newTheme,
          themes: updated,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const updatedTheme: ThemeItem = {
      ...current[index],
      ...updatedFields,
    };

    current[index] = updatedTheme;
    writeThemesToFile(current);

    return NextResponse.json(
      {
        success: true,
        message: "Tema berhasil diperbarui",
        theme: updatedTheme,
        themes: current,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Server Error" }, { status: 500 });
  }
}

// DELETE: /api/themes?id=xyz or DELETE with body { id }
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "ID tema wajib disertakan untuk menghapus." }, { status: 400 });
    }

    const current = readThemesFromFile();
    const filtered = current.filter((t) => t.id !== id);

    writeThemesToFile(filtered);

    return NextResponse.json(
      {
        success: true,
        message: "Tema berhasil dihapus",
        themes: filtered,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || "Server Error" }, { status: 500 });
  }
}
