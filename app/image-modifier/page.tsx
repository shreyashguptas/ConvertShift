'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Upload, Download, X, RotateCw, RotateCcw, Scissors, Eraser, Maximize2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Types
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProcessingResult {
  blob: Blob;
  url: string;
  filename: string;
}

// Resolution presets
const RESOLUTION_PRESETS = {
  '4K': { width: 3840, height: 2160, label: '4K (3840×2160)' },
  '2K': { width: 2560, height: 1440, label: '2K (2560×1440)' },
  '1080p': { width: 1920, height: 1080, label: '1080p (1920×1080)' },
  '720p': { width: 1280, height: 720, label: '720p (1280×720)' },
  '480p': { width: 854, height: 480, label: '480p (854×480)' },
  'custom': { width: 0, height: 0, label: 'Custom Dimensions' }
};

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Collapsible Section Component
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, enabled, onToggleEnabled, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Handler for clicking anywhere on the header - single click enables + expands
  const handleHeaderClick = () => {
    const newEnabled = !enabled;
    onToggleEnabled(newEnabled);
    setIsOpen(newEnabled); // Auto-expand when enabling, collapse when disabling
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={enabled}
              readOnly
              className="w-4 h-4 pointer-events-none"
            />
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>
          </div>
          <div className="p-1">
            {isOpen && enabled ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>
      {enabled && isOpen && (
        <div className="p-4 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default function ImageModifier() {
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Crop state
  const [cropEnabled, setCropEnabled] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Background removal state
  const [backgroundRemovalEnabled, setBackgroundRemovalEnabled] = useState(false);

  // Resize state
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [customWidth, setCustomWidth] = useState<number>(0);
  const [customHeight, setCustomHeight] = useState<number>(0);

  // Compression state
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [targetSize, setTargetSize] = useState<string>('1');
  const [sizeUnit, setSizeUnit] = useState<'MB' | 'KB'>('MB');

  // Conversion state
  const [conversionEnabled, setConversionEnabled] = useState(false);
  const [targetFormat, setTargetFormat] = useState<string>('png');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [result, setResult] = useState<ProcessingResult | null>(null);

  // RAW processing state
  const [isRawFile, setIsRawFile] = useState(false);
  const [isConvertingRaw, setIsConvertingRaw] = useState(false);
  const [rawConversionProgress, setRawConversionProgress] = useState(0);
  const [rawConversionMessage, setRawConversionMessage] = useState('');
  const [rawMetadata, setRawMetadata] = useState<{
    make?: string;
    model?: string;
    iso?: number;
    shutterSpeed?: number;
    aperture?: number;
    focalLength?: number;
  } | null>(null);

  // File upload handlers
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = async (selectedFile: File) => {
    // Import RAW utilities
    const { isRawFile: checkIsRaw, isStandardImage, convertRawToImage } =
      await import('@/lib/raw-processor');

    const isRaw = checkIsRaw(selectedFile);
    setIsRawFile(isRaw);

    // Validate file type
    if (!isRaw && !isStandardImage(selectedFile)) {
      toast.error('Please upload a valid image file (including RAW formats)');
      return;
    }

    setFile(selectedFile);
    setOriginalFileSize(selectedFile.size);
    setRawMetadata(null);

    if (isRaw) {
      // Handle RAW file conversion
      setIsConvertingRaw(true);
      setRawConversionProgress(0);
      setRawConversionMessage('Starting RAW conversion...');

      try {
        const result = await convertRawToImage(selectedFile, (progress) => {
          setRawConversionProgress(progress.progress);
          setRawConversionMessage(progress.message);
        });

        setPreviewUrl(result.dataUrl);
        setOriginalDimensions({ width: result.width, height: result.height });
        setCropArea({ x: 0, y: 0, width: result.width, height: result.height });
        setCustomWidth(result.width);
        setCustomHeight(result.height);
        setRawMetadata(result.metadata);

        toast.success('RAW image converted successfully!');
      } catch (error) {
        console.error('RAW conversion error:', error);
        toast.error('Failed to convert RAW image. The format may not be supported.');
        handleClear();
      } finally {
        setIsConvertingRaw(false);
      }
    } else {
      // Handle standard image (existing logic)
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);

        // Get image dimensions
        const img = new window.Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          // Initialize crop area to full image
          setCropArea({ x: 0, y: 0, width: img.width, height: img.height });
          // Initialize resize dimensions
          setCustomWidth(img.width);
          setCustomHeight(img.height);
        };
        img.src = url;
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setOriginalFileSize(0);
    setResult(null);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    setRotation(0);
    setSelectedPreset('custom');
    setProgress(0);
    setCurrentStep('');
    // Clear RAW-related state
    setIsRawFile(false);
    setRawMetadata(null);
    setRawConversionProgress(0);
    setRawConversionMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Crop handlers
  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropEnabled || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !cropEnabled || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(originalDimensions.width - prev.width, prev.x + dx)),
      y: Math.max(0, Math.min(originalDimensions.height - prev.height, prev.y + dy))
    }));
    setDragStart({ x, y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Resize handlers
  const isPresetAvailable = (presetKey: string) => {
    if (presetKey === 'custom') return true;
    const preset = RESOLUTION_PRESETS[presetKey as keyof typeof RESOLUTION_PRESETS];
    return preset.width <= originalDimensions.width && preset.height <= originalDimensions.height;
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value === 'custom') {
      setCustomWidth(originalDimensions.width);
      setCustomHeight(originalDimensions.height);
    } else {
      const preset = RESOLUTION_PRESETS[value as keyof typeof RESOLUTION_PRESETS];
      setCustomWidth(preset.width);
      setCustomHeight(preset.height);
    }
  };

  const handleCustomWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.min(value, originalDimensions.width);
    setCustomWidth(clampedValue);
  };

  const handleCustomHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.min(value, originalDimensions.height);
    setCustomHeight(clampedValue);
  };

  // Draw crop preview on canvas
  useEffect(() => {
    if (!cropEnabled || !canvasRef.current || !previewUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.src = previewUrl;
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image with rotation
      ctx.save();
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Draw semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear crop area (make it transparent to show original image)
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // Redraw image in crop area
      ctx.save();
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Draw crop rectangle border
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // Draw resize handles
      const handleSize = 10;
      const handles = [
        { x: cropArea.x, y: cropArea.y }, // top-left
        { x: cropArea.x + cropArea.width, y: cropArea.y }, // top-right
        { x: cropArea.x, y: cropArea.y + cropArea.height }, // bottom-left
        { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height }, // bottom-right
      ];

      ctx.fillStyle = '#3B82F6';
      handles.forEach(handle => {
        ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      });
    };
  }, [cropEnabled, cropArea, rotation, previewUrl]);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [result, previewUrl]);

  // Processing Pipeline
  const handleProcess = async () => {
    if (!file || !previewUrl) {
      toast.error('Please upload an image first');
      return;
    }

    // Check if at least one operation is enabled
    if (!cropEnabled && !backgroundRemovalEnabled && !resizeEnabled && !compressionEnabled && !conversionEnabled) {
      toast.error('Please enable at least one operation');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Starting...');

    try {
      let currentImage = new window.Image();
      currentImage.src = previewUrl;
      await new Promise((resolve) => {
        currentImage.onload = resolve;
      });

      let currentCanvas = document.createElement('canvas');
      let ctx = currentCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      let processedBlob: Blob | null = null;
      const totalSteps = [cropEnabled, backgroundRemovalEnabled, resizeEnabled, compressionEnabled || conversionEnabled].filter(Boolean).length;
      let completedSteps = 0;

      // Step 1: Crop
      if (cropEnabled) {
        setCurrentStep('Cropping image...');
        currentCanvas.width = cropArea.width;
        currentCanvas.height = cropArea.height;

        ctx.save();
        if (rotation !== 0) {
          ctx.translate(currentCanvas.width / 2, currentCanvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-currentCanvas.width / 2, -currentCanvas.height / 2);
        }

        ctx.drawImage(
          currentImage,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, cropArea.width, cropArea.height
        );
        ctx.restore();

        // Update current image from canvas
        const croppedDataUrl = currentCanvas.toDataURL();
        currentImage = new window.Image();
        currentImage.src = croppedDataUrl;
        await new Promise((resolve) => {
          currentImage.onload = resolve;
        });

        completedSteps++;
        setProgress((completedSteps / totalSteps) * 100);
      }

      // Step 2: Background Removal
      if (backgroundRemovalEnabled) {
        setCurrentStep('Removing background (AI processing)...');

        // Convert current state to blob
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = currentImage.width;
        tempCanvas.height = currentImage.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(currentImage, 0, 0);
          processedBlob = await new Promise<Blob>((resolve) => {
            tempCanvas.toBlob((blob) => resolve(blob!), 'image/png');
          });
        }

        if (processedBlob) {
          // Dynamic import to avoid SSR issues
          const { removeBackground } = await import('@imgly/background-removal');

          const resultBlob = await removeBackground(processedBlob, {
            onProgress: (progress: number) => {
              const overallProgress = ((completedSteps + progress) / totalSteps) * 100;
              setProgress(overallProgress);
            }
          });

          // Update current image from result
          const url = URL.createObjectURL(resultBlob);
          currentImage = new window.Image();
          currentImage.src = url;
          await new Promise((resolve) => {
            currentImage.onload = resolve;
          });
          URL.revokeObjectURL(url);
        }

        completedSteps++;
        setProgress((completedSteps / totalSteps) * 100);
      }

      // Step 3: Resize
      if (resizeEnabled) {
        setCurrentStep('Resizing image...');

        const targetWidth = customWidth;
        const targetHeight = customHeight;

        currentCanvas.width = targetWidth;
        currentCanvas.height = targetHeight;
        ctx = currentCanvas.getContext('2d');

        if (ctx) {
          // Calculate aspect ratios
          const originalAspectRatio = currentImage.width / currentImage.height;
          const targetAspectRatio = targetWidth / targetHeight;

          // Check if aspect ratio changed
          const aspectRatioChanged = Math.abs(originalAspectRatio - targetAspectRatio) > 0.01;

          if (aspectRatioChanged) {
            // Crop-to-fit: Scale to cover target dimensions, then crop
            const scaleX = targetWidth / currentImage.width;
            const scaleY = targetHeight / currentImage.height;
            const scale = Math.max(scaleX, scaleY);

            const scaledWidth = currentImage.width * scale;
            const scaledHeight = currentImage.height * scale;

            const offsetX = (scaledWidth - targetWidth) / 2;
            const offsetY = (scaledHeight - targetHeight) / 2;

            ctx.drawImage(
              currentImage,
              0, 0, currentImage.width, currentImage.height,
              -offsetX, -offsetY, scaledWidth, scaledHeight
            );
          } else {
            // Simple scale: aspect ratio maintained
            ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);
          }

          // Update current image from canvas
          const resizedDataUrl = currentCanvas.toDataURL();
          currentImage = new window.Image();
          currentImage.src = resizedDataUrl;
          await new Promise((resolve) => {
            currentImage.onload = resolve;
          });
        }

        completedSteps++;
        setProgress((completedSteps / totalSteps) * 100);
      }

      // Step 4: Compression + Format Conversion (combined final encoding step)
      if (compressionEnabled || conversionEnabled) {
        setCurrentStep('Finalizing (compression & format conversion)...');

        // Update canvas with current image if not already done
        currentCanvas.width = currentImage.width;
        currentCanvas.height = currentImage.height;
        ctx = currentCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(currentImage, 0, 0);
        }

        // Determine output format
        let outputFormat = file.type;
        if (conversionEnabled && targetFormat) {
          outputFormat = `image/${targetFormat}`;
        }

        // Convert canvas to blob
        processedBlob = await new Promise<Blob>((resolve) => {
          currentCanvas.toBlob((blob) => resolve(blob!), outputFormat, 0.8);
        });

        // Apply compression if enabled
        if (compressionEnabled && processedBlob) {
          const targetSizeBytes = parseFloat(targetSize) * (sizeUnit === 'MB' ? 1024 * 1024 : 1024);

          if (processedBlob.size > targetSizeBytes) {
            // Use browser-image-compression
            const imageCompression = (await import('browser-image-compression')).default;

            const options = {
              maxSizeMB: targetSizeBytes / (1024 * 1024),
              maxWidthOrHeight: Math.max(currentImage.width, currentImage.height),
              useWebWorker: true,
              initialQuality: processedBlob.size > 5 * 1024 * 1024 ? 0.8 : 0.85,
            };

            const compressedFile = new File([processedBlob], file.name, { type: outputFormat });
            processedBlob = await imageCompression(compressedFile, options);
          }
        }

        completedSteps++;
        setProgress(100);
      }

      // If no compression/conversion, create final blob
      if (!processedBlob) {
        currentCanvas.width = currentImage.width;
        currentCanvas.height = currentImage.height;
        ctx = currentCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(currentImage, 0, 0);
          processedBlob = await new Promise<Blob>((resolve) => {
            currentCanvas.toBlob((blob) => resolve(blob!), file.type, 0.8);
          });
        }
      }

      if (processedBlob) {
        const resultUrl = URL.createObjectURL(processedBlob);
        // Determine correct file extension based on output format
        const outputExtension = (conversionEnabled && targetFormat)
          ? targetFormat
          : (file.name.split('.').pop() || 'png');
        const baseFilename = file.name.replace(/\.[^/.]+$/, '');
        const filename = `modified-${baseFilename}.${outputExtension}`;
        setResult({ blob: processedBlob, url: resultUrl, filename });
        toast.success('Image processed successfully!');
      }

    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.filename;
    link.click();
  };

  return (
    <div className="flex flex-col items-center p-6 max-w-3xl mx-auto">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Image Modifier</h1>
          <p className="text-gray-500">All-in-one image processing: Crop, Remove Background, Resize, Compress & Convert</p>
        </div>

        <div className="space-y-6">
          {/* RAW Conversion Loading State */}
          {isConvertingRaw && (
            <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-12 text-center">
              <div className="animate-spin mx-auto mb-4 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
              <p className="text-lg font-medium text-blue-700 mb-2">
                Converting RAW Image...
              </p>
              <p className="text-sm text-blue-600 mb-4">{rawConversionMessage}</p>
              <Progress value={rawConversionProgress} className="h-2 max-w-xs mx-auto" />
              <p className="text-xs text-blue-500 mt-2">
                RAW conversion can take 10-30 seconds for large files
              </p>
            </div>
          )}

          {/* File Upload */}
          {!file && !isConvertingRaw ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your image here or click to upload
              </p>
              <p className="text-sm text-gray-500 mb-3">Supports: PNG, JPG, WebP, AVIF, SVG + RAW formats (DNG, CR2, NEF, ARW, RAF, etc.)</p>
              <p className="text-xs text-gray-400">
                🔒 Standard images processed locally. RAW files require temporary server processing (never stored).
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.dng,.cr2,.cr3,.nef,.arw,.raf,.orf,.rw2,.pef,.srw,.x3f,.raw,.3fr,.kdc,.dcr,.mrw,.erf,.mef,.mos,.rwl,.srf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Original Image</h3>
                    <p className="text-sm text-gray-500">
                      {originalDimensions.width} × {originalDimensions.height}px | {formatFileSize(originalFileSize)}
                    </p>
                    {rawMetadata && (
                      <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3">
                        {rawMetadata.make && rawMetadata.model && (
                          <span>Camera: {rawMetadata.make} {rawMetadata.model}</span>
                        )}
                        {rawMetadata.iso && <span>ISO: {rawMetadata.iso}</span>}
                        {rawMetadata.aperture && <span>f/{rawMetadata.aperture.toFixed(1)}</span>}
                        {rawMetadata.shutterSpeed && (
                          <span>
                            {rawMetadata.shutterSpeed >= 1
                              ? `${rawMetadata.shutterSpeed}s`
                              : `1/${Math.round(1 / rawMetadata.shutterSpeed)}s`}
                          </span>
                        )}
                        {rawMetadata.focalLength && <span>{Math.round(rawMetadata.focalLength)}mm</span>}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    <X size={16} className="mr-2" />
                    Remove
                  </Button>
                </div>
                <div className="relative w-full max-w-2xl mx-auto bg-gray-100 rounded-lg overflow-hidden">
                  {cropEnabled ? (
                    <canvas
                      ref={canvasRef}
                      width={originalDimensions.width}
                      height={originalDimensions.height}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      className="max-w-full h-auto cursor-move"
                      style={{ display: 'block' }}
                    />
                  ) : (
                    previewUrl && originalDimensions.width > 0 && originalDimensions.height > 0 && (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={originalDimensions.width}
                        height={originalDimensions.height}
                        className="max-w-full h-auto"
                        unoptimized
                      />
                    )
                  )}
                </div>
              </div>

              {/* Operations Sections */}
              <div className="space-y-4">
                {/* Crop Section */}
                <CollapsibleSection
                  title="Crop & Rotate"
                  icon={<Scissors className="text-blue-600" size={20} />}
                  enabled={cropEnabled}
                  onToggleEnabled={setCropEnabled}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleRotateLeft}>
                        <RotateCcw size={16} className="mr-2" />
                        Rotate Left
                      </Button>
                      <Button variant="outline" onClick={handleRotateRight}>
                        <RotateCw size={16} className="mr-2" />
                        Rotate Right
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm">X Position</Label>
                        <Input
                          type="number"
                          value={Math.round(cropArea.x)}
                          onChange={(e) => setCropArea({ ...cropArea, x: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Y Position</Label>
                        <Input
                          type="number"
                          value={Math.round(cropArea.y)}
                          onChange={(e) => setCropArea({ ...cropArea, y: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Width</Label>
                        <Input
                          type="number"
                          value={Math.round(cropArea.width)}
                          onChange={(e) => setCropArea({ ...cropArea, width: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Height</Label>
                        <Input
                          type="number"
                          value={Math.round(cropArea.height)}
                          onChange={(e) => setCropArea({ ...cropArea, height: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Drag on the canvas to adjust crop area, or enter values manually
                    </p>
                  </div>
                </CollapsibleSection>

                {/* Background Removal Section */}
                <CollapsibleSection
                  title="Background Removal"
                  icon={<Eraser className="text-blue-600" size={20} />}
                  enabled={backgroundRemovalEnabled}
                  onToggleEnabled={setBackgroundRemovalEnabled}
                  defaultOpen={false}
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      AI-powered background removal will be applied. This may take a few moments depending on image size.
                    </p>
                  </div>
                </CollapsibleSection>

                {/* Resize Section */}
                <CollapsibleSection
                  title="Resize Dimensions"
                  icon={<Maximize2 className="text-green-600" size={20} />}
                  enabled={resizeEnabled}
                  onToggleEnabled={setResizeEnabled}
                  defaultOpen={false}
                >
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
                        <Label className="text-sm font-medium mb-2 block">Width (px)</Label>
                        <Input
                          type="number"
                          value={customWidth}
                          onChange={handleCustomWidthChange}
                          max={originalDimensions.width}
                          min={1}
                        />
                        <p className="text-xs text-gray-500 mt-1">max: {originalDimensions.width}px</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Height (px)</Label>
                        <Input
                          type="number"
                          value={customHeight}
                          onChange={handleCustomHeightChange}
                          max={originalDimensions.height}
                          min={1}
                        />
                        <p className="text-xs text-gray-500 mt-1">max: {originalDimensions.height}px</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Compression Section */}
                <CollapsibleSection
                  title="Compression"
                  icon={<FileDown className="text-orange-600" size={20} />}
                  enabled={compressionEnabled}
                  onToggleEnabled={setCompressionEnabled}
                  defaultOpen={false}
                >
                  <div className="space-y-4">
                    {/* Display current file size */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-800">
                        Current file size: <strong>{formatFileSize(originalFileSize)}</strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Target File Size</Label>
                        <Input
                          type="number"
                          value={targetSize}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            const maxSizeInUnit = sizeUnit === 'MB'
                              ? originalFileSize / (1024 * 1024)
                              : originalFileSize / 1024;
                            // Clamp to not exceed original file size
                            const clampedValue = Math.min(value, maxSizeInUnit);
                            setTargetSize(clampedValue > 0 ? clampedValue.toString() : e.target.value);
                          }}
                          min="0.1"
                          step="0.1"
                          max={sizeUnit === 'MB' ? originalFileSize / (1024 * 1024) : originalFileSize / 1024}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Unit</Label>
                        <Select value={sizeUnit} onValueChange={(value) => {
                          const newUnit = value as 'MB' | 'KB';
                          setSizeUnit(newUnit);
                          // Adjust target size when switching units to stay within bounds
                          const currentTargetBytes = parseFloat(targetSize) * (sizeUnit === 'MB' ? 1024 * 1024 : 1024);
                          if (currentTargetBytes > originalFileSize) {
                            const newMax = newUnit === 'MB'
                              ? (originalFileSize / (1024 * 1024)).toFixed(1)
                              : (originalFileSize / 1024).toFixed(0);
                            setTargetSize(newMax);
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KB">KB</SelectItem>
                            <SelectItem value="MB">MB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Target size: {targetSize} {sizeUnit} (max: {formatFileSize(originalFileSize)})
                    </p>
                  </div>
                </CollapsibleSection>

                {/* Format Conversion Section */}
                <CollapsibleSection
                  title="Format Conversion"
                  icon={<FileDown className="text-pink-600" size={20} />}
                  enabled={conversionEnabled}
                  onToggleEnabled={setConversionEnabled}
                  defaultOpen={false}
                >
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Target Format</Label>
                    <Select value={targetFormat} onValueChange={setTargetFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="avif">AVIF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleSection>
              </div>

              {/* Process Button */}
              <div className="pt-6 border-t border-gray-200">
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="w-full py-6 text-lg font-semibold"
                  size="lg"
                >
                  {isProcessing ? currentStep : 'Process Image'}
                </Button>

                {isProcessing && (
                  <div className="mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-500 text-center mt-2">{Math.round(progress)}% complete</p>
                  </div>
                )}
              </div>

              {/* Result Section */}
              {result && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-green-800">Processing Complete!</h3>
                      <p className="text-sm text-green-600">Your modified image is ready</p>
                    </div>
                    <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', minHeight: '200px' }}>
                    <Image
                      src={result.url}
                      alt="Result"
                      fill
                      className="object-contain"
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
