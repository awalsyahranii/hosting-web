import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PortfolioItem, DEFAULT_PORTFOLIOS, getScreenshotUrl, getCleanDomain, getCleanUrl } from "@/app/lib/portfolioStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  return path.join(dir, "portfolios.json");
}

function readPortfoliosFromFile(): PortfolioItem[] {
  try {
    const filePath = getDataFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_PORTFOLIOS, null, 2), "utf-8");
      return DEFAULT_PORTFOLIOS;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PORTFOLIOS;
  } catch (err) {
    console.error("Error reading portfolios file:", err);
    return DEFAULT_PORTFOLIOS;
  }
}

function writePortfoliosToFile(portfolios: PortfolioItem[]): boolean {
  try {
    const filePath = getDataFilePath();
    fs.writeFileSync(filePath, JSON.stringify(portfolios, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing portfolios file:", err);
    return false;
  }
}

// GET: /api/portfolios (fetch all portfolios)
export async function GET() {
  const portfolios = readPortfoliosFromFile();
  return NextResponse.json(
    { success: true, count: portfolios.length, portfolios },
    { headers: NO_CACHE_HEADERS }
  );
}

// POST: /api/portfolios (create new portfolio or bulk save)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = readPortfoliosFromFile();

    // If bulk array passed
    if (Array.isArray(body)) {
      writePortfoliosToFile(body);
      return NextResponse.json(
        { success: true, count: body.length, portfolios: body },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const {
      domain,
      url,
      category = "Bisnis & Jasa",
      categoryTag = "PRODUKSI & JASA",
      promoTag = "Hemat 50%",
      gradient = "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)",
      bannerTitle,
      bannerDesc,
      rating = "5.0/5 - 40 Ulasan",
      originalPrice = "Rp 1.500.000",
      discountBadge = "Hemat 50%",
      price = "Mulai Rp 750.000",
      orderPrice = "Pesan Rp 750rb",
      packageTitle = "Jasa Pembuatan Website Profesional",
      feat1 = "Tampilan Bisa Request/Custom",
      feat2 = "Termasuk Domain & Cloud Server NVMe",
      image,
      useScreenshot = true,
      status = "active",
      id,
    } = body;

    const cleanDomain = getCleanDomain(domain || url);
    const cleanUrl = getCleanUrl(url || domain);

    if (!cleanDomain) {
      return NextResponse.json(
        { success: false, message: "Domain atau Link Website wajib diisi." },
        { status: 400 }
      );
    }

    const autoImage = image && image.trim() ? image.trim() : getScreenshotUrl(cleanUrl);

    const newPortfolio: PortfolioItem = {
      id: id || `portfolio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      domain: cleanDomain,
      url: cleanUrl,
      category: category.trim(),
      categoryTag: categoryTag.trim(),
      promoTag: promoTag.trim(),
      gradient: gradient.trim(),
      bannerTitle: (bannerTitle || `Website ${cleanDomain}`).trim(),
      bannerDesc: (bannerDesc || "Layanan website siap online dan bergaransi bebas kendala").trim(),
      rating: rating.trim(),
      originalPrice: originalPrice.trim(),
      discountBadge: discountBadge.trim(),
      price: price.trim(),
      orderPrice: orderPrice.trim(),
      packageTitle: packageTitle.trim(),
      feat1: feat1.trim(),
      feat2: feat2.trim(),
      image: autoImage,
      useScreenshot: Boolean(useScreenshot),
      status: status === "inactive" ? "inactive" : "active",
      created_at: new Date().toISOString().split("T")[0],
    };

    const updated = [newPortfolio, ...current];
    writePortfoliosToFile(updated);

    return NextResponse.json(
      {
        success: true,
        message: "Portofolio website klien berhasil ditambahkan",
        portfolio: newPortfolio,
        portfolios: updated,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// PUT: /api/portfolios (update existing portfolio)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updatedFields } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Portofolio wajib diberikan." },
        { status: 400 }
      );
    }

    const current = readPortfoliosFromFile();
    const index = current.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Portofolio tidak ditemukan." },
        { status: 404 }
      );
    }

    if (updatedFields.url && !updatedFields.image) {
      updatedFields.image = getScreenshotUrl(updatedFields.url);
    }
    if (updatedFields.domain) {
      updatedFields.domain = getCleanDomain(updatedFields.domain);
    }

    const updatedItem = {
      ...current[index],
      ...updatedFields,
    };

    current[index] = updatedItem;
    writePortfoliosToFile(current);

    return NextResponse.json(
      {
        success: true,
        message: "Portofolio berhasil diperbarui",
        portfolio: updatedItem,
        portfolios: current,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: /api/portfolios?id=xxx (delete portfolio)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Portofolio wajib diberikan." },
        { status: 400 }
      );
    }

    const current = readPortfoliosFromFile();
    const filtered = current.filter((p) => p.id !== id);

    if (filtered.length === current.length) {
      return NextResponse.json(
        { success: false, message: "Portofolio tidak ditemukan." },
        { status: 404 }
      );
    }

    writePortfoliosToFile(filtered);

    return NextResponse.json(
      {
        success: true,
        message: "Portofolio berhasil dihapus",
        portfolios: filtered,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server Error" },
      { status: 500 }
    );
  }
}

