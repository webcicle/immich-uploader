import { NextResponse } from 'next/server';

export async function GET() {
  const immichServerUrl = process.env.IMMICH_SERVER_URL || 'http://immich-server:2283';
  const immichApiKey = process.env.IMMICH_API_KEY;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'Immich API key not configured' }, { status: 500 });
  }

  try {
    // Note: Using direct fetch call here since we haven't implemented getAllAlbums in the service yet
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