# Project Structure

## Root Directory
```
file-converter/
├── frontend/           # Next.js frontend application
├── backend/           # Express.js backend server
├── documentation/     # Project documentation
└── .gitignore        # Git ignore configuration
```

## Frontend Structure
```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with sidebar and footer
│   ├── page.tsx               # Homepage with tool grid
│   ├── globals.css            # Global styles
│   └── image-compressor/      # Image compression tool
│       └── page.tsx           # Image compressor component
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   └── footer.tsx         # Global footer component
│   └── ui/                    # Reusable UI components
├── config/
│   └── routes.ts              # Route configurations and tool definitions
└── lib/
    └── utils.ts               # Utility functions
```

## Backend Structure
```
backend/
├── index.js         # Main server entry point
├── node_modules/    # Backend dependencies (gitignored)
└── package.json     # Backend dependencies and scripts
```

## Documentation Structure
```
documentation/
├── project-overview.md    # Project goals, features, and tech stack
├── development-guide.md   # Development setup and guidelines
└── project-structure.md   # Folder structure documentation
```

## Component Organization

### UI Components
- **Button**: Reusable button component with variants
- **Input**: Form input component with validation
- **Label**: Form label component
- **Select**: Dropdown component with custom styling

### Layout Components
- **Sidebar**: Main navigation component
  - Logo/Title
  - Navigation links
  - Tool selection

### Page Components
- **Home**: Welcome page with project information
- **Image Compressor**: Image compression tool
  - File upload interface
  - Size control inputs
  - Compression results display
  - Download functionality

## Scripts
- **optimize-favicon.js**: Favicon generation script
  - Generates multiple favicon sizes
  - Optimizes images for web
  - Creates PWA manifest
  - Supports multiple devices

## Key Configuration Files
- `.gitignore`: Specifies which files Git should ignore
- `frontend/package.json`: Frontend dependencies and scripts
  - browser-image-compression
  - lucide-react for icons
  - shadcn/ui components
  - sharp for image optimization
  - Other development dependencies
- `backend/package.json`: Backend dependencies and scripts
- `frontend/tsconfig.json`: TypeScript configuration
- `frontend/tailwind.config.ts`: Tailwind CSS configuration
- `frontend/next.config.ts`: Next.js configuration

## Environment Files (not in repository)
```
frontend/.env.local  # Frontend environment variables
backend/.env         # Backend environment variables
```

## Styling Organization
- Tailwind CSS for utility classes
- Component-specific styles
- Global styles in globals.css
- shadcn/ui component theming

## Type Definitions
- Component props
- API responses
- Utility functions
- Configuration objects

## Asset Organization
- Icons and images in public directory
  - Source favicon image
  - Generated favicon variants
  - PWA manifest
- Component-specific assets
- Shared utility functions in lib
- Type definitions in types

## Favicon Generation
The project includes an automated favicon generation system:
1. Place source image (`Favicon.jpg`) in `public/images/`
2. Run `pnpm run optimize-favicon`
3. Generated files:
   - favicon.ico (32x32)
   - favicon-16x16.png
   - favicon-32x32.png
   - apple-touch-icon.png (180x180)
   - site.webmanifest