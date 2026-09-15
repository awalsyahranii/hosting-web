import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.NODE_ENV === "production"
        ? "https://order.hostingwebid.com/api/v1"
        : "http://localhost/hosting_webid/api/v1";

    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
