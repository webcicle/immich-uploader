import { config } from '@/lib/config';
import { ImmichService } from '@/services/immich';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const immichServerUrl = config.immichServerUrl;
  const immichApiKey = config.immichApiKey;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'immichApiKeyNotConfigured' }, { status: 500 });
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
    return NextResponse.json(
      { error: 'failedToFetchAlbum' },
      { status: 500 }
    );
  }
}