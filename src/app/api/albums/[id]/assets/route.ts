import { NextRequest, NextResponse } from 'next/server';
import { ImmichService } from '@/services/immich';

export async function PUT(
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
    const body = await req.json();
    const { assetIds } = body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: 'assetIds array is required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key') || undefined;
    const slug = searchParams.get('slug') || undefined;

    const result = await immichService.addAssetsToAlbum(resolvedParams.id, assetIds, {
      key,
      slug
    });

    return NextResponse.json({
      success: true,
      albumId: resolvedParams.id,
      addedAssets: assetIds.length,
      results: result
    });
  } catch (error) {
    console.error('Error adding assets to album:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to add assets to album', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const body = await req.json();
    const { assetIds } = body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: 'assetIds array is required' }, { status: 400 });
    }

    const result = await immichService.removeAssetsFromAlbum(resolvedParams.id, assetIds);

    return NextResponse.json({
      success: true,
      albumId: resolvedParams.id,
      removedAssets: assetIds.length,
      results: result
    });
  } catch (error) {
    console.error('Error removing assets from album:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to remove assets from album', details: errorMessage },
      { status: 500 }
    );
  }
}