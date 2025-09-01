import { NextResponse } from 'next/server';
import { ImmichService } from '@/services/immich';

export async function GET() {
  const immichServerUrl = process.env.IMMICH_SERVER_URL || 'http://immich-server:2283';
  const immichApiKey = process.env.IMMICH_API_KEY;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'Immich API key not configured' }, { status: 500 });
  }

  const immichService = new ImmichService(immichServerUrl, immichApiKey);

  try {
    // Note: Using direct axios call here since we haven't implemented getAllAlbums in the service yet
    // This would typically be immichService.getAllAlbums() if we add that method
    const response = await fetch(`${immichServerUrl}/api/albums`, {
      headers: {
        'x-api-key': immichApiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching albums:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to fetch albums',
      details: errorMessage 
    }, { status: 500 });
  }
}