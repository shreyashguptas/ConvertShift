# Development Guide

## Prerequisites
- Node.js (v18 or higher)
- pnpm (for frontend package management)
- npm (for backend package management)
- Git

## Architecture Guidelines

### Client-Side Processing
All file conversions MUST be implemented on the client side. This means:
- Use WebAssembly (WASM) modules when possible for better performance
- Implement file processing logic in the frontend code
- Utilize client-side libraries for file conversions
- Never send files to the backend for processing
- Handle all file operations in the browser

### Server Implementation Rules
The backend should:
- Never handle file processing
- Never store files
- Only manage authentication and coordination
- Provide lightweight API endpoints
- Focus on session management and configuration

## Features

### Image Resizer
The image resizer tool provides the following capabilities:
- Resize any image format while maintaining aspect ratio
- Special handling for SVG files allowing upscaling up to 2x
- Downscaling support for all other image formats (25% to 100%)
- Quality preservation with format-specific optimizations
- Real-time preview of resized dimensions
- Real-time file size estimation based on:
  - Image format (PNG, JPG, SVG, etc.)
  - Scale percentage
  - Original file size
- Drag and drop file upload support
- Client-side processing using Canvas API
- Format-specific quality settings:
  - SVG: Lossless quality (1.0)
  - Other formats: Optimized quality (0.8)
- Accessible through `/image-resizer` route

#### Supported File Types
- PNG: Lossless compression, downscale only
- JPG/JPEG: Lossy compression, downscale only
- WebP: Modern format, downscale only
- AVIF: Next-gen format, downscale only
- SVG: Vector format, supports upscaling to 200%

#### Size Limitations
- Minimum scale: 25% of original dimensions
- Maximum scale: 
  - SVG: Up to 200% of original dimensions
  - Other formats: Up to 100% of original dimensions

### Video Compressor
The video compressor tool provides professional-grade video compression capabilities:

#### Core Features
- Client-side video processing using FFmpeg WebAssembly
- Adaptive resolution control based on input video
- Real-time file size estimation
- Quality-preserving compression
- Progress tracking during compression
- Drag and drop file upload support
- Accessible through `/video-compressor` route

#### Video Processing
- Resolution Control:
  - Automatic resolution detection
  - Smart resolution dropdown (only shows available downsizing options)
  - Supports from 8K down to 144p
  - Maintains aspect ratio during scaling
- Compression Settings:
  - Variable compression level (1-100%)
  - CRF (Constant Rate Factor) based encoding
  - Optimized audio compression (AAC codec)
  - Configurable video codec settings (H.264)

#### Supported Formats
Input Formats:
- MP4 (H.264, H.265)
- MOV (QuickTime)
- AVI (Audio Video Interleave)
- MKV (Matroska)
- WebM (VP8/VP9)

Output Format:
- MP4 (H.264) with AAC audio

#### Technical Implementation
- Uses FFmpeg.wasm for video processing
- Implements cross-origin isolation for WebAssembly
- Handles large file processing in-browser
- Memory-efficient chunked processing
- Automatic cleanup of temporary files

#### Quality Settings
- Video Codec: H.264 (libx264)
- Audio Codec: AAC (128k bitrate)
- Compression Presets:
  - CRF Range: 0-51 (mapped from quality slider)
  - Encoding Preset: medium (balance of speed/quality)
  - Smart bitrate allocation

## Initial Setup

### Clone the Repository
```bash
git clone [repository-url]
cd file-converter
```

### Frontend Setup
```bash
cd frontend
pnpm install
```

### Backend Setup
```bash
cd backend
npm install
```

## Running the Application

### Frontend Development Server
```bash
cd frontend
pnpm dev
# Runs on http://localhost:3000
```

### Backend Development Server
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

## Installed Dependencies

### Frontend Dependencies
- Next.js v15.0.3
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- @ffmpeg/ffmpeg: WebAssembly-based video processing
- @ffmpeg/core: FFmpeg core functionality
- @ffmpeg/util: FFmpeg utility functions
- @radix-ui/react-slider: For compression controls
- @radix-ui/react-select: For resolution selection

### Backend Dependencies
- express: Web framework
- cors: Cross-Origin Resource Sharing
- dotenv: Environment variable management
- nodemon: Development server with hot reload

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```env
PORT=3001
```

## Development Workflow
1. Start both frontend and backend servers
2. Make changes to the code
3. Frontend changes will hot-reload automatically
4. Backend changes will auto-restart with nodemon
5. Use Git for version control
6. Follow the .gitignore rules for what not to commit

## Best Practices
- Keep frontend and backend code completely separate
- Use TypeScript for type safety in frontend
- Follow the established folder structure
- Document new features and changes
- Use environment variables for configuration
- Keep dependencies up to date
- Implement all file processing on the client side
- Use efficient client-side libraries for file conversion
- Optimize for browser-based processing
- Consider progressive enhancement for better user experience