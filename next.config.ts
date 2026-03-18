import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare D1 bindings will be added here when deploying
  experimental: {
    // Server Actions are enabled by default in Next.js 14+
  },
};

export default nextConfig;
