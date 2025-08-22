import { PDFDocument, PDFImage, PDFPage } from 'pdf-lib'

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
 * Extracts images from PDF and returns them with metadata
 */
async function extractImagesFromPDF(pdfDoc: PDFDocument): Promise<Array<{
  image: PDFImage
  data: Uint8Array
  size: number
  type: string
}>> {
  const images: Array<{
    image: PDFImage
    data: Uint8Array
    size: number
    type: string
  }> = []
  
      // Note: pdf-lib doesn't provide direct access to embedded images
    // This is a limitation of the current approach
    // For production use, you might need a more advanced library like pdf2pic or pdf.js
    // Future enhancement: Implement image extraction and compression
  
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
  // Based on typical PDF compression ratios:
  // - Text-heavy PDFs: 30-50% of original size
  // - Image-heavy PDFs: 50-70% of original size
  // - Mixed content: 40-60% of original size
  
  // Conservative estimate assuming mixed content
  const conservativeRatio = 0.6
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
  
  if (ratio >= 0.8) {
    return {
      level: 'none',
      message: 'No significant quality loss expected.',
      recommendedSize
    }
  } else if (ratio >= 0.6) {
    return {
      level: 'minimal',
      message: 'Minimal quality loss. Most users won\'t notice any difference.',
      recommendedSize
    }
  } else if (ratio >= 0.4) {
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
 * Main PDF compression function
 */
export async function compressPDF(
  file: File,
  options: CompressionOptions
): Promise<Blob> {
  const { targetSizeBytes, maxQuality = 0.9, minQuality = 0.3, progressCallback } = options
  
  try {
    progressCallback?.(10)
    
    // Load the PDF
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    
    progressCallback?.(30)
    
    // Remove metadata to save space
    pdfDoc.setTitle('')
    pdfDoc.setAuthor('')
    pdfDoc.setSubject('')
    pdfDoc.setKeywords([])
    pdfDoc.setProducer('ConvertShift PDF Compressor')
    pdfDoc.setCreator('ConvertShift')
    pdfDoc.setCreationDate(new Date())
    pdfDoc.setModificationDate(new Date())
    
    progressCallback?.(50)
    
    // Calculate optimal quality based on target size
    const currentSize = file.size
    const quality = calculateOptimalQuality(currentSize, targetSizeBytes, minQuality, maxQuality)
    
    progressCallback?.(70)
    
    // Note: Advanced image compression would be implemented here
    // For now, we use basic PDF optimization
    
    // Save with optimization options
    const optimizedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    })
    
    progressCallback?.(90)
    
    let result = new Blob([new Uint8Array(optimizedPdfBytes)], { type: 'application/pdf' })
    
    // If still too large, apply more aggressive compression
    if (result.size > targetSizeBytes * 1.2) {
      // For basic implementation, we'll return the best we can do
      console.warn(`Target size not reached. Compressed to ${(result.size / (1024 * 1024)).toFixed(2)}MB instead of ${(targetSizeBytes / (1024 * 1024)).toFixed(2)}MB`)
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
