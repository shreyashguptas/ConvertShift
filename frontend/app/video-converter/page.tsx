'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FFmpegProvider, useFFmpeg } from '@/components/ffmpeg-provider';

// Format configurations with compatibility and conversion settings
const VIDEO_FORMATS = {
  'mp4-h264': {
    extension: 'mp4',
    mimeType: 'video/mp4',
    codec: 'libx264',
    label: 'MP4 (H.264)',
    description: 'Best for web and universal compatibility',
    compatibleFrom: ['mov', 'mp4', 'webm', 'avi', 'mkv', 'flv'],
    settings: {
      preset: 'medium',
      crf: '23'
    }
  },
  'mp4-h265': {
    extension: 'mp4',
    mimeType: 'video/mp4',
    codec: 'libx265',
    label: 'MP4 (H.265/HEVC)',
    description: 'High efficiency, smaller file size',
    compatibleFrom: ['mov', 'mp4', 'mkv'],
    settings: {
      preset: 'medium',
      crf: '28',
      extraArgs: ['-x265-params', 'log-level=error']
    }
  },
  'webm-vp9': {
    extension: 'webm',
    mimeType: 'video/webm',
    codec: 'libvpx-vp9',
    label: 'WebM (VP9)',
    description: 'Open format, good for web',
    compatibleFrom: ['mp4', 'webm', 'mkv'],
    settings: {
      quality: 'good',
      cpuUsed: '4'
    }
  },
  'mov-h264': {
    extension: 'mov',
    mimeType: 'video/quicktime',
    codec: 'libx264',
    label: 'QuickTime MOV (H.264)',
    description: 'Apple QuickTime format',
    compatibleFrom: ['mov', 'mp4', 'mkv'],
    settings: {
      preset: 'medium',
      crf: '23'
    }
  },
  'prores': {
    extension: 'mov',
    mimeType: 'video/quicktime',
    codec: 'prores_ks',
    label: 'ProRes',
    description: 'Professional Apple format',
    compatibleFrom: ['mov', 'mp4'],
    settings: {
      profile: '3', // ProRes 422 HQ
      vendor: 'apl0',
      bits_per_mb: '8000'
    }
  },
  'dnxhd': {
    extension: 'mxf',
    mimeType: 'application/mxf',
    codec: 'dnxhd',
    label: 'DNxHD',
    description: 'Professional Avid format',
    compatibleFrom: ['mov', 'mxf', 'mp4'],
    settings: {
      profile: 'dnxhr_hq',
      bits_per_mb: '8000'
    }
  }
} as const;

