import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow uploaded local images and unoptimized rendering for crisp display on mobile 3G/4G
  images: {
    unoptimized: true,
  },
  // Suppress experimental SQLite warning noise while keeping serverExternalPackages clean
  serverExternalPackages: [],
};

export default nextConfig;
