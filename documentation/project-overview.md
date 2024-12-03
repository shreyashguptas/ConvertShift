# File Converter Project Overview

## Project Goal
The File Converter is a web application designed to provide users with a simple and efficient way to convert files between different formats. It features a modern web interface for file uploads and conversions, with a separate backend handling the actual conversion processes.

## Core Features
- File upload functionality
- Multiple format conversion support
- Modern, responsive user interface
- Secure file handling
- RESTful API backend
- Client-side file processing

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
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Package Manager**: pnpm
- **File Processing**: Client-side JavaScript libraries for file conversion
- **Analytics**: Vercel Analytics for usage tracking

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
- Scalable folder structure
- Environment-based configuration
- Client-side processing for all file conversions
- Minimal server footprint