/**
 * Converts an image file to the specified format using canvas
 * @param file The source image file
 * @param targetFormat The MIME type to convert to (e.g., 'image/webp')
 * @returns Promise<Blob> The converted image as a Blob
 */
export async function convertImage(file: File, targetFormat: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { 
      alpha: true, // Preserve alpha channel
      willReadFrequently: true // Optimize for pixel manipulation
    });

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Set canvas dimensions to match image exactly
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Configure context for best quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear canvas to ensure no artifacts
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image onto canvas at exact size
      ctx.drawImage(img, 0, 0);

      // Convert to desired format with maximum quality
      const quality = targetFormat === 'image/jpeg' || targetFormat === 'image/webp' ? 1.0 : undefined;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        targetFormat,
        quality // Use maximum quality for formats that support it
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Prevent any image scaling or orientation changes
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = URL.createObjectURL(file);
  });
} 