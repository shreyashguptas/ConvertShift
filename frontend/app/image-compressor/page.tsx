'use client'

import imageCompression from 'browser-image-compression'
import { useState, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, FileIcon, X } from 'lucide-react'
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
      const targetSize = Number(outputSize) * (sizeUnit === 'MB' ? 1024 * 1024 : 1024)
      
      // Don't allow target size smaller than 100KB
      if (targetSize < 100 * 1024) {
        alert('Target size cannot be smaller than 100KB')
        setIsProcessing(false)
        return
      }

      const results: CompressionResult[] = []
      const zip = new JSZip()

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          const compressedBlob = await compressImage(file, targetSize)
          
          results.push({
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

      // Create download
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

      // Show compression results
      const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0)
      const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0)
      const avgCompressionRatio = (1 - (totalCompressedSize / totalOriginalSize)) * 100

      alert(
        `Compression complete!\n` +
        `Files processed: ${results.length}\n` +
        `Total original size: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB\n` +
        `Total compressed size: ${(totalCompressedSize / (1024 * 1024)).toFixed(2)} MB\n` +
        `Average compression ratio: ${avgCompressionRatio.toFixed(1)}%`
      )
    } catch (error) {
      console.error('Error compressing images:', error)
      alert('Error compressing images. Please try again.')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Image Compressor</h1>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (PNG, JPG, JPEG, WebP, AVIF, SVG)
            </Label>
            <div className="relative">
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                className="w-full border-dashed border-2 h-20 flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Choose Files (up to {MAX_FILES})
                </span>
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
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  Selected Files ({files.length})
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <FileIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 truncate max-w-[200px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({formatSize(file.size)})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="output-size" className="block text-sm font-medium text-gray-700">
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
            disabled={!files.length || !outputSize || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <span>Compressing... {Math.round(progress)}%</span>
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Compress {files.length > 1 ? 'Images' : 'Image'}
              </>
            )}
          </Button>

          {files.some(file => file.type === 'image/svg+xml') && (
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