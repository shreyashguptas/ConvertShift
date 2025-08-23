# PDF Compressor

A client-side PDF compression tool that allows users to compress PDF files up to 500MB while maintaining quality control.

## Features

- **Client-Side Processing**: All compression happens in the browser - no server uploads
- **File Size Control**: Users can specify target compression size in MB
- **Quality Assessment**: Automatic quality impact assessment with recommendations
- **Progress Tracking**: Real-time compression progress indicator
- **Drag & Drop Support**: Easy file upload via drag and drop
- **Download with Naming**: Compressed files automatically get "_compressed" suffix

## Current Implementation

### Compression Techniques
1. **Basic PDF Optimization** (First Pass):
   - Metadata removal (title, author, subject, keywords, etc.)
   - PDF optimization using pdf-lib's built-in options
   - Object stream compression
   - Basic file structure optimization

2. **Advanced Image Compression** (Second Pass):
   - PDF.js integration for page rendering
   - Canvas-based image compression with quality control
   - JPEG conversion for optimal file size reduction
   - Multi-attempt compression with adaptive quality settings
   - Preservation of original page dimensions and layout

### Quality Assessment
- Aggressive compression ratios achievable with image processing (15-30% of original size)
- Smart quality adjustment based on target size requirements
- Multi-pass compression attempts for optimal results
- Warning system for extreme compression requests

### Technical Implementation
- **Two-Stage Process**: Basic optimization first, then image compression if needed
- **Dynamic Loading**: PDF.js loaded dynamically to avoid SSR issues
- **Canvas API**: High-quality image processing and compression
- **Adaptive Quality**: Automatically adjusts compression quality to meet target sizes
- **Fallback Strategy**: Returns basic optimization if image compression fails

## Compression Results

### Expected Performance
- **Text-heavy PDFs**: 20-40% of original size
- **Image-heavy PDFs**: 15-30% of original size (significant improvement!)
- **Mixed content**: 20-35% of original size
- **Large files (100MB+)**: Often compress to 20-50MB with good quality

### Quality Levels
- **High Quality** (>50% of original): No visible quality loss
- **Good Quality** (30-50% of original): Minimal quality loss, images remain clear
- **Moderate Quality** (15-30% of original): Some quality loss may be noticeable
- **Aggressive** (<15% of original): Significant quality loss, not recommended

## Future Enhancements

### Potential Improvements
1. **Selective Image Compression**
   - Analyze individual images within PDFs
   - Apply different compression levels based on image content
   - Preserve high-quality images where needed

2. **Text Optimization**
   - Font subsetting and optimization
   - Text compression algorithms
   - Vector graphics optimization

3. **Advanced Quality Control**
   - Visual quality comparison
   - Content-specific compression ratios
   - User-defined quality presets

## Usage

1. Upload a PDF file (up to 500MB)
2. Specify target size in MB
3. Review quality warnings and recommendations
4. Click "Compress PDF" to process
5. Download the compressed file with "_compressed" suffix

## Technical Details

### Dependencies
- `pdf-lib`: Core PDF manipulation
- `React`: UI framework
- `Tailwind CSS`: Styling
- `Lucide React`: Icons

### File Structure
```
app/pdf-compressor/
├── page.tsx              # Main component
├── utils/
│   └── compress-pdf.ts   # Compression utilities
└── README.md            # This file
```

### Compression Process
1. Load PDF using pdf-lib
2. Remove metadata
3. Apply optimization settings
4. Save with compression options
5. Return optimized blob

## Performance Considerations

- Large files (>100MB) may take several minutes to process
- Browser memory usage scales with file size
- Progress tracking helps user experience during long operations
- Client-side processing ensures privacy but requires adequate device resources
