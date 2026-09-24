import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/"],
    },
    sitemap: [
      "https://hostingwebid.com/sitemap.xml",
      "https://hostingwebid.com/sitemap_index.xml",
    ],
  };
}
