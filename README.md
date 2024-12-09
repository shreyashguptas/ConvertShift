# ConvertShift

ConvertShift is a privacy-focused file conversion platform that lets you transform files right in your browser - no uploads, no servers, just seamless local processing.

## Why ConvertShift?

Have you ever needed to:
- Compress a profile picture to meet GitHub's 1MB limit?
- Convert an iPhone video to MP4 for sharing?
- Resize images in bulk for your website?

I built ConvertShift because I was tired of bouncing between sketchy file conversion websites, never knowing where my files were being uploaded or what was happening to them. I figured others probably face these same frustrations too.

## Key Features

- **Image Compression** - Compress images to a target size while maintaining quality
- **Multiple Format Support** - Handle PNG, JPG, JPEG, WebP, AVIF, SVG and more
- **Batch Processing** - Convert up to 1000 files at once
- **Complete Privacy** - All processing happens locally in your browser
- **No Limitations** - No file size limits, no ads, no signups

## Coming Soon

- Image Resizer
- Video Compressor 
- Video Format Converter
- Document Converter

## Privacy First

Your files never leave your device. ConvertShift processes everything locally in your browser - no server uploads, no data collection, no compromises on privacy.

## Get Started

Visit [ConvertShift](https://convertshift.com) to start converting files privately and efficiently.

## Deployment Configuration

The project uses Vercel for deployment and is configured as a monorepo with the Next.js application in the `frontend` directory. The deployment configuration is managed through `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "cd frontend && pnpm install && pnpm build",
  "devCommand": "cd frontend && pnpm dev",
  "installCommand": "pnpm install"
}
```

This configuration:
- Specifies Next.js as the framework
- Handles the monorepo structure by changing to the frontend directory before building
- Uses pnpm for package management
- Ensures dependencies are installed both at the root and in the frontend directory

The build process will:
1. Install dependencies at the root level
2. Navigate to the frontend directory
3. Install frontend-specific dependencies
4. Build the Next.js application
