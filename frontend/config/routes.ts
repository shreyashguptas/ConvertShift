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
  }
] as const

export const comingSoonTools = [
  { 
    icon: '📊', 
    label: 'Document Converter',
    description: 'Convert between document formats easily'
  },
] as const 