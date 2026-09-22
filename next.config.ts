import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_API_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://order.hostingwebid.com/api/v1"
        : "http://localhost:8080/hosting_webid/api/v1");

    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
