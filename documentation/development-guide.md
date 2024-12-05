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
- Downscaling support for all other image formats
- Quality preservation with format-specific optimizations
- Real-time preview of resized dimensions
- Client-side processing using Canvas API
- Accessible through `/image-resizer` route

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
- File conversion libraries (to be added based on format requirements)

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