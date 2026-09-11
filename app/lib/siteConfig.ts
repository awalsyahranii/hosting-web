/**
 * Konfigurasi Umum & Helper WhatsApp
 */

export const SITE_CONFIG = {
  name: "HostingWeb ID",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6285333555976",
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || "085-333-555-976",
  phone: "085-333-555-976",
  email: "admin@hostingwebid.com",
  workingHours: "Senin - Sabtu Pkl. 08.00 - 17.00 WIB",
  address: "Kota Makassar - Sulawesi Selatan 90245",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost/hosting_webid/api/v1",
};

/**
 * Format nomor telepon agar valid untuk URL WhatsApp wa.me
 * Contoh: 0812... -> 62812... , +62 812... -> 62812...
 */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = (phone || "").replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Buat link https://wa.me/... dengan pesan yang di-encode
 */
export function getWhatsAppUrl(message?: string, customPhone?: string): string {
  const rawPhone =
    customPhone ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    SITE_CONFIG.whatsappNumber;
  const phone = formatWhatsAppNumber(rawPhone);
  if (!message) {
    return `https://wa.me/${phone}`;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
