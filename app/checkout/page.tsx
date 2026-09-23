"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWhatsAppUrl, SITE_CONFIG } from "../lib/siteConfig";

/* =========================================================
   TYPE DEFINITIONS
========================================================= */

type CheckoutItem = {
  cart_id: number;
  domain_id: number;
  domain_name: string;
  extension: string;
  price: number;
};

type CheckoutData = {
  items: CheckoutItem[];
  subtotal: string;
  ppn: string;
  total: string;
};

type CouponResponse = {
  status: string;
  code: number;
  message: string;
  data?: {
    coupon?: {
      id: number;
      code: string;
      discount_type: string;
      discount_value: string | number;
    };
    subtotal?: string;
    discount?: string;
    after_discount?: string;
  };
};

type OrderResponse = {
  status: string;
  code: number;
  message: string;
  data?: {
    order_id?: number;
    order_number?: string;
    payment_id?: number | null;
    payment_number?: string;
    subtotal?: string;
    discount?: string;
    after_discount?: string;
    ppn?: string;
    total?: string;
    status?: string;
    service_status?: string;
    start_date?: string | null;
    expiry_date?: string | null;
    coupon?: {
      id: number;
      code: string;
    } | null;
  };
};

type PaymentResponse = {
  status: string;
  code: number;
  message: string;
  data?: {
    payment_id?: number | null;
    payment_number?: string;
    order_id?: number;
    order_number?: string;
    amount?: string;
    payment_method?: string;
    status?: string;
    invoice_id?: number | null;
    invoice_number?: string | null;
  };
};

type SavedCheckoutPayment = {
  paymentId: number;
  paymentNumber: string;
  orderId: number;
  orderNumber: string;
  amount: number;
  itemName?: string;
  itemSpecs?: string;
  durationYears?: number;
  subtotal?: number;
  ppn?: number;
};

/* =========================================================
   APIs & CONSTANTS
========================================================= */

const CHECKOUT_API = "/api/backend/checkout/index.php";
const COUPON_VALIDATE_API = "/api/backend/coupon/validate.php";
const ORDER_CREATE_API = "/api/backend/order/create.php";
const PAYMENT_API = "/api/backend/payment/index.php";

const HOSTING_PACKAGES: Record<
  string,
  {
    name: string;
    badge: string;
    specs: string;
    monthlyPrice: number;
    yearlyPrice: number;
  }
> = {
  starter: {
    name: "Paket Starter Website",
    badge: "Hosting 3GB NVMe",
    specs: "Hosting 3GB NVMe • Termasuk Domain .com • SSL Gratis • Setting SEO On-Page",
    monthlyPrice: 80000,
    yearlyPrice: 750000,
  },
  "business-pro": {
    name: "Paket Bisnis Pro",
    badge: "Hosting 10GB NVMe High Speed",
    specs: "Hosting 10GB NVMe High Speed • Termasuk Domain .com • FREE 30 Artikel SEO • LiteSpeed Turbo",
    monthlyPrice: 160000,
    yearlyPrice: 1500000,
  },
  "elite-enterprise": {
    name: "Paket Elite Enterprise",
    badge: "Hosting 50GB NVMe Cloud",
    specs: "Hosting 50GB NVMe Cloud • Termasuk Domain .com • FREE 30 Artikel SEO • Optimasi SEO Traffic",
    monthlyPrice: 220000,
    yearlyPrice: 2000000,
  },
};

const GOOGLE_ADS_PACKAGES: Record<
  string,
  {
    name: string;
    badge: string;
    specs: string;
    price: number;
    duration: string;
  }
> = {
  "pemula-14": {
    name: "Paket Pemula 14 Hari Google Ads",
    badge: "Google Search Ads 14 Hari",
    specs: "Masa Aktif 14 Hari • Dana Harian Rp 50.000 • Riset Kata Kunci • Garansi Halaman 1 Google",
    price: 700000,
    duration: "14 Hari",
  },
  "pemula-20": {
    name: "Paket Pemula 20 Hari Google Ads",
    badge: "Google Search Ads 20 Hari",
    specs: "Masa Aktif 20 Hari • Dana Harian Rp 50.000 • Optimasi Negatif Keyword • Garansi Halaman 1 Google",
    price: 1000000,
    duration: "20 Hari",
  },
  "pemula-30": {
    name: "Paket Pemula 30 Hari Google Ads",
    badge: "Google Search Ads 30 Hari",
    specs: "Masa Aktif 30 Hari • Dana Harian Rp 50.000 • Call Extension & Setup Komplit • Garansi Halaman 1 Google",
    price: 1500000,
    duration: "30 Hari",
  },
  "bisnis-10": {
    name: "Paket Bisnis 10 Hari Google Ads",
    badge: "Google Search Ads Bisnis 10 Hari",
    specs: "Masa Aktif 10 Hari • Dana Harian Rp 100.000 • Conversion Tracking • Garansi Halaman 1 Google",
    price: 1000000,
    duration: "10 Hari",
  },
  "bisnis-15": {
    name: "Paket Bisnis 15 Hari Google Ads",
    badge: "Google Search Ads Bisnis 15 Hari",
    specs: "Masa Aktif 15 Hari • Dana Harian Rp 100.000 • Copywriting A/B Testing • Garansi Halaman 1 Google",
    price: 1500000,
    duration: "15 Hari",
  },
  "bisnis-30": {
    name: "Paket Bisnis 30 Hari Google Ads",
    badge: "Google Search Ads Bisnis 30 Hari",
    specs: "Masa Aktif 30 Hari • Dana Harian Rp 100.000 • Analytics & Full Conversion • Garansi Halaman 1 Google",
    price: 3000000,
    duration: "30 Hari",
  },
};

const GOOGLE_ADS_CLEAN_NAMES: Record<string, string> = {
  "pemula-14": "Google Ads Paket Pemula 14",
  "pemula-20": "Google Ads Paket Pemula 20",
  "pemula-30": "Google Ads Paket Pemula 30",
  "bisnis-10": "Google Ads Paket Bisnis 10",
  "bisnis-15": "Google Ads Paket Bisnis 15",
  "bisnis-30": "Google Ads Paket Bisnis 30",
};

