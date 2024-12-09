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
- browser-image-compression: Image compression library
- @radix-ui/react-slider: For compression controls
- @radix-ui/react-select: For format selection

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