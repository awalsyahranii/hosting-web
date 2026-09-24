export interface ExpiryInfo {
  daysRemaining: number | null;
  isExpiringSoon: boolean; // <= 7 days and >= 0
  isExpired: boolean;      // < 0 days
  isCritical: boolean;     // <= 3 days and >= 0
  statusText: string;
  formattedDate: string;
}

export function getExpiryInfo(dateStr: string | null | undefined): ExpiryInfo {
  if (!dateStr || dateStr === "-" || dateStr === "Belum aktif") {
    return {
      daysRemaining: null,
      isExpiringSoon: false,
      isExpired: false,
      isCritical: false,
      statusText: "Belum aktif",
      formattedDate: "Belum aktif",
    };
  }

  let formattedDate = dateStr;
  try {
    const d = new Date(dateStr.replace(" ", "T"));
    if (!isNaN(d.getTime())) {
      formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    }
  } catch {
    formattedDate = dateStr;
  }

  try {
    const targetDate = new Date(dateStr.replace(" ", "T")).getTime();
    if (isNaN(targetDate)) {
      return {
        daysRemaining: null,
        isExpiringSoon: false,
        isExpired: false,
        isCritical: false,
        statusText: dateStr,
        formattedDate,
      };
    }

    const now = new Date().getTime();
    const diffMs = targetDate - now;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      const pastDays = Math.abs(daysRemaining);
      return {
        daysRemaining,
        isExpiringSoon: false,
        isExpired: true,
        isCritical: false,
        statusText: pastDays === 1 ? "Kedaluwarsa 1 hari lalu" : `Kedaluwarsa ${pastDays} hari lalu`,
        formattedDate,
      };
    }

    if (daysRemaining === 0) {
      return {
        daysRemaining: 0,
        isExpiringSoon: true,
        isExpired: false,
        isCritical: true,
        statusText: "Berakhir Hari Ini!",
        formattedDate,
      };
    }

    if (daysRemaining <= 7) {
      return {
        daysRemaining,
        isExpiringSoon: true,
        isExpired: false,
        isCritical: daysRemaining <= 3,
        statusText: `Sisa ${daysRemaining} Hari`,
        formattedDate,
      };
    }

    return {
      daysRemaining,
      isExpiringSoon: false,
      isExpired: false,
      isCritical: false,
      statusText: `Sisa ${daysRemaining} Hari`,
      formattedDate,
    };
  } catch {
    return {
      daysRemaining: null,
      isExpiringSoon: false,
      isExpired: false,
      isCritical: false,
      statusText: dateStr,
      formattedDate,
    };
  }
}

export function generateWhatsAppReminderUrl({
  clientName,
  domainName,
  serviceType = "Hosting",
  expiryDate,
  daysRemaining,
  phone = "",
}: {
  clientName: string;
  domainName: string;
  serviceType?: string;
  expiryDate: string;
  daysRemaining: number | null;
  phone?: string;
}): string {
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";
  const phoneParam = cleanPhone.startsWith("0")
    ? "62" + cleanPhone.slice(1)
    : cleanPhone;

  let urgencyText = "";
  if (daysRemaining !== null) {
    if (daysRemaining < 0) {
      urgencyText = `telah kedaluwarsa sejak *${Math.abs(daysRemaining)} hari yang lalu*`;
    } else if (daysRemaining === 0) {
      urgencyText = `akan *berakhir HARI INI*`;
    } else {
      urgencyText = `akan segera berakhir dalam *${daysRemaining} hari lagi* (tanggal ${expiryDate})`;
    }
  } else {
    urgencyText = `akan berakhir pada *${expiryDate}*`;
  }

  const message = `Halo Kak *${clientName}*,\n\nKami dari tim *HostingWeb.id* ingin menginformasikan bahwa layanan *${serviceType}* untuk domain *${domainName}* ${urgencyText}.\n\nAgar website dan email bisnis Anda tetap berjalan normal tanpa gangguan, silakan lakukan perpanjangan layanan melalui dashboard:\n👉 https://hostingwebid.com/dashboard\n\nJika butuh bantuan faktur atau perpanjangan, silakan balas pesan ini ya Kak.\n\nTerima kasih! 🙏✨`;

  return `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
}

