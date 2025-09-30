'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Download, Upload, FileIcon, X, CheckCircle, AlertTriangle } from 'lucide-react'
import { compressPDF, assessQualityImpact, validateCompressionTarget, estimateMinimumSize } from './utils/compress-pdf'

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const MIN_COMPRESSION_SIZE = 1 * 1024 * 1024; // 1MB minimum

interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  fileName: string
}

interface QualityWarning {
  show: boolean
  recommendedSize: number
  message: string
}

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null)
  const [suggestedSizeMB, setSuggestedSizeMB] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [qualityWarning, setQualityWarning] = useState<QualityWarning>({ show: false, recommendedSize: 0, message: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      
      // Validate file type
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a PDF file')
        return
      }

      // Validate file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        alert(`File size exceeds 500MB limit. Your file is ${formatSize(selectedFile.size)}`)
        return
      }

      // Validate minimum file size
      if (selectedFile.size < 1024) {
        alert('PDF file seems too small. Please select a valid PDF file.')
        return
      }

      setFile(selectedFile)
      setResult(null)
      setQualityWarning({ show: false, recommendedSize: 0, message: '' })
      setSuggestedSizeMB(Math.round((selectedFile.size * 0.8) / (1024 * 1024)))
    }
  }

  const removeFile = () => {
    setFile(null)
    setResult(null)
    setQualityWarning({ show: false, recommendedSize: 0, message: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleTargetSizeChange = (_value: string) => {}



  const handleCompress = async () => {
    if (!file) return

    // Use suggested no-loss size (80% of original by default)
    const targetSizeBytes = (suggestedSizeMB
      ? suggestedSizeMB
      : Math.round((file.size * 0.8) / (1024 * 1024))) * 1024 * 1024

    try {
      setIsProcessing(true)
      setResult(null)
      setProgress(0)

      const compressedBlob = await compressPDF(file, {
        targetSizeBytes,
        maxQuality: 0.9,
        minQuality: 0.3,
        progressCallback: (progress) => setProgress(progress)
      })
      
      const compressionResult: CompressionResult = {
        blob: compressedBlob,
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        compressionRatio: (1 - (compressedBlob.size / file.size)) * 100,
        fileName: file.name
      }

      setResult(compressionResult)
    } catch (error) {
      console.error('Error compressing PDF:', error)
      alert(`Error compressing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    
    // Add "compressed" suffix to filename
    const originalName = result.fileName
    const nameWithoutExt = originalName.replace(/\.pdf$/i, '')
    a.download = `${nameWithoutExt}_compressed.pdf`
    
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    
    if (!droppedFile) {
      alert('No file detected. Please try again.')
      return
    }
    
    // Validate file type
    if (droppedFile.type !== 'application/pdf' && !droppedFile.name.toLowerCase().endsWith('.pdf')) {
      alert('Please drop a PDF file')
      return
    }

    // Validate file size
    if (droppedFile.size > MAX_FILE_SIZE) {
      alert(`File size exceeds 500MB limit. Your file is ${formatSize(droppedFile.size)}`)
      return
    }

    // Validate minimum file size
    if (droppedFile.size < 1024) {
      alert('PDF file seems too small. Please select a valid PDF file.')
      return
    }

    setFile(droppedFile)
    setResult(null)
    setQualityWarning({ show: false, recommendedSize: 0, message: '' })
  }

  return (
    <div className="flex flex-col items-center p-6 max-w-3xl mx-auto">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">PDF Compressor</h1>
          <p className="text-gray-500">Compress PDF files while preserving quality</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="file-upload" className="text-base font-medium text-gray-700 mb-3 block">
              Upload PDF
            </Label>
            <div 
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-12 transition-colors duration-150 ease-in-out hover:border-gray-400 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-center" onClick={() => fileInputRef.current?.click()}>
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-dashed h-32 hover:border-blue-500 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-8 w-8 text-blue-500" />
                    <div className="space-y-1 text-center">
                      <p className="text-sm text-gray-600">Choose file or drag & drop</p>
                      <p className="text-xs text-gray-500">PDF files (up to 500MB)</p>
                    </div>
                  </div>
                </Button>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
              </div>
            </div>

            {/* File Display */}
            {file && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Selected File
                  </span>
                </div>
                <div className="rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileIcon className="w-4 h-4 text-red-500" />
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
                      onClick={removeFile}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Removed suggestion block as per new product decision */}

          {/* Quality Warning */}
          {qualityWarning.show && (
            <div className="flex items-start space-x-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Quality Warning</p>
                <p className="text-sm">{qualityWarning.message}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleCompress} 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" 
            disabled={!file || isProcessing}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-2">
                <span>Compressing PDF... {Math.round(progress)}%</span>
                <Progress value={progress} className="w-full max-w-xs" />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Compress</span>
              </div>
            )}
          </Button>

          {/* Results Section */}
          {result && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Compression Results</h2>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
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
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Advanced PDF Compression</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• All processing happens on your device - files never leave your computer</li>
              <li>• Two-stage compression: basic optimization + advanced image compression</li>
              <li>• Achieves 70-85% size reduction for image-heavy PDFs</li>
              <li>• Automatic quality adjustment to meet your target file size</li>
              <li>• Smart recommendations prevent excessive quality loss</li>
              <li>• Compressed files are saved with &quot;_compressed&quot; suffix</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
