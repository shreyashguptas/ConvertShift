import LibRaw from 'libraw-wasm';

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
  stage: 'loading' | 'processing' | 'complete';
  progress: number;
  message: string;
}

/**
 * Convert a RAW file to a displayable PNG using client-side WebAssembly processing
 * Files never leave the user's device - 100% client-side
 */
export async function convertRawToImage(
  file: File,
  onProgress?: (progress: RawConversionProgress) => void
): Promise<RawConversionResult> {
  onProgress?.({
    stage: 'loading',
    progress: 10,
    message: 'Reading RAW file...'
  });

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    onProgress?.({
      stage: 'processing',
      progress: 30,
      message: 'Decoding RAW image...'
    });

    // Create LibRaw instance and process the file
    const raw = new LibRaw();
    await raw.open(uint8Array, {
      useCameraWb: true,  // Use camera white balance
      halfSize: false,    // Full resolution
      outputBps: 8,       // 8-bit output
    });

    onProgress?.({
      stage: 'processing',
      progress: 50,
      message: 'Processing image data...'
    });

    // Get metadata and image data
    const metadata = await raw.metadata();
    const imageData = await raw.imageData();

    onProgress?.({
      stage: 'processing',
      progress: 70,
      message: 'Creating displayable image...'
    });

    // Convert RGB pixel data to PNG using canvas
    const width = imageData.width;
    const height = imageData.height;
    const rgbData = imageData.data;

    // Create canvas to render the image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }

    // Create ImageData from RGB pixels (need to convert RGB to RGBA)
    const imgData = ctx.createImageData(width, height);
    const pixels = imgData.data;

    // Convert RGB to RGBA
    for (let i = 0, j = 0; i < rgbData.length; i += 3, j += 4) {
      pixels[j] = rgbData[i];       // R
      pixels[j + 1] = rgbData[i + 1]; // G
      pixels[j + 2] = rgbData[i + 2]; // B
      pixels[j + 3] = 255;            // A (fully opaque)
    }

    ctx.putImageData(imgData, 0, 0);

    onProgress?.({
      stage: 'processing',
      progress: 90,
      message: 'Finalizing...'
    });

    // Convert canvas to blob and data URL
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
        'image/png',
        1.0
      );
    });

    const dataUrl = canvas.toDataURL('image/png');

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Conversion complete!'
    });

    return {
      blob,
      dataUrl,
      width,
      height,
      metadata: {
        make: metadata.make,
        model: metadata.model,
        iso: metadata.iso_speed,
        shutterSpeed: metadata.shutter,
        aperture: metadata.aperture,
        focalLength: metadata.focal_len,
      },
    };
  } catch (error) {
    console.error('RAW conversion error:', error);

    if (error instanceof Error) {
      throw new Error(`RAW conversion failed: ${error.message}`);
    }
    throw new Error('RAW conversion failed: Unknown error');
  }
}
