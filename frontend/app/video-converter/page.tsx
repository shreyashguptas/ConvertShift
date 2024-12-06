'use client';

import { useState } from 'react'
import { FFmpegProvider, useFFmpeg } from '@/components/ffmpeg-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VideoFormat {
  label: string;
  extension: string;
  mimeType: string;
  codec: string;
  compatibleFrom: string[];
  settings: {
    preset: string;
    crf: string;
    extraArgs?: string[];
  };
}

const VIDEO_FORMATS: Record<string, VideoFormat> = {
  'mp4-h264': {
    label: 'MP4 (H.264)',
    extension: 'mp4',
    mimeType: 'video/mp4',
    codec: 'libx264',
    compatibleFrom: ['mp4', 'mov', 'webm', 'mkv'],
    settings: {
      preset: 'medium',
      crf: '23'
    }
  },
  'mp4-h265': {
    label: 'MP4 (H.265/HEVC)',
    extension: 'mp4',
    mimeType: 'video/mp4',
    codec: 'libx265',
    compatibleFrom: ['mp4', 'mov', 'webm', 'mkv'],
    settings: {
      preset: 'medium',
      crf: '28',
      extraArgs: ['-x265-params', 'log-level=error']
    }
  },
  'webm-vp9': {
    label: 'WebM (VP9)',
    extension: 'webm',
    mimeType: 'video/webm',
    codec: 'libvpx-vp9',
    compatibleFrom: ['mp4', 'webm', 'mkv'],
    settings: {
      preset: 'medium',
      crf: '30',
      extraArgs: ['-b:v', '0', '-deadline', 'good', '-cpu-used', '4']
    }
  }
};

function VideoConverterContent() {
  const { ffmpeg, loaded } = useFFmpeg();
  const [sourceFormat, setSourceFormat] = useState('');
  const [targetFormat, setTargetFormat] = useState('');
  const [videoData, setVideoData] = useState<Uint8Array | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const getCompatibleFormats = (sourceFormat: string): string[] => {
    return Object.entries(VIDEO_FORMATS)
      .filter(([_, format]) => format.compatibleFrom.includes(sourceFormat))
      .map(([key]) => key);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setSourceFormat('')
      setTargetFormat('')
      setVideoData(null)
      return
    }

    const format = file.name.split('.').pop()?.toLowerCase() || ''
    setSourceFormat(format)
    setVideoData(new Uint8Array(await file.arrayBuffer()))

    // Set first compatible format as default
    const compatibleFormats = getCompatibleFormats(format)
    if (compatibleFormats.length > 0) {
      setTargetFormat(compatibleFormats[0])
    } else {
      setError(`Unsupported source format: ${format}`)
    }
  }

  const convertVideo = async () => {
    if (!videoData || !targetFormat) return;

    setIsConverting(true);
    setError('');
    setProgress(0);

    try {
      const format = VIDEO_FORMATS[targetFormat];
      const inputExt = sourceFormat.toLowerCase();
      const outputExt = format.extension;

      if (!format.compatibleFrom.includes(sourceFormat)) {
        setError(`Cannot convert from ${sourceFormat} to ${format.label}`);
        return;
      }

      await ffmpeg.writeFile(`input.${inputExt}`, videoData);
      
      const args = [
        '-i', `input.${inputExt}`,
        '-c:v', format.codec,
        '-preset', format.settings.preset,
        '-crf', format.settings.crf
      ];

      // Add format-specific extra arguments
      if (format.settings.extraArgs) {
        args.push(...format.settings.extraArgs);
      }

      // Add output file
      args.push(`output.${outputExt}`);

      // Run the conversion
      await ffmpeg.exec(args);

      // Read the output file
      const data = await ffmpeg.readFile(`output.${outputExt}`);
      const uint8Array = new Uint8Array(data);

      // Create and trigger download
      const blob = new Blob([uint8Array], { type: format.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-video.${outputExt}`;
      a.click();
      URL.revokeObjectURL(url);

      setIsConverting(false);
      setProgress(100);
    } catch (error) {
      console.error('Conversion error:', error);
      setError('Failed to convert video. Please try again.');
      setIsConverting(false);
    }
  };

  if (!loaded) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-lg text-gray-600">Loading video converter...</p>
            <p className="text-sm text-gray-500">This might take a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Video Converter</h1>
          <p className="text-lg text-gray-600">Convert videos between formats while maintaining quality</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) await handleFileChange(file);
          }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 transition-colors duration-150 ease-in-out hover:border-gray-400 cursor-pointer"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) await handleFileChange(file);
            };
            input.click();
          }}
        >
          <div className="text-center">
            <div className="mx-auto flex justify-center text-blue-500 mb-4">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-600">Choose files or drag & drop</span>
              <p className="text-sm text-gray-500 mt-2">
                Supports MP4, MOV, WebM, and MKV
              </p>
            </div>
          </div>
        </div>

        {videoData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Target Format</Label>
              <Select 
                value={targetFormat} 
                onValueChange={setTargetFormat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select output format" />
                </SelectTrigger>
                <SelectContent>
                  {getCompatibleFormats(sourceFormat).map((key) => (
                    <SelectItem key={key} value={key}>
                      {VIDEO_FORMATS[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={convertVideo}
              disabled={isConverting || !targetFormat} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2"
            >
              {isConverting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Converting... {progress}%</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Convert Video</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoConverter() {
  return (
    <FFmpegProvider>
      <VideoConverterContent />
    </FFmpegProvider>
  );
} 