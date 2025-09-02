"use client"

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Camera, Users, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import imageCompression from 'browser-image-compression';

interface FileWithMetadata {
  id: number;
  file: File;
  preview: string;
  status: string;
}

interface UploadResult {
  success: boolean;
  filename: string;
  assetId?: string;
  error?: string;
}

const ImmichUploader = () => {
  const { translations } = useLanguage();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [albumName, setAlbumName] = useState('');
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get CSRF token on component mount
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/share-photos/api/csrf');
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };
    fetchCsrfToken();
  }, []);

  // Compress image if it's too large
  const compressImageIfNeeded = async (file: File): Promise<File> => {
    // Only compress images, skip videos
    if (!file.type.startsWith('image/')) {
      return file;
    }

    // Only compress if file is larger than 2MB
    if (file.size <= 2 * 1024 * 1024) {
      return file;
    }

    try {
      const options = {
        maxSizeMB: 2, // Compress to max 2MB
        maxWidthOrHeight: 1920, // Max dimension 1920px
        useWebWorker: true,
        fileType: file.type
      };

      const compressedFile = await imageCompression(file, options);
      
      // Ensure the compressed file retains the original filename and type
      const renamedFile = new File([compressedFile], file.name, {
        type: file.type,
        lastModified: file.lastModified
      });
      
      console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(renamedFile.size / 1024 / 1024).toFixed(1)}MB`);
      return renamedFile;
    } catch (error) {
      console.warn(`Failed to compress ${file.name}, using original:`, error);
      return file;
    }
  };

  // Start simulated progress
  const startSimulatedProgress = () => {
    const stepSize = 100 / files.length;
    const maxProgress = stepSize * (files.length - 1); // Stop at penultimate step
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + stepSize;
        if (newProgress >= maxProgress) {
          clearInterval(interval);
          return maxProgress;
        }
        return newProgress;
      });
    }, 500);
    
    setProgressInterval(interval);
    return interval;
  };

  // Stop simulated progress and complete
  const completeProgress = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setProgress(100);
    setProgressText(translations.uploadCompleteProgress);
  };

  // API call to upload files
  const uploadFiles = async () => {
    const formData = new FormData();
    
    // Compress files before adding to FormData
    for (const fileObj of files) {
      const compressedFile = await compressImageIfNeeded(fileObj.file);
      formData.append('photos', compressedFile);
    }
    
    formData.append('albumName', albumName);

    try {
      const response = await fetch('/share-photos/api/upload', {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      completeProgress();
      
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const fileArray: FileWithMetadata[] = Array.from(selectedFiles).map((file, index) => ({
      id: Date.now() + index,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...fileArray]);
    setError('');
  };

  const removeFile = (id: number) => {
    setFiles(prev => {
      const newFiles = prev.filter(file => file.id !== id);
      // Clean up object URL to prevent memory leaks
      const fileToRemove = prev.find(file => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (!albumName.trim()) {
      setError(translations.pleaseEnterAlbumName);
      return;
    }

    setUploading(true);
    setError('');
    setResults([]);
    setProgress(0);
    setProgressText(translations.uploadingPhotosProgress);
    
    // Start simulated progress
    startSimulatedProgress();
    
    try {
      const result = await uploadFiles();
      setResults(result.results || []);
      setShowResults(true);
      
      // Clear files after successful upload
      files.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
      setFiles([]);
      setUploading(false);
      setProgress(0);
      setProgressText('');
    } catch (error) {
      // Clean up progress on error
      if (progressInterval) {
        clearInterval(progressInterval);
        setProgressInterval(null);
      }
      
      if (error instanceof Error) {
        // If the error message is a translation key, use it directly
        const errorKey = error.message as keyof typeof translations;
        if (errorKey in translations) {
          setError(translations[errorKey]);
        } else {
          setError(translations.uploadFailed);
        }
      } else {
        setError(translations.uploadFailed);
      }
      setUploading(false);
      setProgress(0);
      setProgressText('');
    }
  };

  const resetForm = () => {
    // Clean up progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    
    // Clean up object URLs
    files.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
    setFiles([]);
    setAlbumName('');
    setResults([]);
    setShowResults(false);
    setError('');
    setUploading(false);
    setCompressing(false);
    setProgress(0);
    setProgressText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Camera className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">{translations.sharePhotos}</h1>
          </div>
          <p className="text-gray-600">{translations.uploadPhotosToCreateAlbum}</p>
        </div>

        {!showResults ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Album Info Form */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.albumName}
              </label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder={translations.albumNamePlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              />
            </div>

            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed ${
                uploading
                  ? 'border-gray-200' 
                  : 'border-gray-300 hover:border-blue-400'
              } rounded-lg p-8 text-center mb-6 transition-colors ${
                !uploading ? 'cursor-pointer' : ''
              }`}
              onClick={!uploading ? () => fileInputRef.current?.click() : undefined}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                {translations.tapToSelectPhotos}
              </p>
              <p className="text-sm text-gray-500">
                {translations.selectMultiplePhotos}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {/* Selected Files Preview */}
            {files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  {translations.selectedPhotos} ({files.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {files.map((fileObj) => (
                    <div key={fileObj.id} className="relative group">
                      <Image
                        src={fileObj.preview}
                        alt={fileObj.file.name}
                        width={96}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg"
                        unoptimized
                      />
                      {!uploading && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(fileObj.id);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {uploading && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{progressText}</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || !albumName.trim() || uploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {progressText || translations.uploadingPhotos}
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  {translations.createAlbumAndUpload} ({files.length} {translations.photosText})
                </>
              )}
            </button>
          </div>
        ) : (
          /* Results Screen */
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{translations.uploadComplete}</h2>
              <p className="text-gray-600">
                {translations.createdAlbumWith} &ldquo;{albumName}&rdquo; {results.filter(r => r.success).length} {translations.photosText}
              </p>
            </div>

            {/* Upload Results */}
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-3">
                    {result.filename}
                  </span>
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-center text-gray-600">
                {translations.photosAddedToAlbum}
              </p>
              
              <button
                onClick={resetForm}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {translations.uploadMorePhotos}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">{translations.howToUse}</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>{translations.instructionStep1}</li>
            <li>{translations.instructionStep2}</li>
            <li>{translations.instructionStep3}</li>
            <li>{translations.instructionStep4}</li>
            <li>{translations.instructionStep5}</li>
            <li>{translations.instructionStep6}</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>{translations.tipTitle}</strong> {translations.tipDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmichUploader;