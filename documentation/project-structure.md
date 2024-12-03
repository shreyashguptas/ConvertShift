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
│       └── page.tsx       # Image compression page
├── components/       # Reusable React components
│   ├── ui/          # UI components (buttons, inputs, etc.)
│   ├── layout/      # Layout components
│   │   └── sidebar.tsx  # Navigation sidebar
│   └── analytics.tsx    # Analytics component
├── lib/             # Utility functions and shared logic
├── public/          # Static assets
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
├── project-overview.md    # Project goals and technology stack
├── development-guide.md   # Development setup and guidelines
└── project-structure.md   # Folder structure documentation
```

## Key Configuration Files
- `.gitignore`: Specifies which files Git should ignore
- `frontend/package.json`: Frontend dependencies and scripts
- `backend/package.json`: Backend dependencies and scripts
- `frontend/tsconfig.json`: TypeScript configuration for frontend
- `frontend/tailwind.config.ts`: Tailwind CSS styling configuration

## Environment Files (not in repository)
```
frontend/.env.local  # Frontend environment variables
backend/.env         # Backend environment variables
``` 