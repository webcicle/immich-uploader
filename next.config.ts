import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Base path for subpath deployment
  basePath: '/share-photos',
  assetPrefix: '/share-photos',
  
  // Trailing slash for better routing
  trailingSlash: true,
  
  // Enable experimental features if needed
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
