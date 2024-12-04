# File Converter Project Overview

## Project Goal
The File Converter is a web application designed to provide users with a simple and efficient way to convert files between different formats. It features a modern web interface with a sidebar navigation for easy access to different tools, starting with the Image Compressor.

## Core Features
- File upload functionality with drag-and-drop support
- Multiple format conversion support
- Modern, responsive user interface with sidebar navigation
- Secure file handling
- Client-side file processing
- Image compression with size control
- Cross-platform compatibility
- Real-time compression feedback
- Format-specific optimizations
- Automated asset optimization
- Progressive Web App support

## Available Tools
1. Image Compressor
   - Supports multiple formats:
     - Raster formats: PNG, JPG, JPEG, WebP, AVIF
     - Vector format: SVG (with special handling)
   - Format-specific optimizations:
     - WebP and AVIF: Native format compression
     - SVG: Vector-aware handling with optimization suggestions
   - Features:
     - Compression range: 100MB to 100KB
     - Custom target size selection with KB/MB units
     - Intuitive file upload interface
     - File information display (name, size, type)
     - Compression statistics
     - Manual download control

2. Asset Optimization
   - Automated favicon generation
   - Multiple device support:
     - Traditional favicon (ICO)
     - Modern browsers (PNG)
     - Apple devices (touch icon)
   - Optimization features:
     - Automatic resizing
     - Maximum compression
     - Quality preservation
     - Multiple format support
   - PWA manifest generation
   - Device-specific icons

## Key Architecture Decisions

### Client-Side Processing
A fundamental architectural decision of this project is to perform all file conversions on the client side (user's machine) rather than the server. This approach:
- Minimizes server resource usage
- Reduces server costs
- Improves scalability
- Ensures better privacy as files stay on user's machine
- Reduces network bandwidth usage
- Provides faster conversion times by utilizing client's computing power

### Asset Optimization
The project includes automated asset optimization:
- Favicon generation pipeline
- Image compression tools
- Resource minimization
- Device-specific assets
- PWA support

### Server Responsibilities
The server's role is intentionally lightweight:
- Authentication and authorization
- Serving the web application
- Managing user sessions
- Providing conversion configurations
- API endpoints for minimal coordination

## Technology Stack

### Frontend (Next.js)
- **Framework**: Next.js 14
- **UI Library**: React
- **Styling**: 
  - Tailwind CSS for utility-first styling
  - shadcn/ui for component library
  - Custom component styling
- **Type Safety**: TypeScript
- **Package Manager**: pnpm
- **File Processing**:
  - browser-image-compression for image optimization
  - sharp for asset optimization
  - Format-specific compression algorithms
  - Web Workers for background processing
  - Native format support for WebP and AVIF
  - Vector-aware handling for SVG
- **UI Components**:
  - Custom file upload interface
  - Responsive sidebar navigation
  - Interactive form controls
  - Progress indicators
  - Format-specific UI elements
- **Input Validation**:
  - Custom numeric input handling
  - File type validation
  - Size constraints enforcement
- **Asset Generation**:
  - Automated favicon creation
  - PWA manifest generation
  - Optimized image variants
- **Analytics**: Vercel Analytics for usage tracking
- **Routing**: Next.js App Router
- **Components**: Mix of server and client components

### Backend (Node.js)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Middleware**: CORS for cross-origin requests
- **Environment**: dotenv for configuration
- **Development**: nodemon for hot reloading

## User Experience Features
1. **File Upload**:
   - Visual upload area with icon
   - File type validation
   - Size limit enforcement
   - Clear error messages

2. **File Information**:
   - Prominent file details display
   - Format-specific badges
   - Size information
   - Type indicators

3. **Compression Controls**:
   - Precise size input with validation
   - Unit selection (KB/MB)
   - Clear action buttons
   - Processing indicators

4. **Results Display**:
   - Compression statistics
   - Before/after size comparison
   - Compression ratio
   - Download control

5. **Cross-Platform Support**:
   - Responsive design
   - Device-specific favicons
   - PWA capabilities
   - Touch-friendly interface

## Architecture
The project follows a modern client-server architecture with:
- Decoupled frontend and backend services
- RESTful API communication
- Feature-based folder structure
- Environment-based configuration
- Client-side processing for all file conversions
- Automated asset optimization
- Minimal server footprint
- Sidebar navigation for tool access