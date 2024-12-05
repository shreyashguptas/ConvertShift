'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  loaded: boolean;
  fetchFile: typeof fetchFile;
}

const FFmpegContext = createContext<FFmpegContextType>({
  ffmpeg: null,
  loaded: false,
  fetchFile,
});

export function useFFmpeg() {
  return useContext(FFmpegContext);
}

export function FFmpegProvider({ children }: { children: ReactNode }) {
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadFFmpeg = async () => {
      try {
        // Create blob URLs for the FFmpeg core files
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const coreURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript'
        );
        const wasmURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm'
        );
        const workerURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          'text/javascript'
        );

        // Create and configure FFmpeg instance
        const instance = new FFmpeg();
        await instance.load({
          coreURL,
          wasmURL,
          workerURL
        });

        if (mounted) {
          setFFmpeg(instance);
          setLoaded(true);
          console.log('FFmpeg loaded successfully');
        }
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
        }
      }
    };

    loadFFmpeg();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video processing capabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <FFmpegContext.Provider value={{ ffmpeg, loaded, fetchFile }}>
      {children}
    </FFmpegContext.Provider>
  );
} 