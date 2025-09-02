import { config } from '@/lib/config';
import { ImmichService } from '@/services/immich';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
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
    const body = await req.json();
    const { assetIds } = body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: 'assetIdsRequired' }, { status: 400 });
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
    return NextResponse.json(
      { error: 'failedToAddAssetsToAlbum' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const body = await req.json();
    const { assetIds } = body;

    if (!Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json({ error: 'assetIdsRequired' }, { status: 400 });
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
    return NextResponse.json(
      { error: 'failedToRemoveAssetsFromAlbum' },
      { status: 500 }
    );
  }
}