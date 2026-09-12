"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWhatsAppUrl, SITE_CONFIG } from "./lib/siteConfig";

interface PlanFeature {
  text: string;
  icon: string;
  checkColor: string;
  highlight?: boolean;
}

interface PlanItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  priceLabel: string;
  originalPrice: string;
  price: number;
  priceFormatted: string;
  discountBadge: string;
  discountType: string;
  popular: boolean;
  popularBadge?: string;
  btnClass: string;
  featuresHeader: string;
  featuresHeaderBadge?: string;
  features: PlanFeature[];
}

const plans: PlanItem[] = [
  {
    id: "starter",
    icon: "✨",
    name: "Paket Starter Website",
    description: "Cocok untuk memulai website profesional & portofolio pribadi.",
    priceLabel: "HARGA MULAI DARI",
    originalPrice: "Rp 1.200.000",
    price: 750000,
    priceFormatted: "750.000",
    discountBadge: "Hemat 35%",
    discountType: "green",
    popular: false,
    btnClass: "plan-btn-outline",
    featuresHeader: "YANG KAMU DAPATKAN:",
    features: [
      { text: "Hosting 3GB NVMe", icon: "💻", checkColor: "teal" },
      { text: "Termasuk Domain .com", icon: "🌐", checkColor: "teal" },
      { text: "Website Siap Pakai", icon: "🚀", checkColor: "teal" },
      { text: "Setting SEO On-Page", icon: "✔️", checkColor: "teal" },
      { text: "Garansi Bebas Error", icon: "🛡️", checkColor: "teal" },
      { text: "SSL Certificate Gratis", icon: "🔒", checkColor: "teal" },
    ],
  },
  {
    id: "business-pro",
    icon: "🔥",
    name: "Paket Bisnis Pro",
    description: "Untuk bisnis yang ingin berkembang lebih cepat & penjualan optimal.",
    popularBadge: "PALING POPULER",
    priceLabel: "REKOMENDASI TERBAIK",
    originalPrice: "Rp 2.500.000",
    price: 1500000,
    priceFormatted: "1.500.000",
    discountBadge: "Hemat 40%",
    discountType: "red-pill",
    popular: true,
    btnClass: "plan-btn-primary",
    featuresHeader: "YANG KAMU DAPATKAN:",
    featuresHeaderBadge: "ALL-IN-ONE",
    features: [
      { text: "Hosting 10GB NVMe High Speed", icon: "💻", checkColor: "orange" },
      { text: "Termasuk Domain .com", icon: "🌐", checkColor: "orange" },
      { text: "Website Siap Pakai", icon: "🚀", checkColor: "orange" },
      { text: "FREE 30 Artikel SEO Berkualitas", icon: "📝", highlight: true, checkColor: "orange" },
      { text: "FREE Riset Kata Kunci", icon: "🔍", highlight: true, checkColor: "orange" },
      { text: "Setting SEO On-Page", icon: "✔️", checkColor: "orange" },
      { text: "Garansi Bebas Error", icon: "🛡️", checkColor: "orange" },
      { text: "LiteSpeed Turbo Cache Enabled", icon: "⚡", checkColor: "orange" },
    ],
  },
  {
    id: "elite-enterprise",
    icon: "🌟",
    name: "Paket Elite Enterprise",
    description: "Untuk bisnis dengan kebutuhan website dan SEO lebih tinggi.",
    priceLabel: "HARGA MULAI DARI",
    originalPrice: "Rp 3.500.000",
    price: 2000000,
    priceFormatted: "2.000.000",
    discountBadge: "Hemat 42%",
    discountType: "green",
    popular: false,
    btnClass: "plan-btn-outline",
    featuresHeader: "YANG KAMU DAPATKAN:",
    features: [
      { text: "Hosting 50GB NVMe Cloud", icon: "💻", checkColor: "teal" },
      { text: "Termasuk Domain .com", icon: "🌐", checkColor: "teal" },
      { text: "Website Siap Pakai", icon: "🚀", checkColor: "teal" },
      { text: "FREE 30 Artikel SEO Berkualitas", icon: "📝", checkColor: "teal" },
      { text: "FREE Riset Kata Kunci", icon: "🔍", checkColor: "teal" },
      { text: "Setting SEO On-Page", icon: "✔️", checkColor: "teal" },
      { text: "Garansi Bebas Error", icon: "🛡️", checkColor: "teal" },
      { text: "Optimasi SEO untuk Traffic", icon: "📈", checkColor: "teal" },
    ],
  },
];

interface GoogleAdsPackage {
  id: string;
  category: "pemula" | "bisnis";
  categoryLabel: string;
  durationDays: number;
  durationLabel: string;
  title: string;
  description: string;
  dailyBudget: string;
  dailyBudgetValue: number;
  price: number;
  priceFormatted: string;
  originalPrice?: string;
  features: string[];
}

const googleAdsPackages: GoogleAdsPackage[] = [
  {
    id: "pemula-14",
    category: "pemula",
    categoryLabel: "Paket Pemula",
    durationDays: 14,
    durationLabel: "14 Hari",
    title: "Paket Pemula 14 Hari",
    description: "Ideal untuk uji coba pasar, testing kata kunci & bisnis lokal.",
    dailyBudget: "Rp 50.000 / hari",
    dailyBudgetValue: 50000,
    price: 700000,
    priceFormatted: "Rp 700.000",
    features: [
      "Masa Aktif 14 Hari Penuh",
      "Dana Harian Rp 50.000 ke Google",
      "Riset Kata Kunci Potensial & Relevan",
      "Teks Iklan Kami Bantu (Copywriting Persuasif)",
      "Optimasi Iklan Berkala & Pemantauan",
      "Include Jasa Setting & Setup Akun",
      "Belum termasuk PPN 11%",
    ],
  },
  {
    id: "pemula-20",
    category: "pemula",
    categoryLabel: "Paket Pemula",
    durationDays: 20,
    durationLabel: "20 Hari",
    title: "Paket Pemula 20 Hari",
    description: "Visibilitas lebih lama untuk menjaring pelanggan berulang.",
    dailyBudget: "Rp 50.000 / hari",
    dailyBudgetValue: 50000,
    price: 1000000,
    priceFormatted: "Rp 1.000.000",
    features: [
      "Masa Aktif 20 Hari Penuh",
      "Dana Harian Rp 50.000 ke Google",
      "Riset Kata Kunci Potensial Tertarget",
      "Teks Iklan Kami Bantu (Multi-Variasi)",
      "Optimasi Iklan Berkala & Negative Keyword",
      "Include Jasa Setting & Setup Ekstensi WA",
      "Belum termasuk PPN 11%",
    ],
  },
  {
    id: "pemula-30",
    category: "pemula",
    categoryLabel: "Paket Pemula",
    durationDays: 30,
    durationLabel: "30 Hari",
    title: "Paket Pemula 30 Hari",
    description: "Sebulan penuh tayang non-stop dengan anggaran paling hemat.",
    dailyBudget: "Rp 50.000 / hari",
    dailyBudgetValue: 50000,
    price: 1500000,
    priceFormatted: "Rp 1.500.000",
    features: [
      "Masa Aktif 30 Hari Sebulan Penuh",
      "Dana Harian Rp 50.000 ke Google",
      "Riset Kata Kunci Mendalam & Relevan",
      "Teks Iklan Kami Bantu & Setting Call Extension",
      "Optimasi Iklan Mingguan",
      "Include Jasa Setting & Setup Komplit",
      "Belum termasuk PPN 11%",
    ],
  },
  {
    id: "bisnis-10",
    category: "bisnis",
    categoryLabel: "Paket Bisnis",
    durationDays: 10,
    durationLabel: "10 Hari",
    title: "Paket Bisnis 10 Hari",
    description: "Traffic lebih deras dengan budget harian lebih tinggi.",
    dailyBudget: "Rp 100.000 / hari",
    dailyBudgetValue: 100000,
    price: 1000000,
    priceFormatted: "Rp 1.000.000",
    features: [
      "Masa Aktif 10 Hari Penuh",
      "Dana Harian Rp 100.000 ke Google",
      "Riset Kata Kunci Kompetitor Tertarget",
      "Teks Iklan High Converting Copywriting",
      "Optimasi Harian & Bid Adjustment",
      "Include Setup Conversion Tracking",
      "Belum termasuk PPN 11%",
    ],
  },
  {
    id: "bisnis-15",
    category: "bisnis",
    categoryLabel: "Paket Bisnis",
    durationDays: 15,
    durationLabel: "15 Hari",
    title: "Paket Bisnis 15 Hari",
    description: "Penetrasi pasar optimal untuk campaign promo atau momentum khusus.",
    dailyBudget: "Rp 100.000 / hari",
    dailyBudgetValue: 100000,
    price: 1500000,
    priceFormatted: "Rp 1.500.000",
    features: [
      "Masa Aktif 15 Hari Penuh",
      "Dana Harian Rp 100.000 ke Google",
      "Riset Kata Kunci Premium & Negatif Keyword",
      "Copywriting A/B Testing untuk CTR Tinggi",
      "Optimasi Berkala & Bid Strategi",
      "Include Setup Akun & Remarketing Tag",
      "Belum termasuk PPN 11%",
    ],
  },
  {
    id: "bisnis-30",
    category: "bisnis",
    categoryLabel: "Paket Bisnis",
    durationDays: 30,
    durationLabel: "30 Hari",
    title: "Paket Bisnis 30 Hari",
    description: "Solusi terlengkap dominasi halaman 1 Google selama sebulan penuh.",
    dailyBudget: "Rp 100.000 / hari",
    dailyBudgetValue: 100000,
    price: 3000000,
    priceFormatted: "Rp 3.000.000",
    originalPrice: "Rp 3.450.000",
    features: [
      "Masa Aktif 30 Hari Penuh",
      "Dana Harian Rp 100.000 ke Google",
      "Riset Kata Kunci Skala Penuh & Kompetitif",
      "Multiple Ad Extensions & Callouts",
      "Optimasi Intensif Mingguan",
      "Include Setup Google Analytics & Conversion Tracking",
      "Belum termasuk PPN 11%",
    ],
  },
];

