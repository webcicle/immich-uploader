import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Base path for subpath deployment
  basePath: '/share',
  assetPrefix: '/share',
  
  // Trailing slash for better routing
  trailingSlash: true,
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/share/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Environment variables
  env: {
    IMMICH_SERVER_URL: process.env.IMMICH_SERVER_URL,
  },
  
  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
};

export default nextConfig;
