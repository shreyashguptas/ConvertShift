'use client';

import { useState } from 'react';
import { ImageConverter } from './components/image-converter';
import { Card } from '@/components/ui/card';

export default function ImageConverterPage() {
  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Image Format Converter</h1>
          <p className="text-muted-foreground">
            Convert your images between different formats while maintaining quality. Supports PNG, JPG, JPEG, WebP, AVIF, and more.
          </p>
        </div>
        
        <Card className="p-6">
          <ImageConverter />
        </Card>
      </div>
    </main>
  );
} 