'use client';

import { ImageCropper } from './components/image-cropper';

export default function ImageCropperPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Image Cropper</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Crop and rotate your images right in your browser. Supports PNG, JPG, JPEG, WebP, and AVIF formats.
        </p>
        <ImageCropper />
      </div>
    </div>
  );
} 