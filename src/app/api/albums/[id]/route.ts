import { NextRequest, NextResponse } from 'next/server';
import { ImmichService } from '@/services/immich';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const immichServerUrl = process.env.IMMICH_SERVER_URL || 'http://immich-server:2283';
  const immichApiKey = process.env.IMMICH_API_KEY;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'Immich API key not configured' }, { status: 500 });
  }

  const immichService = new ImmichService(immichServerUrl, immichApiKey);

  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(req.url);
    const withoutAssets = searchParams.get('withoutAssets') === 'true';
    const key = searchParams.get('key') || undefined;
    const slug = searchParams.get('slug') || undefined;

    const album = await immichService.getAlbum(resolvedParams.id, {
      withoutAssets,
      key,
      slug
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error('Error fetching album:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch album', details: errorMessage },
      { status: 500 }
    );
  }
}