import { getSession, updateSessionAlbums } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { ImmichService } from '@/services/immich';
import fs from 'fs';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'authenticationRequired' }, { status: 401 });
  }

  // Check CSRF token
  const csrfToken = req.headers.get('x-csrf-token');
  if (!csrfToken) {
    return NextResponse.json({ error: 'csrfTokenRequired' }, { status: 403 });
  }

  try {
    const SECRET_KEY = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    );
    const { payload } = await jwtVerify(csrfToken, SECRET_KEY);
    
    if (payload.sessionId !== session.sessionId || payload.purpose !== 'csrf') {
      return NextResponse.json({ error: 'invalidCsrfToken' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  // Check rate limit per session
  const rateLimit = checkRateLimit(session.sessionId, 1, 1 * 60 * 1000); // 1 upload batch per 1 minute
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'tooManyUploadRequests' },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimit)
      }
    );
  }

  const immichServerUrl = process.env.IMMICH_SERVER_URL || 'http://immich-server:2283';
  const immichApiKey = process.env.IMMICH_API_KEY;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'immichApiKeyNotConfigured' }, { status: 500 });
  }

  const immichService = new ImmichService(immichServerUrl, immichApiKey);

  try {
    // Parse the multipart form data using NextRequest
    const formData = await req.formData();
    
    const albumName = formData.get('albumName') as string;
    const photoFiles = formData.getAll('photos') as File[];

    if (!photoFiles || photoFiles.length === 0) {
      return NextResponse.json({ error: 'noFilesUploaded' }, { status: 400 });
    }

    if (!albumName) {
      return NextResponse.json({ error: 'albumNameRequired' }, { status: 400 });
    }

    console.log(`Processing upload: ${photoFiles.length} files for album "${albumName}" by ${session.userName}`);

    // Create new album
    const description = `Shared by ${session.userName}`;
    const album = await immichService.createAlbum({
      albumName,
      description
    });
    console.log(`Created album: ${album.id}`);

    // Validate file types and sizes
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mov', 'video/avi', 'video/quicktime'
    ];
    const maxFileSize = 100 * 1024 * 1024; // 100MB
    const maxFiles = 100;

    if (photoFiles.length > maxFiles) {
      return NextResponse.json({ 
        error: 'tooManyFiles' 
      }, { status: 400 });
    }

    // Upload each file to Immich
    const uploadResults = [];
    const assetIds = [];

    for (const file of photoFiles) {
      if (!file) continue;
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        uploadResults.push({
          success: false,
          filename: file.name || 'unknown',
          error: 'invalidFileType'
        });
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        uploadResults.push({
          success: false,
          filename: file.name || 'unknown',
          error: 'fileTooLarge'
        });
        continue;
      }
      
      let tempFilePath: string | null = null;
      
      try {
        console.log(`Uploading: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        // Write file to temporary location
        tempFilePath = `/tmp/${Date.now()}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(tempFilePath, buffer);
        
        // Log file info for debugging
        console.log(`Wrote temp file: ${tempFilePath}, size: ${buffer.length} bytes`);
        
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

    // Update session with the new album
    await updateSessionAlbums(session.sessionId, album.id);

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
    return NextResponse.json({ 
      error: 'genericError' 
    }, { status: 500 });
  }
}