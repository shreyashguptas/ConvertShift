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
├── app/              # Next.js app directory (routes and pages)
│   ├── layout.tsx    # Root layout with sidebar
│   ├── page.tsx      # Home page
│   └── image-compression/  # Image compression feature
│       └── page.tsx       # Image compression page component
├── components/       # Reusable React components
│   ├── ui/          # UI components
│   │   ├── button.tsx     # Button component
│   │   ├── input.tsx      # Input component
│   │   ├── label.tsx      # Label component
│   │   └── select.tsx     # Select/Dropdown component
│   └── layout/      # Layout components
│       └── sidebar.tsx    # Navigation sidebar component
├── lib/             # Utility functions and shared logic
│   └── utils.ts     # Utility functions
├── public/          # Static assets
├── styles/          # Global styles
│   └── globals.css  # Global CSS
├── types/           # TypeScript type definitions
├── .next/           # Next.js build output (gitignored)
├── node_modules/    # Frontend dependencies (gitignored)
├── package.json     # Frontend dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json    # TypeScript configuration
├── next.config.ts   # Next.js configuration
└── postcss.config.mjs    # PostCSS configuration
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
- **Image Compression**: Image compression tool
  - File upload interface
  - Size control inputs
  - Compression results display
  - Download functionality

## Key Configuration Files
- `.gitignore`: Specifies which files Git should ignore
- `frontend/package.json`: Frontend dependencies and scripts
  - browser-image-compression
  - lucide-react for icons
  - shadcn/ui components
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
- Component-specific assets
- Shared utility functions in lib
- Type definitions in types