import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.TIMEBOXING_BASE_PATH || '',
  trailingSlash: true,
  images: { unoptimized: true },
  serverExternalPackages: []
};

export default nextConfig;
