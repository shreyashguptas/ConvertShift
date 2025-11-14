'use client';

import { useState, ChangeEvent, useRef } from 'react';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Resolution preset definitions
const RESOLUTION_PRESETS = {
  '4K': { width: 3840, height: 2160, label: '4K (3840×2160)' },
  '2K': { width: 2560, height: 1440, label: '2K (2560×1440)' },
  '1080p': { width: 1920, height: 1080, label: '1080p (1920×1080)' },
  '720p': { width: 1280, height: 720, label: '720p (1280×720)' },
  '480p': { width: 854, height: 480, label: '480p (854×480)' },
  'custom': { width: 0, height: 0, label: 'Custom Dimensions' }
};

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [newDimensions, setNewDimensions] = useState({ width: 0, height: 0 });
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);
  const [imageType, setImageType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [estimatedNewSize, setEstimatedNewSize] = useState<string>('');
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

  // Check if a preset resolution is available (not larger than original)
  const isPresetAvailable = (presetKey: string) => {
    if (presetKey === 'custom') return true;
    const preset = RESOLUTION_PRESETS[presetKey as keyof typeof RESOLUTION_PRESETS];
    return preset.width <= originalDimensions.width && preset.height <= originalDimensions.height;
  };

  // Handle preset selection from dropdown
  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);

    if (value === 'custom') {
      // Reset to custom dimensions or original dimensions
      setCustomWidth(originalDimensions.width);
      setCustomHeight(originalDimensions.height);
      setNewDimensions({ width: originalDimensions.width, height: originalDimensions.height });
      setEstimatedNewSize(calculateEstimatedSize(originalDimensions.width, originalDimensions.height, originalFileSize));
    } else {
      const preset = RESOLUTION_PRESETS[value as keyof typeof RESOLUTION_PRESETS];
      setCustomWidth(preset.width);
      setCustomHeight(preset.height);
      setNewDimensions({ width: preset.width, height: preset.height });
      setEstimatedNewSize(calculateEstimatedSize(preset.width, preset.height, originalFileSize));
    }
  };

  // Handle custom width input
  const handleCustomWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.min(value, originalDimensions.width);
    setCustomWidth(clampedValue);
    setNewDimensions({ ...newDimensions, width: clampedValue });
    setEstimatedNewSize(calculateEstimatedSize(clampedValue, newDimensions.height, originalFileSize));
  };

  // Handle custom height input
  const handleCustomHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.min(value, originalDimensions.height);
    setCustomHeight(clampedValue);
    setNewDimensions({ ...newDimensions, height: clampedValue });
    setEstimatedNewSize(calculateEstimatedSize(newDimensions.width, clampedValue, originalFileSize));
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

      const img = new window.Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        setOriginalDimensions({ width, height });
        setNewDimensions({ width, height });
        setCustomWidth(width);
        setCustomHeight(height);
        setSelectedPreset('custom');
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
    setCustomWidth(0);
    setCustomHeight(0);
    setSelectedPreset('custom');
  };


  const handleResize = async () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    canvas.width = newDimensions.width;
    canvas.height = newDimensions.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new window.Image();
    img.src = image;

    await new Promise((resolve) => {
      img.onload = () => {
        // Calculate aspect ratios
        const originalAspectRatio = originalDimensions.width / originalDimensions.height;
        const targetAspectRatio = newDimensions.width / newDimensions.height;

        // Check if aspect ratio changed (with small tolerance for floating point errors)
        const aspectRatioChanged = Math.abs(originalAspectRatio - targetAspectRatio) > 0.01;

        if (aspectRatioChanged) {
          // Crop-to-fit: Scale to cover target dimensions, then crop
          const scaleX = newDimensions.width / originalDimensions.width;
          const scaleY = newDimensions.height / originalDimensions.height;
          const scale = Math.max(scaleX, scaleY); // Use larger scale to cover

          const scaledWidth = originalDimensions.width * scale;
          const scaledHeight = originalDimensions.height * scale;

          // Calculate crop offsets to center the image
          const offsetX = (scaledWidth - newDimensions.width) / 2;
          const offsetY = (scaledHeight - newDimensions.height) / 2;

          // Draw the scaled image with offset to achieve center crop
          ctx.drawImage(
            img,
            0, 0, originalDimensions.width, originalDimensions.height, // source rectangle
            -offsetX, -offsetY, scaledWidth, scaledHeight // destination rectangle
          );
        } else {
          // Simple scale: aspect ratio maintained
          ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height);
        }

        const quality = imageType === 'image/svg+xml' ? 1.0 : 0.8;
        const resizedImage = canvas.toDataURL(imageType, quality);

        const link = document.createElement('a');
        link.download = `resized-${fileName}`;
        link.href = resizedImage;
        link.click();
        resolve(null);
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
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 transition-colors duration-150 ease-in-out hover:border-gray-400 cursor-pointer"
            >
              <div className="text-center" onClick={handleUploadClick}>
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
                    <NextImage
                      src={image}
                      alt="Preview"
                      fill
                      sizes="100vw"
                      className="object-contain"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Resolution Preset</Label>
                        <Select value={selectedPreset} onValueChange={handlePresetChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a resolution preset" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
                              <SelectItem
                                key={key}
                                value={key}
                                disabled={!isPresetAvailable(key)}
                              >
                                {preset.label}
                                {!isPresetAvailable(key) && key !== 'custom' && (
                                  <span className="text-xs text-gray-400 ml-2">(too large)</span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            Width (px)
                          </Label>
                          <Input
                            type="number"
                            value={customWidth}
                            onChange={handleCustomWidthChange}
                            max={originalDimensions.width}
                            min={1}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">max: {originalDimensions.width}px</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-2 block">
                            Height (px)
                          </Label>
                          <Input
                            type="number"
                            value={customHeight}
                            onChange={handleCustomHeightChange}
                            max={originalDimensions.height}
                            min={1}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">max: {originalDimensions.height}px</p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 text-center">
                        New dimensions: {newDimensions.width} x {newDimensions.height}px
                      </div>
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