# ConvertShift

ConvertShift is a privacy-focused file conversion platform that lets you transform files right in your browser - no uploads, no servers, just seamless local processing.

## Why ConvertShift?

Have you ever needed to:
- Compress a profile picture to meet GitHub's 1MB limit?
- Convert an iPhone video to MP4 for sharing?
- Resize images in bulk for your website?

I built ConvertShift because I was tired of bouncing between sketchy file conversion websites, never knowing where my files were being uploaded or what was happening to them. I figured others probably face these same frustrations too.

## Key Features

- **Image Modifier** - All-in-one image processing tool with:
  - **Crop & Rotate** - Interactive canvas with drag-to-crop and rotation controls
  - **Background Removal** - AI-powered background removal using ML models
  - **Resize** - Smart resizing with preset resolutions (4K, 2K, 1080p, 720p, 480p) or custom dimensions
  - **Compression** - Target file size compression with adaptive quality
  - **Format Conversion** - Convert between PNG, JPEG, WebP, and AVIF
  - **Smart Pipeline** - Combines multiple operations in optimal order for best quality
- **PDF Compression** - Compress PDF files while maintaining quality (up to 500MB)
- **Complete Privacy** - All processing happens locally in your browser
- **No Limitations** - No file size limits, no ads, no signups

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Image Processing**: HTML5 Canvas API
- **State Management**: React Hooks
- **File Handling**: Native File API
- **Styling**: Tailwind CSS with custom animations

## Privacy First

Your files never leave your device. ConvertShift processes everything locally in your browser - no server uploads, no data collection, no compromises on privacy.

## Get Started

Visit [ConvertShift](https://convertshift.com) to start converting files privately and efficiently.

## Contributing

ConvertShift is an open-source project, and we welcome contributions from the community! If you have a feature idea or face a conversion problem that isn't addressed yet, feel free to contribute. Remember that our core mission is to provide on-device file conversions without server dependencies.

### Guidelines for Contributing
- Ensure new features maintain the "no-server" philosophy
- All processing should happen locally in the browser
- Create a pull request with your changes
- Document your features properly

## License

This project is licensed under the MIT License - see the LICENSE file for details. Feel free to fork this project and create your own version while maintaining the same privacy-focused principles.
