'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [newDimensions, setNewDimensions] = useState({ width: 0, height: 0 });
  const [scalePercentage, setScalePercentage] = useState(100);
  const [imageType, setImageType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [estimatedNewSize, setEstimatedNewSize] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateEstimatedSize = (width: number, height: number, originalSize: number) => {
    const originalPixels = originalDimensions.width * originalDimensions.height;
    const newPixels = width * height;
    const ratio = newPixels / originalPixels;
    
    let estimatedSize = originalSize * ratio;
    
    // Adjust for different formats
    if (imageType === 'image/png') {
      // PNG is lossless, so size reduction might be less dramatic
      estimatedSize = estimatedSize * 1.2;
    } else if (imageType === 'image/svg+xml') {
      // SVG size doesn't necessarily scale with dimensions
      estimatedSize = originalSize;
    }
    
    if (estimatedSize < 1024) {
      return `${Math.round(estimatedSize)} B`;
    } else if (estimatedSize < 1024 * 1024) {
      return `${(estimatedSize / 1024).toFixed(1)} KB`;
    } else {
      return `${(estimatedSize / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setImageType(file.type);
    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    setOriginalFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        setOriginalDimensions({ width, height });
        setNewDimensions({ width, height });
        setScalePercentage(100);
        setEstimatedNewSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClearAll = () => {
    setImage(null);
    setFileName('');
    setFileSize('');
    setOriginalDimensions({ width: 0, height: 0 });
    setNewDimensions({ width: 0, height: 0 });
    setScalePercentage(100);
  };

  const handleScaleChange = (value: number[]) => {
    const scale = value[0];
    setScalePercentage(scale);
    const newWidth = Math.round((originalDimensions.width * scale) / 100);
    const newHeight = Math.round((originalDimensions.height * scale) / 100);
    setNewDimensions({
      width: newWidth,
      height: newHeight,
    });
    setEstimatedNewSize(calculateEstimatedSize(newWidth, newHeight, originalFileSize));
  };

  const canUpscale = imageType === 'image/svg+xml';

  const handleResize = async () => {
    if (!image || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = newDimensions.width;
    canvas.height = newDimensions.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    
    await new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height);
        const quality = imageType === 'image/svg+xml' ? 1.0 : 0.8;
        const resizedImage = canvas.toDataURL(imageType, quality);
        
        const link = document.createElement('a');
        link.download = `resized-${fileName}`;
        link.href = resizedImage;
        link.click();
      };
    });
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Image Resizer</h1>
          <p className="text-lg text-gray-600">Resize images while preserving quality</p>
        </div>

        <div className="mt-8">
          <div className="space-y-4">
            <div
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 transition-colors duration-150 ease-in-out hover:border-gray-400 cursor-pointer"
            >
              <div className="text-center">
                <div className="mx-auto flex justify-center text-blue-500 mb-4">
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-600">Choose files or drag & drop</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, JPEG, WebP, AVIF, SVG
                  </p>
                </div>
              </div>
            </div>

            {image && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">Selected File (1)</h2>
                  <Button variant="ghost" onClick={handleClearAll} className="text-sm text-gray-500">
                    Clear all
                  </Button>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-sm text-gray-500">{fileSize}</p>
                      </div>
                    </div>
                    <button onClick={handleClearAll} className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6 space-y-6">
                  <div className="aspect-video relative rounded-lg border overflow-hidden bg-gray-50">
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Preview"
                      className="object-contain w-full h-full"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium">Scale: {scalePercentage}%</Label>
                        <span className="text-sm text-gray-500">
                          {newDimensions.width} x {newDimensions.height}px
                        </span>
                      </div>
                      <Slider
                        min={25}
                        max={canUpscale ? 200 : 100}
                        step={1}
                        value={[scalePercentage]}
                        onValueChange={handleScaleChange}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Original size: {originalDimensions.width} x {originalDimensions.height}px</span>
                        <span>Original file size: {fileSize}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Estimated new file size: </span>
                        <span className={
                          estimatedNewSize.localeCompare(fileSize) < 0 
                            ? "text-green-600 font-medium"
                            : "text-yellow-600 font-medium"
                        }>
                          {estimatedNewSize}
                        </span>
                      </div>
                      {!canUpscale && (
                        <p className="text-sm text-yellow-600">
                          Note: Only SVG images can be scaled up. Other formats can only be downsized.
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={handleResize} 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download Resized Image</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 