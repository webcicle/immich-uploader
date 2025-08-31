import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'Immich Photo Uploader',
    timestamp: new Date().toISOString()
  });
}