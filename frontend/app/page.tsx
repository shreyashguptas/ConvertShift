'use client'

import imageCompression from 'browser-image-compression'
import { useState, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FileConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [outputSize, setOutputSize] = useState<string>('')
  const [sizeUnit, setSizeUnit] = useState<'MB' | 'KB'>('MB')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0]
      // Check if file is an image and under 100MB
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, or JPEG)')
        return
      }
      if (selectedFile.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB')
        return
      }
      setFile(selectedFile)
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

      const options = {
        maxSizeMB: targetSize / (1024 * 1024),
        useWebWorker: true,
      }

      const compressedFile = await imageCompression(file, options)
      
      // Create download link
      const url = URL.createObjectURL(compressedFile)
      const a = document.createElement('a')
      a.href = url
      a.download = `compressed-${file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error compressing image:', error)
      alert('Error compressing image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Image Compressor</h1>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Upload Image (PNG, JPG, JPEG)
            </Label>
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg"
              className="mt-1"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="output-size" className="block text-sm font-medium text-gray-700">
                Target Size
              </Label>
              <Input
                id="output-size"
                type="number"
                min="0.1"
                step="0.1"
                value={outputSize}
                onChange={(e) => setOutputSize(e.target.value)}
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
            className="w-full" 
            disabled={!file || !outputSize || isProcessing}
          >
            {isProcessing ? 'Compressing...' : 'Compress'}
          </Button>
        </div>
      </div>
    </div>
  )
}
