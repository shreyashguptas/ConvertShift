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

### Video Processing Features

#### FFmpeg Integration
We use FFmpeg.wasm for client-side video processing. The implementation follows these key principles:

1. **FFmpeg Provider Setup**
```typescript
// FFmpeg Provider Context
interface FFmpegContextType {
  ffmpeg: FFmpeg | null;
  loaded: boolean;
  fetchFile: typeof fetchFile;
}

// Core FFmpeg loading
const loadFFmpeg = async () => {
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  const instance = new FFmpeg();
  await instance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
  });
};
```

2. **Format Handling**
```typescript
// Format configuration structure
const FORMAT_CONFIG = {
  extension: string;
  mimeType: string;
  codec: string;
  compatibleFrom: string[];
  settings: {
    preset?: string;
    crf?: string;
    profile?: string;
    // Other format-specific settings
  };
};
```

3. **Conversion Process**
```typescript
// Basic conversion flow
const convertVideo = async () => {
  await ffmpeg.writeFile('input.mp4', videoData);
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-c:v', codec,
    // Format-specific settings
    'output.ext'
  ]);
  const data = await ffmpeg.readFile('output.ext');
};
```

#### Video Converter
The video converter supports multiple formats with specific optimizations:

1. **Supported Formats**:
   - MP4 (H.264/H.265)
   - WebM (VP9)
   - MOV (QuickTime)
   - ProRes
   - DNxHD

2. **Format-Specific Settings**:
```typescript
// H.264/H.265 settings
{
  codec: 'libx264',
  settings: {
    preset: 'medium',
    crf: '23'
  }
}

// ProRes settings
{
  codec: 'prores_ks',
  settings: {
    profile: '3',  // ProRes 422 HQ
    vendor: 'apl0',
    bits_per_mb: '8000'
  }
}
```

3. **Format Compatibility**:
```typescript
const compatibilityMap = {
  'mov': ['mp4', 'mov', 'prores'],
  'mp4': ['mp4', 'webm', 'mov'],
  // ... other mappings
};
```

### Security Considerations

#### CORS and SharedArrayBuffer
FFmpeg.wasm requires specific headers for SharedArrayBuffer support:
```javascript
// next.config.js
{
  headers: [
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin"
    },
    {
      key: "Cross-Origin-Embedder-Policy",
      value: "require-corp"
    }
  ]
}
```

#### Error Handling
Implement proper error handling for:
- Format incompatibility
- Memory limitations
- Codec support
- File size limits

### Best Practices for Video Processing

1. **Memory Management**:
   - Clean up resources after processing
   - Use URL.revokeObjectURL for previews
   - Delete temporary FFmpeg files

2. **User Experience**:
   - Show progress indicators
   - Provide format compatibility info
   - Display helpful error messages
   - Add preview capabilities

3. **Performance**:
   - Use appropriate codec presets
   - Optimize for quality vs speed
   - Handle large files efficiently

4. **Code Organization**:
   - Separate format configurations
   - Modular codec settings
   - Reusable FFmpeg commands

### Adding New Video Features
When adding new video processing features:

1. **FFmpeg Integration**:
   - Use the FFmpegProvider context
   - Follow the established format structure
   - Add proper type definitions

2. **Format Support**:
   - Define compatibility rules
   - Add codec-specific settings
   - Document format limitations

3. **UI Implementation**:
   - Follow existing design patterns
   - Add proper loading states
   - Implement error handling
   - Add progress indicators

4. **Testing**:
   - Test format compatibility
   - Verify codec support
   - Check error scenarios
   - Validate output quality

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