# Development Guide

## Prerequisites
- Node.js (v18 or higher)
- pnpm (for package management)
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

### Image Processing Features

#### Image Compression
The image compressor provides:
- Quality-based compression
- Format-specific optimizations
- Real-time preview
- Progress tracking
- Batch processing

#### Image Resizing
The image resizer supports:
- Custom dimensions
- Aspect ratio preservation
- Multiple output formats
- Batch processing
- Preview capabilities

### Security Considerations

#### Error Handling
Implement proper error handling for:
- Format incompatibility
- Memory limitations
- File size limits

### Best Practices

1. **Memory Management**:
   - Clean up resources after processing
   - Use URL.revokeObjectURL for previews
   - Delete temporary files

2. **User Experience**:
   - Show progress indicators
   - Provide format compatibility info
   - Display helpful error messages
   - Add preview capabilities

3. **Performance**:
   - Use appropriate quality settings
   - Optimize for quality vs size
   - Handle large files efficiently

4. **Code Organization**:
   - Separate format configurations
   - Modular settings
   - Reusable commands

## Initial Setup

### Clone the Repository
```bash
git clone [repository-url]
cd file-converter
```

### Setup
```bash
pnpm install
```

## Running the Application

### Development Server
```bash
pnpm dev
# Runs on http://localhost:3000
```

## Installed Dependencies

### Dependencies
- Next.js v15.5.0: React framework with latest optimizations
- React v19.1.1: UI library with latest features
- TypeScript v5.9.2: Type safety and development experience
- Tailwind CSS v3.4.15: Utility-first CSS framework
- shadcn/ui components: Modern UI component library
- browser-image-compression: Client-side image compression
- pdf-lib v1.17.1: PDF manipulation and compression
- @radix-ui/react-*: Accessible component primitives
- lucide-react v0.541.0: Beautiful icon library
- jszip: ZIP file creation for batch downloads

## Environment Variables

### Environment (.env.local)
```env
# Add any environment variables as needed
# Currently no environment variables are required
```

## Development Workflow
1. Start the development server with `pnpm dev`
2. Make changes to the code
3. Changes will hot-reload automatically
4. Use Git for version control
5. Follow the .gitignore rules for what not to commit
6. Use `pnpm build` to test production builds
7. Deploy via Vercel integration