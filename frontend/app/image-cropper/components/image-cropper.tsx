'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { CropperCanvas } from './cropper-canvas';
import { RotateControls } from './rotate-controls';

interface CropperCanvasRef {
  canvas: HTMLCanvasElement | null;
  getCroppedImage: () => HTMLCanvasElement | null;
}

export function ImageCropper() {
  const [image, setImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const cropperRef = useRef<CropperCanvasRef>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setRotation(0); // Reset rotation when new image is loaded
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleRotate = useCallback((direction: 'left' | 'right') => {
    setRotation(prev => {
      const newRotation = direction === 'left' ? prev - 90 : prev + 90;
      return ((newRotation % 360) + 360) % 360; // Normalize to 0-359
    });
  }, []);

  const handleDownload = useCallback(async () => {
    if (!cropperRef.current) return;

    try {
      const croppedCanvas = cropperRef.current.getCroppedImage();
      if (!croppedCanvas) {
        throw new Error('Failed to get cropped image');
      }

      // Convert to blob and download
      const blob = await new Promise<Blob>((resolve) => {
        croppedCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cropped-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Image downloaded successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download the image.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      {!image ? (
        <FileDropzone
          onFileSelect={handleFileSelect}
          accept="image/*"
          maxFiles={1}
        />
      ) : (
        <div className="space-y-4">
          <div className="relative border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
            <CropperCanvas
              ref={cropperRef}
              image={image}
              rotation={rotation}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <RotateControls onRotate={handleRotate} />
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setImage(null);
                  setRotation(0);
                }}
              >
                Clear
              </Button>
              <Button onClick={handleDownload}>
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 