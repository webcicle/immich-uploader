import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Trailing slash for better routing
  trailingSlash: true,

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
