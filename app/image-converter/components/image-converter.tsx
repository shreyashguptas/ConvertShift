'use client';

import { useState, useCallback } from 'react';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convertImage } from '../utils/convert-image';
import { Progress } from '@/components/ui/progress';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Define supported formats and their conversion capabilities
const FORMAT_RELATIONSHIPS = {
  'image/png': ['image/jpeg', 'image/webp', 'image/avif'],
  'image/jpeg': ['image/png', 'image/webp', 'image/avif'],
  'image/webp': ['image/png', 'image/jpeg', 'image/avif'],
  'image/avif': ['image/png', 'image/jpeg', 'image/webp'],
} as const;

const FORMAT_EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
} as const;

const FORMAT_NAMES = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
} as const;

interface ConversionResult {
  originalName: string;
  convertedBlob: Blob;
  targetFormat: string;
}

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ConversionResult[]>([]);

  const handleFileDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== acceptedFiles.length) {
      toast.error('Some files were skipped as they are not images');
    }
    setFiles(imageFiles);
    setResults([]);
  }, []);

  const getAvailableFormats = (file: File) => {
    const sourceFormat = file.type as keyof typeof FORMAT_RELATIONSHIPS;
    return FORMAT_RELATIONSHIPS[sourceFormat] || [];
  };

  const handleConvert = async () => {
    if (!targetFormat || files.length === 0) {
      toast.error('Please select files and target format');
      return;
    }

    setConverting(true);
    setProgress(0);
    setResults([]);

    try {
      const newResults: ConversionResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const convertedBlob = await convertImage(file, targetFormat);
        
        newResults.push({
          originalName: file.name,
          convertedBlob,
          targetFormat,
        });

        setProgress(((i + 1) / files.length) * 100);
      }

      setResults(newResults);
      toast.success('Conversion completed successfully');
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Error during conversion');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = (result: ConversionResult) => {
    const extension = FORMAT_EXTENSIONS[result.targetFormat as keyof typeof FORMAT_EXTENSIONS];
    const fileName = result.originalName.replace(/\.[^/.]+$/, '') + '.' + extension;
    
    const url = URL.createObjectURL(result.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    results.forEach(result => handleDownload(result));
  };

  return (
    <div className="flex flex-col gap-6">
      <FileDropzone
        onDrop={handleFileDrop}
        accept={{
          'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif']
        }}
        maxFiles={10}
      />

      {files.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Select
              value={targetFormat}
              onValueChange={setTargetFormat}
              disabled={converting}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {files[0] && getAvailableFormats(files[0]).map((format) => (
                  <SelectItem key={format} value={format}>
                    {FORMAT_NAMES[format as keyof typeof FORMAT_NAMES]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleConvert}
              disabled={!targetFormat || converting}
            >
              {converting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                'Convert'
              )}
            </Button>
          </div>

          {converting && (
            <Progress value={progress} className="w-full" />
          )}

          {results.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Converted Files</h3>
                <Button onClick={handleDownloadAll} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
              </div>

              <div className="grid gap-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <span className="truncate">
                      {result.originalName}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(result)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 