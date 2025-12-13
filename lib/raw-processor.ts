// RAW file extensions supported
export const RAW_EXTENSIONS = [
  '.dng',   // Adobe Digital Negative
  '.cr2',   // Canon Raw 2
  '.cr3',   // Canon Raw 3
  '.nef',   // Nikon Electronic Format
  '.arw',   // Sony Alpha Raw
  '.raf',   // Fujifilm Raw
  '.orf',   // Olympus Raw Format
  '.rw2',   // Panasonic Raw
  '.pef',   // Pentax Electronic File
  '.srw',   // Samsung Raw
  '.x3f',   // Sigma Raw
  '.raw',   // Generic Raw
  '.3fr',   // Hasselblad Raw
  '.kdc',   // Kodak Raw
  '.dcr',   // Kodak Raw
  '.mrw',   // Minolta Raw
  '.erf',   // Epson Raw
  '.mef',   // Mamiya Raw
  '.mos',   // Leaf Raw
  '.rwl',   // Leica Raw
  '.srf',   // Sony Raw
  '.crw',   // Canon Raw (older)
  '.tiff',  // TIFF (sometimes RAW)
  '.tif',   // TIFF
] as const;

export type RawExtension = typeof RAW_EXTENSIONS[number];

/**
 * Check if a file is a RAW image based on extension
 */
export function isRawFile(file: File): boolean {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return RAW_EXTENSIONS.includes(extension as RawExtension);
}

/**
 * Check if a file is a standard web-displayable image
 */
export function isStandardImage(file: File): boolean {
  return file.type.startsWith('image/') && !isRawFile(file);
}

/**
 * Get accepted file types string for input element
 */
export function getAcceptedImageTypes(): string {
  const standardTypes = 'image/*';
  const rawExtensions = RAW_EXTENSIONS.join(',');
  return `${standardTypes},${rawExtensions}`;
}

export interface RawConversionResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  metadata: {
    make?: string;
    model?: string;
    iso?: number;
    shutterSpeed?: number;
    aperture?: number;
    focalLength?: number;
  };
}

export interface RawConversionProgress {
  stage: 'uploading' | 'processing' | 'complete';
  progress: number;
  message: string;
}

/**
 * Convert a RAW file to a displayable PNG using server-side processing
 */
export async function convertRawToImage(
  file: File,
  onProgress?: (progress: RawConversionProgress) => void
): Promise<RawConversionResult> {
  onProgress?.({
    stage: 'uploading',
    progress: 10,
    message: 'Uploading RAW file...'
  });

  // Create FormData with the file
  const formData = new FormData();
  formData.append('file', file);

  // Add timeout with AbortController (55s to be under Vercel's 60s limit)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  try {
    onProgress?.({
      stage: 'processing',
      progress: 40,
      message: 'Converting RAW image...'
    });

    // Send to API route with abort signal
    const response = await fetch('/api/convert-raw', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Response wasn't JSON - might be HTML error page
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Conversion failed');
    }

    onProgress?.({
      stage: 'processing',
      progress: 80,
      message: 'Finalizing...'
    });

    // Convert data URL to blob - with error handling
    let blob: Blob;
    try {
      const base64Response = await fetch(result.dataUrl);
      blob = await base64Response.blob();
    } catch {
      throw new Error('Failed to process converted image');
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Conversion complete!'
    });

    return {
      blob,
      dataUrl: result.dataUrl,
      width: result.width,
      height: result.height,
      metadata: {},
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. The file may be too large.');
    }

    throw error;
  }
}
