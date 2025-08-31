import { NextResponse } from 'next/server';

export async function GET() {
  // Simple SVG icon for PWA
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#4f46e5" rx="15"/>
      <circle cx="30" cy="35" r="8" fill="white" opacity="0.9"/>
      <path d="M20 60 L45 40 L60 50 L80 35 L80 70 L20 70 Z" fill="white" opacity="0.9"/>
      <rect x="15" y="25" width="70" height="50" fill="none" stroke="white" stroke-width="3" rx="5"/>
    </svg>
  `;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    }
  });
}