const features = [
  {
    icon: "⚡",
    badge: "NVMe 5x Faster",
    theme: "yellow",
    title: "Super Cepat",
    description:
      "Server menggunakan teknologi SSD NVMe untuk memberikan performa website yang cepat dan responsif.",
    detail:
      "Website yang cepat memberikan pengalaman yang lebih nyaman bagi pengunjung. HostingWeb menggunakan teknologi SSD NVMe untuk membantu website tetap responsif dan memiliki performa yang optimal.",
    benefits: [
      "Menggunakan penyimpanan SSD NVMe",
      "Performa website lebih responsif",
      "Loading halaman lebih cepat",
      "Cocok untuk website bisnis dan profesional",
    ],
  },
  {
    icon: "🛡",
    badge: "Free Wildcard SSL",
    theme: "pink",
    title: "Aman & Terpercaya",
    description:
      "SSL gratis, sistem keamanan berlapis dan backup rutin untuk menjaga website tetap aman.",
    detail:
      "Keamanan website merupakan hal penting. HostingWeb menyediakan SSL dan sistem keamanan berlapis untuk membantu melindungi website serta data kamu.",
    benefits: [
      "SSL untuk keamanan koneksi website",
      "Sistem keamanan berlapis",
      "Backup data secara berkala",
      "Perlindungan tambahan untuk data website",
    ],
  },
  {
    icon: "🚀",
    badge: "1-Click Scale",
    theme: "orange",
    title: "Mudah Dikembangkan",
    description:
      "Paket hosting fleksibel yang bisa disesuaikan dengan pertumbuhan website dan bisnis kamu.",
    detail:
      "Website dan bisnis kamu bisa terus berkembang. HostingWeb menyediakan paket yang fleksibel sehingga kebutuhan hosting dapat disesuaikan seiring pertumbuhan website.",
    benefits: [
      "Pilihan paket sesuai kebutuhan",
      "Dapat melakukan upgrade paket",
      "Cocok untuk website yang terus berkembang",
      "Fleksibel untuk kebutuhan bisnis",
    ],
  },
  {
    icon: "💬",
    badge: "Respon < 5 Menit",
    theme: "purple",
    title: "Support Responsif",
    description:
      "Tim support siap membantu ketika kamu membutuhkan bantuan terkait hosting dan website.",
    detail:
      "Ketika mengalami kendala terkait hosting atau website, kamu dapat mendapatkan bantuan dari tim support untuk membantu menemukan solusi yang tepat.",
    benefits: [
      "Bantuan terkait layanan hosting",
      "Dukungan ketika mengalami kendala",
      "Membantu memberikan solusi",
      "Support yang mudah dihubungi",
    ],
  },
  {
    icon: "🌐",
    badge: "DNS Propagation Instan",
    theme: "blue",
    title: "Domain Mudah",
    description:
      "Cari dan daftarkan domain impianmu dengan proses yang cepat dan sederhana.",
    detail:
      "Domain merupakan alamat utama website kamu. HostingWeb membantu membuat proses penggunaan dan pengelolaan domain menjadi lebih mudah.",
    benefits: [
      "Domain .com tersedia pada paket tertentu",
      "Proses pengelolaan domain lebih sederhana",
      "Domain menjadi identitas profesional website",
      "Cocok untuk website bisnis dan personal",
    ],
  },
  {
    icon: "🔄",
    badge: "Auto Daily Backup",
    theme: "indigo",
    title: "Backup Berkala",
    description:
      "Data website kamu mendapatkan backup berkala sehingga lebih aman dari kehilangan data.",
    detail:
      "Backup berkala memberikan perlindungan tambahan terhadap data website. Dengan adanya salinan data, risiko kehilangan data akibat masalah pada website dapat dikurangi.",
    benefits: [
      "Backup dilakukan secara berkala",
      "Perlindungan tambahan terhadap data",
      "Mengurangi risiko kehilangan data",
      "Mendukung proses pemulihan website",
    ],
  },
];

const testimonials = [
  {
    name: "Andi Pratama",
    role: "Owner Online Store",
    initials: "AP",
    color: "#ef4444",
    rating: "5.0",
    text: "Sejak pindah ke Hostingwebid website toko online saya terasa jauh lebih cepat. Support-nya juga sangat responsif dan selalu solutif.",
  },
  {
    name: "Rizky Maulana",
    role: "Web Developer",
    initials: "RM",
    color: "#f97316",
    rating: "5.0",
    text: "Harganya sangat terjangkau dan proses set-up nya gampang banget. Cocok untuk project client maupun website pribadi yang butuh performa stabil.",
  },
  {
    name: "Dewi Anggraini",
    role: "Business Owner",
    initials: "DA",
    color: "#dc2626",
    rating: "5.0",
    text: "Saya suka karena tidak ribet sama sekali. Domain dan hosting bisa diurus di satu tempat dan dibantu ketika ada kendala teknis.",
  },
];

const faqs = [
  {
    question: "Apa itu web hosting?",
    answer:
      "Web hosting adalah layanan penyimpanan online yang memungkinkan file, gambar, database, dan kode website Anda dapat diakses di internet secara online 24 jam nonstop di seluruh dunia dengan cepat dan aman.",
  },
  {
    question: "Apakah mendapatkan SSL gratis?",
    answer:
      "Ya, semua paket hosting Hostingwebid sudah dilengkapi dengan SSL Certificate gratis (Let's Encrypt / Wildcard) untuk memastikan website Anda aman dan menggunakan protokol HTTPS.",
  },
  {
    question: "Apakah bisa menggunakan domain sendiri?",
    answer:
      "Tentu saja! Anda bisa menghubungkan domain yang sudah Anda miliki sebelumnya atau mendaftarkan nama domain baru langsung saat proses pemesanan.",
  },
  {
    question: "Apakah bisa migrasi dari hosting lain?",
    answer:
      "Bisa dan gratis! Tim teknis kami siap membantu proses pemindahan (migrasi) file website dan database dari penyedia hosting lama Anda tanpa downtime.",
  },
  {
    question: "Bagaimana jika saya mengalami masalah teknis?",
    answer:
      "Tim support spesialis kami siap membantu Anda 24/7 melalui Live Chat WhatsApp, tiket bantuan, dan panduan teknis yang mudah dipahami.",
  },
];

type DomainResultItem = {
  domain: string;
  extension: string;
  available: boolean | null;
  price: number;
  promo_price: number | null;
  domain_id: number;
  badge?: string;
  isFirst?: boolean;
};

const initialDomainResults: DomainResultItem[] = [];

const popularRow1 = [
  {
    domain: "tukangaluminiumkaca.my.id",
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
  },
  {
    domain: "terbaruindo.com",
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
  },
  {
    domain: "aionjakarta.id",
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
  },
  {
    domain: "hunianjabodetabek.com",
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
  },
  {
    domain: "manalagiviral.com",
    category: "Media & Berita",
    categoryTag: "VIRAL & TREND",
    promoTag: "High Traffic",
    gradient: "linear-gradient(135deg, #3b0764 0%, #7e22ce 50%, #6b21a8 100%)",
    bannerTitle: "Platform Media Kurasi Konten Viral",
    bannerDesc: "Kategori tren, komentar interaktif & loading ultra cepat",
    rating: "4.8/5 - 29 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Media Viral",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Mobile Friendly & Cache Optimization",
  },
  {
    domain: "sanploionmaritim.com",
    category: "Bisnis & Jasa",
    categoryTag: "MARITIM & LOGISTIK",
    promoTag: "Corporate B2B",
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0369a1 100%)",
    bannerTitle: "Logistik Laut, Kargo & Perkapalan",
    bannerDesc: "Layanan pengiriman antar pulau & profil armada terpercaya",
    rating: "4.9/5 - 34 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Hemat 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Ekspedisi Laut",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Form Permintaan Penawaran Harga",
  },
  {
    domain: "diskontoyotamakassar.com",
    category: "Otomotif",
    categoryTag: "DEALER TOYOTA",
    promoTag: "Promo Spesial",
    gradient: "linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #b91c1c 100%)",
    bannerTitle: "Promo Diskon & Kredit Toyota Makassar",
    bannerDesc: "Pricelist Avanza, Innova, Rush, Fortuner & diskon DP murah",
    rating: "5.0/5 - 47 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Sales Otomotif",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Tombol Chat Sales Langsung ke WA",
  },
  {
    domain: "tontongsekaran.com",
    category: "Bisnis & Jasa",
    categoryTag: "KONSULTASI & BISNIS",
    promoTag: "Hemat 50%",
    gradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)",
    bannerTitle: "Layanan Profesional & Solusi Bisnis",
    bannerDesc: "Profil konsultan, portofolio klien & jadwal konsultasi online",
    rating: "4.9/5 - 31 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Konsultan",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Form Booking Konsultasi Instan",
  },
];

const popularRow2 = [
  {
    domain: "ramnet.co.id",
    category: "Teknologi",
    categoryTag: "ISP & FIBER OPTIC",
    promoTag: "Dedicated Speed",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)",
    bannerTitle: "Penyedia Internet Dedicated & Fiber Optic",
    bannerDesc: "Paket corporate, coverage area & layanan SLA 99.9%",
    rating: "4.9/5 - 38 Ulasan",
    originalPrice: "Rp 2.000.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Provider ISP",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Cek Coverage & Form Pasang Baru",
  },
  {
    domain: "lestarisaftindo.com",
    category: "Industri",
    categoryTag: "SAFETY & APD K3",
    promoTag: "Standar SNI/ISO",
    gradient: "linear-gradient(135deg, #78350f 0%, #d97706 50%, #b45309 100%)",
    bannerTitle: "Supplier Alat Safety & Perlengkapan K3",
    bannerDesc: "Helm safety, rompi, sepatu boots & alat pelindung diri lengkap",
    rating: "4.8/5 - 41 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Hemat 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Supplier K3",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Katalog Produk & Download Brosur",
  },
  {
    domain: "perfectmoba.my.id",
    category: "Teknologi",
    categoryTag: "ESPORTS & GAMING",
    promoTag: "Member Portal",
    gradient: "linear-gradient(135deg, #581c87 0%, #9333ea 50%, #7e22ce 100%)",
    bannerTitle: "Komunitas Esports & Turnamen Game Mobile",
    bannerDesc: "Pendaftaran turnamen, live bracket & panduan build hero",
    rating: "5.0/5 - 45 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Komunitas Game",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Sistem Registrasi Tim & Leaderboard",
  },
  {
    domain: "jual-oli-vibrator-motor.com",
    category: "Industri",
    categoryTag: "DISTRIBUTOR OLI MESIN",
    promoTag: "Heavy Duty",
    gradient: "linear-gradient(135deg, #1f2937 0%, #4b5563 50%, #374151 100%)",
    bannerTitle: "Pusat Oli Industri & Motor Vibrator",
    bannerDesc: "Oli pelumas pabrik & motor vibrator konstruksi original",
    rating: "4.9/5 - 32 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Distributor Oli",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Form Request Quotation / Penawaran",
  },
  {
    domain: "downloadpidio.com",
    category: "Teknologi",
    categoryTag: "TOOLS & DOWNLOADER",
    promoTag: "Fast Cloud API",
    gradient: "linear-gradient(135deg, #065f46 0%, #10b981 50%, #059669 100%)",
    bannerTitle: "Tools Online Video Downloader Praktis",
    bannerDesc: "Convert link video ke resolusi HD dengan kecepatan tinggi",
    rating: "4.9/5 - 55 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Web Tools Online",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Optimasi Server Cepat & Ringan",
  },
  {
    domain: "jual-transmax-gear.com",
    category: "Industri",
    categoryTag: "TRANSMISI & GEAR",
    promoTag: "Industri Siap",
    gradient: "linear-gradient(135deg, #831843 0%, #db2777 50%, #be185d 100%)",
    bannerTitle: "Pusat Gear Box & Pelumas Transmax Heavy",
    bannerDesc: "Sparepart mesin transmisi pabrik dan oli gigi spesifikasi tinggi",
    rating: "4.8/5 - 28 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Hemat 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Mesin Industri",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Katalog Spek Teknis & CS WhatsApp",
  },
  {
    domain: "infotimur.id",
    category: "Media & Berita",
    categoryTag: "INFORMASI REGIONAL",
    promoTag: "Rujukan Resmi",
    gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #15803d 100%)",
    bannerTitle: "Portal Berita & Eksplorasi Indonesia Timur",
    bannerDesc: "Informasi pariwisata, budaya daerah & berita terkini kawasan timur",
    rating: "5.0/5 - 39 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Save 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Portal Daerah",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Kategori Budaya & Galeri Wisata",
  },
  {
    domain: "jual-yuema-pump.com",
    category: "Industri",
    categoryTag: "POMPA & ELEKTROMOTOR",
    promoTag: "Garansi Resmi",
    gradient: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)",
    bannerTitle: "Distributor Resmi Pompa Yuema Industri",
    bannerDesc: "Pompa sentrifugal, elektromotor 3 phase & aksesoris mesin",
    rating: "4.9/5 - 36 Ulasan",
    originalPrice: "Rp 1.500.000",
    discountBadge: "Hemat 50%",
    price: "Mulai Rp 750.000",
    orderPrice: "Pesan Rp 750rb",
    packageTitle: "Jasa Pembuatan Website Pompa Industri",
    feat1: "Tampilan Bisa Request/Custom",
    feat2: "Form Konsultasi Teknis & Pembelian",
  },
];