const BANK_ACCOUNTS = [
  {
    name: "BCA",
    logo: "/bank-logos/bca.png",
    accountNumber: "8735105848",
    owner: "Irwanto",
    status: "Cek Otomatis",
  },
  {
    name: "BRI",
    logo: "/bank-logos/bri.png",
    accountNumber: "490501014725533",
    owner: "Irwanto",
    status: "Cek Otomatis",
  },
  {
    name: "MANDIRI",
    logo: "/bank-logos/mandiri.png",
    accountNumber: "1740002093110",
    owner: "Irwanto",
    status: "Cek Otomatis",
  },
  {
    name: "BSI",
    logo: "/bank-logos/bni.png",
    accountNumber: "0671541810",
    owner: "Irwanto",
    status: "Cek Otomatis",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function rupiah(value: number | string | undefined | null) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`Server tidak mengembalikan response. HTTP ${response.status}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const el = document.createElement("div");
    el.innerHTML = text;
    const clean = el.textContent?.replace(/\s+/g, " ").trim();
    throw new Error(clean || `Server mengembalikan response tidak valid. HTTP ${response.status}`);
  }
}

function getDomainPriceFromExt(domain: string): number {
  const lower = (domain || "").toLowerCase();
  if (lower.endsWith(".co.id")) return 270000;
  if (lower.endsWith(".my.id") || lower.endsWith(".biz.id")) return 12000;
  if (lower.endsWith(".xyz") || lower.endsWith(".buzz")) return 29900;
  if (lower.endsWith(".id")) return 250000;
  if (lower.endsWith(".net")) return 180000;
  if (lower.endsWith(".org")) return 149900;
  if (lower.endsWith(".com")) return 150000;
  return 150000;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="checkout-loading-screen">
          <div className="checkout-spinner" />
          <span>Memuat halaman checkout...</span>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderNumberParam = searchParams.get("order_number") || "";
  const amountParam = searchParams.get("amount") || "";
  const paketParam = searchParams.get("paket") || "";
  const adsParam = searchParams.get("ads") || "";
  const typeParam = searchParams.get("type") || "";
  const packageParam = searchParams.get("package") || searchParams.get("name") || "";
  const seoParam = searchParams.get("seo") || (typeParam === "seo" ? packageParam || "Jasa SEO" : "");
  const cycleParam = searchParams.get("cycle") || "yearly";
  const domainParam = searchParams.get("domain") || "";
  const priceParam = searchParams.get("price") || "";
  const domainIdParam = searchParams.get("domain_id") || "0";
  const isNewParam = searchParams.get("new") || "";

  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Duration State (Default 1 Tahun, can be 1..10 Tahun)
  const [durationYears, setDurationYears] = useState<number>(1);

  // Promo Code State
  const [showPromoInput, setShowPromoInput] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  // Order & Payment State
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>("");
  const [orderSuccess, setOrderSuccess] = useState<string>("");

  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [paymentNumber, setPaymentNumber] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [invoiceId, setInvoiceId] = useState<number | null>(null);

  // Copy feedback
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // 24-Hour Countdown Timer State (Ticking dynamically)
  const [timeLeft, setTimeLeft] = useState<number>(23 * 3600 + 59 * 60 + 59);

  // Security CAPTCHA Checkbox State ("Saya bukan robot")
  const [isRobotVerified, setIsRobotVerified] = useState<boolean>(false);

  useEffect(() => {
    const storageKey = `hostingwebid_deadline_${createdOrderNumber || "default"}`;
    let deadline = Number(localStorage.getItem(storageKey));
    const now = Date.now();

    if (!deadline || deadline < now || isNaN(deadline)) {
      deadline = now + (23 * 3600 + 59 * 60 + 59) * 1000;
      localStorage.setItem(storageKey, String(deadline));
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [createdOrderNumber]);

  const formattedTimeLeft = useMemo(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  }, [timeLeft]);

  // Lock ref to prevent any duplicate POST order creation in React render cycles
  const orderCreationLockRef = useRef<boolean>(false);

  /* =========================================================
     LOAD INITIAL CHECKOUT DATA (DIRECT 1-STEP CHECKOUT)
  ========================================================= */
  const redirectToLogin = () => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const target = `${currentPath}${currentSearch}`;
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    } else {
      router.replace("/login?redirect=/checkout");
    }
  };

  useEffect(() => {
    async function fetchCheckout() {
      if (orderCreationLockRef.current) return;

      try {
        setLoading(true);
        setError("");

        let savedUser = typeof window !== "undefined" ? localStorage.getItem("hostingwebid_user") : null;
        if (!savedUser && typeof window !== "undefined") {
          const authRaw = localStorage.getItem("hostingweb_auth");
          if (authRaw) {
            try {
              const parsedAuth = JSON.parse(authRaw);
              if (parsedAuth?.loggedIn && parsedAuth?.email) {
                savedUser = JSON.stringify({
                  id: parsedAuth.id || 0,
                  name: parsedAuth.name || parsedAuth.username || parsedAuth.email.split("@")[0],
                  email: parsedAuth.email,
                  role: parsedAuth.role || "user",
                });
                localStorage.setItem("hostingwebid_user", savedUser);
              }
            } catch {}
          }
        }

        // 1. Existing Order from Riwayat Pesanan (/checkout?order_number=ORD-...)
        if (orderNumberParam && !adsParam && !paketParam && !seoParam && !typeParam && !packageParam && !domainParam) {
          orderCreationLockRef.current = true;
          setCreatedOrderNumber(orderNumberParam);
          const rawAmt = Number(amountParam) || 0;
          if (rawAmt > 0) setPaymentAmount(rawAmt);

          setCheckout({
            items: [
              {
                cart_id: 9999,
                domain_id: 0,
                domain_name: `Pesanan #${orderNumberParam}`,
                extension: "Layanan HostingWeb",
                price: rawAmt > 0 ? Math.round(rawAmt / 1.11) : 0,
              },
            ],
            subtotal: String(rawAmt > 0 ? Math.round(rawAmt / 1.11) : 0),
            ppn: String(rawAmt > 0 ? Math.round(rawAmt - Math.round(rawAmt / 1.11)) : 0),
            total: String(rawAmt),
          });

          try {
            const query = `order_number=${encodeURIComponent(orderNumberParam)}`;
            const res = await fetch(`${PAYMENT_API}?${query}`, {
              method: "GET",
              credentials: "include",
              headers: { Accept: "application/json" },
              cache: "no-store",
            });
            const result = await readApiResponse<any>(res);
            if (result.data) {
              if (result.data.order_id) setCreatedOrderId(Number(result.data.order_id));
              if (result.data.payment_id) setPaymentId(Number(result.data.payment_id));
              if (result.data.payment_number) setPaymentNumber(result.data.payment_number);
              if (result.data.amount) setPaymentAmount(Number(result.data.amount));
              if (result.data.status) setPaymentStatus(result.data.status);
              if (result.data.invoice_id) setInvoiceId(Number(result.data.invoice_id));
            }
          } catch (err) {
            console.error("Gagal load detail order_number:", err);
          }
          return;
        }

        // Lock creation right before preparing payload & calling backend
        orderCreationLockRef.current = true;

        // 3. Prepare order payload
        let orderPayload: any = null;
        let itemName = "Layanan HostingWeb";
        let itemExtension = "Hosting & Domain";
        let basePrice = 150000;

        if (typeParam === "website" || (packageParam && packageParam.toLowerCase().includes("website"))) {
          const packageName = packageParam || "Jasa Pembuatan Website";
          basePrice = Number(priceParam) || 750000;
          itemName = packageName;
          itemExtension = domainParam
            ? `Domain: ${domainParam} • Cloud Server High Speed • Custom Desain & Free SSL`
            : "Termasuk Domain & Cloud Server • Custom Desain & Free SSL";
          orderPayload = {
            package_name: packageName,
            domain_name: domainParam || packageName,
            price: basePrice,
            duration_years: 1,
            payment_method: "transfer",
          };
        } else if (seoParam || typeParam === "seo") {
          const packageName = seoParam || packageParam || "Paket Jasa SEO";
          basePrice = Number(priceParam) || 650000;
          itemName = packageName;
          itemExtension = domainParam ? `Target Web: ${domainParam} • Layanan SEO & PBN Backlink` : "Layanan SEO, PBN & High Authority Backlink";
          orderPayload = {
            package_name: packageName,
            domain_name: domainParam || packageName,
            price: basePrice,
            duration_years: 1,
            payment_method: "transfer",
          };
        } else if (adsParam && GOOGLE_ADS_PACKAGES[adsParam]) {
          const adPkg = GOOGLE_ADS_PACKAGES[adsParam];
          basePrice = adPkg.price;
          itemName = adPkg.name;
          itemExtension = `${adPkg.badge} • ${adPkg.specs}`;
          const cleanBackendPkgName = GOOGLE_ADS_CLEAN_NAMES[adsParam] || "Google Ads Paket";
          orderPayload = {
            package_name: cleanBackendPkgName,
            domain_name: domainParam || cleanBackendPkgName,
            price: basePrice,
            duration_years: 1,
            payment_method: "transfer",
          };
        } else if (paketParam && HOSTING_PACKAGES[paketParam]) {
          const pkg = HOSTING_PACKAGES[paketParam];
          const isYearly = cycleParam !== "monthly";
          basePrice = isYearly ? pkg.yearlyPrice : pkg.monthlyPrice;
          const cycleLabel = isYearly ? " (Tahunan / 1 Tahun)" : " (Bulanan / 1 Bulan)";
          itemName = `${pkg.name}${cycleLabel}`;
          itemExtension = domainParam ? `Domain: ${domainParam} • ${pkg.specs}` : pkg.specs;
          orderPayload = {
            package_name: pkg.name,
            domain_name: domainParam || null,
            price: basePrice,
            duration_years: 1,
            payment_method: "transfer",
          };
        } else if (domainParam) {
          basePrice = Number(priceParam) || getDomainPriceFromExt(domainParam);
          itemName = domainParam;
          itemExtension = `Registrasi Domain Baru (${domainParam}) • Termasuk DNS Management & Free SSL`;
          orderPayload = {
            domain_name: domainParam,
            price: basePrice,
            duration_years: 1,
            payment_method: "transfer",
          };
        } else {
          // Default cart
          orderPayload = {
            payment_method: "transfer",
            duration_years: 1,
          };
        }

        const ppnVal = Math.round(basePrice * 0.11);
        const totalVal = basePrice + ppnVal;
        const currentCheckoutData: CheckoutData = {
          items: [
            {
              cart_id: 1001,
              domain_id: Number(domainIdParam || 0),
              domain_name: itemName,
              extension: itemExtension,
              price: basePrice,
            },
          ],
          subtotal: String(basePrice),
          ppn: String(ppnVal),
          total: String(totalVal),
        };
        setCheckout(currentCheckoutData);

        // 4. Create Order Immediately in Backend
        let parsedUser: any = null;
        try {
          parsedUser = savedUser ? JSON.parse(savedUser) : null;
        } catch {}

        const enrichedPayload = {
          ...orderPayload,
          user_id: parsedUser?.id || 0,
          user_email: parsedUser?.email || "pelanggan@hostingwebid.com",
          username: parsedUser?.name || parsedUser?.username || "Pelanggan",
        };

        const createRes = await fetch(ORDER_CREATE_API, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(enrichedPayload),
        });
        const createResult = await createRes.json().catch(() => null);

        if (!createRes.ok || createResult?.status !== "success" || !createResult?.data) {
          const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          const fallbackOrdNum = `ORD-${dateStr}-${randSuffix}`;
          const fallbackPayNum = `PAY-${dateStr}-${randSuffix}`;
          const ordId = Date.now();
          const finalTotal = totalVal;

          setCreatedOrderId(ordId);
          setCreatedOrderNumber(fallbackOrdNum);
          setPaymentId(ordId);
          setPaymentNumber(fallbackPayNum);
          setPaymentAmount(finalTotal);
          setPaymentStatus("pending");
          setOrderSuccess("Pesanan siap dan menunggu pembayaran.");

          const savedData = {
            orderId: ordId,
            orderNumber: fallbackOrdNum,
            paymentId: ordId,
            paymentNumber: fallbackPayNum,
            amount: finalTotal,
            status: "pending",
            checkout: currentCheckoutData,
          };

          localStorage.setItem("hostingweb_checkout_payment", JSON.stringify(savedData));

          if (typeof window !== "undefined") {
            window.history.replaceState(null, "", `/checkout?order_number=${encodeURIComponent(fallbackOrdNum)}&amount=${finalTotal}`);
          }
        } else {
          const d = createResult.data;
          const ordId = Number(d.order_id);
          const ordNum = String(d.order_number || (ordId ? `ORD-${ordId}` : ""));
          const payId = Number(d.payment_id || ordId);
          const payNum = String(d.payment_number || (ordNum ? `PAY-${ordNum}` : ""));
          const finalTotal = Number(d.total) || totalVal;

          setCreatedOrderId(ordId);
          setCreatedOrderNumber(ordNum);
          setPaymentId(payId);
          setPaymentNumber(payNum);
          setPaymentAmount(finalTotal);
          setPaymentStatus("pending");
          setOrderSuccess("Pesanan berhasil dibuat dan menunggu pembayaran.");

          const savedData = {
            orderId: ordId,
            orderNumber: ordNum,
            paymentId: payId,
            paymentNumber: payNum,
            amount: finalTotal,
            status: "pending",
            checkout: currentCheckoutData,
          };

          localStorage.setItem("hostingweb_checkout_payment", JSON.stringify(savedData));

          if (typeof window !== "undefined" && ordNum) {
            window.history.replaceState(null, "", `/checkout?order_number=${encodeURIComponent(ordNum)}&amount=${finalTotal}`);
          }
        }
      } catch (err) {
        console.error("Checkout Error:", err);
        const errMsg = err instanceof Error ? err.message : "Tidak dapat mengambil data checkout.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    }

    void fetchCheckout();
  }, [router, orderNumberParam, amountParam, paketParam, cycleParam, domainParam, priceParam, domainIdParam, adsParam, seoParam, typeParam, packageParam, isNewParam]);

  /* =========================================================
     POLL PAYMENT STATUS
  ========================================================= */
  useEffect(() => {
    if ((!paymentNumber && !createdOrderId && !paymentId) || paymentStatus.toLowerCase() === "paid") return;

    let active = true;
    const refreshPaymentStatus = async () => {
      try {
        const query = paymentNumber
          ? `payment_number=${encodeURIComponent(paymentNumber)}`
          : paymentId
          ? `payment_id=${paymentId}`
          : `order_id=${createdOrderId}`;

        const response = await fetch(`${PAYMENT_API}?${query}`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const result = await readApiResponse<any>(response);
        const latest = result.data;
        if (!active || !latest) return;

        if (latest.status) {
          setPaymentStatus(latest.status);
        }
        if (latest.invoice_id) {
          setInvoiceId(Number(latest.invoice_id));
        }
      } catch (err) {
        console.error("Gagal polling status payment:", err);
      }
    };

    void refreshPaymentStatus();
    const interval = window.setInterval(refreshPaymentStatus, 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [paymentId, paymentNumber, createdOrderId, paymentStatus]);

  /* =========================================================
     CALCULATIONS (WITH DURATION MULTIPLIER)
  ========================================================= */
  const unitBasePrice = useMemo(() => {
    if (!checkout || !checkout.items[0]) return 150000;
    return Number(checkout.items[0].price) || 150000;
  }, [checkout]);

  const subtotal = useMemo(() => {
    return unitBasePrice * durationYears;
  }, [unitBasePrice, durationYears]);

  // Applied Promo Struct
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    percent?: number;
    fixed?: number;
    label?: string;
  } | null>(null);

  const couponDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.percent !== undefined) {
      return Math.round((subtotal * appliedPromo.percent) / 100);
    }
    if (appliedPromo.fixed !== undefined) {
      return Math.min(appliedPromo.fixed, subtotal);
    }
    return 0;
  }, [appliedPromo, subtotal]);

  const couponApplied = Boolean(appliedPromo);

  const afterDiscount = useMemo(() => {
    return Math.max(0, subtotal - couponDiscount);
  }, [subtotal, couponDiscount]);

  const ppn = useMemo(() => {
    return Math.round(afterDiscount * 0.11);
  }, [afterDiscount]);

  const calculatedTotal = useMemo(() => {
    return afterDiscount + ppn;
  }, [afterDiscount, ppn]);

  /* =========================================================
     APPLY VOUCHER
  ========================================================= */
  const handleApplyCoupon = async () => {
    const trimmed = couponCode.trim();
    if (!trimmed) {
      setCouponError("Silakan masukkan kode promo / voucher.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      setCouponMessage("");

      const upper = trimmed.toUpperCase().replace(/\s+/g, "");
      let percent: number | undefined = undefined;
      let fixed: number | undefined = undefined;
      let promoLabel = "";

      // 1. Try server-side validation first
      try {
        const response = await fetch(COUPON_VALIDATE_API, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            code: trimmed,
            coupon_code: trimmed,
            subtotal: subtotal,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === "success") {
            const rawDiscount = Number(result.data?.discount) || Number(result.data?.discount_amount) || 0;
            const couponObj = result.data?.coupon;

            if (couponObj) {
              const cType = String(couponObj.discount_type || "").toLowerCase();
              const cVal = Number(couponObj.discount_value || couponObj.value || 0);
              if (cType.includes("percent") && cVal > 0) {
                percent = cVal;
              } else if (cVal > 0) {
                fixed = cVal;
              }
            }

            if (!percent && rawDiscount > 0) {
              fixed = rawDiscount;
            }

            if (result.message && typeof result.message === "string") {
              promoLabel = result.message;
            }
          }
        }
      } catch {
        // Fallback to client-side rule evaluation
      }

      // 2. Dynamic regex match for DISKON10, DISKON20, DISKON30, DISKON40, DISKON50, etc.
      if ((percent === undefined || percent <= 0) && (fixed === undefined || fixed <= 0)) {
        const matchNumber = upper.match(/^(?:DISKON|PROMO|HOSTING|HEMAT|POTONGAN|VOUCHER)(\d+)$/);
        if (matchNumber) {
          const val = parseInt(matchNumber[1], 10);
          if (val > 0 && val <= 100) {
            percent = val;
          }
        }
      }

      // 3. Predefined promo codes dictionary
      if ((percent === undefined || percent <= 0) && (fixed === undefined || fixed <= 0)) {
        const promoMap: Record<string, { percent?: number; fixed?: number }> = {
          DISKON10: { percent: 10 },
          DISKON20: { percent: 20 },
          DISKON30: { percent: 30 },
          DISKON40: { percent: 40 },
          DISKON50: { percent: 50 },
          DISKON60: { percent: 60 },
          DISKON70: { percent: 70 },
          DISKON80: { percent: 80 },
          DISKON90: { percent: 90 },
          PROMO10: { percent: 10 },
          PROMO20: { percent: 20 },
          PROMO30: { percent: 30 },
          PROMO40: { percent: 40 },
          PROMO50: { percent: 50 },
          HOSTING10: { percent: 10 },
          HOSTING20: { percent: 20 },
          HOSTING30: { percent: 30 },
          HOSTING40: { percent: 40 },
          HOSTING50: { percent: 50 },
          HEMAT10: { percent: 10 },
          HEMAT20: { percent: 20 },
          HEMAT30: { percent: 30 },
          HEMAT40: { percent: 40 },
          HEMAT50: { percent: 50 },
          HOSTINGWEB: { fixed: 25000 },
        };

        if (promoMap[upper]) {
          percent = promoMap[upper].percent;
          fixed = promoMap[upper].fixed;
        }
      }

      // If valid discount was found
      if ((percent !== undefined && percent > 0) || (fixed !== undefined && fixed > 0)) {
        const displayLabel = percent !== undefined ? `Diskon ${percent}%` : `Potongan ${rupiah(fixed)}`;
        setAppliedPromo({
          code: upper,
          percent,
          fixed,
          label: displayLabel,
        });
        setCouponMessage(`🎉 Promo ${upper} (${displayLabel}) berhasil diterapkan!`);
        setCouponError("");
        setCouponLoading(false);
        return;
      }

      setCouponError(`Kode promo "${trimmed}" tidak valid atau tidak ditemukan.`);
      setAppliedPromo(null);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Gagal menerapkan promo.");
      setAppliedPromo(null);
    } finally {
      setCouponLoading(false);
    }
  };

  /* =========================================================
     CREATE ORDER
  ========================================================= */
  const handleCreateOrder = async () => {
    if (!checkout) return;

    try {
      setSubmitting(true);
      setError("");

      const packageName =
        typeParam === "website" || (packageParam && packageParam.toLowerCase().includes("website"))
          ? packageParam || "Jasa Pembuatan Website"
          : (seoParam || typeParam === "seo")
          ? (seoParam || packageParam || "Paket Jasa SEO")
          : adsParam && GOOGLE_ADS_PACKAGES[adsParam]
          ? (GOOGLE_ADS_CLEAN_NAMES[adsParam] || "Google Ads Paket")
          : paketParam
          ? HOSTING_PACKAGES[paketParam]?.name
          : null;

      const payload = {
        coupon_code: couponApplied ? couponCode.trim() : null,
        payment_method: "transfer",
        package_name: packageName,
        duration_years: durationYears,
        domain_name: domainParam || (packageName ? packageName : (checkout.items[0]?.domain_name ?? null)),
        price: unitBasePrice,
      };

      const response = await fetch(ORDER_CREATE_API, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await readApiResponse<OrderResponse>(response);

      if (
        response.status === 401 ||
        response.status === 403 ||
        (result && result.status !== "success" && (
          result.message?.toLowerCase().includes("login") ||
          result.message?.toLowerCase().includes("auth") ||
          result.code === 401
        ))
      ) {
        redirectToLogin();
        return;
      }

      if (!response.ok || result.status !== "success" || !result.data) {
        throw new Error(result.message || "Gagal membuat pesanan di database.");
      }

      const orderData = result.data;
      const orderId = Number(orderData.order_id);
      const orderNumber = String(orderData.order_number || (orderId ? `ORD-${orderId}` : ""));

      setCreatedOrderId(orderId);
      setCreatedOrderNumber(orderNumber);

      const finalPaymentId = Number(orderData.payment_id || orderId);
      const finalPaymentNumber = String(orderData.payment_number || (orderNumber ? `PAY-${orderNumber}` : ""));
      const finalAmount = orderData.total ? Number(orderData.total) : calculatedTotal;

      setPaymentId(finalPaymentId);
      setPaymentNumber(finalPaymentNumber);
      setPaymentAmount(finalAmount);
      setPaymentStatus("pending");

      localStorage.setItem(
        "hostingweb_checkout_payment",
        JSON.stringify({
          paymentId: finalPaymentId,
          paymentNumber: finalPaymentNumber,
          orderId: orderId,
          orderNumber: orderNumber,
          amount: finalAmount,
          itemName: checkout.items[0]?.domain_name || "Layanan HostingWeb",
          itemSpecs: checkout.items[0]?.extension || "Paket Layanan",
          durationYears: durationYears,
          subtotal: subtotal,
          ppn: ppn,
        } satisfies SavedCheckoutPayment)
      );

      setOrderSuccess("Pesanan berhasil dibuat dan menunggu pembayaran.");
    } catch (err) {
      console.error("Create Order Error:", err);
      const errMsg = err instanceof Error ? err.message : "Tidak dapat membuat pesanan.";
      if (errMsg.toLowerCase().includes("login") || errMsg.toLowerCase().includes("auth")) {
        redirectToLogin();
        return;
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     COPY ACCOUNT NUMBER
  ========================================================= */
  const handleCopyAccount = (number: string, bank: string) => {
    navigator.clipboard.writeText(number.replace(/[^0-9]/g, ""));
    setCopiedAccount(bank);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  /* =========================================================
     TOGGLE PAYMENT CONFIRMATION & NOTIFY BACKEND
  ========================================================= */
  const handleToggleConfirmation = async () => {
    const nextVal = !isRobotVerified;
    setIsRobotVerified(nextVal);
    if (nextVal) {
      try {
        const payload = {
          payment_id: paymentId,
          order_id: createdOrderId,
          payment_number: paymentNumber,
        };
        await fetch(`${SITE_CONFIG.apiUrl}/payment/request-confirmation.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Gagal kirim notifikasi konfirmasi ke backend:", err);
      }
    }
  };

  /* =========================================================
     WHATSAPP LINK & BACKEND CONFIRMATION
  ========================================================= */
  const handleConfirmPaymentWA = async () => {
    try {
      const payload = {
        payment_id: paymentId,
        order_id: createdOrderId,
        payment_number: paymentNumber,
      };
      await fetch(`${SITE_CONFIG.apiUrl}/payment/request-confirmation.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Gagal kirim notifikasi konfirmasi ke backend:", err);
    }
  };

  const whatsappUrl = useMemo(() => {
    const ordNum = createdOrderNumber || "ORD-TERBARU";
    const payNum = paymentNumber || "PAY-TERBARU";
    const amt = rupiah(calculatedTotal);
    const text = `Halo Admin HostingWeb, saya ingin konfirmasi pembayaran untuk:\n- Nomor Order: ${ordNum}\n- Nomor Payment: ${payNum}\n- Total: ${amt}\n- Durasi: ${durationYears} Tahun\n\nBerikut saya lampirkan bukti struk transfer. Mohon bantuannya untuk diproses dan diaktifkan. Terima kasih!`;
    return getWhatsAppUrl(text);
  }, [createdOrderNumber, paymentNumber, calculatedTotal, durationYears]);

  if (loading) {
    return (
      <div className="checkout-loading-screen">
        <div className="checkout-spinner" />
        <span>Memuat data checkout...</span>
      </div>
    );
  }

  const isOrderPlaced = Boolean(paymentNumber || createdOrderNumber);
  const primaryItem = checkout?.items[0];
  const displayTotal = calculatedTotal;

  return (
    <main className="unified-checkout-page">
      <div className="unified-container">
        {/* TOP SUCCESS BANNER */}
        <div className="unified-success-banner">
          <div className="banner-left">
            <span className="banner-icon-badge">✓</span>
            <div>
              <strong className="banner-title">Pesanan berhasil dibuat</strong>
              <p className="banner-subtitle">
                Pesanan kamu telah dibuat dan menunggu pembayaran.
              </p>
            </div>
          </div>
          <div className="banner-right">
            <div className="banner-meta-pill">
              <span className="pill-label">Nomor Order</span>
              <strong className="pill-val">{createdOrderNumber || "ORD-TERBARU"}</strong>
            </div>
            <div className="banner-meta-pill">
              <span className="pill-label">Order ID</span>
              <strong className="pill-val">#{createdOrderId || "1"}</strong>
            </div>
          </div>
        </div>

        {error && !error.toLowerCase().includes("login") && (
          <div className="checkout-error-alert">⚠️ {error}</div>
        )}

        {/* MAIN 2-COLUMN GRID (UNIFIED LAYOUT) */}
        <div className="unified-grid">
          {/* ===================================================
              LEFT COLUMN (65% - 68%)
          =================================================== */}
          <div className="unified-left-column">
            {/* PAYMENT INSTRUCTIONS & BANK ACCOUNTS */}
            <div className="unified-card payment-instructions-card">
              {/* PAYMENT HEADER */}
              <div className="payment-card-header">
                <div>
                  <span className="card-eyebrow">PEMBAYARAN</span>
                  <h2 className="card-main-title">
                    {paymentStatus.toLowerCase() === "paid"
                      ? "Pembayaran Berhasil Diverifikasi"
                      : "Selesaikan Pembayaran"}
                  </h2>
                  <p className="card-sub-title">
                    {paymentStatus.toLowerCase() === "paid"
                      ? "Layanan dan hosting kamu sudah aktif dan dapat digunakan."
                      : "Transfer sesuai nominal pembayaran ke salah satu rekening berikut."}
                  </p>
                </div>
                <div
                  className={`payment-live-badge ${
                    paymentStatus.toLowerCase() === "paid" ? "paid" : "pending"
                  }`}
                >
                  <span className="pulse-dot" />
                  {paymentStatus.toLowerCase() === "paid"
                    ? "Pembayaran Dikonfirmasi"
                    : "Menunggu Pembayaran"}
                </div>
              </div>

              {/* 3 HIGHLIGHT BOXES */}
              <div className="payment-highlights-row">
                <div className="highlight-box total-box">
                  <span className="hl-label">TOTAL PEMBAYARAN</span>
                  <strong className="hl-val-price">{rupiah(displayTotal)}</strong>
                  <span className="hl-note">*Termasuk PPN 11%</span>
                </div>
                <div className="highlight-box">
                  <span className="hl-label">Nomor Order</span>
                  <strong className="hl-val-code">{createdOrderNumber}</strong>
                  <span className="hl-note">ID #{createdOrderId}</span>
                </div>
                <div className="highlight-box">
                  <span className="hl-label">Nomor Payment</span>
                  <strong className="hl-val-code">{paymentNumber}</strong>
                  <span className="hl-note">Transfer Bank Manual</span>
                </div>
              </div>

              {/* INFORMASI LAYANAN DENGAN DURASI DOMAIN */}
              <div className="service-info-section">
                <span className="section-eyebrow">INFORMASI LAYANAN</span>
                <div className="service-item-box">
                  <div className="service-item-left">
                    <div className="service-icon-wrap">
                      {paketParam
                        ? "🔥"
                        : adsParam
                        ? "🎯"
                        : seoParam || typeParam === "seo"
                        ? "🚀"
                        : typeParam === "website" || (packageParam && packageParam.toLowerCase().includes("website"))
                        ? "💻"
                        : "🌐"}
                    </div>
                    <div>
                      <div className="service-title-row">
                        <strong className="service-name">
                          {primaryItem?.domain_name || "Cloud Hosting & Domain"}
                        </strong>
                        <span className="service-tag">
                          {paketParam
                            ? "Hosting"
                            : adsParam
                            ? "Google Ads"
                            : seoParam || typeParam === "seo"
                            ? "SEO"
                            : typeParam === "website" || (packageParam && packageParam.toLowerCase().includes("website"))
                            ? "Website"
                            : primaryItem?.domain_name?.includes(".")
                            ? `.${primaryItem.domain_name.split(".").pop()}`
                            : "Domain"}
                        </span>
                      </div>
                      <p className="service-desc">
                        {primaryItem?.extension || `Pendaftaran Domain ${durationYears} Tahun`}
                      </p>
                    </div>
                  </div>

                  {/* DURASI DROPDOWN & PRICE */}
                  <div className="service-item-right">
                    <div className="duration-dropdown-wrap">
                      <label className="duration-mini-label">Durasi Domain</label>
                      <div className="duration-select-pill">
                        <select
                          className="duration-select"
                          value={durationYears}
                          onChange={(e) => setDurationYears(Number(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((yr) => (
                            <option key={yr} value={yr}>
                              {yr} Tahun
                            </option>
                          ))}
                        </select>
                        <span className="select-arrow">▼</span>
                      </div>
                    </div>
                    <strong className="service-price">
                      {rupiah(subtotal)}
                    </strong>
                  </div>
                </div>
              </div>

              {paymentStatus.toLowerCase() === "paid" ? (
                <div className="p-6 my-4 bg-gradient-to-b from-emerald-50/80 to-white border border-emerald-200 rounded-2xl text-center space-y-4 shadow-sm animate-fade-in">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-md ring-4 ring-emerald-100">
                    ✓
                  </div>
                  <div>
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1.5">
                      Admin Confirmed &amp; Live Server
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Selamat! Hosting Anda Sudah Dikonfirmasi Admin 🎉
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 max-w-lg mx-auto">
                      Infrastruktur NVMe High-Speed &amp; cPanel Anda telah dialokasikan dan aktif 100% di server, siap digunakan untuk website Anda.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-w-md mx-auto pt-2 text-left">
                    <div className="p-3.5 bg-white rounded-xl border border-emerald-200/70 shadow-sm">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Layanan</span>
                      <strong className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Aktif (Online)
                      </strong>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-emerald-200/70 shadow-sm">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Alamat IP Server</span>
                      <strong className="text-slate-900 font-mono text-sm">103.147.154.21</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Link
                      href="/dashboard/hosting"
                      className="py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      🚀 Kelola Layanan Hosting Sekarang →
                    </Link>
                    <Link
                      href={`/dashboard/invoices${invoiceId ? `?id=${invoiceId}` : ''}`}
                      className="py-3 px-6 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      📄 Unduh Invoice Resmi
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* REKENING PEMBAYARAN */}
                  <div className="bank-transfer-section">
                    <div className="bank-section-header">
                      <div>
                        <span className="section-eyebrow">METODE TRANSFER</span>
                        <h3 className="section-title">Rekening Pembayaran</h3>
                        <p className="section-desc">
                          Transfer sesuai nominal pembayaran ke salah satu rekening berikut:
                        </p>
                      </div>
                      <div className="bank-owner-pill">
                        <span>Atas Nama:</span>
                        <strong>Irwanto</strong>
                      </div>
                    </div>

                    {/* BANK ROWS */}
                    <div className="bank-rows-list">
                      {BANK_ACCOUNTS.map((bank) => (
                        <div key={bank.name} className="bank-card-row">
                          <div className="bank-logo-wrap">
                            <img src={bank.logo} alt={bank.name} />
                          </div>
                          <div className="bank-info-col">
                            <span className="bank-col-label">Nomor Rekening Bank {bank.name}</span>
                            <strong className="bank-number">{bank.accountNumber}</strong>
                          </div>
                          <div className="bank-status-col">
                            <span className="bank-auto-check">
                              <span className="dot-green" /> {bank.status}
                            </span>
                            <small className="bank-owner-text">a.n {bank.owner}</small>
                          </div>
                          <button
                            type="button"
                            className={`btn-copy-account ${copiedAccount === bank.name ? "copied" : ""}`}
                            onClick={() => handleCopyAccount(bank.accountNumber, bank.name)}
                          >
                            {copiedAccount === bank.name ? "✓ Tersalin" : "⧉ Salin"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NOTICE BOXES */}
                  <div className="notices-wrap">
                    <div className="notice-box warning">
                      <span className="notice-icon">⚠️</span>
                      <div>
                        <strong>TRANSFER SESUAI NOMINAL TEPAT</strong>
                        <p>
                          Pastikan nominal transfer tepat hingga digit terakhir (<strong>{rupiah(displayTotal)}</strong>) untuk mempercepat verifikasi otomatis sistem.
                        </p>
                      </div>
                    </div>

                    <div className="notice-box info">
                      <span className="notice-icon">ℹ️</span>
                      <div>
                        <strong>PEMBAYARAN 1-GATE</strong>
                        <p>
                          Simpan bukti struk transfer kamu. Sistem otomatis memproses pesanan begitu dana berhasil diverifikasi oleh admin.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DISCLAIMER & TRANSFER ACCURACY BANNER */}
                  <div className="whatsapp-cta-box">
                    <div className="wa-text-col">
                      <div className="wa-warning-badge">
                        <span className="badge-warn-icon">⚠️</span>
                        <strong>PENTING: Cek Kembali Rekening & Nominal Transfer</strong>
                      </div>
                      <p>
                        Pastikan nomor rekening, bank tujuan, dan nominal sudah <strong>100% tepat</strong> sebelum menyelesaikan pembayaran. <em>Segala kelalaian atau kesalahan transfer ke rekening lain bukan merupakan tanggung jawab pihak admin.</em> Simpan struk resmi Anda & konfirmasikan untuk aktivasi kilat!
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ===================================================
              RIGHT COLUMN (ORDER SUMMARY STICKY)
          =================================================== */}
          <aside className="unified-right-column">
            <div className="unified-card order-summary-card">
              <span className="summary-eyebrow">ORDER SUMMARY</span>
              <h2 className="summary-title">Ringkasan Pembayaran</h2>

              {/* LINE ITEMS BREAKDOWN */}
              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Subtotal ({durationYears} Tahun)</span>
                  <strong>{rupiah(subtotal)}</strong>
                </div>

                {couponDiscount > 0 && (
                  <div className="summary-row discount-row">
                    <span className="text-emerald-600 font-semibold">Diskon Promo</span>
                    <strong className="text-emerald-600">-{rupiah(couponDiscount)}</strong>
                  </div>
                )}

                <div className="summary-row">
                  <span>Setelah Diskon</span>
                  <strong>{rupiah(afterDiscount)}</strong>
                </div>

                <div className="summary-row">
                  <span>PPN (11%)</span>
                  <strong>{rupiah(ppn)}</strong>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total-row">
                  <span>Total</span>
                  <strong className="total-highlight-amount">{rupiah(displayTotal)}</strong>
                </div>
              </div>

              {/* PROMO CODE TRIGGER ("Punya kode promo? Klik disini untuk pakai") */}
              <div className="promo-toggle-container">
                {!couponApplied ? (
                  <div className="promo-trigger-line">
                    <span className="promo-green-label">Punya kode promo?</span>{" "}
                    <button
                      type="button"
                      className="promo-action-link"
                      onClick={() => setShowPromoInput(!showPromoInput)}
                    >
                      Klik disini untuk pakai
                    </button>
                  </div>
                ) : (
                  <div className="promo-applied-pill">
                    <span>🎉 Promo <strong>{appliedPromo?.code || couponCode}</strong> ({appliedPromo?.label || "Diterapkan"})</span>
                    <button
                      type="button"
                      className="btn-remove-promo"
                      onClick={() => {
                        setAppliedPromo(null);
                        setCouponMessage("");
                        setCouponError("");
                        setCouponCode("");
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                )}

                {/* EXPANDABLE PROMO INPUT */}
                {showPromoInput && !couponApplied && (
                  <div className="promo-input-expanded">
                    <div className="voucher-input-group">
                      <input
                        type="text"
                        className="voucher-input"
                        placeholder="Masukkan kode promo"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <button
                        type="button"
                        className="btn-apply-voucher"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? "..." : "Pakai"}
                      </button>
                    </div>
                  </div>
                )}

                {couponError && <span className="voucher-error">{couponError}</span>}
                {couponMessage && <span className="voucher-success">{couponMessage}</span>}
              </div>

              {/* ACTION BUTTON & CAPTCHA SECURITY */}
              <div className="order-placed-actions">
                {paymentStatus.toLowerCase() === "paid" ? (
                  <div className="rounded-2xl bg-gradient-to-b from-emerald-50/90 via-teal-50/50 to-emerald-100/40 border border-emerald-300/80 p-5 text-center shadow-sm space-y-3.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Transaksi Terverifikasi Resmi</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                        Server Cloud Siap Digunakan 🚀
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                        Alokasi resource hosting NVMe dan domain Anda telah selesai dikonfigurasi &amp; aktif penuh.
                      </p>
                    </div>

                    <div className="pt-1.5">
                      <Link
                        href="/dashboard/hosting"
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-700/25 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 no-underline"
                        style={{ color: "#ffffff", textDecoration: "none" }}
                      >
                        <span className="text-sm">⚡</span>
                        <span className="tracking-wide">Masuk ke Dashboard Hosting →</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* KONFIRMASI PEMBAYARAN INTERAKTIF */}
                    <div
                      className={`payment-confirm-card ${isRobotVerified ? "verified" : ""}`}
                      onClick={handleToggleConfirmation}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          void handleToggleConfirmation();
                        }
                      }}
                    >
                      <div className="payment-confirm-left">
                        <div className={`payment-confirm-box ${isRobotVerified ? "checked" : ""}`}>
                          {isRobotVerified && <span className="payment-confirm-icon">✓</span>}
                        </div>
                        <div className="payment-confirm-content">
                          <strong className="payment-confirm-title">
                            Saya telah melakukan pembayaran & siap konfirmasi
                          </strong>
                          <p className="payment-confirm-desc">
                            Centang di sini jika Anda sudah mentransfer pembayaran sesuai nominal.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* WHATSAPP ACTION BUTTON (LOCKED UNTIL CONFIRMED) */}
                    <a
                      href={isRobotVerified ? whatsappUrl : undefined}
                      target={isRobotVerified ? "_blank" : undefined}
                      rel={isRobotVerified ? "noopener noreferrer" : undefined}
                      className={`btn-checkout-primary whatsapp-btn ${!isRobotVerified ? "btn-locked-wa" : ""}`}
                      onClick={(e) => {
                        if (!isRobotVerified) {
                          e.preventDefault();
                        } else {
                          void handleConfirmPaymentWA();
                        }
                      }}
                      title={!isRobotVerified ? "Centang konfirmasi pembayaran di atas terlebih dahulu" : "Kirim struk konfirmasi ke WhatsApp"}
                    >
                      {isRobotVerified ? "Sudah Bayar? Konfirmasi WA →" : "🔒 Centang Konfirmasi untuk Lanjut ke WA"}
                    </a>

                    {!isRobotVerified && (
                      <div className="captcha-helper-warning">
                        <span>ℹ️ Centang kotak di atas jika sudah melakukan transfer agar tombol WhatsApp aktif.</span>
                      </div>
                    )}

                    <div className="timer-countdown-box">
                      <span className="timer-label">SELESAIKAN PEMBAYARAN DALAM</span>
                      <strong className="timer-digits">{formattedTimeLeft}</strong>
                    </div>
                  </>
                )}
              </div>

              {/* TRUST & SECURITY BADGES */}
              <div className="summary-trust-footer">
                <div className="trust-item">
                  <span>🔒</span>
                  <span>256-Bit SSL Enkripsi Aman</span>
                </div>
                <div className="trust-item">
                  <span>⚡</span>
                  <span>Aktivasi Cepat & Garansi Layanan</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .unified-checkout-page {
          min-height: 100vh;
          background: #f8fafc;
          background-image: 
            radial-gradient(at 50% 0%, rgba(249, 115, 22, 0.05) 0px, transparent 60%),
            radial-gradient(at 100% 100%, rgba(239, 68, 68, 0.02) 0px, transparent 50%);
          padding: 40px 16px 80px 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
        }

        .unified-container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .checkout-loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: #f8fafc;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
        }

        .checkout-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #ea580c;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* SUCCESS BANNER */
        .unified-success-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0fdf4;
          border: 1.5px solid #bbf7d0;
          border-radius: 16px;
          padding: 16px 22px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.06);
        }

        .banner-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .banner-icon-badge {
          width: 34px;
          height: 34px;
          background: #16a34a;
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .banner-title {
          font-size: 16px;
          color: #15803d;
          display: block;
        }

        .banner-subtitle {
          font-size: 13px;
          color: #166534;
          margin: 2px 0 0 0;
        }

        .banner-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .banner-meta-pill {
          background: #ffffff;
          border: 1px solid #bbf7d0;
          padding: 6px 14px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .pill-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .pill-val {
          font-size: 13px;
          color: #0f172a;
          font-family: monospace;
        }

        /* HEADING */
        .checkout-page-heading {
          margin-bottom: 24px;
        }

        .heading-eyebrow {
          font-size: 11.5px;
          font-weight: 800;
          color: #ea580c;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .heading-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin: 4px 0;
          letter-spacing: -0.02em;
        }

        .heading-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .checkout-error-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13.5px;
          margin-bottom: 20px;
        }

        /* MAIN 2-COLUMN GRID */
        .unified-grid {
          display: grid;
          grid-template-columns: 1fr 370px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 960px) {
          .unified-grid {
            grid-template-columns: 1fr;
          }
        }

        /* CARDS */
        .unified-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 28px 26px;
          box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.05);
        }

        .card-eyebrow, .section-eyebrow, .summary-eyebrow {
          font-size: 11px;
          font-weight: 800;
          color: #ea580c;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 4px;
        }

        .card-main-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }

        .card-sub-title {
          font-size: 13.5px;
          color: #64748b;
          margin: 0;
        }

        .payment-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .payment-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .payment-live-badge.pending {
          background: #fff7ed;
          border: 1px solid #ffedd5;
          color: #c2410c;
        }

        .payment-live-badge.paid {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          background: #ea580c;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .payment-live-badge.paid .pulse-dot {
          background: #16a34a;
        }

        /* 3 HIGHLIGHT BOXES */
        .payment-highlights-row {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr;
          gap: 14px;
          margin: 20px 0;
        }

        @media (max-width: 640px) {
          .payment-highlights-row {
            grid-template-columns: 1fr;
          }
        }

        .highlight-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
        }

        .highlight-box.total-box {
          background: #fff7ed;
          border-color: #fed7aa;
        }

        .hl-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .highlight-box.total-box .hl-label {
          color: #c2410c;
        }

        .hl-val-price {
          font-size: 22px;
          font-weight: 800;
          color: #ea580c;
          margin: 4px 0 2px 0;
        }

        .hl-val-code {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 4px 0 2px 0;
          font-family: monospace;
        }

        .hl-note {
          font-size: 11px;
          color: #94a3b8;
        }

        /* INFORMASI LAYANAN */
        .service-info-section {
          margin: 22px 0;
        }

        .service-item-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 18px;
          margin-top: 8px;
          gap: 14px;
          flex-wrap: wrap;
        }

        .service-item-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
        }

        .service-item-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .service-icon-wrap {
          width: 40px;
          height: 40px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .service-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .service-name {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
        }

        .service-tag {
          background: #ffedd5;
          color: #c2410c;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .service-desc {
          font-size: 12.5px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .service-price {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        /* DURATION DROPDOWN SELECTOR */
        .duration-dropdown-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .duration-mini-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .duration-select-pill {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .duration-select {
          appearance: none;
          -webkit-appearance: none;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #0f172a;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 28px 6px 12px;
          border-radius: 10px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s ease;
        }

        .duration-select:focus {
          border-color: #ea580c;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.15);
        }

        .select-arrow {
          position: absolute;
          right: 10px;
          font-size: 8px;
          color: #64748b;
          pointer-events: none;
        }

        /* BANK TRANSFER SECTION */
        .bank-transfer-section {
          margin-top: 24px;
        }

        .bank-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
          margin: 2px 0 4px 0;
        }

        .section-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .bank-owner-pill {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
          color: #475569;
          display: flex;
          gap: 6px;
          white-space: nowrap;
        }

        .bank-owner-pill strong {
          color: #0f172a;
        }

        .bank-rows-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .bank-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px 20px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          gap: 16px;
          position: relative;
        }

        .bank-card-row:hover {
          border-color: #ea580c;
          background: linear-gradient(to right, #ffffff, #fffaf5);
          box-shadow: 0 8px 24px -4px rgba(234, 88, 12, 0.12), 0 2px 6px -1px rgba(234, 88, 12, 0.06);
          transform: translateY(-2px);
        }

        .bank-logo-wrap {
          width: 96px;
          height: 52px;
          min-width: 96px;
          background: #ffffff;
          border: 1.5px solid #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
        }

        .bank-card-row:hover .bank-logo-wrap {
          border-color: #fed7aa;
          box-shadow: 0 4px 10px rgba(234, 88, 12, 0.08);
        }

        .bank-logo-wrap img {
          max-height: 38px;
          max-width: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04));
        }

        .bank-info-col {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 170px;
        }

        .bank-col-label {
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .bank-number {
          font-size: 19px;
          font-weight: 800;
          color: #0f172a;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          letter-spacing: 0.06em;
          line-height: 1.2;
        }

        .bank-status-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .bank-auto-check {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #059669;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          padding: 3px 9px;
          border-radius: 20px;
          box-shadow: 0 1px 2px rgba(5, 150, 105, 0.06);
        }

        .dot-green {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
        }

        .bank-owner-text {
          font-size: 11.5px;
          color: #64748b;
          font-weight: 600;
        }

        .btn-copy-account {
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          color: #334155;
          font-size: 12.5px;
          font-weight: 800;
          padding: 8px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .btn-copy-account:hover {
          background: #ea580c;
          border-color: #ea580c;
          color: #ffffff;
          transform: scale(1.03);
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.3);
        }

        .btn-copy-account.copied {
          background: #059669;
          border-color: #059669;
          color: #ffffff;
          transform: scale(1.03);
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
        }

        /* NOTICES */
        .notices-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 20px 0;
        }

        .notice-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 12.5px;
          line-height: 1.45;
        }

        .notice-box.warning {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
        }

        .notice-box.info {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          color: #0369a1;
        }

        .notice-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .notice-box p {
          margin: 2px 0 0 0;
          font-weight: 400;
        }

        /* WHATSAPP CTA */
        .whatsapp-cta-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fffbeb;
          border: 1.5px solid #fde68a;
          border-left: 5px solid #f59e0b;
          border-radius: 14px;
          padding: 16px 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .wa-text-col {
          flex: 1;
          min-width: 260px;
        }

        .wa-warning-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .wa-warning-badge .badge-warn-icon {
          font-size: 15px;
        }

        .wa-warning-badge strong {
          font-size: 13.5px;
          color: #92400e;
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .wa-text-col p {
          font-size: 12.5px;
          color: #78350f;
          line-height: 1.55;
          margin: 0;
        }

        .wa-text-col p strong {
          color: #92400e;
          font-weight: 700;
        }

        .wa-text-col p em {
          color: #b45309;
          font-style: normal;
          font-weight: 600;
          background: rgba(245, 158, 11, 0.12);
          padding: 1px 4px;
          border-radius: 4px;
        }

        .btn-whatsapp-action {
          background: #16a34a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          padding: 11px 18px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-whatsapp-action:hover {
          background: #15803d;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
        }

        /* PRE-ORDER REVIEW ITEMS */
        .order-review-card .review-items-list {
          margin-top: 18px;
        }

        .review-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          gap: 14px;
          flex-wrap: wrap;
        }

        .item-info-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
        }

        .item-action-right {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .item-type-icon {
          width: 40px;
          height: 40px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .item-name-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .item-name-badge strong {
          font-size: 16px;
          color: #0f172a;
        }

        .item-tag {
          background: #ffedd5;
          color: #c2410c;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
        }

        .item-sub-specs {
          font-size: 12.5px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .item-price-val {
          font-size: 17px;
          color: #0f172a;
          font-weight: 800;
        }

        /* RIGHT COLUMN / ORDER SUMMARY */
        .order-summary-card {
          position: sticky;
          top: 24px;
        }

        .summary-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 16px 0;
        }

        /* PROMO CODE TOGGLE */
        .promo-toggle-container {
          margin: 16px 0;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
        }

        .promo-trigger-line {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .promo-green-label {
          color: #16a34a;
          font-weight: 700;
        }

        .promo-action-link {
          background: none;
          border: none;
          color: #ea580c;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        .promo-action-link:hover {
          color: #c2410c;
        }

        .promo-applied-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0fdf4;
          border: 1px solid #86efac;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          color: #166534;
        }

        .btn-remove-promo {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        .promo-input-expanded {
          margin-top: 10px;
        }

        .voucher-input-group {
          display: flex;
          gap: 8px;
        }

        .voucher-input {
          flex: 1;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 13px;
          color: #0f172a;
          outline: none;
          font-weight: 600;
        }

        .voucher-input:focus {
          border-color: #ea580c;
          background: #ffffff;
        }

        .btn-apply-voucher {
          background: #ea580c;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-apply-voucher:hover:not(:disabled) {
          background: #c2410c;
        }

        .btn-apply-voucher:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .voucher-error {
          font-size: 11.5px;
          color: #ef4444;
          margin-top: 4px;
          display: block;
        }

        .voucher-success {
          font-size: 11.5px;
          color: #16a34a;
          margin-top: 4px;
          display: block;
          font-weight: 600;
        }

        /* BREAKDOWN */
        .summary-breakdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13.5px;
          color: #475569;
        }

        .summary-row strong {
          color: #0f172a;
        }

        .summary-row.discount-row {
          background: #f0fdf4;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .summary-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 6px 0;
        }

        .total-row {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .total-highlight-amount {
          font-size: 22px;
          font-weight: 900;
          color: #ea580c;
        }

        /* BUTTONS */
        .btn-checkout-primary {
          width: 100%;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          border: none;
          padding: 13px 20px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);
          margin-top: 14px;
          text-align: center;
          display: inline-block;
          text-decoration: none;
        }

        .btn-checkout-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(234, 88, 12, 0.45);
        }

        .btn-checkout-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-checkout-primary.whatsapp-btn {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          box-shadow: 0 6px 20px rgba(22, 163, 74, 0.35);
        }

        .btn-checkout-primary.whatsapp-btn:hover {
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.45);
        }

        /* LOCKED STATE WHEN CAPTCHA NOT CHECKED */
        .btn-checkout-primary.whatsapp-btn.btn-locked-wa {
          background: #cbd5e1 !important;
          color: #64748b !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
          transform: none !important;
          opacity: 0.85;
        }

        /* PAYMENT CONFIRMATION CARD */
        .payment-confirm-card {
          margin-top: 14px;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px 14px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
        }

        .payment-confirm-card:hover {
          background: #ffffff;
          border-color: #94a3b8;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
        }

        .payment-confirm-card.verified {
          background: #f0fdf4;
          border-color: #86efac;
          box-shadow: 0 3px 10px rgba(22, 163, 74, 0.08);
        }

        .payment-confirm-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .payment-confirm-box {
          width: 24px;
          height: 24px;
          border: 2px solid #94a3b8;
          border-radius: 6px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .payment-confirm-card:hover .payment-confirm-box:not(.checked) {
          border-color: #64748b;
        }

        .payment-confirm-box.checked {
          background: #16a34a;
          border-color: #16a34a;
          box-shadow: 0 2px 6px rgba(22, 163, 74, 0.35);
        }

        .payment-confirm-icon {
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          line-height: 1;
        }

        .payment-confirm-content {
          flex: 1;
        }

        .payment-confirm-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #1e293b;
          display: block;
          line-height: 1.4;
          letter-spacing: -0.2px;
        }

        .payment-confirm-card.verified .payment-confirm-title {
          color: #15803d;
        }

        .payment-confirm-desc {
          font-size: 11.5px;
          color: #64748b;
          margin: 2px 0 0 0;
          line-height: 1.4;
        }

        .payment-confirm-card.verified .payment-confirm-desc {
          color: #166534;
        }

        .captcha-helper-warning {
          margin-top: 8px;
          font-size: 11.5px;
          color: #b45309;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          padding: 6px 10px;
          border-radius: 8px;
          text-align: center;
          line-height: 1.4;
        }

        .timer-countdown-box {
          margin-top: 12px;
          background: #fff7ed;
          border: 1px dashed #fed7aa;
          padding: 10px;
          border-radius: 10px;
          text-align: center;
        }

        .timer-label {
          font-size: 10.5px;
          font-weight: 800;
          color: #c2410c;
          display: block;
          letter-spacing: 0.04em;
        }

        .timer-digits {
          font-size: 18px;
          font-weight: 900;
          color: #ea580c;
          font-family: monospace;
          letter-spacing: 0.05em;
        }

        /* TRUST FOOTER */
        .summary-trust-footer {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: #64748b;
          font-weight: 500;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(0.85);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}