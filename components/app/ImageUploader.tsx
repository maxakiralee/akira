'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { vapi } from '@/lib/vapi.sdk';

interface ImageUploaderProps {
  onImageAnalyzed?: (description: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageAnalyzed }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        vapi.send({
          type: "add-message",
          message: {
            role: "system",
            content: `User has shared an image. Here's what I can see: ${data.description}`
          }
        });
        
        onImageAnalyzed?.(data.description);
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-16 h-16 rounded-full cursor-pointer transition-all duration-200
          flex items-center justify-center
          ${isDragOver 
            ? 'bg-blue-100 border-2 border-blue-400 scale-110' 
            : 'bg-slate-100/80 hover:bg-slate-200/80 border border-slate-300'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          backdrop-blur-sm shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)]
          hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]
        `}
        title="Upload an image"
      >
        {isUploading ? (
          <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg 
            className="w-8 h-8 text-slate-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        )}
      </div>

      {error && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 