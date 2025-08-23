import { PDFDocument, PDFImage, PDFPage, PDFName, PDFDict, PDFRef } from 'pdf-lib'

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: any = null
let pdfjsLoadPromise: Promise<any> | null = null

async function getPDFJS() {
  if (typeof window === 'undefined') {
    console.error('PDF.js can only be loaded in browser environment')
    return null
  }

  if (pdfjsLib) {
    return pdfjsLib
  }

  if (pdfjsLoadPromise) {
    return pdfjsLoadPromise
  }

  pdfjsLoadPromise = (async () => {
    try {
      console.log('Loading PDF.js...')
      pdfjsLib = await import('pdfjs-dist')
      
      // Prefer local worker served from /public to avoid CDN failures
      // Fallback to CDN if local file is unavailable
      const localCandidates = [
        '/pdf.worker.min.mjs',
        '/pdf.worker.min.js'
      ]
      let workerSrc = localCandidates[0]
      try {
        // We cannot synchronously check existence; set to first candidate
        // Next.js will serve from /public if present (copied by postinstall)
      } catch {}
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
      
      console.log(`PDF.js ${pdfjsLib.version} loaded successfully`)
      console.log(`Worker source: ${pdfjsLib.GlobalWorkerOptions.workerSrc}`)
      
      return pdfjsLib
    } catch (error) {
      console.error('Failed to load PDF.js:', error)
      pdfjsLoadPromise = null // Reset so we can try again
      throw error
    }
  })()

  return pdfjsLoadPromise
}

interface CompressionOptions {
  targetSizeBytes: number
  maxQuality: number
  minQuality: number
  progressCallback?: (progress: number) => void
}

interface ImageCompressionResult {
  originalSize: number
  compressedSize: number
  quality: number
}

/**
 * Compresses an image using canvas API
 */
