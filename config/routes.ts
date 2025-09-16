export const routes = [
  {
    label: 'Image Compressor',
    href: '/image-compressor',
    icon: '🖼️',
    description: 'Compress images while preserving quality (PNG, JPG, WebP)'
  },
  {
    label: 'Image Resizer',
    href: '/image-resizer',
    icon: '📐',
    description: 'Resize images to your desired dimensions while maintaining quality'
  },
  {
    label: 'Image Cropper',
    href: '/image-cropper',
    icon: '✂️',
    description: 'Crop and rotate your images with precision. Supports PNG, JPG, JPEG, WebP, and AVIF formats.'
  },
  {
    label: 'Background Remover',
    href: '/image-background-remover',
    icon: '🧼',
    description: 'Remove image backgrounds locally in your browser. Exports high-quality PNG.'
  },
  {
    label: 'Image Converter',
    href: '/image-converter',
    icon: '🔄',
    description: 'Convert images between different formats while maintaining quality. Supports PNG, JPG, JPEG, WebP, and AVIF.'
  },
  {
    label: 'PDF Compressor',
    href: '/pdf-compressor',
    icon: '📄',
    description: 'Compress PDF files while maintaining quality (up to 500MB)'
  }
] as const

export const comingSoonTools = [
  { 
    icon: '📊', 
    label: 'Document Converter',
    description: 'Convert between document formats easily'
  },
] as const 