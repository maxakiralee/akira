'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { vapi } from '@/lib/vapi.sdk';

interface ImageUploadPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    setError(null);

    try {
      // Create Supabase client
      const supabase = createClient();
      
      // Upload to Supabase Storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('image-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('image-uploads')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Display the uploaded image
      setUploadedImage(imageUrl);

      // Analyze image with Claude Vision
      const response = await fetch('/api/analyzeImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();

      if (data.success && data.description) {
        // Send description to Vapi as background message
        vapi.send({
          type: "add-message",
          message: {
            role: "system",
            content: `User has shared an image. Here's what I can see: ${data.description}`
          }
        });
      }

    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetPanel = () => {
    setUploadedImage(null);
    setError(null);
    setIsUploading(false);
    setIsDragOver(false);
  };

  // Reset when panel closes
  React.useEffect(() => {
    if (!isOpen) {
      resetPanel();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-100/90 backdrop-blur-md rounded-3xl p-8 shadow-[16px_16px_32px_rgba(0,0,0,0.1),-16px_-16px_32px_rgba(255,255,255,0.8)] max-w-md w-full ml-8 mr-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-slate-700">Upload Image</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300/80 flex items-center justify-center transition-all duration-200 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              aspect-square w-full rounded-2xl cursor-pointer transition-all duration-200
              flex items-center justify-center relative overflow-hidden
              ${isDragOver 
                ? 'bg-blue-100 border-2 border-blue-400 scale-105' 
                : 'bg-slate-200/60 hover:bg-slate-300/60 border border-slate-300'
              }
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)]
              hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]
            `}
          >
            {uploadedImage ? (
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : isUploading ? (
              <div className="w-12 h-12 border-4 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="text-center">
          {uploadedImage ? (
            <p className="text-sm text-green-600 font-medium">Image uploaded successfully!</p>
          ) : isUploading ? (
            <p className="text-sm text-slate-600">Uploading and analyzing...</p>
          ) : (
            <p className="text-sm text-slate-500">Click or drag to upload an image</p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadPanel; 