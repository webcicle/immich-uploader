import type { NextConfig } from "next";
import { config, hasBasePath } from "./src/lib/config";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: config.nextMode,
  
  // Base path for subpath deployment (only set if BASE_PATH is provided)
  ...(hasBasePath() && {
    basePath: config.basePath,
    assetPrefix: config.basePath,
  }),
  
  // Trailing slash for better routing
  trailingSlash: hasBasePath(),
  
  // Make BASE_PATH available to client-side code
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH,
  },
  
  // Enable experimental features if needed
  experimental: {
    serverActions: {
      bodySizeLimit: config.bodySizeLimit,
    },
  },
};

export default nextConfig;
