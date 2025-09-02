import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export interface CreateAlbumRequest {
  albumName: string;
  description?: string;
  assetIds?: string[];
  albumUsers?: Array<{
    role: 'editor' | 'viewer';
    userId: string;
  }>;
}

export interface CreateAlbumResponse {
  id: string;
  albumName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  albumThumbnailAssetId?: string;
  shared: boolean;
  hasSharedLink: boolean;
  startDate?: string;
  endDate?: string;
  assetCount: number;
  owner: {
    id: string;
    email: string;
    name: string;
    avatarColor: string;
  };
  albumUsers: Array<{
    role: string;
    user: {
      id: string;
      email: string;
      name: string;
      avatarColor: string;
    };
  }>;
  assets: Array<{
    id: string;
    deviceAssetId: string;
    type: 'IMAGE' | 'VIDEO';
    originalFileName: string;
    resized: boolean;
    thumbhash?: string;
    fileCreatedAt: string;
    fileModifiedAt: string;
    updatedAt: string;
    isFavorite: boolean;
    isArchived: boolean;
    duration?: string;
    exifInfo?: Record<string, unknown>;
    smartInfo?: Record<string, unknown>;
    livePhotoVideoId?: string;
    tags: Record<string, unknown>[];
    people: Record<string, unknown>[];
    checksum: string;
  }>;
}

export interface UploadAssetRequest {
  filePath: string;
  originalFilename: string;
  deviceAssetId: string;
  deviceId: string;
  fileCreatedAt: string;
  fileModifiedAt: string;
  isFavorite?: boolean;
  duration?: string;
  filename?: string;
  visibility?: 'archive' | 'timeline' | 'hidden' | 'locked';
}

export interface UploadAssetResponse {
  id: string;
  status: 'created' | 'replaced' | 'duplicate';
}

export interface GetAlbumResponse {
  id: string;
  albumName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  albumThumbnailAssetId?: string;
  shared: boolean;
  hasSharedLink: boolean;
  startDate?: string;
  endDate?: string;
  assetCount: number;
  owner: {
    id: string;
    email: string;
    name: string;
    avatarColor: string;
  };
  albumUsers: Array<{
    role: string;
    user: {
      id: string;
      email: string;
      name: string;
      avatarColor: string;
    };
  }>;
  assets: Array<{
    id: string;
    deviceAssetId: string;
    type: 'IMAGE' | 'VIDEO';
    originalFileName: string;
    resized: boolean;
    thumbhash?: string;
    fileCreatedAt: string;
    fileModifiedAt: string;
    updatedAt: string;
    isFavorite: boolean;
    isArchived: boolean;
    duration?: string;
    exifInfo?: Record<string, unknown>;
    smartInfo?: Record<string, unknown>;
    livePhotoVideoId?: string;
    tags: Record<string, unknown>[];
    people: Record<string, unknown>[];
    checksum: string;
  }>;
}

export interface AddAssetsToAlbumResponse {
  id: string;
  success: boolean;
  error?: 'duplicate' | 'no_permission' | 'not_found' | 'unknown';
}

export interface RemoveAssetsFromAlbumResponse {
  id: string;
  success: boolean;
  error?: 'duplicate' | 'no_permission' | 'not_found' | 'unknown';
}

export class ImmichService {
  private serverUrl: string;
  private headers: Record<string, string>;

  constructor(serverUrl: string, apiKey: string) {
    this.serverUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    this.headers = {
      'x-api-key': apiKey,
      'Accept': 'application/json',
    };
  }

  /**
   * Create a new album
   * Endpoint: POST /api/albums
   * Permission: album.create
   */
  async createAlbum(request: CreateAlbumRequest): Promise<CreateAlbumResponse> {
    try {
      const response = await axios.post(
        `${this.serverUrl}/api/albums`,
        request,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error creating album:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  /**
   * Upload an asset to Immich
   * Endpoint: POST /api/assets
   * Permission: asset.upload
   */
  async uploadAsset(request: UploadAssetRequest): Promise<UploadAssetResponse> {
    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(request.filePath);

      formData.append('assetData', fileStream, {
        filename: request.originalFilename,
        contentType: 'application/octet-stream',
      });

      // Required fields
      formData.append('deviceAssetId', request.deviceAssetId);
      formData.append('deviceId', request.deviceId);
      formData.append('fileCreatedAt', request.fileCreatedAt);
      formData.append('fileModifiedAt', request.fileModifiedAt);

      // Optional fields
      if (request.isFavorite !== undefined) {
        formData.append('isFavorite', request.isFavorite.toString());
      }
      if (request.duration) {
        formData.append('duration', request.duration);
      }
      if (request.filename) {
        formData.append('filename', request.filename);
      }
      if (request.visibility) {
        formData.append('visibility', request.visibility);
      }

      const response = await axios.post(
        `${this.serverUrl}/api/assets`,
        formData,
        {
          headers: {
            ...this.headers,
            ...formData.getHeaders(),
          },
          timeout: 60000, // 60 second timeout for uploads
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error uploading asset:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  /**
   * Get album information by ID
   * Endpoint: GET /api/albums/{id}
   * Permission: album.read
   */
  async getAlbum(
    albumId: string,
    options?: {
      key?: string;
      slug?: string;
      withoutAssets?: boolean;
    }
  ): Promise<GetAlbumResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.key) params.append('key', options.key);
      if (options?.slug) params.append('slug', options.slug);
      if (options?.withoutAssets) params.append('withoutAssets', options.withoutAssets.toString());

      const queryString = params.toString();
      const url = `${this.serverUrl}/api/albums/${albumId}${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(url, {
        headers: this.headers,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching album:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  /**
   * Add assets to an album
   * Endpoint: PUT /api/albums/{id}/assets
   * Permission: albumAsset.create
   */
  async addAssetsToAlbum(
    albumId: string,
    assetIds: string[],
    options?: {
      key?: string;
      slug?: string;
    }
  ): Promise<AddAssetsToAlbumResponse[]> {
    try {
      const params = new URLSearchParams();
      if (options?.key) params.append('key', options.key);
      if (options?.slug) params.append('slug', options.slug);

      const queryString = params.toString();
      const url = `${this.serverUrl}/api/albums/${albumId}/assets${queryString ? `?${queryString}` : ''}`;

      const response = await axios.put(
        url,
        { ids: assetIds },
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error adding assets to album:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  /**
   * Remove assets from an album
   * Endpoint: DELETE /api/albums/{id}/assets
   * Permission: albumAsset.delete
   */
  async removeAssetsFromAlbum(
    albumId: string,
    assetIds: string[]
  ): Promise<RemoveAssetsFromAlbumResponse[]> {
    try {
      const response = await axios.delete(`${this.serverUrl}/api/albums/${albumId}/assets`, {
        headers: this.headers,
        data: { ids: assetIds },
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error removing assets from album:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  }

  /**
   * Generate a unique device asset ID for web uploads
   */
  generateDeviceAssetId(): string {
    return `web-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the default device ID for web uploads
   */
  getDeviceId(): string {
    return 'web-uploader';
  }
}