import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hostingwebid.com";

  // Static main pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/seo`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tema`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic article routes from API
  try {
    const backendUrl =
      process.env.NODE_ENV === "production"
        ? "https://order.hostingwebid.com/api/v1/article/index.php"
        : "http://localhost:8080/hosting_webid/api/v1/article/index.php";

    const res = await fetch(backendUrl, {
      next: { revalidate: 3600 },
    });
    const json = await res.json().catch(() => null);

    if (json?.status === "success" && Array.isArray(json?.data?.articles)) {
      const articleRoutes: MetadataRoute.Sitemap = json.data.articles.map((art: any) => ({
        url: `${baseUrl}/blog/${art.slug}`,
        lastModified: art.created_at ? new Date(art.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

      return [...staticRoutes, ...articleRoutes];
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
  }

  return staticRoutes;
}
