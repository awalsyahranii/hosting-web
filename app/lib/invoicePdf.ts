import { SITE_CONFIG } from "./siteConfig";
import { LOGO_BASE64 } from "./logoBase64";

export interface InvoicePdfData {
  invoice_number: string;
  order_number?: string | number;
  created_at: string;
  due_date: string;
  status: string;
  username: string;
  email: string;
  phone?: string;
  total: number | string;
  subtotal?: number | string;
  ppn?: number | string;
  discount?: number | string;
  items?: Array<{
    id?: number | string;
    domain_name?: string;
    description?: string;
    price: number | string;
  }>;
}

function rupiah(val: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr.replace(" ", "T"));
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function generateInvoiceHtml(data: InvoicePdfData): string {
  const isPaid =
    (data.status || "").toLowerCase() === "paid" ||
    (data.status || "").toLowerCase() === "lunas" ||
    (data.status || "").toLowerCase() === "success" ||
    (data.status || "").toLowerCase() === "completed" ||
    (data.status || "").toLowerCase() === "active";

  const rawTotal = Number(data.total) || 0;
  let subtotal = Number(data.subtotal) || 0;
  let ppn = Number(data.ppn) || 0;

  // Intelligently calculate pre-tax subtotal & PPN if total includes 11% PPN
  if (ppn === 0 && (subtotal === 0 || subtotal === rawTotal) && rawTotal > 0) {
    const baseEstimate = Math.round(rawTotal / 1.11);
    if (Math.round(baseEstimate * 1.11) === rawTotal) {
      subtotal = baseEstimate;
      ppn = rawTotal - baseEstimate;
    } else {
      subtotal = rawTotal;
    }
  } else if (subtotal === 0 && rawTotal > 0) {
    if (ppn > 0) {
      subtotal = rawTotal - ppn;
    } else {
      subtotal = rawTotal;
    }
  }

  // Ensure items display pre-tax prices that sum to subtotal
  let displayItems = data.items && data.items.length > 0 ? [...data.items] : [];

  if (displayItems.length === 0) {
    displayItems = [
      {
        description: "Paket Cloud Server & Infrastruktur Website",
        domain_name: "Paket Bisnis 30 Hari Google Ads (Google Search Campaign)",
        price: subtotal || rawTotal,
      },
    ];
  } else if (displayItems.length === 1) {
    // If single item whose price matches total, adjust to pre-tax subtotal
    const firstItem = { ...displayItems[0] };
    if (Number(firstItem.price) === rawTotal && subtotal > 0 && subtotal !== rawTotal) {
      firstItem.price = subtotal;
    }
    displayItems[0] = firstItem;
  }

  // Ensure invoice number always starts with INV-
  const rawInv = String(data.invoice_number || "").trim();
  let invClean = rawInv.startsWith("PAY-")
    ? rawInv.replace(/^PAY-/, "INV-")
    : rawInv.startsWith("ORD-")
    ? rawInv.replace(/^ORD-/, "INV-")
    : rawInv.startsWith("INV-")
    ? rawInv
    : `INV-${rawInv || "20260913-4B74B4"}`;
  invClean = invClean.replace(/^#+/, "");

  const rawOrder = String(data.order_number || invClean.replace(/^INV-/, "ORD-")).trim().replace(/^#+/, "");
  const cleanOrderNumber = rawOrder.startsWith("ORD-") ? rawOrder : `ORD-${rawOrder}`;

  const authCodeSuffix = (cleanOrderNumber || invClean || "E83560").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Invoice #${invClean} - HostingWebID</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #f8fafc;
      color: #0f172a;
      font-size: 12px;
      line-height: 1.45;
      padding: 16px 12px;
    }
    .print-actions-bar {
      max-width: 800px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .btn-print {
      background: #ea580c;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 12.5px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .btn-print:hover {
      background: #c2410c;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 32px 36px 20px;
      box-shadow: 0 4px 25px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
    }
    .invoice-top-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4.5px;
      background: linear-gradient(90deg, #ef4444 0%, #f97316 35%, #eab308 70%, #10b981 100%);
    }
    
    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 22px;
      padding-top: 4px;
    }
    .brand-block {
      display: flex;
      flex-direction: column;
    }
    .brand-logo-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .brand-logo-row img {
      height: 38px;
      width: auto;
      object-fit: contain;
      display: block;
    }
    .company-info {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.45;
    }
    .company-info strong {
      color: #1e293b;
      font-size: 11.5px;
    }

    /* RIGHT HEADER / INVOICE TITLE & VERIFIED BADGE */
    .invoice-title-block {
      text-align: right;
    }
    .invoice-header-label {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .invoice-no {
      font-size: 23px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    
    .stamp-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 6px;
      width: 100%;
    }
    .rubber-stamp {
      display: block;
      max-width: 145px;
      height: auto;
    }

    /* META GRID */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
    }
    .meta-card-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #ea580c;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .meta-card-title .orange-dot {
      color: #ea580c;
      font-size: 10px;
    }
    .meta-content {
      font-size: 11.5px;
      color: #334155;
      line-height: 1.5;
    }
    .meta-content strong {
      color: #0f172a;
      font-size: 13.5px;
      display: block;
      margin-bottom: 2px;
    }
    .order-id-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 3.5px 10px;
      margin-top: 8px;
    }
    .order-id-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      font-family: sans-serif;
    }
    .order-id-value {
      font-size: 11.5px;
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .info-table td {
      padding: 3.5px 0;
      color: #64748b;
      vertical-align: middle;
    }
    .info-table td:last-child {
      text-align: right;
      font-weight: 700;
      color: #0f172a;
      vertical-align: middle;
    }
    .status-pill-green {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: #dcfce7;
      color: #15803d;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1.5px solid #86efac;
      line-height: 1;
      text-align: center;
      box-sizing: border-box;
      vertical-align: middle;
    }

    /* ITEMS TABLE */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .items-table th {
      background: #0f172a;
      color: #ffffff;
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 14px;
      text-align: left;
    }
    .items-table th:last-child {
      text-align: right;
    }
    .items-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11.5px;
    }
    .items-table td:last-child {
      text-align: right;
      font-weight: 800;
      color: #0f172a;
      font-size: 12.5px;
    }
    .items-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* SUMMARY SECTION */
    .summary-section {
      display: grid;
      grid-template-columns: 1fr 310px;
      gap: 16px;
      margin-bottom: 20px;
    }
    .guarantee-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
    }
    .guarantee-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      color: #059669;
      margin-bottom: 4px;
    }
    .guarantee-box p {
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.45;
      margin: 0;
    }
    .summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 18px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      color: #64748b;
      margin-bottom: 5px;
    }
    .summary-row strong {
      color: #0f172a;
    }
    .summary-total-block {
      border-top: 2px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 6px;
    }
    .total-label-small {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #ea580c;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
    }
    .total-main-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .tax-note {
      font-size: 10px;
      color: #64748b;
    }
    .total-big-amount {
      font-size: 20px;
      font-weight: 900;
      color: #ea580c;
      letter-spacing: -0.5px;
    }

    /* FOOTER */
    .footer-note {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 14px;
      margin-bottom: 14px;
      line-height: 1.45;
    }
    .invoice-bottom-security {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      font-family: monospace;
      color: #cbd5e1;
      padding-top: 8px;
      border-top: 1px dashed #e2e8f0;
      letter-spacing: 0.5px;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .print-actions-bar {
        display: none !important;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions-bar">
    <div>
      <strong style="color: #0f172a; font-size: 13px;">Pratinjau Tagihan Resmi</strong>
      <span style="color: #64748b; font-size: 12px; margin-left: 8px;">Invoice #${invClean}</span>
    </div>
    <button class="btn-print" onclick="window.print()">
      <span>🖨️</span> Simpan sebagai PDF / Cetak
    </button>
  </div>

  <div class="invoice-card">
    <div class="invoice-top-accent"></div>

    <!-- HEADER -->
    <div class="header">
      <div class="brand-block">
        <div class="brand-logo-row" style="display: flex; align-items: center; gap: 8px;">
          <img src="${LOGO_BASE64}" alt="HostingWebID" style="height: 38px; width: auto; max-width: 175px; object-fit: contain; display: block;" />
        </div>
        <div class="company-info" style="font-size: 11px; color: #64748b; margin-top: 6px; line-height: 1.45;">
          <strong style="color: #0f172a; font-size: 11.5px;">HostingWeb Indonesia</strong><br>
          Ruko No. 2A/11, Jl. Tamalate II, Kota Makassar<br>
          WhatsApp: <strong>${SITE_CONFIG.whatsappDisplay}</strong> • Email: ${SITE_CONFIG.email}<br>
          Layanan Web Hosting, Domain &amp; Google Ads
        </div>
      </div>

      <div class="invoice-title-block">
        <div class="invoice-header-label">INVOICE RESMI</div>
        <div class="invoice-no" style="font-size: 22px; font-weight: 900; color: #0f172a; white-space: nowrap; text-align: right; letter-spacing: -0.5px;">#${invClean}</div>
        
        <!-- CIRCULAR RUBBER STAMP (TERIMA PEMBAYARAN LUNAS) -->
        <div class="stamp-wrapper">
          <svg class="rubber-stamp" width="138" height="92" viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="topArc_${invClean}" d="M 30,50 A 44,44 0 0,1 120,50" fill="none" />
              <path id="bottomArc_${invClean}" d="M 120,50 A 44,44 0 0,1 30,50" fill="none" />
            </defs>
            <!-- Outer Dotted Circle -->
            <circle cx="75" cy="50" r="46" stroke="${isPaid ? "#10b981" : "#dc2626"}" stroke-width="2.2" stroke-dasharray="3,2" fill="none" />
            <!-- Inner Solid Circle -->
            <circle cx="75" cy="50" r="41" stroke="${isPaid ? "#10b981" : "#dc2626"}" stroke-width="1.4" fill="none" />

            <!-- Top Arc Text: TERIMA -->
            <text font-family="'Arial Black', Impact, sans-serif" font-size="9" font-weight="900" fill="${isPaid ? "#10b981" : "#dc2626"}" letter-spacing="2.5">
              <textPath href="#topArc_${invClean}" startOffset="50%" text-anchor="middle">${isPaid ? "TERIMA" : "MENUNGGU"}</textPath>
            </text>
            <text x="75" y="27" text-anchor="middle" fill="${isPaid ? "#10b981" : "#dc2626"}" font-size="7" font-weight="bold" letter-spacing="3">★ ★ ★</text>

            <!-- Bottom Stars & Arc Text: PEMBAYARAN -->
            <text x="75" y="74" text-anchor="middle" fill="${isPaid ? "#10b981" : "#dc2626"}" font-size="7" font-weight="bold" letter-spacing="3">★ ★ ★</text>
            <text font-family="'Arial Black', Impact, sans-serif" font-size="8" font-weight="900" fill="${isPaid ? "#10b981" : "#dc2626"}" letter-spacing="2">
              <textPath href="#bottomArc_${invClean}" startOffset="50%" text-anchor="middle">${isPaid ? "PEMBAYARAN" : "PEMBAYARAN"}</textPath>
            </text>

            <!-- Center Banner Box -->
            <rect x="8" y="33" width="134" height="34" rx="7" ry="7" fill="#ffffff" stroke="${isPaid ? "#10b981" : "#dc2626"}" stroke-width="2.6" />
            <text x="75" y="57" text-anchor="middle" font-family="'Impact', 'Arial Black', Arial, sans-serif" font-size="22" font-weight="900" letter-spacing="2" fill="#ffffff" stroke="${isPaid ? "#10b981" : "#dc2626"}" stroke-width="1.8" paint-order="stroke fill">${isPaid ? "LUNAS" : "BELUM LUNAS"}</text>
          </svg>
        </div>
      </div>
    </div>

    <!-- META INFO GRID -->
    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-card-title">
          <span class="orange-dot">●</span> DITAGIHKAN KEPADA:
        </div>
        <div class="meta-content">
          <strong style="font-size: 14px; color: #0f172a; display: block; margin-bottom: 2px;">${data.username || "testuser"}</strong>
          <div style="color: #64748b; font-size: 11px; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
            <span>✉</span> ${data.email || "-"}
          </div>
          ${data.phone ? `<div style="color: #64748b; font-size: 11px; margin-top: 2px;">📞 ${data.phone}</div>` : ""}
          <div style="margin-top: 10px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 12px;">
            <span style="font-style: italic; color: #94a3b8; font-size: 10.5px; display: block;">Alamat / Catatan Klien (Sesuai Akun Pelanggan)</span>
          </div>
        </div>
      </div>

      <div class="meta-card">
        <div class="meta-card-title">
          <span class="orange-dot">●</span> INFORMASI TAGIHAN:
        </div>
        <table class="info-table">
          <tbody>
            <tr>
              <td>Tanggal Terbit:</td>
              <td>${formatDate(data.created_at)}</td>
            </tr>
            <tr>
              <td>Jatuh Tempo:</td>
              <td>${formatDate(data.due_date)}</td>
            </tr>
            <tr>
              <td>Metode:</td>
              <td>
                Transfer <span style="background: #e0f2fe; color: #0284c7; padding: 1.5px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 800; border: 1px solid #bae6fd;">Bank / Virtual</span> Account
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b; font-size: 11px;">Status:</td>
              <td style="padding: 4px 0; text-align: right;">
                <span style="display: inline-block; background: ${isPaid ? "#dcfce7" : "#fee2e2"}; border: 1.5px solid ${isPaid ? "#86efac" : "#fca5a5"}; border-radius: 20px; padding: 4px 12px; font-size: 10.5px; font-weight: 800; color: ${isPaid ? "#15803d" : "#b91c1c"}; text-align: center; white-space: nowrap;">
                  ${isPaid ? "✓ Pembayaran Terverifikasi (Lunas)" : "⏳ Belum Dibayar"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45px; text-align: center;">NO</th>
          <th>DESKRIPSI ITEM LAYANAN</th>
          <th>BIAYA</th>
        </tr>
      </thead>
      <tbody>
        ${displayItems
          .map(
            (item, index) => `
          <tr>
            <td style="color: #94a3b8; text-align: center; font-weight: 700;">${index + 1}</td>
            <td>
              <strong style="color: #0f172a; font-size: 12.5px; display: block;">${item.domain_name || item.description || "Layanan Cloud Hosting / Domain Website"}</strong>
              <div style="font-size: 10.5px; color: #64748b; margin-top: 2px;">• Paket Cloud Server &amp; Infrastruktur Website</div>
            </td>
            <td>${rupiah(item.price)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <!-- SUMMARY SECTION -->
    <div class="summary-section">
      <div class="guarantee-box">
        <div class="guarantee-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
          <span>Jaminan Pembayaran Sah</span>
        </div>
        <p>Transaksi telah terverifikasi secara sistem perbankan. Layanan aktif sesuai periode kontrak layanan yang telah disepakati.</p>
      </div>

      <div class="summary-box">
        <div class="summary-row">
          <span>Subtotal:</span>
          <strong>${rupiah(subtotal)}</strong>
        </div>
        ${
          ppn > 0
            ? `
        <div class="summary-row">
          <span>PPN (11%):</span>
          <strong>${rupiah(ppn)}</strong>
        </div>
        `
            : ""
        }
        <div class="summary-total-block">
          <span class="total-label-small">TOTAL TAGIHAN</span>
          <div class="total-main-row">
            <span class="tax-note">(Termasuk PPN)</span>
            <strong class="total-big-amount">${rupiah(rawTotal)}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER NOTE -->
    <div class="footer-note">
      Terima kasih atas kepercayaan Anda menggunakan layanan <strong>HostingWebID</strong>.<br>
      Dokumen tagihan invoice ini sah dan diterbitkan secara digital oleh sistem HostingWeb Indonesia tanpa memerlukan tanda tangan basah.
    </div>

    <!-- BOTTOM ENCRYPTION FOOTER -->
    <div class="invoice-bottom-security">
      <span>AUTH CODE: HWI-${authCodeSuffix}-OK</span>
      <span>SECURE ENCRYPTION SHA-256</span>
      <span>PAGE 1 OF 1</span>
    </div>
  </div>
</body>
</html>`;
}

export async function downloadInvoicePdf(data: InvoicePdfData): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    // Create a temporary hidden container formatted specifically for clean invoice rendering
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "-99999px";
    container.style.width = "800px";
    container.style.background = "#ffffff";
    container.style.padding = "20px";
    container.style.zIndex = "-9999";
    container.style.boxSizing = "border-box";

    // Inject invoice HTML (excluding top preview header bar)
    container.innerHTML = generateInvoiceHtml(data);

    // Remove the print action bar from capture
    const actionBars = container.querySelectorAll(".print-actions-bar");
    actionBars.forEach((bar) => bar.remove());

    document.body.appendChild(container);

    // Allow browser to render styles
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Render to high-resolution canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }

    // Convert canvas to PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight, undefined, "FAST");
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }
    }

    // Directly triggers browser download of the .pdf file
    const rawInv = String(data.invoice_number || "").trim();
    const invClean = rawInv.startsWith("PAY-")
      ? rawInv.replace(/^PAY-/, "INV-")
      : rawInv.startsWith("INV-")
      ? rawInv
      : `INV-${rawInv || "20260913"}`;
      
    pdf.save(`Invoice-${invClean}.pdf`);
  } catch (err) {
    console.error("Direct PDF download error, falling back to printer dialog:", err);
    fallbackPrintDialog(data);
  }
}

