'use client';

import { useState, useRef } from 'react'
import { FFmpegProvider, useFFmpeg } from '@/components/ffmpeg-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchFile } from '@ffmpeg/util'

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

interface VideoInfo {
  duration: string;
  resolution: string;
  size: string;
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVideoInfo = (file: File): Promise<VideoInfo> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        
        resolve({
          duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          size: formatBytes(file.size)
        });
        
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const getCompatibleFormats = (sourceFormat: string): string[] => {
    return Object.entries(VIDEO_FORMATS)
      .filter(([_, format]) => format.compatibleFrom.includes(sourceFormat))
      .map(([key]) => key);
  };

  const handleFileChange = async (file: File | null) => {
    // Clean up previous preview URL
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    if (!file) {
      setSourceFormat('')
      setTargetFormat('')
      setVideoFile(null)
      setVideoPreviewUrl(null)
      setVideoInfo(null)
      return
    }

    const format = file.name.split('.').pop()?.toLowerCase() || ''
    setSourceFormat(format)
    setVideoFile(file)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(previewUrl);

    // Get video information
    const info = await getVideoInfo(file);
    setVideoInfo(info);

    // Set first compatible format as default
    const compatibleFormats = getCompatibleFormats(format)
    if (compatibleFormats.length > 0) {
      setTargetFormat(compatibleFormats[0])
    } else {
      setError(`Unsupported source format: ${format}`)
    }
  }

  const convertVideo = async () => {
    if (!videoFile || !targetFormat || !ffmpeg || !videoInfo) {
      setError('Please wait for the converter to load and select a video');
      return;
    }

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

      // Get video dimensions
      const [width, height] = videoInfo.resolution.split('x').map(Number);

      // Write input file using fetchFile utility
      const inputData = await fetchFile(videoFile);
      await ffmpeg.writeFile(`input.${inputExt}`, inputData);

      // Set up progress tracking
      ffmpeg.on('progress', ({ progress, time }) => {
        const duration = videoRef.current?.duration || 0;
        const percentage = (time / duration) * 100;
        setProgress(Math.min(Math.round(percentage), 100));
      });
      
      const args = [
        '-i', `input.${inputExt}`,
        // Video settings
        '-c:v', format.codec,
        '-preset', 'veryfast', // Faster encoding
        '-crf', format.settings.crf,
        // Maintain resolution with hardware acceleration if available
        '-vf', `scale=${width}:${height}`,
        // Use multiple threads for faster encoding
        '-threads', '0',
        // Copy audio stream without re-encoding
        '-c:a', 'copy'
      ];

      // Add format-specific optimizations
      switch (format.codec) {
        case 'libx264':
          args.push(
            // Use faster x264 settings
            '-tune', 'fastdecode',
            '-profile:v', 'high',
            '-level', '4.1',
            '-movflags', '+faststart'
          );
          break;
        case 'libx265':
          args.push(
            // Optimize HEVC encoding
            '-x265-params', 'log-level=error:pools=+frame:frame-threads=4:no-wpp=1:no-pmode=1:no-pme=1',
            '-tag:v', 'hvc1', // Better compatibility
            '-movflags', '+faststart'
          );
          break;
        case 'libvpx-vp9':
          args.push(
            // Optimize VP9 encoding
            '-row-mt', '1',
            '-tile-columns', '2',
            '-tile-rows', '1',
            '-frame-parallel', '1'
          );
          break;
      }

      // Add any additional format-specific arguments
      if (format.settings.extraArgs) {
        args.push(...format.settings.extraArgs);
      }

      // Add output file
      args.push(`output.${outputExt}`);

      // Run the conversion
      await ffmpeg.exec(args);

      // Read the output file
      const outputData = await ffmpeg.readFile(`output.${outputExt}`);
      
      // Create blob from the output data
      const blob = new Blob([outputData], { type: format.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-video.${outputExt}`;
      a.click();
      URL.revokeObjectURL(url);

      // Clean up
      await ffmpeg.deleteFile(`input.${inputExt}`);
      await ffmpeg.deleteFile(`output.${outputExt}`);

      setIsConverting(false);
      setProgress(100);

      // Remove progress listener
      ffmpeg.off('progress');
    } catch (error) {
      console.error('Conversion error:', error);
      setError('Failed to convert video. Please try again.');
      setIsConverting(false);
      ffmpeg.off('progress');
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

        {videoFile && videoPreviewUrl && (
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoPreviewUrl}
                controls
                className="w-full h-full"
              />
            </div>

            {/* Video Information */}
            {videoInfo && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium">{videoInfo.duration}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Resolution</div>
                  <div className="font-medium">{videoInfo.resolution}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Size</div>
                  <div className="font-medium">{videoInfo.size}</div>
                </div>
              </div>
            )}

            {/* Format Selection */}
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

            {/* Convert Button */}
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