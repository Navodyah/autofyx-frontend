import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow vehicle images from any external HTTPS source stored in the database
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // wildcard — permits any HTTPS image URL
      },
      {
        protocol: "http",
        hostname: "**", // also allow HTTP (local dev backend images)
      },
    ],
  },
};

export default nextConfig;
