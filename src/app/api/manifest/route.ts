import { NextResponse } from 'next/server';
import { assetPath, navPath } from '@/lib/paths';

export async function GET() {
  const manifest = {
    name: "Share Photos - Immich",
    short_name: "Share Photos",
    description: "Upload photos to create shared albums",
    start_url: navPath() + '/',
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    icons: [
      {
        src: assetPath('/icon.svg'),
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: assetPath('/icon.svg'),
        sizes: "512x512", 
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    categories: ["photo", "utilities"],
    screenshots: [],
    prefer_related_applications: false
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}