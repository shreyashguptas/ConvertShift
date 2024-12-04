# File Converter Project Overview

## Project Goal
The File Converter is a web application designed to provide users with a simple and efficient way to convert files between different formats. It features a modern web interface with a sidebar navigation for easy access to different tools, starting with image compression capabilities.

## Core Features
- File upload functionality
- Multiple format conversion support
- Modern, responsive user interface with sidebar navigation
- Secure file handling
- Client-side file processing
- Image compression with size control
- Cross-platform compatibility

## Available Tools
1. Image Compression
   - Supports multiple formats:
     - Raster formats: PNG, JPG, JPEG, WebP, AVIF
     - Vector format: SVG (with special handling)
   - Format-specific optimizations:
     - WebP and AVIF: Native format compression
     - SVG: Vector-aware handling with optimization suggestions
   - Compression range: 100MB to 100KB
   - Custom target size selection
   - Client-side processing using WebAssembly
   - Instant download after compression
   - Compression statistics display
   - Format-specific handling and recommendations

## Key Architecture Decisions

### Client-Side Processing
A fundamental architectural decision of this project is to perform all file conversions on the client side (user's machine) rather than the server. This approach:
- Minimizes server resource usage
- Reduces server costs
- Improves scalability
- Ensures better privacy as files stay on user's machine
- Reduces network bandwidth usage
- Provides faster conversion times by utilizing client's computing power

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
- **Type Safety**: TypeScript
- **Package Manager**: pnpm
- **File Processing**:
  - browser-image-compression for image optimization
  - Format-specific compression algorithms
  - Web Workers for background processing
  - Native format support for WebP and AVIF
  - Vector-aware handling for SVG
- **Analytics**: Vercel Analytics for usage tracking
- **Routing**: Next.js App Router
- **Components**: Mix of server and client components

### Backend (Node.js)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Middleware**: CORS for cross-origin requests
- **Environment**: dotenv for configuration
- **Development**: nodemon for hot reloading

## Architecture
The project follows a modern client-server architecture with:
- Decoupled frontend and backend services
- RESTful API communication
- Feature-based folder structure
- Environment-based configuration
- Client-side processing for all file conversions
- Minimal server footprint
- Sidebar navigation for tool access