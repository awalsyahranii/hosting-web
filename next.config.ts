import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const envUrl = (process.env.BACKEND_API_URL || "").trim();
    const backendUrl =
      process.env.NODE_ENV === "production"
        ? (envUrl && !envUrl.includes("localhost") ? envUrl : "https://order.hostingwebid.com/api/v1")
        : (envUrl || "http://localhost:8080/hosting_webid/api/v1");

    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/checkout",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/login",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
