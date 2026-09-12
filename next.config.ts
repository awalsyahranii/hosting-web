import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost/hosting_webid/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
