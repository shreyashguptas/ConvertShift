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

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setImage(url);
    setRotation(0);
  }, [toast]);

  const handleRotate = useCallback((direction: 'left' | 'right') => {
    setRotation(prev => {
      const newRotation = direction === 'left' ? prev - 90 : prev + 90;
      return ((newRotation % 360) + 360) % 360; // Normalize to 0-359
    });
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = cropperRef.current?.getCroppedImage();
    if (!canvas) {
      toast({
        title: 'Error',
        description: 'Failed to crop image.',
        variant: 'destructive',
      });
      return;
    }

    // Create download link
    canvas.toBlob((blob) => {
      if (!blob) {
        toast({
          title: 'Error',
          description: 'Failed to create image file.',
          variant: 'destructive',
        });
        return;
      }

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
        description: 'Image downloaded successfully.',
      });
    });
  }, [toast]);

  return (
    <div className="space-y-6">
      {!image ? (
        <FileDropzone
          onDrop={handleFileSelect}
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