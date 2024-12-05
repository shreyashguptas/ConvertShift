'use client';

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Standard video resolutions
const VIDEO_RESOLUTIONS = {
  '8K': { width: 7680, height: 4320, label: '8K (7680x4320)' },
  '4K': { width: 3840, height: 2160, label: '4K (3840x2160)' },
  '2K': { width: 2560, height: 1440, label: '2K (2560x1440)' },
  'FHD': { width: 1920, height: 1080, label: '1080p (1920x1080)' },
  'HD': { width: 1280, height: 720, label: '720p (1280x720)' },
  'SD': { width: 854, height: 480, label: '480p (854x480)' },
  '360p': { width: 640, height: 360, label: '360p (640x360)' },
  '240p': { width: 426, height: 240, label: '240p (426x240)' },
  '144p': { width: 256, height: 144, label: '144p (256x144)' },
};

export default function VideoCompressor() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [originalResolution, setOriginalResolution] = useState<string>('');
  const [targetResolution, setTargetResolution] = useState<string>('');
  const [availableResolutions, setAvailableResolutions] = useState<string[]>([]);
  const [compressionLevel, setCompressionLevel] = useState(50);
  const [estimatedSize, setEstimatedSize] = useState<string>('');
  const [ffmpeg] = useState(() => new FFmpeg());
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        await ffmpeg.load({
          coreURL: '/ffmpeg-core.js',
          wasmURL: '/ffmpeg-core.wasm',
        });
        setLoaded(true);
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
      }
    };
    load();
  }, [ffmpeg]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const detectResolution = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const width = video.videoWidth;
        const height = video.videoHeight;
        
        // Find the closest standard resolution
        const resolutionEntry = Object.entries(VIDEO_RESOLUTIONS).find(([key, value]) => {
          return value.width === width && value.height === height;
        });
        
        resolve(resolutionEntry ? resolutionEntry[0] : `Custom (${width}x${height})`);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const getAvailableResolutions = (currentResolution: string) => {
    const resolutionKeys = Object.keys(VIDEO_RESOLUTIONS);
    const currentIndex = resolutionKeys.indexOf(currentResolution);
    return currentIndex >= 0 ? resolutionKeys.slice(currentIndex) : resolutionKeys;
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

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    setVideo(file);
    setFileName(file.name);
    setFileSize(formatBytes(file.size));
    setVideoUrl(URL.createObjectURL(file));

    const resolution = await detectResolution(file);
    setOriginalResolution(resolution);
    const availableRes = getAvailableResolutions(resolution);
    setAvailableResolutions(availableRes);
    setTargetResolution(resolution);

    // Estimate initial compressed size
    updateEstimatedSize(file.size, resolution, resolution, 50);
  };

  const handleVideoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const updateEstimatedSize = (originalSize: number, originalRes: string, targetRes: string, compression: number) => {
    const originalResObj = VIDEO_RESOLUTIONS[originalRes as keyof typeof VIDEO_RESOLUTIONS];
    const targetResObj = VIDEO_RESOLUTIONS[targetRes as keyof typeof VIDEO_RESOLUTIONS];
    
    if (!originalResObj || !targetResObj) return;

    const resolutionRatio = (targetResObj.width * targetResObj.height) / 
                           (originalResObj.width * originalResObj.height);
    
    const compressionRatio = (100 - compression) / 100;
    const estimatedBytes = originalSize * resolutionRatio * compressionRatio;
    
    setEstimatedSize(formatBytes(estimatedBytes));
  };

  const handleCompressionChange = (value: number[]) => {
    const level = value[0];
    setCompressionLevel(level);
    if (video) {
      updateEstimatedSize(
        video.size,
        originalResolution,
        targetResolution,
        level
      );
    }
  };

  const handleResolutionChange = (value: string) => {
    setTargetResolution(value);
    if (video) {
      updateEstimatedSize(
        video.size,
        originalResolution,
        value,
        compressionLevel
      );
    }
  };

  const compressVideo = async () => {
    if (!video || !loaded) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Convert File to Uint8Array
      const videoData = await fetchFile(video);
      
      // Write the input video file to FFmpeg's virtual filesystem
      await ffmpeg.writeFile('input.mp4', videoData);

      const targetRes = VIDEO_RESOLUTIONS[targetResolution as keyof typeof VIDEO_RESOLUTIONS];
      const crf = Math.round(51 * (compressionLevel / 100)); // Convert compression level to CRF (0-51)
      
      // Prepare FFmpeg command
      const args = [
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-crf', crf.toString(),
        '-preset', 'medium',
        '-vf', `scale=${targetRes.width}:${targetRes.height}`,
        '-c:a', 'aac',
        '-b:a', '128k',
        'output.mp4'
      ];

      // Run FFmpeg command
      await ffmpeg.exec(args);

      // Read the output file
      const outputData = await ffmpeg.readFile('output.mp4');
      
      // Create download link
      const blob = new Blob([outputData], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed-${fileName}`;
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
    } catch (error) {
      console.error('Error during compression:', error);
      alert('An error occurred during compression. Please try again.');
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Video Compressor</h1>
          <p className="text-lg text-gray-600">Compress videos while preserving quality</p>
        </div>

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
                    MP4, MOV, AVI, MKV, WebM
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

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target Resolution</Label>
                    <Select value={targetResolution} onValueChange={handleResolutionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resolution" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableResolutions.map((res) => (
                          <SelectItem key={res} value={res}>
                            {VIDEO_RESOLUTIONS[res as keyof typeof VIDEO_RESOLUTIONS]?.label || res}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium">Compression Level: {compressionLevel}%</Label>
                      <span className="text-sm text-gray-500">
                        Estimated size: {estimatedSize}
                      </span>
                    </div>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={[compressionLevel]}
                      onValueChange={handleCompressionChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Higher Quality</span>
                      <span>Smaller Size</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Original resolution: {originalResolution}</span>
                      <span>Original size: {fileSize}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={compressVideo}
                    disabled={processing} 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Compress Video</span>
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