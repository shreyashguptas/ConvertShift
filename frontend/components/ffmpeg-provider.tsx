'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

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
        const instance = new FFmpeg();
        await instance.load({
          coreURL: '/ffmpeg-core.js',
          wasmURL: '/ffmpeg-core.wasm',
        });

        if (mounted) {
          setFFmpeg(instance);
          setLoaded(true);
        }
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
      }
    };

    loadFFmpeg();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FFmpegContext.Provider value={{ ffmpeg, loaded, fetchFile }}>
      {children}
    </FFmpegContext.Provider>
  );
} 