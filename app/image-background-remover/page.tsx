'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { Download, Eraser, ImageIcon, Loader2, RefreshCw, Trash2 } from 'lucide-react'

const ACCEPTED_IMAGE_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif']
}

export default function ImageBackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null)
  const [inputPreviewUrl, setInputPreviewUrl] = useState<string | null>(null)
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const revokeUrls = useCallback(() => {
    if (inputPreviewUrl) URL.revokeObjectURL(inputPreviewUrl)
    if (outputUrl) URL.revokeObjectURL(outputUrl)
  }, [inputPreviewUrl, outputUrl])

  useEffect(() => {
    return () => {
      revokeUrls()
    }
  }, [revokeUrls])

  const onDrop = useCallback((files: File[]) => {
    const selected = files[0]
    if (!selected) return
    // Basic type validation
    if (!selected.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }
    setError(null)
    setFile(selected)
    setOutputBlob(null)
    setOutputUrl(null)
    if (inputPreviewUrl) URL.revokeObjectURL(inputPreviewUrl)
    const url = URL.createObjectURL(selected)
    setInputPreviewUrl(url)
  }, [inputPreviewUrl])

  const handleClear = useCallback(() => {
    setFile(null)
    setError(null)
    setIsProcessing(false)
    setProgress(0)
    revokeUrls()
    setInputPreviewUrl(null)
    setOutputBlob(null)
    setOutputUrl(null)
  }, [revokeUrls])

  const handleRemoveBackground = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setProgress(0)
    try {
      // Dynamic import to avoid SSR/bundle resolution until runtime
      const mod = await import('@imgly/background-removal')
      const removeBackground = mod.removeBackground

      const resultBlob: Blob = await removeBackground(file, {
        autoDownloadModel: true,
        debug: false,
        onProgress: (p: number) => setProgress(Math.round(p * 100)),
      })

      setOutputBlob(resultBlob)
      if (outputUrl) URL.revokeObjectURL(outputUrl)
      const outUrl = URL.createObjectURL(resultBlob)
      setOutputUrl(outUrl)
    } catch (e: unknown) {
      console.error('Background removal failed:', e)
      setError('Failed to remove background. Please try a different image or reload the page.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, outputUrl])

  const handleDownload = useCallback(() => {
    if (!outputBlob) return
    const a = document.createElement('a')
    const url = URL.createObjectURL(outputBlob)
    a.href = url
    const baseName = file?.name ? file.name.replace(/\.[^.]+$/, '') : 'image'
    a.download = `${baseName}_no-bg.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [outputBlob, file])

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Eraser className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-semibold">Background Remover</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload an image and remove its background locally</CardTitle>
        </CardHeader>
        <CardContent>
          {!file && (
            <FileDropzone onDrop={onDrop} accept={ACCEPTED_IMAGE_TYPES} maxFiles={1} />
          )}

          {file && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50 min-h-64 flex items-center justify-center">
                  {inputPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={inputPreviewUrl} alt="Input preview" className="max-h-[480px] object-contain" />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500"><ImageIcon className="h-5 w-5" /> No image</div>
                  )}
                </div>
                <div className="flex-1 border rounded-lg overflow-hidden bg-gray-50 min-h-64 flex items-center justify-center">
                  {outputUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={outputUrl} alt="Output preview" className="max-h-[480px] object-contain" />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500"><ImageIcon className="h-5 w-5" /> Output will appear here</div>
                  )}
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing background removal...
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleRemoveBackground} disabled={isProcessing}>
                  {isProcessing ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Removing...</>) : (<><Eraser className="h-4 w-4 mr-2" />Remove Background</>)}
                </Button>
                <Button variant="outline" onClick={handleClear} disabled={isProcessing}>
                  <Trash2 className="h-4 w-4 mr-2" />Clear
                </Button>
                <Button variant="secondary" onClick={handleDownload} disabled={!outputBlob || isProcessing}>
                  <Download className="h-4 w-4 mr-2" />Download PNG
                </Button>
                <Button variant="ghost" onClick={() => setOutputUrl(null)} disabled={isProcessing || !outputUrl}>
                  <RefreshCw className="h-4 w-4 mr-2" />Reset Output
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


