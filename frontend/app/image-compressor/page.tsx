'use client'

import imageCompression from 'browser-image-compression'
import { useState, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, FileIcon, X, CheckCircle, Package } from 'lucide-react'
import JSZip from 'jszip'

// Define supported formats and their MIME types
const SUPPORTED_FORMATS = {
  'image/jpeg': { ext: 'jpg', name: 'JPEG' },
  'image/png': { ext: 'png', name: 'PNG' },
  'image/webp': { ext: 'webp', name: 'WebP' },
  'image/avif': { ext: 'avif', name: 'AVIF' },
  'image/svg+xml': { ext: 'svg', name: 'SVG' }
}

const MAX_FILES = 1000;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  fileName: string
}

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([])
  const [outputSize, setOutputSize] = useState<string>('')
  const [sizeUnit, setSizeUnit] = useState<'MB' | 'KB'>('MB')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [results, setResults] = useState<CompressionResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files)
      
      // Check number of files
      if (selectedFiles.length > MAX_FILES) {
        alert(`Maximum ${MAX_FILES} files allowed`)
        return
      }

      // Validate each file
      const validFiles = selectedFiles.filter(file => {
        if (!Object.keys(SUPPORTED_FORMATS).includes(file.type)) {
          alert(`File "${file.name}" is not a supported image format`)
          return false
        }
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" exceeds 100MB limit`)
          return false
        }
        return true
      })

      setFiles(prevFiles => [...prevFiles, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const compressImage = async (file: File, targetSize: number): Promise<Blob> => {
    const fileType = file.type

    // Special handling for SVG
    if (fileType === 'image/svg+xml') {
      return file
    }

    const options = {
      maxSizeMB: targetSize / (1024 * 1024),
      useWebWorker: true,
      fileType: fileType,
      initialQuality: 0.7,
    }

    try {
      return await imageCompression(file, options)
    } catch (error) {
      console.error('Error during compression:', error)
      throw new Error(`Failed to compress ${file.name}`)
    }
  }

  const handleConvert = async () => {
    if (!files.length || !outputSize) return

    try {
      setIsProcessing(true)
      setResults([]) // Clear previous results
      const targetSize = Number(outputSize) * (sizeUnit === 'MB' ? 1024 * 1024 : 1024)
      
      if (targetSize < 100 * 1024) {
        alert('Target size cannot be smaller than 100KB')
        setIsProcessing(false)
        return
      }

      const newResults: CompressionResult[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const compressedBlob = await compressImage(file, targetSize)
          
          newResults.push({
            blob: compressedBlob,
            originalSize: file.size,
            compressedSize: compressedBlob.size,
            compressionRatio: (1 - (compressedBlob.size / file.size)) * 100,
            fileName: file.name
          })

          setProgress(((i + 1) / files.length) * 100)
        } catch (error) {
          console.error(`Error compressing ${file.name}:`, error)
        }
      }

      setResults(newResults)
    } catch (error) {
      console.error('Error compressing images:', error)
      alert('Error compressing images. Please try again.')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleDownloadAll = async () => {
    if (results.length === 1) {
      // Single file download
      const url = URL.createObjectURL(results[0].blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `compressed-${results[0].fileName}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (results.length > 1) {
      // Create zip file
      const zip = new JSZip()
      results.forEach(result => {
        zip.file(`compressed-${result.fileName}`, result.blob)
      })
      
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'compressed-images.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleDownloadSingle = (result: CompressionResult) => {
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed-${result.fileName}`
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

  return (
    <div className="flex flex-col items-center p-6 max-w-3xl mx-auto">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Image Compressor</h1>
          <p className="text-gray-500">Compress images while preserving quality</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="file-upload" className="text-base font-medium text-gray-700 mb-3 block">
              Upload Images
            </Label>
            <div className="relative">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="w-full border-2 border-dashed h-32 hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-8 w-8 text-blue-500" />
                  <div className="space-y-1 text-center">
                    <p className="text-sm text-gray-600">Choose files or drag & drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG, WebP, AVIF, SVG (up to {MAX_FILES} files)</p>
                  </div>
                </div>
              </Button>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                accept=".png,.jpg,.jpeg,.webp,.avif,.svg,image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                className="hidden"
                multiple
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Selected Files ({files.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles([])}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <FileIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate max-w-[300px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({formatSize(file.size)})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="output-size" className="text-base font-medium text-gray-700 mb-2 block">
                Target Size (per file)
              </Label>
              <Input
                id="output-size"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                min="0.1"
                step="0.1"
                value={outputSize}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setOutputSize(value)
                  }
                }}
                placeholder="Enter size"
              />
            </div>
            <div className="w-28">
              <Label htmlFor="size-unit" className="text-base font-medium text-gray-700 mb-2 block">
                Unit
              </Label>
              <Select value={sizeUnit} onValueChange={(value: 'MB' | 'KB') => setSizeUnit(value)}>
                <SelectTrigger id="size-unit">
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
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" 
            disabled={!files.length || !outputSize || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <span>Compressing... {Math.round(progress)}%</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Compress {files.length > 1 ? 'Images' : 'Image'}</span>
              </div>
            )}
          </Button>

          {files.some(file => file.type === 'image/svg+xml') && (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <span className="text-sm">
                Note: SVG files are vector-based and may not benefit from traditional compression. 
                Consider using an SVG optimizer for better results.
              </span>
            </div>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Compression Results</h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Total Files: {results.length}
                  </div>
                  {results.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAll}
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      <span>Download All (ZIP)</span>
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-gray-900">{result.fileName}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                          <div>Original Size: {formatSize(result.originalSize)}</div>
                          <div>Compressed Size: {formatSize(result.compressedSize)}</div>
                          <div className="text-green-600">
                            Saved: {formatSize(result.originalSize - result.compressedSize)}
                          </div>
                          <div className="text-blue-600">
                            Reduction: {result.compressionRatio.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => handleDownloadSingle(result)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 