const portfolioCategories = [
  "Semua",
  "Bisnis & Jasa",
  "Otomotif",
  "Media & Berita",
  "Industri",
  "Teknologi",
  "Properti",
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [domain, setDomain] = useState("");

  const [domainLoading, setDomainLoading] = useState(false);

  const [domainResults, setDomainResults] =
    useState<DomainResultItem[]>(initialDomainResults);

  const [domainQuery, setDomainQuery] = useState("");

  const [domainError, setDomainError] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();
  const [portfolioCategory, setPortfolioCategory] = useState("Semua");
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Google Ads Filter
  const [adsFilter, setAdsFilter] = useState<"all" | "pemula" | "bisnis">("all");

  const [systemSettings, setSystemSettings] = useState<{
    maintenanceMode?: boolean;
    maintenanceNotice?: string;
    broadcastBannerActive?: boolean;
    broadcastBannerText?: string;
    broadcastBannerLink?: string;
    broadcastBannerBg?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hostingweb_system_settings");
      if (saved) {
        setSystemSettings(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleBuyAds = (pkg: GoogleAdsPackage) => {
    const targetUrl = `/checkout?ads=${encodeURIComponent(pkg.id)}`;
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("hostingwebid_user") : null;
    if (!savedUser) {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  const handleBuyPackage = (planId: string) => {
    const targetUrl = `/checkout?paket=${encodeURIComponent(planId)}&cycle=${billingCycle}`;
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("hostingwebid_user") : null;
    if (!savedUser) {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  const scrollSlider = (id: string, offset: number) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollBy({ left: offset, behavior: "smooth" });
    }
  };
  
    // STATE UNTUK MODAL FITUR
    const [selectedFeature, setSelectedFeature] =
      useState<(typeof features)[number] | null>(null);

    const searchDomain = async () => {
    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\s+/g, "")
      .replace(/\.(com|net|org|id|co\.id|xyz|info|online|cloud|site|store|tech|dev|io|biz|us|me|tv|cc|buzz|lol|mom|it\.com)$/i, "");

    if (!cleanDomain) {
      setDomainError(
        "Silakan masukkan nama domain terlebih dahulu."
      );
      setDomainResults([]);
      return;
    }

    setDomainLoading(true);
    setDomainError("");
    setDomainResults([]);
    setDomainQuery(cleanDomain);

    try {
      const response = await fetch(
        "http://localhost/hosting_webid/api/v1/domain/batch_check.php",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            domain: cleanDomain,
          }),
        }
      );

      const result = await response.json().catch(() => null);

      if (
        !response.ok ||
        result?.status !== "success"
      ) {
        setDomainError(
          result?.message ||
            "Gagal mengecek domain."
        );
        return;
      }

      const results: DomainResultItem[] =
        (result.data?.results || []).map(
          (item: DomainResultItem) => ({
            domain: item.domain,
            extension: item.extension,
            available: item.available,
            price: Number(item.price) || 0,
            promo_price:
              item.promo_price !== null &&
              item.promo_price !== undefined
                ? Number(item.promo_price)
                : null,
            domain_id: item.domain_id || 0,
          })
        );

      setDomainResults(results);

    } catch (error) {
      setDomainError(
        error instanceof Error
          ? error.message
          : "Tidak dapat terhubung ke server."
      );

    } finally {

      setDomainLoading(false);

    }
  };

  return (
    <main>
      {/* =====================================================
          SUPER ADMIN LIVE BROADCAST PROMO BANNER
      ===================================================== */}
      {systemSettings?.broadcastBannerActive !== false && (
        <aside
          className="broadcast-top-banner"
          style={{
            background:
              systemSettings?.broadcastBannerBg ||
              "linear-gradient(90deg, #ea580c 0%, #f97316 50%, #ea580c 100%)",
          }}
        >
          <div className="container flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold text-white text-center">
            <span>
              {systemSettings?.broadcastBannerText ||
                "🔥 DISKON SPESIAL HARI INI: Dapatkan Diskon s/d 80% untuk Cloud Hosting & Gratis Domain .COM!"}
            </span>
            <a
              href={systemSettings?.broadcastBannerLink || "#pricing"}
              className="underline font-black hover:opacity-90 ml-1 inline-flex items-center gap-0.5"
            >
              <span>Klaim Sekarang</span>
              <span>&rarr;</span>
            </a>
          </div>
        </aside>
      )}

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="navbar">
  <div className="container nav-inner">

    {/* LOGO */}
    <Link
      href="/"
      className="brand"
      onClick={() => setMobileMenuOpen(false)}
    >
      <img src="/logo.png" alt="Hostingwebid" />
    </Link>

    {/* DESKTOP NAVIGATION */}
    <nav className="nav-menu">
      <Link href="/#pricing">Hosting</Link>
      <Link href="/#domain">Domain</Link>
      <Link href="/#portfolio">Portfolio</Link>
      <Link href="/#google-ads">Google Ads</Link>
      <Link href="/#features">Fitur</Link>
      <Link href="/#faq">FAQ</Link>
    </nav>

    {/* DESKTOP ACTIONS */}
    <div className="nav-actions">
      <a
        href={getWhatsAppUrl("Halo Tim Support HostingWeb, saya ingin bertanya seputar layanan web hosting.")}
        target="_blank"
        rel="noopener noreferrer"
        className="nav-contact"
      >
        Hubungi Kami
      </a>

      <Link href="/login" className="nav-login">
        Masuk
      </Link>

      <Link href="/register" className="nav-button">
        Mulai Sekarang
      </Link>

    </div>

    {/* MOBILE MENU BUTTON */}
    <button
      className={`mobile-menu-button ${
        mobileMenuOpen ? "menu-open" : ""
      }`}
      aria-label={
        mobileMenuOpen
          ? "Tutup menu"
          : "Buka menu"
      }
      type="button"
      onClick={() =>
        setMobileMenuOpen(!mobileMenuOpen)
      }
    >
      <span />
      <span />
      <span />
    </button>

  </div>

  {/* =====================================================
      MOBILE / TABLET MENU
  ===================================================== */}
  {mobileMenuOpen && (
    <div className="mobile-menu">

      <Link
        href="/#pricing"
        onClick={() => setMobileMenuOpen(false)}
      >
        Hosting
      </Link>

      <Link
        href="/#domain"
        onClick={() => setMobileMenuOpen(false)}
      >
        Domain
      </Link>

      <Link
        href="/#portfolio"
        onClick={() => setMobileMenuOpen(false)}
      >
        Portfolio
      </Link>

      <Link
        href="/#google-ads"
        onClick={() => setMobileMenuOpen(false)}
      >
        Google Ads
      </Link>

      <Link
        href="/#features"
        onClick={() => setMobileMenuOpen(false)}
      >
        Fitur
      </Link>

      <Link
        href="/#faq"
        onClick={() => setMobileMenuOpen(false)}
      >
        FAQ
      </Link>

      <div className="mobile-menu-divider" />

      <a
        href={getWhatsAppUrl("Halo Tim Support HostingWeb, saya ingin bertanya seputar layanan web hosting.")}
        target="_blank"
        rel="noopener noreferrer"
        className="mobile-contact"
        onClick={() => setMobileMenuOpen(false)}
      >
        Hubungi Kami
      </a>

      <Link
        href="/login"
        className="mobile-login"
        onClick={() => setMobileMenuOpen(false)}
      >
        Masuk
      </Link>

      <Link
        href="/register"
        className="mobile-register"
        onClick={() => setMobileMenuOpen(false)}
      >
        Mulai Sekarang
        <span>→</span>
      </Link>

    </div>
  )}
</header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="hero">
        <div className="hero-grid-pattern" />

        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div className="container hero-container">

          {/* LEFT CONTENT */}
          <div className="hero-content">

            <div className="hero-badge">
              <span className="badge-dot" />
              Web Hosting Cepat & Terpercaya
            </div>

            <h1>
              Hosting Murah
              <br />
              <span>Untuk Website Hebat</span>
            </h1>

            <p className="hero-description">
              Bangun website profesional dengan hosting cepat,
              aman, dan stabil. Solusi hosting dan domain untuk
              bisnis, toko online, portfolio, hingga website pribadi.
            </p>

            <div className="hero-checklist">

              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>SSD NVMe berkecepatan tinggi</span>
              </div>

              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>SSL Gratis</span>
              </div>

              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Backup berkala</span>
              </div>

              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Support responsif</span>
              </div>

            </div>

            <div className="hero-actions">

              <a href="#pricing" className="btn btn-primary">
                Lihat Paket Hosting
                <span>→</span>
              </a>

              <a href="#domain" className="btn btn-outline">
                Cari Domain
              </a>

            </div>

            <div className="hero-trust">

              <div className="trust-avatars">
                <span>A</span>
                <span>R</span>
                <span>D</span>
                <span>+</span>
              </div>

              <div>
                <div className="trust-stars">★★★★★</div>
                <p>Dipercaya pelanggan Indonesia</p>
              </div>

            </div>

          </div>

          {/* RIGHT VISUAL */}
          <div className="hero-visual">

            <div className="hero-circle hero-circle-one" />
            <div className="hero-circle hero-circle-two" />
            <div className="hero-circle hero-circle-three" />

            {/* Review Card */}
            <div className="floating-card review-card">

              <div className="review-header">

                <div className="google-letter">G</div>

                <div>
                  <strong>Google Review</strong>
                  <small>Customer Rating</small>
                </div>

              </div>

              <div className="review-stars">
                ★★★★★
              </div>

              <div className="review-bottom">
                <strong>5.0</strong>
                <span>Excellent</span>
              </div>

            </div>

            {/* Growth Card */}
            <div className="floating-card growth-card">

              <span className="card-label">
                Website Growth
              </span>

              <div className="growth-number">
                <strong>+40%</strong>
                <span>↗</span>
              </div>

              <div className="mini-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

            </div>

            {/* SERVER DASHBOARD */}
            <div className="server-dashboard">

              <div className="server-header">

                <div className="server-brand">

                  <div className="server-logo">
                    H
                  </div>

                  <div>
                    <strong>Hostingwebid</strong>
                    <small>Cloud Hosting</small>
                  </div>

                </div>

                <div className="server-online">
                  <span />
                  Online
                </div>

              </div>

              <div className="server-content">

                <div className="server-content-top">

                  <div>
                    <span>Server Performance</span>
                    <strong>99.9%</strong>
                  </div>

                  <div className="server-period">
                    Last 30 days
                  </div>

                </div>

                <div className="big-chart">

                  <div className="chart-lines">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>

                  <svg
                    viewBox="0 0 500 180"
                    preserveAspectRatio="none"
                    className="chart-svg"
                  >

                    <defs>

                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        x2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ff1111"
                        />
                        <stop
                          offset="100%"
                          stopColor="#f7931e"
                        />
                      </linearGradient>

                      <linearGradient
                        id="chartFill"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#ff4d20"
                          stopOpacity="0.35"
                        />
                        <stop
                          offset="100%"
                          stopColor="#ff4d20"
                          stopOpacity="0"
                        />
                      </linearGradient>

                    </defs>

                    <path
                      d="M0 150 C40 130, 55 145, 85 115 C120 80, 125 125, 160 105 C195 85, 200 120, 235 82 C270 45, 280 92, 315 65 C350 35, 360 70, 390 45 C425 15, 450 42, 500 5 L500 180 L0 180 Z"
                      fill="url(#chartFill)"
                    />

                    <path
                      d="M0 150 C40 130, 55 145, 85 115 C120 80, 125 125, 160 105 C195 85, 200 120, 235 82 C270 45, 280 92, 315 65 C350 35, 360 70, 390 45 C425 15, 450 42, 500 5"
                      fill="none"
                      stroke="url(#chartGradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />

                  </svg>

                </div>

                <div className="server-stats">

                  <div>
                    <span>CPU Usage</span>
                    <strong>18%</strong>
                  </div>

                  <div>
                    <span>Memory</span>
                    <strong>32%</strong>
                  </div>

                  <div>
                    <span>Uptime</span>
                    <strong>99.9%</strong>
                  </div>

                </div>

              </div>

            </div>

            {/* SPEED CARD */}
            <div className="speed-card">

              <div className="speed-icon">
                ⚡
              </div>

              <div>
                <span>Website Speed</span>
                <strong>40x Faster</strong>
              </div>

            </div>

            {/* DOMAIN PROMO */}
            <div className="domain-promo-card">

              <div className="promo-top">
                <span>🔥</span>
                <strong>Promo Domain</strong>
              </div>

              <div className="promo-main">

                <div>
                  <strong>.COM</strong>
                  <span>Mulai dari</span>
                </div>

                <div className="promo-price">
                  <strong>Rp114.900</strong>
                  <del>Rp209.900</del>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST BAR
      ===================================================== */}
      <section className="trust-section">

        <div className="container trust-grid">

          <div className="trust-item">
            <strong>99.9%</strong>
            <span>Server Uptime</span>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <strong>24/7</strong>
            <span>Customer Support</span>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <strong>NVMe</strong>
            <span>Storage Technology</span>
          </div>

          <div className="trust-divider" />

          <div className="trust-item">
            <strong>SSL</strong>
            <span>Gratis Selamanya</span>
          </div>

        </div>

      </section>

      {/* =====================================================
          DOMAIN SEARCH
      ===================================================== */}
      <section className="domain-section" id="domain">
        <div className="container">
          <div className="domain-wrapper">

            {/* =================================================
                LEFT - TEXT & BADGES
            ================================================= */}
            <div className="domain-text">
              <div className="domain-section-label">
                <span className="domain-label-dot" />
                <span>CARI DOMAIN</span>
              </div>

              <h2>
                Temukan nama
                <br />
                domain
                <br />
                <span>
                  untuk brand
                  <br />
                  kamu.
                </span>
              </h2>

              <p>
                Pilih nama domain yang mudah diingat dan buat
                bisnis kamu terlihat lebih profesional dengan
                jaringan Tier-4 berlatensi ultra-rendah.
              </p>

              {/* TRUST BADGES */}
              <div className="domain-trust-list">
                <div className="domain-trust-item">
                  <svg className="trust-icon-svg orange" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  <span>Aktivasi Instan &lt; 1 Menit</span>
                </div>

                <div className="domain-trust-item">
                  <svg className="trust-icon-svg blue" width="16" height="16" viewBox="0 0 24 24" fill="#2563eb">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  <span>Anycast DNS Global</span>
                </div>

                <div className="domain-trust-item">
                  <svg className="trust-icon-svg purple" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Gratis WHOIS Privacy</span>
                </div>
              </div>

              {/* LATENCY */}
              <div className="domain-latency">
                <div className="domain-latency-left">
                  <span className="domain-status-dot" />
                  <span>
                    JKT-IX Point of Presence:
                    <strong>&lt; 3.2 ms</strong>
                  </span>
                </div>

                <strong className="domain-uptime">
                  100% Uptime SLA
                </strong>
              </div>
            </div>


            {/* =================================================
                RIGHT - DOMAIN SEARCH
            ================================================= */}
            <div className="domain-search-box">

              {/* SEARCH HEADER */}
              <div className="domain-search-header">
                <div className="domain-search-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <circle cx="11" cy="11" r="3"/>
                  </svg>
                  <strong>Cek Ketersediaan Domain</strong>
                </div>

                <span className="domain-registrar">
                  Registrar Resmi ID &amp; Global
                </span>
              </div>


              {/* SEARCH FORM */}
              <form
                className="domain-search-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void searchDomain();
                }}
              >
                <div className="domain-search-input-wrapper">
                  {/* INPUT */}
                  <div className="domain-input">
                    <svg className="domain-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>

                    <div className="domain-input-content">
                      <span className="domain-prefix">
                        https://
                      </span>

                      <input
                        type="text"
                        id="domainQuery"
                        placeholder="Ketik nama domain atau bisnis kamu..."
                        value={domain}
                        onChange={(e) => {
                          setDomain(e.target.value);
                          setDomainResults([]);
                          setDomainError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void searchDomain();
                          }
                        }}
                        disabled={domainLoading}
                        autoComplete="off"
                        suppressHydrationWarning
                      />
                    </div>
                  </div>

                  {/* TLD SELECTOR */}
                  <div className="domain-tld-wrapper">
                    <select
                      id="tldSelector"
                      defaultValue=".com"
                      className="domain-tld-select"
                      suppressHydrationWarning
                    >
                      <option value=".id">.id</option>
                      <option value=".com">.com</option>
                      <option value=".co.id">.co.id</option>
                      <option value=".my.id">.my.id</option>
                      <option value=".net">.net</option>
                      <option value=".org">.org</option>
                    </select>

                    <svg className="domain-tld-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {/* SEARCH BUTTON */}
                  <div className="domain-search-action">
                    <button
                      type="submit"
                      className="domain-search-button"
                      disabled={domainLoading}
                      suppressHydrationWarning
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <span>
                        {domainLoading
                          ? "Mengecek..."
                          : "Cari Domain"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* POPULAR EXTENSIONS */}
                <div className="domain-popular">
                  <div className="domain-popular-heading">
                    <span>
                      Ekstensi Paling Populer Hari Ini:
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const selector = document.getElementById("tldSelector") as HTMLSelectElement | null;
                        selector?.focus();
                      }}
                    >
                      Lihat Semua 300+ TLD
                    </button>
                  </div>

                  <div className="domain-popular-list">
                    <button
                      type="button"
                      className="domain-pop-card"
                      onClick={() => {
                        const selector = document.getElementById("tldSelector") as HTMLSelectElement | null;
                        if (selector) selector.value = ".id";
                      }}
                    >
                      <div className="domain-pop-header">
                        <b>.id</b>
                        <span className="domain-pill-orange">PILIHAN UTAMA</span>
                      </div>

                      <div className="domain-pop-price">
                        <strong>Rp 199.000</strong>
                        <small>250k</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="domain-pop-card domain-pop-active"
                      onClick={() => {
                        const selector = document.getElementById("tldSelector") as HTMLSelectElement | null;
                        if (selector) selector.value = ".com";
                      }}
                    >
                      <div className="domain-pop-header">
                        <b>.com</b>
                        <span className="domain-active-dot" />
                      </div>

                      <div className="domain-pop-price">
                        <strong>Rp 125.000</strong>
                        <small>180k</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="domain-pop-card"
                      onClick={() => {
                        const selector = document.getElementById("tldSelector") as HTMLSelectElement | null;
                        if (selector) selector.value = ".co.id";
                      }}
                    >
                      <div className="domain-pop-header">
                        <b>.co.id</b>
                        <span className="domain-business-badge">Bisnis ID</span>
                      </div>

                      <div className="domain-pop-price">
                        <strong>Rp 275.000</strong>
                        <small className="domain-pop-period">/tahun</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="domain-pop-card"
                      onClick={() => {
                        const selector = document.getElementById("tldSelector") as HTMLSelectElement | null;
                        if (selector) selector.value = ".my.id";
                      }}
                    >
                      <div className="domain-pop-header">
                        <b>.my.id</b>
                        <span className="domain-save-badge">HEMAT 85%</span>
                      </div>

                      <div className="domain-pop-price">
                        <strong className="text-orange">Rp 12.000</strong>
                        <small>80k</small>
                      </div>
                    </button>
                  </div>
                </div>
              </form>

              {/* LOADING */}
              {domainLoading && (
                <div className="domain-batch-loading">
                  <div className="domain-loading-spinner" />
                  <div>
                    <strong>Sedang mengecek ketersediaan domain...</strong>
                    <span>Mengecek semua ekstensi, mohon tunggu sebentar.</span>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {domainError && !domainLoading && (
                <div className="domain-batch-error">
                  <div className="domain-batch-error-icon">!</div>
                  <div>
                    <strong>Gagal mengecek domain</strong>
                    <span>{domainError}</span>
                  </div>
                </div>
              )}

              {/* RESULTS */}
              {domainResults.length > 0 && !domainLoading && !domainError && (
                <div className="domain-results-section">
                  <div className="domain-results-header">
                    <div className="domain-results-title-group">
                      <h3>Hasil Pencarian Domain</h3>
                      <span className="domain-results-badge">
                        {domainResults.length} Ekstensi Ditemukan
                      </span>
                    </div>

                    <span className="domain-tax-note">
                      Termasuk PPN &amp; DNS
                    </span>
                  </div>

                  <div className="domain-results-grid">
                    {domainResults.map((item, index) => (
                      <div
                        className={`domain-result-card ${
                          item.available === true
                            ? "domain-card-available"
                            : item.available === false
                            ? "domain-card-unavailable"
                            : "domain-card-unknown"
                        }`}
                        key={item.domain + index}
                      >
                        {/* CARD LEFT */}
                        <div className="domain-card-top">
                          <span className="domain-card-status-dot" />

                          <div className="domain-card-name">
                            <span className="domain-card-base">
                              {item.domain.endsWith("...")
                                ? item.domain
                                : item.domain.includes(".")
                                ? item.domain.split(".")[0]
                                : domainQuery}
                            </span>

                            {!item.domain.endsWith("...") && (
                              <span className="domain-card-ext">
                                {item.extension || (item.domain.includes(".") ? "." + item.domain.split(".").slice(1).join(".") : "")}
                              </span>
                            )}
                          </div>

                          <div
                            className={`domain-card-badge ${
                              item.badge === "Populer ID"
                                ? "badge-populer"
                                : item.available === true
                                ? "badge-available"
                                : item.available === false
                                ? "badge-unavailable"
                                : "badge-unknown"
                            }`}
                          >
                            {item.badge ||
                              (item.available === true
                                ? "Tersedia"
                                : item.available === false
                                ? "Tidak Tersedia"
                                : "Tidak diketahui")}
                          </div>
                        </div>

                        {/* CARD RIGHT */}
                        <div className="domain-card-bottom">
                          <div className="domain-card-price">
                            {item.promo_price !== null && item.promo_price > 0 ? (
                              <div className="domain-card-price-stack">
                                <del>
                                  Rp {item.price.toLocaleString("id-ID")}
                                </del>
                                <strong className="domain-price-promo">
                                  Rp {item.promo_price.toLocaleString("id-ID")}
                                </strong>
                              </div>
                            ) : (
                              <div className="domain-card-price-single">
                                <strong>
                                  Rp {item.price.toLocaleString("id-ID")}
                                </strong>
                                <span className="domain-card-period">
                                  /tahun
                                </span>
                              </div>
                            )}
                          </div>

                          {/* ACTION BUTTONS */}
                          {item.available === true ? (
                            <Link
                              href={`/checkout?domain=${encodeURIComponent(
                                item.domain
                              )}&domain_id=${item.domain_id}&price=${item.promo_price || item.price}&new=1`}
                              className="domain-card-buy"
                            >
                              Beli
                            </Link>
                          ) : item.available === false ? (
                            <span className="domain-card-taken">
                              Sudah diambil
                            </span>
                          ) : (
                            <span className="domain-card-taken">
                              Tidak diketahui
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GUARANTEE FOOTER */}
              <div className="domain-guarantee">
                <span className="guarantee-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Bebas Biaya Tersembunyi
                </span>

                <i>•</i>

                <span className="guarantee-dns">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                    <line x1="6" y1="6" x2="6.01" y2="6"/>
                    <line x1="6" y1="18" x2="6.01" y2="18"/>
                  </svg>
                  Termasuk DNS Management &amp; Free SSL
                </span>

                <i>•</i>

                <span className="guarantee-support">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                  Dukungan Teknis 24/7
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          PORTFOLIO / CLIENT WEBSITES SHOWCASE
      ===================================================== */}
      {/* =====================================================
          PORTFOLIO / CLIENT WEBSITES SHOWCASE (2 SLIDE ROWS)
      ===================================================== */}
      <section className="portfolio-section" id="portfolio">
        <div className="container">
          {/* SECTION HEADER */}
          <div className="portfolio-header-center">
            <div className="portfolio-top-badge">
              <span className="portfolio-top-badge-dot" />
              <span>PORTFOLIO &amp; CONTOH WEBSITE KLIEN</span>
            </div>

            <h2 className="portfolio-main-title">
              Website yang Telah Online
              <br />
              <span className="portfolio-title-highlight">Bersama Layanan HostingWeb.</span>
            </h2>

            <p className="portfolio-main-subtitle">
              Jelajahi berbagai website aktif yang menggunakan infrastruktur cloud hosting NVMe berkecepatan tinggi kami.
            </p>
          </div>

          {/* FILTER TABS & SEARCH BAR */}
          <div className="portfolio-controls">
            <div className="portfolio-tabs">
              {portfolioCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`portfolio-tab ${portfolioCategory === cat ? "active" : ""}`}
                  onClick={() => setPortfolioCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="portfolio-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Cari nama website atau domain..."
                value={portfolioSearch}
                onChange={(e) => setPortfolioSearch(e.target.value)}
                suppressHydrationWarning
              />
              {portfolioSearch && (
                <button
                  type="button"
                  className="portfolio-search-clear"
                  onClick={() => setPortfolioSearch("")}
                  title="Reset pencarian"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* SLIDER ROW 1 */}
          {popularRow1.filter((item) => {
            const matchesCategory =
              portfolioCategory === "Semua" || item.category === portfolioCategory;
            const matchesSearch =
              !portfolioSearch ||
              item.domain.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.bannerTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.packageTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.categoryTag.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.category.toLowerCase().includes(portfolioSearch.toLowerCase());
            return matchesCategory && matchesSearch;
          }).length > 0 && (
            <div className="slider-row-wrapper">
              <div className="slider-row-header">
                <div className="slider-row-title">
                  <span className="slider-row-bullet" />
                  <strong>Koleksi Populer #1: Instansi, Media &amp; Bisnis Retail</strong>
                </div>

                <div className="slider-row-nav">
                  <span className="slider-hint">Geser untuk melihat →</span>
                  <button
                    type="button"
                    className="slider-nav-btn"
                    onClick={() => scrollSlider("slider-row-1", -340)}
                    aria-label="Geser ke kiri"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="slider-nav-btn"
                    onClick={() => scrollSlider("slider-row-1", 340)}
                    aria-label="Geser ke kanan"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="slider-track" id="slider-row-1">
                {popularRow1
                  .filter((item) => {
                    const matchesCategory =
                      portfolioCategory === "Semua" || item.category === portfolioCategory;
                    const matchesSearch =
                      !portfolioSearch ||
                      item.domain.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                      item.bannerTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                      item.packageTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                      item.categoryTag.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                      item.category.toLowerCase().includes(portfolioSearch.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((item, index) => (
                    <div className="slider-card" key={item.domain + index}>
                      {/* CARD PREVIEW BANNER */}
                      <div
                        className="slider-card-banner"
                        style={{ background: item.gradient }}
                      >
                        <div className="banner-browser-top">
                          <div className="banner-dots">
                            <span className="dot dot-red" />
                            <span className="dot dot-yellow" />
                            <span className="dot dot-green" />
                          </div>
                          <span className="banner-domain">{item.domain}</span>
                        </div>

                        <div className="banner-badges-row">
                          <span className="banner-category-badge">{item.categoryTag}</span>
                          <span className="banner-promo-badge">{item.promoTag}</span>
                        </div>

                        <div className="banner-main-text">
                          <h4 className="banner-title">{item.bannerTitle}</h4>
                          <p className="banner-desc">{item.bannerDesc}</p>
                        </div>
                      </div>

                      {/* CARD BODY */}
                      <div className="slider-card-body">
                        <div className="slider-card-rating">
                          <span className="stars">★★★★★</span>
                          <small>({item.rating})</small>
                        </div>

                        <div className="slider-card-pricing">
                          <div className="slider-price-row">
                            <del>{item.originalPrice}</del>
                            <span className="slider-discount-tag">{item.discountBadge}</span>
                          </div>
                          <strong className="slider-final-price">{item.price}</strong>
                        </div>

                        <h5 className="slider-package-title">{item.packageTitle}</h5>

                        <ul className="slider-features-list">
                          <li>
                            <span className="check">✓</span>
                            {item.feat1}
                          </li>
                          <li>
                            <span className="check">✓</span>
                            {item.feat2}
                          </li>
                        </ul>

                        <div className="slider-card-actions">
                          <a
                            href={`https://${item.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="slider-btn-detail"
                          >
                            👁️ Lihat Detail
                          </a>

                          <Link
                            href={`/checkout?domain=${encodeURIComponent(item.domain)}`}
                            className="slider-btn-order"
                          >
                            {item.orderPrice}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SLIDER ROW 2 */}
          {popularRow2.filter((item) => {
            const matchesCategory =
              portfolioCategory === "Semua" || item.category === portfolioCategory;
            const matchesSearch =
              !portfolioSearch ||
              item.domain.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.bannerTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.packageTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.categoryTag.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.category.toLowerCase().includes(portfolioSearch.toLowerCase());
            return matchesCategory && matchesSearch;
          }).length > 0 && (
            <div className="slider-row-wrapper" style={{ marginTop: "44px" }}>
              <div className="slider-row-header">
                <div className="slider-row-title">
                  <span className="slider-row-bullet" />
                  <strong>Koleksi Populer #2: Pariwisata, Komunitas, Tokoh &amp; B2B</strong>
                </div>

                <div className="slider-row-nav">
                  <span className="slider-hint">Geser untuk melihat →</span>
                  <button
                    type="button"
                    className="slider-nav-btn"
                    onClick={() => scrollSlider("slider-row-2", -340)}
                    aria-label="Geser ke kiri"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="slider-nav-btn"
                    onClick={() => scrollSlider("slider-row-2", 340)}
                    aria-label="Geser ke kanan"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="slider-track" id="slider-row-2">
                {popularRow2
                  .filter((item) => {
                    const matchesCategory =
                      portfolioCategory === "Semua" || item.category === portfolioCategory;
                    const matchesSearch =
                      !portfolioSearch ||
                      item.domain.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                      item.bannerTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                      item.packageTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                      item.categoryTag.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
                      item.category.toLowerCase().includes(portfolioSearch.toLowerCase());
                    return matchesCategory && matchesSearch;
                  })
                  .map((item, index) => (
                    <div className="slider-card" key={item.domain + index}>
                      {/* CARD PREVIEW BANNER */}
                      <div
                        className="slider-card-banner"
                        style={{ background: item.gradient }}
                      >
                        <div className="banner-browser-top">
                          <div className="banner-dots">
                            <span className="dot dot-red" />
                            <span className="dot dot-yellow" />
                            <span className="dot dot-green" />
                          </div>
                          <span className="banner-domain">{item.domain}</span>
                        </div>

                        <div className="banner-badges-row">
                          <span className="banner-category-badge">{item.categoryTag}</span>
                          <span className="banner-promo-badge">{item.promoTag}</span>
                        </div>

                        <div className="banner-main-text">
                          <h4 className="banner-title">{item.bannerTitle}</h4>
                          <p className="banner-desc">{item.bannerDesc}</p>
                        </div>
                      </div>

                      {/* CARD BODY */}
                      <div className="slider-card-body">
                        <div className="slider-card-rating">
                          <span className="stars">★★★★★</span>
                          <small>({item.rating})</small>
                        </div>

                        <div className="slider-card-pricing">
                          <div className="slider-price-row">
                            <del>{item.originalPrice}</del>
                            <span className="slider-discount-tag">{item.discountBadge}</span>
                          </div>
                          <strong className="slider-final-price">{item.price}</strong>
                        </div>

                        <h5 className="slider-package-title">{item.packageTitle}</h5>

                        <ul className="slider-features-list">
                          <li>
                            <span className="check">✓</span>
                            {item.feat1}
                          </li>
                          <li>
                            <span className="check">✓</span>
                            {item.feat2}
                          </li>
                        </ul>

                        <div className="slider-card-actions">
                          <a
                            href={`https://${item.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="slider-btn-detail"
                          >
                            👁️ Lihat Detail
                          </a>

                          <Link
                            href={`/checkout?domain=${encodeURIComponent(item.domain)}`}
                            className="slider-btn-order"
                          >
                            {item.orderPrice}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {popularRow1.filter((item) => {
            const matchesCategory =
              portfolioCategory === "Semua" || item.category === portfolioCategory;
            const matchesSearch =
              !portfolioSearch ||
              item.domain.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.bannerTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.packageTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.categoryTag.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.category.toLowerCase().includes(portfolioSearch.toLowerCase());
            return matchesCategory && matchesSearch;
          }).length === 0 &&
          popularRow2.filter((item) => {
            const matchesCategory =
              portfolioCategory === "Semua" || item.category === portfolioCategory;
            const matchesSearch =
              !portfolioSearch ||
              item.domain.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.bannerTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.packageTitle.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.categoryTag.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
              item.category.toLowerCase().includes(portfolioSearch.toLowerCase());
            return matchesCategory && matchesSearch;
          }).length === 0 && (
            <div className="portfolio-empty">
              <span className="empty-icon">🔍</span>
              <h4>Tidak ada website ditemukan</h4>
              <p>Coba kata kunci lain atau pilih kategori &quot;Semua&quot;.</p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setPortfolioCategory("Semua");
                  setPortfolioSearch("");
                }}
              >
                Reset Filter
              </button>
            </div>
          )}

          {/* PORTFOLIO BOTTOM CTA */}
          <div className="portfolio-cta-card">
            <div className="portfolio-cta-content">
              <h3>Ingin Website Bisnis Kamu Online &amp; Cepat Seperti Mereka?</h3>
              <p>Mulai sekarang dengan paket hosting lengkap termasuk domain, SSL gratis, dan bantuan setup sampai siap tayang.</p>
            </div>
            <a href="#pricing" className="btn btn-primary">
              Pilih Paket Hosting
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOSTING PLANS
      ===================================================== */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          {/* SECTION HEADER */}
          <div className="pricing-header-center">
            <div className="pricing-top-badge">
              <span className="pricing-top-badge-icon">🔥</span>
              <span>PILIHAN TERBAIK UNTUK PERFORMA WEB ANDA</span>
            </div>

            <h2 className="pricing-main-title">
              Hosting Sesuai Kebutuhan
              <br />
              <span className="pricing-title-highlight">website kamu.</span>
            </h2>

            <p className="pricing-main-subtitle">
              Pilih paket yang sesuai dengan kebutuhan website dan bisnis kamu dengan jaminan kestabilan server, NVMe Cloud SSD, dan panduan langsung.
            </p>

            {/* BILLING CYCLE SWITCHER */}
            <div className="pricing-billing-wrapper">
              <div className="pricing-billing-switch">
                <button
                  type="button"
                  className={`billing-btn ${billingCycle === "monthly" ? "active" : ""}`}
                  onClick={() => setBillingCycle("monthly")}
                >
                  Bayar Bulanan
                </button>
                <button
                  type="button"
                  className={`billing-btn ${billingCycle === "yearly" ? "active" : ""}`}
                  onClick={() => setBillingCycle("yearly")}
                >
                  Bayar Tahunan
                  <span className="billing-save-pill">Hemat 25% + Free Domain</span>
                </button>
              </div>
            </div>
          </div>

          {/* PRICING CARDS GRID */}
          <div className="pricing-grid-cards">
            {plans.map((plan) => (
              <div
                className={`pricing-box-card ${plan.popular ? "popular-card" : ""}`}
                key={plan.id}
              >
                {/* POPULAR TOP FLOATING BADGE */}
                {plan.popular && (
                  <div className="popular-top-pill">
                    <span className="popular-pill-icon">🔥</span>
                    <span>PALING POPULER</span>
                  </div>
                )}

                {/* CARD HEADER */}
                <div className="plan-card-header">
                  <div className="plan-title-row">
                    <span className="plan-title-icon">{plan.icon}</span>
                    <h3 className="plan-name-text">{plan.name}</h3>
                  </div>
                  <p className="plan-desc-text">{plan.description}</p>
                </div>

                {/* PRICE ROW */}
                <div className="plan-price-block">
                  <div className="plan-price-top-meta">
                    <span className={plan.popular ? "price-meta-tag recom" : "price-meta-tag"}>
                      {plan.priceLabel}
                    </span>
                    <del className="price-meta-del">{plan.originalPrice}</del>
                  </div>

                  <div className="plan-price-main-row">
                    <span className="price-currency-label">Rp</span>
                    <strong className="price-amount-large">{plan.priceFormatted}</strong>
                    <span className={`price-discount-pill ${plan.discountType}`}>
                      {plan.discountBadge}
                    </span>
                  </div>
                </div>

                {/* BUTTON CTA */}
                <button
                  type="button"
                  onClick={() => handleBuyPackage(plan.id)}
                  className={`plan-action-btn ${plan.popular ? "btn-popular" : "btn-outline"}`}
                >
                  Beli Sekarang
                  <span className="btn-arrow">→</span>
                </button>

                {/* DIVIDER */}
                <div className="plan-divider-line" />

                {/* FEATURES LIST */}
                <div className="plan-features-section">
                  <div className="plan-features-header-row">
                    <strong className="plan-features-label">{plan.featuresHeader}</strong>
                    {plan.featuresHeaderBadge && (
                      <span className="plan-features-allinone">{plan.featuresHeaderBadge}</span>
                    )}
                  </div>

                  <ul className="plan-features-list">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className={feature.highlight ? "feature-row-highlight" : "feature-row-normal"}
                      >
                        <span className={`feature-check-icon ${feature.checkColor}`}>✓</span>
                        <span className="feature-text-content">
                          <span className="feature-emoji">{feature.icon}</span>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          JASA IKLAN GOOGLE ADS SECTION
      ===================================================== */}
      <section className="google-ads-section" id="google-ads">
        <div className="container">
          {/* SECTION HEADER */}
          <div className="gads-header-center">
            <div className="gads-top-pill">
              <span className="gads-top-dot" />
              <span>GOOGLE SEARCH CAMPAIGN SPECIALIST</span>
            </div>

            <h2 className="gads-main-title">
              Jasa Iklan <span className="gads-title-highlight">Google Ads</span> Terpercaya
            </h2>

            <p className="gads-main-subtitle">
              Garansi Masuk Halaman 1 Google. <strong>Bayar hanya jika iklan Anda sudah muncul dan tayang di halaman 1 Google.</strong> Tanpa resiko, transparan, dan terukur.
            </p>

            {/* TRUST PILLS */}
            <div className="gads-trust-pills-row">
              <span className="gads-trust-pill">
                <span>🛡️</span> Garansi Halaman 1 Google
              </span>
              <span className="gads-trust-pill">
                <span>⚡</span> Proses Cepat 1 Hari Selesai
              </span>
              <span className="gads-trust-pill">
                <span>💳</span> Bayar Setelah Iklan Tayang
              </span>
            </div>

            {/* FILTER TABS */}
            <div className="gads-filter-wrapper">
              <div className="gads-filter-tabs">
                <button
                  type="button"
                  className={`gads-tab-btn ${adsFilter === "all" ? "active" : ""}`}
                  onClick={() => setAdsFilter("all")}
                >
                  Semua Paket (6)
                </button>
                <button
                  type="button"
                  className={`gads-tab-btn ${adsFilter === "pemula" ? "active" : ""}`}
                  onClick={() => setAdsFilter("pemula")}
                >
                  Paket Pemula
                </button>
                <button
                  type="button"
                  className={`gads-tab-btn ${adsFilter === "bisnis" ? "active" : ""}`}
                  onClick={() => setAdsFilter("bisnis")}
                >
                  Paket Bisnis
                </button>
              </div>

              <span className="gads-notice-pill">
                <span>ℹ️</span> Semua harga sudah mencakup saldo alokasi harian Google + jasa setting riset lengkap
              </span>
            </div>
          </div>

          {/* SUB NAV & SLIDER HEADER */}
          <div className="gads-sub-nav-row">
            <div className="gads-sub-heading">
              <span className="gads-sub-dot" />
              <span>Pilihan Paket Siap Pakai • Klik tombol untuk pesan atau konsultasi langsung</span>
            </div>
            <div className="gads-slider-arrows">
              <button
                type="button"
                className="gads-arrow-btn"
                onClick={() => scrollSlider("gadsSliderTrack", -360)}
                aria-label="Scroll kiri"
              >
                ‹
              </button>
              <button
                type="button"
                className="gads-arrow-btn"
                onClick={() => scrollSlider("gadsSliderTrack", 360)}
                aria-label="Scroll kanan"
              >
                ›
              </button>
            </div>
          </div>

          {/* CARDS GRID */}
          <div className="gads-cards-track" id="gadsSliderTrack">
            {googleAdsPackages
              .filter((pkg) => adsFilter === "all" || pkg.category === adsFilter)
              .map((pkg) => (
                <div className="gads-card" key={pkg.id}>
                  {/* BROWSER TOP PREVIEW */}
                  <div className="gads-card-browser">
                    <div className="flex items-center gap-2">
                      <span className="gads-ad-badge">IKLAN</span>
                      <span className="text-slate-600 font-medium">bisnis-anda.com</span>
                    </div>
                    <div className="text-amber-500 font-bold">★★★★★</div>
                  </div>

                  {/* META TOP */}
                  <div className="gads-card-meta-top">
                    <span className="gads-badge-duration">
                      <span>📅</span> {pkg.durationLabel}
                    </span>
                    <span className="gads-badge-category">{pkg.categoryLabel}</span>
                  </div>

                  {/* TITLE & DESC */}
                  <h3 className="gads-card-title">{pkg.title}</h3>
                  <p className="gads-card-desc">{pkg.description}</p>

                  {/* DANA HARIAN */}
                  <div className="gads-daily-budget-box">
                    <span>Dana Harian Iklan:</span>
                    <strong>{pkg.dailyBudget}</strong>
                  </div>

                  {/* TOTAL HARGA */}
                  <div className="gads-total-price-box">
                    <span className="total-label">TOTAL BIAYA:</span>
                    <div className="price-num">{pkg.priceFormatted}</div>
                    <small>Termasuk saldo iklan harian + biaya jasa optimasi</small>
                  </div>

                  {/* FEATURES LIST */}
                  <ul className="gads-features-list">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx}>
                        {feat.includes("Belum termasuk") ? (
                          <span className="gads-feat-dash">−</span>
                        ) : (
                          <span className="gads-feat-check">✓</span>
                        )}
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* BOTTOM GUARANTEE */}
                  <div className="gads-guarantee-box">
                    <span>🛡️</span>
                    <span>PROSES 1 HARI • BAYAR SETELAH IKLAN TAYANG</span>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="gads-card-actions">
                    <a
                      href={getWhatsAppUrl(`Halo Admin HostingWeb, saya tertarik dengan layanan *${pkg.title}* (${pkg.priceFormatted}). Bisa konsultasi kata kunci dan target iklannya?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gads-btn-wa"
                    >
                      <span>💬</span> Chat Admin
                    </a>
                    <button
                      type="button"
                      onClick={() => handleBuyAds(pkg)}
                      className="gads-btn-buy"
                    >
                      <span>🛍️</span> {pkg.priceFormatted}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="features-section" id="features">
        <div className="container">
          {/* SECTION HEADER */}
          <div className="features-header-left">
            <div className="features-top-badge">
              <span className="features-top-badge-dot" />
              <span>FITUR UNGGULAN</span>
            </div>

            <h2 className="features-main-title">
              Semua yang dibutuhkan
              <br />
              <span className="features-title-highlight">website kamu.</span>
            </h2>

            <p className="features-main-subtitle">
              Kami menyediakan infrastruktur yang dirancang untuk membuat website tetap cepat, aman, dan mudah dikelola.
            </p>
          </div>

          {/* FEATURES GRID */}
          <div className="features-grid-modern">
            {features.map((feature) => (
              <div
                className="feature-modern-card"
                key={feature.title}
              >
                {/* TOP ROW: ICON + BADGE */}
                <div className="feature-card-top-row">
                  <div className={`feature-icon-box ${feature.theme}`}>
                    {feature.icon}
                  </div>

                  <span className={`feature-pill-badge ${feature.theme}`}>
                    {feature.badge}
                  </span>
                </div>

                {/* TITLE & DESCRIPTION */}
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-desc">{feature.description}</p>

                {/* ACTION LINK */}
                <button
                  type="button"
                  className="feature-action-link"
                  onClick={() => setSelectedFeature(feature)}
                >
                  Pelajari lebih lanjut
                  <span className="feature-link-arrow">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================
            FEATURE DETAIL MODAL
        ===================================================== */}
        {selectedFeature && (

          <div
            className="feature-modal-overlay"
            onClick={() =>
              setSelectedFeature(null)
            }
          >

            <div
              className="feature-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                type="button"
                className="feature-modal-close"
                onClick={() =>
                  setSelectedFeature(null)
                }
                aria-label="Tutup"
              >
                ×
              </button>

              <div className="feature-modal-icon">
                {selectedFeature.icon}
              </div>

              <span className="section-label">
                FITUR UNGGULAN
              </span>

              <h2>
                {selectedFeature.title}
              </h2>

              <p className="feature-modal-description">
                {selectedFeature.detail}
              </p>

              <ul className="feature-modal-list">

                {selectedFeature.benefits.map(
                  (benefit, index) => (

                    <li key={index}>
                      <span>✓</span>
                      {benefit}
                    </li>

                  )
                )}

              </ul>

              <button
                type="button"
                className="pricing-button pricing-button-primary"
                onClick={() => {

                  setSelectedFeature(null);

                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });

                }}
              >
                Lihat Paket Hosting
                <span>→</span>
              </button>

            </div>

          </div>

        )}

      </section>

      {/* =====================================================
          WHY US
      ===================================================== */}
      {/* =====================================================
          WHY US (KENAPA HOSTINGWEBID?)
      ===================================================== */}
      <section className="why-section" id="hosting">
        <div className="container why-grid">
          {/* LEFT: DASHBOARD UI MOCKUP */}
          <div className="why-visual-wrapper">
            <div className="why-mockup-card">
              {/* TOP HEADER */}
              <div className="mockup-header-bar">
                <div className="mockup-brand-group">
                  <div className="mockup-logo-icon">H</div>
                  <div className="mockup-brand-text">
                    <strong>Hostingwebid</strong>
                    <span>Hosting Dashboard • Server Jakarta</span>
                  </div>
                </div>
                <div className="mockup-online-pill">
                  <span className="online-dot" />
                  <span>Online</span>
                </div>
              </div>

              {/* CARD INNER BODY */}
              <div className="mockup-body-content">
                {/* WEBSITE STATUS ROW */}
                <div className="mockup-site-row">
                  <div className="mockup-site-info">
                    <div className="mockup-site-icon">W</div>
                    <div>
                      <div className="site-name-row">
                        <strong>websitekamu.com</strong>
                        <span className="site-active-dot" />
                      </div>
                      <span className="site-sub-text">Active website • 1x - 3GB NVMe</span>
                    </div>
                  </div>
                  <div className="mockup-uptime-stat">
                    <strong>99.9%</strong>
                    <span>UPTIME RECORD</span>
                  </div>
                </div>

                {/* PERFORMANCE BAR */}
                <div className="mockup-perf-section">
                  <div className="mockup-perf-labels">
                    <span>Performance</span>
                    <strong className="perf-highlight">Terdistribusi &amp; Stabil</strong>
                  </div>
                  <div className="mockup-perf-bar-track">
                    <div className="mockup-perf-bar-fill" />
                  </div>
                </div>

                {/* 3 METRIC STATS */}
                <div className="mockup-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-label">Response Time</span>
                    <strong className="metric-val">18ms</strong>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">SSL Certificate</span>
                    <strong className="metric-val text-green">Active (Auto)</strong>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Cloud Backup</span>
                    <strong className="metric-val">Daily 02:00</strong>
                  </div>
                </div>
              </div>

              {/* FLOATING BADGE */}
              <div className="mockup-floating-badge">
                <div className="floating-check-icon">✓</div>
                <div>
                  <strong>Website Aktif</strong>
                  <small>99.9% Real-time Uptime</small>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TEXT & NUMBERED LIST */}
          <div className="why-content-side">
            <div className="why-top-badge">
              <span className="why-top-badge-dot" />
              <span>KENAPA HOSTINGWEBID?</span>
            </div>

            <h2 className="why-main-title">
              Bukan cuma hosting.
              <br />
              <span className="why-title-highlight">Partner website kamu.</span>
            </h2>

            <p className="why-main-subtitle">
              Kami percaya hosting yang bagus bukan hanya soal server. Kamu juga membutuhkan layanan yang mudah digunakan dan support yang bisa diandalkan.
            </p>

            <div className="why-numbered-list">
              {/* ITEM 01 */}
              <div className="why-item-card">
                <span className="why-item-num">01</span>
                <div className="why-item-body">
                  <div className="why-item-title-row">
                    <strong>Performa cepat</strong>
                    <span className="why-badge-tag yellow">⚡ NVME 5X FASTER</span>
                  </div>
                  <p>Infrastruktur modern untuk loading website yang lebih cepat dan lancar saat diakses dari seluruh Indonesia.</p>
                </div>
              </div>

              {/* ITEM 02 */}
              <div className="why-item-card">
                <span className="why-item-num">02</span>
                <div className="why-item-body">
                  <div className="why-item-title-row">
                    <strong>Harga transparan</strong>
                    <span className="why-badge-tag green">🔒 NO HIDDEN COST</span>
                  </div>
                  <p>Pilih paket sesuai kebutuhan tanpa fitur yang tidak diperlukan, tanpa biaya tersembunyi saat perpanjangan.</p>
                </div>
              </div>

              {/* ITEM 03 */}
              <div className="why-item-card">
                <span className="why-item-num">03</span>
                <div className="why-item-body">
                  <div className="why-item-title-row">
                    <strong>Support manusia</strong>
                    <span className="why-badge-tag red">💬 RESPON &lt; 5 MENIT</span>
                  </div>
                  <p>Dapatkan bantuan teknis dari tim spesialis asli ketika kamu membutuhkannya, via live chat WhatsApp &amp; tiket 24 jam.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TESTIMONIAL SECTION
      ===================================================== */}
      <section className="testimonial-section">
        <div className="container">
          {/* SECTION HEADER */}
          <div className="testimonial-header-center">
            <div className="testimonial-top-badge">
              <span className="testimonial-top-badge-dot" />
              <span>TESTIMONIAL</span>
            </div>

            <h2 className="testimonial-main-title">
              Cerita dari pelanggan
              <br />
              <span className="testimonial-title-highlight">Hostingwebid.</span>
            </h2>

            <p className="testimonial-main-subtitle">
              Beberapa pengalaman pelanggan yang menggunakan layanan kami untuk kebutuhan website bisnis dan profesional mereka.
            </p>
          </div>

          {/* TESTIMONIALS 3 CARDS */}
          <div className="testimonial-grid-modern">
            {testimonials.map((testimonial) => (
              <div
                className="testimonial-modern-card"
                key={testimonial.name}
              >
                {/* STARS & SCORE ROW */}
                <div className="testimonial-stars-row">
                  <div className="testimonial-stars-gold">★★★★★</div>
                  <span className="testimonial-score-text">{testimonial.rating}</span>
                </div>

                {/* QUOTE */}
                <p className="testimonial-quote-text">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* AUTHOR ROW */}
                <div className="testimonial-author-row">
                  <div
                    className="testimonial-avatar-circle"
                    style={{ background: testimonial.color }}
                  >
                    {testimonial.initials}
                  </div>

                  <div className="testimonial-author-info">
                    <div className="author-name-verified">
                      <strong>{testimonial.name}</strong>
                      <svg className="verified-badge-icon" width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <span className="author-role-text">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM TRUST RATING PILL BAR */}
          <div className="testimonial-trust-bar">
            <div className="trust-bar-rating">
              <div className="trust-bar-star-icon">★</div>
              <div>
                <strong className="trust-bar-score">Skor Kepuasan 4.9 / 5.0</strong>
                <span className="trust-bar-sub">Dari 1.200+ pemilik website &amp; UMKM di seluruh Indonesia</span>
              </div>
            </div>

            <div className="trust-bar-partners">
              <span className="trust-partner-badge google">
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Google Review
              </span>
              <span className="trust-partner-badge trustpilot">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#00b67a">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                Trustpilot
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA BANNER SECTION
      ===================================================== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box-modern">
            <div className="cta-ambient-rings" />

            <div className="cta-content-inner">
              {/* TOP BADGE */}
              <div className="cta-top-badge">
                <span className="cta-top-badge-dot" />
                <span>SIAP MEMULAI?</span>
              </div>

              {/* TITLE */}
              <h2 className="cta-main-title">
                Saatnya website kamu
                <br />
                <span className="cta-title-highlight">tampil lebih profesional.</span>
              </h2>

              {/* SUBTITLE */}
              <p className="cta-main-subtitle">
                Pilih hosting terbaik untuk website kamu dan mulai berkembang bersama <strong>Hostingwebid</strong>. Dapatkan kecepatan ultra, uptime 99.9%, dan dukungan ahli Indonesia.
              </p>

              {/* BUTTONS */}
              <div className="cta-action-buttons">
                <a href="#pricing" className="cta-btn-primary">
                  Lihat Paket Hosting
                  <span>→</span>
                </a>
                <a
                  href={getWhatsAppUrl("Halo Admin HostingWeb, saya tertarik dengan promo paket hosting. Bisa dibantu penjelasannya?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-btn-whatsapp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#22c55e">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.974.53 1.77.813 2.796.814h.005c3.18 0 5.766-2.587 5.767-5.766 0-1.541-.6-2.99-1.69-4.081-1.09-1.09-2.539-1.691-4.082-1.691zm7.135 1.541c1.47 1.47 2.28 3.424 2.28 5.503 0 4.288-3.489 7.777-7.777 7.777-1.306 0-2.583-.332-3.714-.963l-4.14 1.085 1.107-4.037c-.702-1.182-1.074-2.534-1.074-3.862 0-4.288 3.489-7.778 7.777-7.778 2.079 0 4.033.81 5.541 2.275zm-3.08 7.828c-.198-.099-1.171-.578-1.353-.644-.182-.066-.314-.099-.446.099-.133.198-.513.644-.629.777-.116.132-.232.149-.43.05-.198-.099-.838-.309-1.597-.986-.591-.528-.99-1.18-1.106-1.378-.116-.198-.012-.306.087-.404.089-.089.198-.232.298-.348.099-.116.132-.198.198-.33.066-.132.033-.248-.017-.348-.05-.099-.446-1.074-.612-1.471-.161-.387-.326-.334-.446-.34-.116-.006-.248-.007-.38-.007s-.348.05-.529.248c-.182.198-.694.678-.694 1.653s.711 1.917.81 2.05c.099.132 1.399 2.136 3.39 2.994.474.204.844.326 1.132.418.476.151.909.13 1.251.079.382-.057 1.171-.479 1.337-.942.165-.463.165-.86.116-.942-.049-.082-.181-.132-.379-.231z"/>
                  </svg>
                  Chat WhatsApp
                </a>
              </div>

              {/* BOTTOM TRUST CHECKLIST */}
              <div className="cta-trust-checklist">
                <span className="cta-check-item">
                  <span className="cta-item-icon">⚡</span> Aktivasi Instan
                </span>
                <span className="cta-dot-separator">•</span>
                <span className="cta-check-item">
                  <span className="cta-item-icon">🛡️</span> Garansi 30 Hari Bebas Risiko
                </span>
                <span className="cta-dot-separator">•</span>
                <span className="cta-check-item">
                  <span className="cta-item-icon">💬</span> Support 24/7 Siaga
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ SECTION
      ===================================================== */}
      <section className="faq-section" id="faq">
        <div className="container faq-grid-modern">
          {/* LEFT COLUMN */}
          <div className="faq-intro-side">
            <div className="faq-top-badge">
              <span className="faq-top-badge-dot" />
              <span>FAQ BANTUAN</span>
            </div>

            <h2 className="faq-main-title">
              Pertanyaan yang
              <br />
              <span className="faq-title-highlight">sering ditanyakan.</span>
            </h2>

            <p className="faq-main-subtitle">
              Masih bingung memilih paket atau butuh penjelasan lebih detail? Hubungi tim kami dan kami akan membantu menjelaskan layanan yang paling sesuai untuk bisnis kamu.
            </p>

            {/* HELP CARD */}
            <div className="faq-help-card">
              <div className="faq-help-icon-box">💬</div>
              <div className="faq-help-content">
                <strong>Ada pertanyaan khusus?</strong>
                <p>Konsultasikan kebutuhan website kamu secara gratis dengan Customer Success kami.</p>
                <a
                  href={getWhatsAppUrl("Halo Customer Success HostingWeb, saya ingin konsultasi kebutuhan website saya.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="faq-help-link"
                >
                  Tanya via WhatsApp →
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACCORDION LIST */}
          <div className="faq-accordion-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  className={`faq-accordion-item ${isOpen ? "faq-open" : ""}`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="faq-question-btn"
                  >
                    <span>{faq.question}</span>
                    <span className={`faq-toggle-icon ${isOpen ? "is-open" : ""}`}>
                      {isOpen ? "✕" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer-box">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="footer" id="contact">
        <div className="container footer-premium-container">
          {/* TOP ROW: BRAND & FEATURE PILLS */}
          <div className="footer-top-row">
            <div className="footer-top-brand-box">
              <div className="footer-logo-wrap">
                <img src="/logo.png" alt="hostingwebid" />
              </div>
              <p className="footer-top-desc">
                Solusi hosting, domain, dan pembuatan website murah, cepat, dan terpercaya di Indonesia. Didesain untuk memaksimalkan performa bisnis digital Anda secara terjamin.
              </p>
            </div>

            <div className="footer-top-features">
              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-red">⚡</div>
                <div className="feat-text">
                  <span className="feat-label">Kecepatan</span>
                  <strong className="feat-value">NVMe SSD Cepat</strong>
                </div>
              </div>

              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-orange">🛡️</div>
                <div className="feat-text">
                  <span className="feat-label">Keamanan</span>
                  <strong className="feat-value">Garansi 99.9% Up</strong>
                </div>
              </div>

              <div className="footer-feat-pill">
                <div className="feat-icon-box feat-teal">🎧</div>
                <div className="feat-text">
                  <span className="feat-label">Bantuan</span>
                  <strong className="feat-value">24/7 Siap Sigap</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-divider-glow" />

          {/* MAIN 4-COLUMN GRID */}
          <div className="footer-premium-grid">
            {/* COL 1: KANTOR LAYANAN */}
            <div className="footer-col-kantor">
              <h3 className="footer-sec-title">
                <span className="title-bar" /> KANTOR LAYANAN
              </h3>
              <p className="footer-sec-sub">Hubungi langsung tim helpdesk &amp; representatif kami:</p>

              <div className="footer-contact-stack">
                <div className="contact-row">
                  <div className="contact-icon-box">📞</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Telepon:</span>
                    <a href={`tel:${SITE_CONFIG.phone.replace(/[^0-9]/g, "")}`} className="contact-meta-val">
                      {SITE_CONFIG.phone}
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box contact-wa-icon">💬</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">WhatsApp:</span>
                    <a
                      href={getWhatsAppUrl("Halo Admin HostingWeb, saya ingin berkonsultasi.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-meta-val"
                    >
                      {SITE_CONFIG.whatsappDisplay}
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box">✉️</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Email Resmi:</span>
                    <a href={`mailto:${SITE_CONFIG.email}`} className="contact-meta-val">
                      {SITE_CONFIG.email}
                    </a>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box">📍</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Alamat Kantor:</span>
                    <span className="contact-meta-val">Ruko No. 2A/11, Jl. Tamalate II</span>
                    <span className="contact-meta-sub">Kota Makassar - Sulawesi Selatan 90245</span>
                  </div>
                </div>

                <div className="contact-row">
                  <div className="contact-icon-box">🕒</div>
                  <div className="contact-meta">
                    <span className="contact-meta-label">Jam Operasional:</span>
                    <span className="contact-meta-val">Senin - Sabtu Pkl. 08.00 - 17.00 WIB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COL 2: LAYANAN */}
            <div className="footer-col-nav">
              <h3 className="footer-sec-title">
                <span className="title-bar" /> LAYANAN
              </h3>
              <ul className="footer-nav-links">
                <li><a href="#portfolio">Jasa Pembuatan Website</a></li>
                <li><a href="#google-ads">Jasa Iklan Google Ads</a></li>
                <li><a href="#features">Jasa SEO</a></li>
              </ul>
            </div>

            {/* COL 3: INFORMASI */}
            <div className="footer-col-nav">
              <h3 className="footer-sec-title">
                <span className="title-bar" /> INFORMASI
              </h3>
              <ul className="footer-nav-links">
                <li><a href="#">Affiliasi</a></li>
                <li><a href="/checkout">Konfirmasi Pembayaran</a></li>
                <li><a href="#about">Tentang Kami</a></li>
                <li><a href="#">PKL</a></li>
                <li><a href="#">Legalitas Perusahaan</a></li>
                <li><a href="#portfolio">Portofolio Proyek</a></li>
              </ul>
            </div>

            {/* COL 4: SECURE SHOPPING */}
            <div className="footer-col-secure">
              <h3 className="footer-sec-title">
                <span className="title-bar" /> SECURE SHOPPING
              </h3>
              <p className="footer-sec-sub">
                Transaksi aman dan terenkripsi menggunakan sertifikasi keamanan berstandar internasional.
              </p>

              <div className="footer-security-cards">
                {/* 1. GOOGLE SAFE BROWSING */}
                <div className="security-card">
                  <div className="sec-card-left">
                    <div className="google-g-logo">G</div>
                    <div className="sec-card-info">
                      <div className="sec-card-title flex items-center gap-1">
                        <span>Google Safe Browsing</span>
                        <span className="text-emerald-400">✓</span>
                      </div>
                      <span className="sec-card-desc">Terverifikasi Bebas Malware &amp; Phishing</span>
                    </div>
                  </div>
                  <span className="badge-active-green">ACTIVE</span>
                </div>

                {/* 2. SSL SECURED 256-BIT */}
                <div className="security-card">
                  <div className="sec-card-left">
                    <div className="ssl-lock-box">🔒</div>
                    <div className="sec-card-info">
                      <div className="sec-card-title">SSL SECURED 256-BIT</div>
                      <span className="sec-card-desc">End-to-End Encryption Protocol</span>
                    </div>
                  </div>
                  <span className="badge-tls">TLS 1.3</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SUB-FOOTER */}
          <div className="footer-premium-bottom">
            <div className="footer-copyright">
              © 2026 <strong>hostingwebid</strong> • Seluruh hak cipta dilindungi undang-undang.
            </div>
            <div className="footer-legal-bar">
              <a href="#">Syarat &amp; Ketentuan</a>
              <span>•</span>
              <a href="#">Kebijakan Privasi</a>
              <span>•</span>
              <a href="#">Status Layanan</a>
              <span>•</span>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================
          WHATSAPP FLOATING BUTTON
      ===================================================== */}
      <a
        href={getWhatsAppUrl("Halo Customer Service HostingWeb, saya butuh informasi / bantuan.")}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat WhatsApp"
      >

        <span>☏</span>

        <div>
          <strong>
            Chat dengan kami
          </strong>

          <small>
            Online sekarang
          </small>
        </div>

      </a>

    </main>
  );
}