async function compressImage(
  imageData: Uint8Array,
  mimeType: string,
  quality: number
): Promise<{ data: Uint8Array; size: number }> {
  return new Promise((resolve, reject) => {
    try {
      // Create a blob from the image data
      const blob = new Blob([new Uint8Array(imageData)], { type: mimeType })
      const img = new Image()
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height
        
        // Configure context for quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0)
        
        // Convert to compressed format
        canvas.toBlob(
          async (compressedBlob) => {
            if (!compressedBlob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            // Convert blob to Uint8Array
            const arrayBuffer = await compressedBlob.arrayBuffer()
            const compressedData = new Uint8Array(arrayBuffer)
            
            resolve({
              data: compressedData,
              size: compressedData.length
            })
          },
          mimeType === 'image/png' ? 'image/jpeg' : mimeType, // Convert PNG to JPEG for better compression
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      // Load image
      img.src = URL.createObjectURL(blob)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Extracts images from PDF using PDF.js and returns them with metadata
 */
async function extractImagesFromPDF(pdfArrayBuffer: ArrayBuffer): Promise<Array<{
  data: Uint8Array
  width: number
  height: number
  type: string
  size: number
}>> {
  const images: Array<{
    data: Uint8Array
    width: number
    height: number
    type: string
    size: number
  }> = []

  try {
    const pdfjs = await getPDFJS()
    if (!pdfjs) throw new Error('PDF.js not available')

    // Load PDF with PDF.js
    const loadingTask = pdfjs.getDocument({ data: pdfArrayBuffer })
    const pdf = await loadingTask.promise

    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const operatorList = await page.getOperatorList()

      // Look for image operations
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        if (operatorList.fnArray[i] === pdfjs.OPS.paintImageXObject) {
          try {
            const objId = operatorList.argsArray[i][0]
            
            // Get the image object
            const imgObj = page.objs.get(objId)
            if (imgObj && imgObj.data) {
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              
              if (ctx && imgObj.width && imgObj.height) {
                canvas.width = imgObj.width
                canvas.height = imgObj.height
                
                // Create ImageData from the raw image data
                const imageData = new ImageData(
                  new Uint8ClampedArray(imgObj.data),
                  imgObj.width,
                  imgObj.height
                )
                
                ctx.putImageData(imageData, 0, 0)
                
                // Convert to blob and then to Uint8Array
                const blob = await new Promise<Blob | null>((resolve) => {
                  canvas.toBlob(resolve, 'image/jpeg', 1.0)
                })
                
                if (blob) {
                  const arrayBuffer = await blob.arrayBuffer()
                  const data = new Uint8Array(arrayBuffer)
                  
                  images.push({
                    data,
                    width: imgObj.width,
                    height: imgObj.height,
                    type: 'image/jpeg',
                    size: data.length
                  })
                }
              }
            }
          } catch (error) {
            console.warn('Failed to extract image:', error)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error extracting images from PDF:', error)
  }

  return images
}

/**
 * Alternative method to extract images using PDF.js render context
 */
async function extractImagesFromPDFPages(pdfArrayBuffer: ArrayBuffer): Promise<Array<{
  data: Uint8Array
  width: number
  height: number
  type: string
  size: number
}>> {
  const images: Array<{
    data: Uint8Array
    width: number
    height: number
    type: string
    size: number
  }> = []

  try {
    const pdfjs = await getPDFJS()
    if (!pdfjs) throw new Error('PDF.js not available')

    const loadingTask = pdfjs.getDocument({ data: pdfArrayBuffer })
    const pdf = await loadingTask.promise

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      
      // Get page dimensions
      const viewport = page.getViewport({ scale: 1.0 })
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) continue
      
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      // Render page to canvas
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        canvas: canvas
      }
      
      await page.render(renderContext).promise
      
      // Convert canvas to compressed image
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8)
      })
      
      if (blob && blob.size > 10000) { // Only include if image is substantial
        const arrayBuffer = await blob.arrayBuffer()
        const data = new Uint8Array(arrayBuffer)
        
        images.push({
          data,
          width: canvas.width,
          height: canvas.height,
          type: 'image/jpeg',
          size: data.length
        })
      }
    }
  } catch (error) {
    console.error('Error rendering PDF pages:', error)
  }

  return images
}

/**
 * Calculates optimal compression quality based on target size
 */
function calculateOptimalQuality(
  currentSize: number,
  targetSize: number,
  minQuality: number,
  maxQuality: number
): number {
  const compressionRatio = targetSize / currentSize
  
  if (compressionRatio >= 0.8) {
    return maxQuality
  } else if (compressionRatio >= 0.6) {
    return 0.8
  } else if (compressionRatio >= 0.4) {
    return 0.6
  } else if (compressionRatio >= 0.2) {
    return 0.4
  } else {
    return minQuality
  }
}

/**
 * Estimates the minimum achievable file size without significant quality loss
 */
export function estimateMinimumSize(originalSize: number): number {
  // With image compression, we can achieve much better ratios:
  // - Text-heavy PDFs: 20-40% of original size
  // - Image-heavy PDFs: 15-30% of original size (due to JPEG compression)
  // - Mixed content: 20-35% of original size
  
  // More aggressive estimate with image compression
  const conservativeRatio = 0.25 // 25% of original size
  return Math.round((originalSize * conservativeRatio) / (1024 * 1024)) // Return in MB
}

/**
 * Determines if the target compression ratio would result in quality loss
 */
export function assessQualityImpact(originalSize: number, targetSize: number): {
  level: 'none' | 'minimal' | 'moderate' | 'significant'
  message: string
  recommendedSize: number
} {
  const ratio = targetSize / originalSize
  const recommendedSize = estimateMinimumSize(originalSize)
  
  if (ratio >= 0.5) {
    return {
      level: 'none',
      message: 'No significant quality loss expected with image compression.',
      recommendedSize
    }
  } else if (ratio >= 0.3) {
    return {
      level: 'minimal',
      message: 'Minimal quality loss. Images will be compressed but remain clear.',
      recommendedSize
    }
  } else if (ratio >= 0.15) {
    return {
      level: 'moderate',
      message: 'Moderate compression. Some quality loss may be noticeable in images.',
      recommendedSize
    }
  } else {
    return {
      level: 'significant',
      message: `High compression may result in noticeable quality loss. We recommend ${recommendedSize}MB or higher for best quality.`,
      recommendedSize
    }
  }
}

/**
 * Creates a new PDF with compressed images
 */
async function createCompressedPDF(
  originalArrayBuffer: ArrayBuffer,
  quality: number,
  scale: number,
  progressCallback?: (progress: number) => void
): Promise<Uint8Array> {
  console.log(`Starting createCompressedPDF with quality: ${quality}`)
  
  try {
    const pdfjs = await getPDFJS()
    if (!pdfjs) {
      throw new Error('PDF.js not available - make sure you are running in a browser environment')
    }

    console.log('PDF.js loaded successfully')

    // Load the original PDF with PDF.js to render pages
    const loadingTask = pdfjs.getDocument({ 
      data: originalArrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    })
    
    const pdf = await loadingTask.promise
    console.log(`PDF loaded with ${pdf.numPages} pages`)
    
    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create()
    
    const totalPages = pdf.numPages
    let totalCompressedSize = 0
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const progress = 20 + ((pageNum - 1) / totalPages) * 60
      progressCallback?.(progress)
      
      console.log(`Processing page ${pageNum}/${totalPages}`)
      
      const page = await pdf.getPage(pageNum)
      
      // Compute viewport with provided scale (downscales when < 1)
      const maxDim = Math.max(page.view[2], page.view[3])
      const safeScale = Math.max(0.3, Math.min(2.0, scale))
      const viewport = page.getViewport({ scale: safeScale })
      
      console.log(`Page ${pageNum} viewport: ${viewport.width}x${viewport.height}`)
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { 
        alpha: false, // No transparency needed for PDFs
        desynchronized: true // Better performance
      })
      
      if (!ctx) {
        console.warn(`Failed to get canvas context for page ${pageNum}`)
        continue
      }
      
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      // Clear canvas with white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Render page to canvas
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
        canvas: canvas
      }
      
      try {
        await page.render(renderContext).promise
        console.log(`Page ${pageNum} rendered successfully`)
      } catch (renderError) {
        console.error(`Failed to render page ${pageNum}:`, renderError)
        continue
      }
      
      // Convert canvas to compressed image
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => {
          if (result) {
            console.log(`Page ${pageNum} compressed to ${(result.size / 1024).toFixed(2)}KB`)
          }
          resolve(result)
        }, 'image/jpeg', quality)
      })
      
      if (blob) {
        const imageBytes = await blob.arrayBuffer()
        totalCompressedSize += imageBytes.byteLength
        
        const image = await newPdfDoc.embedJpg(imageBytes)
        
        // Keep original PDF page size
        const originalViewport = page.getViewport({ scale: 1.0 })
        const pageWidth = originalViewport.width
        const pageHeight = originalViewport.height
        
        const newPage = newPdfDoc.addPage([pageWidth, pageHeight])
        
        // Draw the compressed image to fill the entire page
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        })
      } else {
        console.warn(`Failed to create blob for page ${pageNum}`)
      }
      
      // Clean up canvas to free memory
      canvas.width = 1
      canvas.height = 1
    }
    
    console.log(`Total compressed image size: ${(totalCompressedSize / (1024 * 1024)).toFixed(2)}MB`)
    
    // Save the new PDF
    const pdfBytes = await newPdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    })
    
    console.log(`Final PDF size: ${(pdfBytes.length / (1024 * 1024)).toFixed(2)}MB`)
    
    return pdfBytes
  } catch (error) {
    console.error('Error creating compressed PDF:', error)
    throw error
  }
}

