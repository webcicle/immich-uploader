import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import formidable from 'formidable';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';

// Immich API helper class
class ImmichAPI {
  private serverUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(serverUrl: string, apiKey: string) {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
    this.headers = {
      'x-api-key': apiKey,
      'Accept': 'application/json'
    };
  }

  async createAlbum(albumName: string, description = '') {
    try {
      const response = await axios.post(`${this.serverUrl}/api/album`, {
        albumName,
        description
      }, { headers: this.headers });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error creating album:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  async uploadAsset(filePath: string, originalFilename: string) {
    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      
      formData.append('assetData', fileStream, {
        filename: originalFilename,
        contentType: 'application/octet-stream'
      });

      // Add metadata
      const deviceAssetId = `web-upload-${Date.now()}-${Math.random()}`;
      const deviceId = 'web-uploader';
      const fileCreatedAt = new Date().toISOString();
      const fileModifiedAt = fileCreatedAt;

      formData.append('deviceAssetId', deviceAssetId);
      formData.append('deviceId', deviceId);
      formData.append('fileCreatedAt', fileCreatedAt);
      formData.append('fileModifiedAt', fileModifiedAt);
      formData.append('isFavorite', 'false');

      const response = await axios.post(`${this.serverUrl}/api/asset/upload`, formData, {
        headers: {
          ...this.headers,
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 second timeout for uploads
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error uploading asset:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  async addAssetsToAlbum(albumId: string, assetIds: string[]) {
    try {
      const response = await axios.put(`${this.serverUrl}/api/album/${albumId}/assets`, {
        ids: assetIds
      }, { headers: this.headers });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error adding assets to album:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  async getAlbums() {
    try {
      const response = await axios.get(`${this.serverUrl}/api/album`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching albums:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }
}

export async function POST(req: NextRequest) {
  const immichServerUrl = process.env.IMMICH_SERVER_URL || 'http://immich-server:2283';
  const immichApiKey = process.env.IMMICH_API_KEY;

  if (!immichApiKey) {
    return NextResponse.json({ error: 'Immich API key not configured' }, { status: 500 });
  }

  const immichAPI = new ImmichAPI(immichServerUrl, immichApiKey);

  try {
    // Parse the multipart form data
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxFiles: 50,
      filter: ({ mimetype }) => {
        // Accept images and videos
        return !!(mimetype && (mimetype.startsWith('image/') || mimetype.startsWith('video/')));
      }
    });

    const [fields, files] = await form.parse(req as unknown as import('http').IncomingMessage);

    const albumName = Array.isArray(fields.albumName) ? fields.albumName[0] : fields.albumName;
    const userName = Array.isArray(fields.userName) ? fields.userName[0] : fields.userName;
    const photoFiles = Array.isArray(files.photos) ? files.photos : [files.photos].filter(Boolean);

    if (!photoFiles || photoFiles.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (!albumName) {
      return NextResponse.json({ error: 'Album name is required' }, { status: 400 });
    }

    console.log(`Processing upload: ${photoFiles.length} files for album "${albumName}" by ${userName}`);

    // Create new album
    const description = userName ? `Shared by ${userName}` : 'Shared photos';
    const album = await immichAPI.createAlbum(albumName, description);
    console.log(`Created album: ${album.id}`);

    // Upload each file to Immich
    const uploadResults = [];
    const assetIds = [];

    for (const file of photoFiles) {
      if (!file) continue;
      
      try {
        console.log(`Uploading: ${file.originalFilename}`);
        const asset = await immichAPI.uploadAsset(file.filepath, file.originalFilename || 'unknown');
        
        assetIds.push(asset.id);
        uploadResults.push({
          success: true,
          filename: file.originalFilename || 'unknown',
          assetId: asset.id
        });

        // Clean up temp file
        fs.unlinkSync(file.filepath);
      } catch (uploadError) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
        console.error(`Failed to upload ${file.originalFilename}:`, uploadError);
        uploadResults.push({
          success: false,
          filename: file.originalFilename || 'unknown',
          error: errorMessage
        });

        // Clean up temp file even on error
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
          console.error('Failed to clean up temp file:', cleanupError);
        }
      }
    }

    // Add successfully uploaded assets to album
    if (assetIds.length > 0) {
      try {
        await immichAPI.addAssetsToAlbum(album.id, assetIds);
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