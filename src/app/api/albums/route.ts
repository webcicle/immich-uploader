import axios, { AxiosError } from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  const immichServerUrl = process.env.IMMICH_SERVER_URL || 'http://immich-server:2283';
  const immichApiKey = process.env.IMMICH_API_KEY;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'Immich API key not configured' }, { status: 500 });
  }

  try {
    const response = await axios.get(`${immichServerUrl}/api/album`, {
      headers: {
        'x-api-key': immichApiKey,
        'Accept': 'application/json'
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching albums:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to fetch albums',
      details: errorMessage 
    }, { status: 500 });
  }
}