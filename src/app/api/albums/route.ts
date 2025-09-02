import { config } from '@/lib/config';
import { NextResponse } from 'next/server';

export async function GET() {
  const immichServerUrl = config.immichServerUrl;
  const immichApiKey = config.immichApiKey;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'immichApiKeyNotConfigured' }, { status: 500 });
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
    return NextResponse.json({ 
      error: 'failedToFetchAlbums'
    }, { status: 500 });
  }
}