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
    label: 'Video Compressor',
    href: '/video-compressor',
    icon: '🎥',
    description: 'Compress videos with custom quality and resolution settings'
  },
] as const

export const comingSoonTools = [
  { 
    icon: '🎵', 
    label: 'Video Converter',
    description: 'Convert videos between popular formats'
  },
  { 
    icon: '📊', 
    label: 'Document Converter',
    description: 'Convert between document formats easily'
  },
] as const 