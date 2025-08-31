import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Camera, Users, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';

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
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [userName, setUserName] = useState('');
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API call to upload files
  const uploadFiles = async () => {
    const formData = new FormData();
    
    files.forEach((fileObj) => {
      formData.append('photos', fileObj.file);
    });
    
    formData.append('albumName', albumName);
    formData.append('userName', userName);

    try {
      const response = await fetch('/share/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      return await response.json();
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
    if (!albumName.trim() || !userName.trim()) {
      setError('Please enter your name and album name');
      return;
    }

    setUploading(true);
    setError('');
    setResults([]);
    
    try {
      const result = await uploadFiles();
      setResults(result.results || []);
      setShowResults(true);
      
      // Clear files after successful upload
      files.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
      setFiles([]);
      setUploading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setError(errorMessage);
      setUploading(false);
    }
  };

  const resetForm = () => {
    // Clean up object URLs
    files.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
    setFiles([]);
    setAlbumName('');
    setUserName('');
    setResults([]);
    setShowResults(false);
    setError('');
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Camera className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Share Photos</h1>
          </div>
          <p className="text-gray-600">Upload photos to create a shared album</p>
        </div>

        {!showResults ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* User Info Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={uploading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Album Name
                </label>
                <input
                  type="text"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="e.g., Beach Trip 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={uploading}
                />
              </div>
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
                Tap to select photos from your iPhone
              </p>
              <p className="text-sm text-gray-500">
                You can select multiple photos at once
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
                  Selected Photos ({files.length})
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

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || !albumName.trim() || !userName.trim() || uploading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading Photos...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Create Album & Upload ({files.length} photos)
                </>
              )}
            </button>
          </div>
        ) : (
          /* Results Screen */
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Complete!</h2>
              <p className="text-gray-600">
                Created album &ldquo;{albumName}&rdquo; with {results.filter(r => r.success).length} photos
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
                Your photos have been added to the shared album!
              </p>
              
              <button
                onClick={resetForm}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Upload More Photos
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">How to use from iPhone:</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. Open Safari on your iPhone</li>
            <li>2. Navigate to this page</li>
            <li>3. Tap &ldquo;Select Photos&rdquo; button</li>
            <li>4. Choose multiple photos from your photo library</li>
            <li>5. Enter your name and album name</li>
            <li>6. Tap &ldquo;Create Album & Upload&rdquo;</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Add this page to your iPhone home screen for easy access!
              Tap the share button in Safari and select &ldquo;Add to Home Screen&rdquo;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImmichUploader;