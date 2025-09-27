import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Don't ignore build errors in production
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
  eslint: {
    // Only ignore ESLint errors during builds in development
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  // Handle static assets properly
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.ASSET_PREFIX : '',
  images: {
    domains: [],
  },
};

export default nextConfig;
