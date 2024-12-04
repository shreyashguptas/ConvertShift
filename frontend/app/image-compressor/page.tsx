'use client'

import imageCompression from 'browser-image-compression'
import { useState, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, FileIcon } from 'lucide-react'

// Define supported formats and their MIME types
const SUPPORTED_FORMATS = {
  'image/jpeg': { ext: 'jpg', name: 'JPEG' },
  'image/png': { ext: 'png', name: 'PNG' },
  'image/webp': { ext: 'webp', name: 'WebP' },
  'image/avif': { ext: 'avif', name: 'AVIF' },
  'image/svg+xml': { ext: 'svg', name: 'SVG' }
}

interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  fileName: string
}

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [outputSize, setOutputSize] = useState<string>('')
  const [sizeUnit, setSizeUnit] = useState<'MB' | 'KB'>('MB')
  const [isProcessing, setIsProcessing] = useState(false)
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      const fileType = selectedFile.type

      // Check if file type is supported
      if (!Object.keys(SUPPORTED_FORMATS).includes(fileType)) {
        alert('Please select a supported image file (PNG, JPG, JPEG, WebP, AVIF, or SVG)')
        return
      }

      // Check file size
      if (selectedFile.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB')
        return
      }

      // Special handling for SVG files
      if (fileType === 'image/svg+xml') {
        alert('Note: SVG files are already in a vector format and may not benefit from traditional compression. Consider optimizing the SVG markup instead.')
      }

      setFile(selectedFile)
      setCompressionResult(null) // Reset previous results
    }
  }

  const compressImage = async (file: File, targetSize: number): Promise<Blob> => {
    const fileType = file.type

    // Special handling for SVG
    if (fileType === 'image/svg+xml') {
      // For SVG, we'll just return the original file as it's already vector-based
      return file
    }

    // For AVIF and WebP, we'll use their native formats for best compression
    const options = {
      maxSizeMB: targetSize / (1024 * 1024),
      useWebWorker: true,
      fileType: fileType, // Preserve the original format
      initialQuality: 0.7, // Start with good quality
    }

    try {
      return await imageCompression(file, options)
    } catch (error) {
      console.error('Error during compression:', error)
      throw new Error('Compression failed')
    }
  }

  const handleConvert = async () => {
    if (!file || !outputSize) return

    try {
      setIsProcessing(true)
      const targetSize = Number(outputSize) * (sizeUnit === 'MB' ? 1024 * 1024 : 1024)
      
      // Don't allow target size larger than original
      if (targetSize >= file.size) {
        alert('Target size must be smaller than original file size')
        setIsProcessing(false)
        return
      }

      // Don't allow target size smaller than 100KB
      if (targetSize < 100 * 1024) {
        alert('Target size cannot be smaller than 100KB')
        setIsProcessing(false)
        return
      }

      const compressedBlob = await compressImage(file, targetSize)
      
      // Calculate compression stats
      const result: CompressionResult = {
        blob: compressedBlob,
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        compressionRatio: (1 - (compressedBlob.size / file.size)) * 100,
        fileName: file.name
      }

      setCompressionResult(result)
    } catch (error) {
      console.error('Error compressing image:', error)
      alert('Error compressing image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!compressionResult) return

    const url = URL.createObjectURL(compressionResult.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed-${compressionResult.fileName}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setOutputSize(value)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Image Compressor</h1>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image (PNG, JPG, JPEG, WebP, AVIF, SVG)
            </Label>
            <div className="relative">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="w-full border-dashed border-2 h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {file ? 'Change File' : 'Choose File'}
                </span>
              </Button>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                accept=".png,.jpg,.jpeg,.webp,.avif,.svg,image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                className="hidden"
              />
            </div>
            {file && (
              <div className="mt-4 p-4 border border-blue-100 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <FileIcon className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900">Selected File</h3>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-blue-800 font-medium">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {SUPPORTED_FORMATS[file.type as keyof typeof SUPPORTED_FORMATS]?.name || 'Unknown'}
                        </span>
                        <span>•</span>
                        <span>{formatSize(file.size)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="output-size" className="block text-sm font-medium text-gray-700">
                Target Size
              </Label>
              <Input
                id="output-size"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                min="0.1"
                step="0.1"
                value={outputSize}
                onChange={handleSizeChange}
                className="mt-1"
                placeholder="Enter size"
              />
            </div>
            <div className="w-24">
              <Label htmlFor="size-unit" className="block text-sm font-medium text-gray-700">
                Unit
              </Label>
              <Select value={sizeUnit} onValueChange={(value: 'MB' | 'KB') => setSizeUnit(value)}>
                <SelectTrigger id="size-unit" className="mt-1">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MB">MB</SelectItem>
                  <SelectItem value="KB">KB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleConvert} 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={!file || !outputSize || isProcessing}
          >
            {isProcessing ? (
              'Compressing...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Compress Image
              </>
            )}
          </Button>

          {compressionResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <h2 className="font-semibold text-lg text-gray-900">Compression Results</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Original size: {formatSize(compressionResult.originalSize)}
                </p>
                <p className="text-sm text-gray-600">
                  Compressed size: {formatSize(compressionResult.compressedSize)}
                </p>
                <p className="text-sm text-gray-600">
                  Compression ratio: {compressionResult.compressionRatio.toFixed(1)}%
                </p>
              </div>
              <Button 
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Compressed Image
              </Button>
            </div>
          )}

          {file?.type === 'image/svg+xml' && (
            <p className="text-sm text-amber-600">
              Note: SVG files are vector-based and may not benefit from traditional compression. 
              Consider using an SVG optimizer for better results.
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 