function VideoConverterContent() {
  const { ffmpeg, loaded, fetchFile } = useFFmpeg();
  
  // File and video state
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<{
    format: string;
    duration: string;
    resolution: string;
    bitrate: string;
  } | null>(null);
  
  // Conversion state
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [targetFormat, setTargetFormat] = useState<keyof typeof VIDEO_FORMATS | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [availableFormats, setAvailableFormats] = useState<(keyof typeof VIDEO_FORMATS)[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Get file extension from the file name
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Check format compatibility
  const getCompatibleFormats = (sourceFormat: string): (keyof typeof VIDEO_FORMATS)[] => {
    return Object.entries(VIDEO_FORMATS)
      .filter(([_, format]) => format.compatibleFrom.includes(sourceFormat))
      .map(([key]) => key as keyof typeof VIDEO_FORMATS);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      await handleFile(files[0]);
    }
  };

  const getVideoInfo = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        
        setVideoInfo({
          format: file.type || 'Unknown format',
          duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          bitrate: 'Original quality',
        });
        
        URL.revokeObjectURL(video.src);
        resolve();
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    const extension = getFileExtension(file.name);
    const compatibleFormats = getCompatibleFormats(extension);

    if (compatibleFormats.length === 0) {
      setError(`Format ${extension} is not supported for conversion`);
      return;
    }

    setVideo(file);
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setAvailableFormats(compatibleFormats);
    await getVideoInfo(file);
    setError(null);
  };

  const handleVideoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFile(file);
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

  const getFFmpegArgs = (format: typeof VIDEO_FORMATS[keyof typeof VIDEO_FORMATS], inputFile: string, outputFile: string): string[] => {
    const args = ['-i', inputFile];

    // Add codec-specific settings
    switch (format.codec) {
      case 'libx264':
      case 'libx265':
        args.push(
          '-c:v', format.codec,
          '-preset', format.settings.preset,
          '-crf', format.settings.crf
        );
        if (format.settings.extraArgs) {
          args.push(...format.settings.extraArgs);
        }
        break;
      case 'libvpx-vp9':
        args.push(
          '-c:v', format.codec,
          '-quality', format.settings.quality,
          '-cpu-used', format.settings.cpuUsed
        );
        break;
      case 'prores_ks':
        args.push(
          '-c:v', format.codec,
          '-profile:v', format.settings.profile,
          '-vendor', format.settings.vendor,
          '-bits_per_mb', format.settings.bits_per_mb
        );
        break;
      case 'dnxhd':
        args.push(
          '-c:v', format.codec,
          '-profile:v', format.settings.profile,
          '-bits_per_mb', format.settings.bits_per_mb
        );
        break;
    }

    // Add audio settings
    args.push(
      '-c:a', 'aac',
      '-b:a', '320k',
      outputFile
    );

    return args;
  };

  const convertVideo = async () => {
    if (!video || !loaded || !ffmpeg || !targetFormat) {
      setError('Please select a video and target format');
      return;
    }

    const sourceFormat = getFileExtension(video.name);
    const format = VIDEO_FORMATS[targetFormat];

    if (!format.compatibleFrom.includes(sourceFormat)) {
      setError(`Cannot convert from ${sourceFormat} to ${format.label}`);
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      console.log('Starting conversion...');
      const videoData = await fetchFile(video);
      
      console.log('Writing input file...');
      await ffmpeg.writeFile('input.mp4', videoData);

      const outputFileName = `output.${format.extension}`;
      const args = getFFmpegArgs(format, 'input.mp4', outputFileName);

      console.log('Running FFmpeg command:', args.join(' '));
      await ffmpeg.exec(args);

      console.log('Reading output file...');
      const outputData = await ffmpeg.readFile(outputFileName);
      const blob = new Blob([outputData], { type: format.mimeType });
      const url = URL.createObjectURL(blob);
      
      console.log('Creating download link...');
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted-${fileName.split('.')[0]}.${format.extension}`;
      link.click();

      URL.revokeObjectURL(url);
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile(outputFileName);
      
      console.log('Conversion completed successfully');
    } catch (error) {
      console.error('Error during conversion:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during conversion');
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

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

        <div className="mt-8">
          <div className="space-y-4">
            <div
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 transition-colors duration-150 ease-in-out hover:border-gray-400 cursor-pointer"
            >
              <div className="text-center">
                <div className="mx-auto flex justify-center text-blue-500 mb-4">
                  <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-600">Choose files or drag & drop</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Supports MP4, MOV, AVI, MKV, WebM, FLV, and more
                  </p>
                </div>
              </div>
            </div>

            {video && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">Selected Video</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setVideo(null);
                      setVideoUrl(null);
                      setVideoInfo(null);
                    }} 
                    className="text-sm text-gray-500"
                  >
                    Clear
                  </Button>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{fileName}</p>
                        <p className="text-sm text-gray-500">{fileSize}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {videoUrl && (
                  <div className="aspect-video relative rounded-lg border overflow-hidden bg-gray-50">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                )}

                {videoInfo && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">Format:</span>
                      <span className="ml-2 font-medium">{videoInfo.format}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2 font-medium">{videoInfo.duration}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">Resolution:</span>
                      <span className="ml-2 font-medium">{videoInfo.resolution}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="text-gray-600">Quality:</span>
                      <span className="ml-2 font-medium">{videoInfo.bitrate}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target Format</Label>
                    <Select 
                      value={targetFormat} 
                      onValueChange={(value) => setTargetFormat(value as keyof typeof VIDEO_FORMATS)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select output format" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFormats.map((key) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex flex-col">
                              <span>{VIDEO_FORMATS[key].label}</span>
                              <span className="text-xs text-gray-500">{VIDEO_FORMATS[key].description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={convertVideo}
                    disabled={processing || !targetFormat} 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Converting...</span>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoConverterPage() {
  return (
    <FFmpegProvider>
      <VideoConverterContent />
    </FFmpegProvider>
  );
} 