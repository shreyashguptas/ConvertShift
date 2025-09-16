declare module '@imgly/background-removal' {
  export interface BackgroundRemovalOptions {
    autoDownloadModel?: boolean;
    debug?: boolean;
    onProgress?: (progress: number) => void;
    workerURL?: string;
    model?: 'small' | 'medium' | 'large';
  }

  export function removeBackground(
    input:
      | Blob
      | File
      | HTMLImageElement
      | ImageData
      | HTMLCanvasElement,
    options?: BackgroundRemovalOptions
  ): Promise<Blob>;
}