export function printOrDownloadInvoicePdf(data: InvoicePdfData) {
  // Directly trigger PDF file download
  downloadInvoicePdf(data);
}

function fallbackPrintDialog(data: InvoicePdfData) {
  const html = generateInvoiceHtml(data);
  let iframe = document.getElementById("invoice-print-frame") as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "invoice-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe?.contentWindow?.focus();
        iframe?.contentWindow?.print();
      } catch {
        downloadInvoiceHtmlFile(data);
      }
    }, 350);
  } else {
    downloadInvoiceHtmlFile(data);
  }
}

export function downloadInvoiceHtmlFile(data: InvoicePdfData) {
  const html = generateInvoiceHtml(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Invoice-${data.invoice_number}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function generateWhatsAppInvoiceLink(data: InvoicePdfData, clientPhone?: string) {
  const isPaid =
    (data.status || "").toLowerCase() === "paid" ||
    (data.status || "").toLowerCase() === "lunas" ||
    (data.status || "").toLowerCase() === "success" ||
    (data.status || "").toLowerCase() === "completed" ||
    (data.status || "").toLowerCase() === "active";

  const message =
    `Halo Kak *${data.username || "Pelanggan"}*,\n\n` +
    `Berikut adalah rincian tagihan invoice resmi Anda dari *HostingWebID*:\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🧾 *No. Invoice:* #${data.invoice_number}\n` +
    `📦 *Order ID:* #${data.order_number || data.invoice_number}\n` +
    `💰 *Total Nominal:* ${rupiah(data.total)}\n` +
    `📅 *Jatuh Tempo:* ${formatDate(data.due_date)}\n` +
    `📌 *Status:* ${isPaid ? "✅ LUNAS" : "⏳ MENUNGGU PEMBAYARAN"}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    (!isPaid
      ? `Silakan melakukan transfer ke rekening resmi kami:\n` +
        `• *BCA:* 123-456-7890 (A/N HostingWeb Indonesia)\n` +
        `• *Mandiri:* 987-654-3210 (A/N HostingWeb Indonesia)\n\n` +
        `Setelah melakukan transfer, silakan kirimkan bukti pembayaran di chat ini. Dokumen tagihan resmi PDF dapat diunduh pada link di atas. Terima kasih! 🙏`
      : `Terima kasih atas pembayaran Anda. Layanan Anda telah aktif. 🙏`);

  const encoded = encodeURIComponent(message);

  if (clientPhone) {
    const cleanPhone = clientPhone.replace(/[^0-9]/g, "").replace(/^0/, "62");
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }

  return `https://api.whatsapp.com/send?text=${encoded}`;
}
