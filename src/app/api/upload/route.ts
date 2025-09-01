import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { ImmichService } from '@/services/immich';

export async function POST(req: NextRequest) {
  const immichServerUrl = process.env.IMMICH_SERVER_URL || 'http://immich-server:2283';
  const immichApiKey = process.env.IMMICH_API_KEY;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'Immich API key not configured' }, { status: 500 });
  }

  const immichService = new ImmichService(immichServerUrl, immichApiKey);

  try {
    // Parse the multipart form data using NextRequest
    const formData = await req.formData();
    
    const albumName = formData.get('albumName') as string;
    const userName = formData.get('userName') as string;
    const photoFiles = formData.getAll('photos') as File[];

    if (!photoFiles || photoFiles.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (!albumName) {
      return NextResponse.json({ error: 'Album name is required' }, { status: 400 });
    }

    console.log(`Processing upload: ${photoFiles.length} files for album "${albumName}" by ${userName}`);

    // Create new album
    const description = userName ? `Shared by ${userName}` : 'Shared photos';
    const album = await immichService.createAlbum({
      albumName,
      description
    });
    console.log(`Created album: ${album.id}`);

    // Upload each file to Immich
    const uploadResults = [];
    const assetIds = [];

    for (const file of photoFiles) {
      if (!file) continue;
      
      let tempFilePath: string | null = null;
      
      try {
        console.log(`Uploading: ${file.name}`);
        
        // Write file to temporary location
        tempFilePath = `/tmp/${Date.now()}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(tempFilePath, buffer);
        
        const deviceAssetId = immichService.generateDeviceAssetId();
        const deviceId = immichService.getDeviceId();
        const fileCreatedAt = new Date().toISOString();
        const fileModifiedAt = fileCreatedAt;
        
        const asset = await immichService.uploadAsset({
          filePath: tempFilePath,
          originalFilename: file.name || 'unknown',
          deviceAssetId,
          deviceId,
          fileCreatedAt,
          fileModifiedAt,
          isFavorite: false
        });
        
        assetIds.push(asset.id);
        uploadResults.push({
          success: true,
          filename: file.name || 'unknown',
          assetId: asset.id
        });

        // Clean up temp file
        fs.unlinkSync(tempFilePath);
      } catch (uploadError) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
        console.error(`Failed to upload ${file.name}:`, uploadError);
        uploadResults.push({
          success: false,
          filename: file.name || 'unknown',
          error: errorMessage
        });

        // Clean up temp file even on error
        if (tempFilePath) {
          try {
            fs.unlinkSync(tempFilePath);
          } catch (cleanupError) {
            console.error('Failed to clean up temp file:', cleanupError);
          }
        }
      }
    }

    // Add successfully uploaded assets to album
    if (assetIds.length > 0) {
      try {
        await immichService.addAssetsToAlbum(album.id, assetIds);
        console.log(`Added ${assetIds.length} assets to album ${album.id}`);
      } catch (albumError) {
        console.error('Failed to add assets to album:', albumError);
        // Don't fail the whole request if album addition fails
      }
    }

    return NextResponse.json({
      success: true,
      albumId: album.id,
      albumName: albumName,
      uploadedCount: assetIds.length,
      totalCount: photoFiles.length,
      results: uploadResults
    });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: errorMessage 
    }, { status: 500 });
  }
}