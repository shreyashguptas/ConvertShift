'use client';

import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  maxFiles?: number;
}

export function FileDropzone({ onFileSelect, accept = '*', maxFiles = 1 }: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files?.length) {
      if (files.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }
      onFileSelect(files);
    }
  }, [maxFiles, onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      if (files.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }
      onFileSelect(files);
    }
  }, [maxFiles, onFileSelect]);

  return (
    <div
      onClick={handleUploadClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 transition-colors duration-150 ease-in-out hover:border-gray-400 cursor-pointer"
    >
      <div className="text-center">
        <Button 
          variant="outline" 
          className="w-full border-2 border-dashed h-32 hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-blue-500" />
            <div className="space-y-1 text-center">
              <p className="text-sm text-gray-600">Choose files or drag & drop</p>
              <p className="text-xs text-gray-500">
                {accept === 'image/*' ? 'PNG, JPG, JPEG, WebP, AVIF, SVG' : accept}
                {maxFiles > 1 ? ` (up to ${maxFiles} files)` : ''}
              </p>
            </div>
          </div>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          multiple={maxFiles > 1}
        />
      </div>
    </div>
  );
} 