/**
 * Advanced PDF compression function with image compression
 */
export async function compressPDF(
  file: File,
  options: CompressionOptions
): Promise<Blob> {
  const { targetSizeBytes, maxQuality = 0.95, minQuality = 0.95, progressCallback } = options
  
  try {
    progressCallback?.(5)
    
    // Load the PDF
    const arrayBuffer = await file.arrayBuffer()
    
    progressCallback?.(10)
    
    // First, try basic PDF optimization
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    
    // Remove metadata to save space
    pdfDoc.setTitle('')
    pdfDoc.setAuthor('')
    pdfDoc.setSubject('')
    pdfDoc.setKeywords([])
    pdfDoc.setProducer('ConvertShift PDF Compressor')
    pdfDoc.setCreator('ConvertShift')
    pdfDoc.setCreationDate(new Date())
    pdfDoc.setModificationDate(new Date())
    
    // Save with basic optimization
    const basicOptimizedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    })
    
    progressCallback?.(15)
    
    let result = new Blob([new Uint8Array(basicOptimizedBytes)], { type: 'application/pdf' })
    
    console.log(`Basic optimization: ${(result.size / (1024 * 1024)).toFixed(2)}MB. Target: ${(targetSizeBytes / (1024 * 1024)).toFixed(2)}MB`)
    
    // If basic optimization is sufficient, return it
    if (result.size <= targetSizeBytes) {
      console.log('Basic optimization achieved target size, skipping image compression')
      progressCallback?.(100)
      return result
    }
    
    // Apply high-quality image recomposition once (no downscaling, near-lossless JPEG)
    console.log('Applying high-quality image recomposition (near-lossless)...')
    try {
      const compressedBytes = await createCompressedPDF(
        arrayBuffer,
        0.95, // near-lossless
        2.0, // render at 2x to preserve small text edges
        (progress) => progressCallback?.(15 + (progress * 0.7))
      )
      const newResult = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' })
      if (newResult.size < result.size) {
        result = newResult
      }
    } catch (err) {
      console.error('High-quality recomposition failed; returning basic optimization.', err)
    }
    
    // If we didn't achieve any meaningful compression, log it
    const finalCompressionRatio = (1 - (result.size / file.size)) * 100
    
    // Final check and warning
    if (result.size > targetSizeBytes * 1.1) {
      console.warn(`Target size not fully reached. Compressed to ${(result.size / (1024 * 1024)).toFixed(2)}MB instead of ${(targetSizeBytes / (1024 * 1024)).toFixed(2)}MB`)
    } else {
      console.log(`Successfully compressed to ${(result.size / (1024 * 1024)).toFixed(2)}MB (target: ${(targetSizeBytes / (1024 * 1024)).toFixed(2)}MB)`)
    }
    
    progressCallback?.(100)
    
    return result
  } catch (error) {
    console.error('PDF compression error:', error)
    throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validates if a file can be compressed to the target size
 */
export function validateCompressionTarget(
  originalSize: number,
  targetSizeBytes: number
): { valid: boolean; reason?: string } {
  const minSize = 1024 * 1024 // 1MB minimum
  const maxCompressionRatio = 0.1 // Don't allow compression below 10% of original
  
  if (targetSizeBytes < minSize) {
    return {
      valid: false,
      reason: 'Target size cannot be smaller than 1MB'
    }
  }
  
  if (targetSizeBytes < originalSize * maxCompressionRatio) {
    return {
      valid: false,
      reason: 'Target size is too small. Maximum compression is 90% of original size.'
    }
  }
  
  return { valid: true }
}
