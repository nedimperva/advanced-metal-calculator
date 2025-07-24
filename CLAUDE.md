# SteelForge Pro - Codebase Documentation

## Project Overview

SteelForge Pro is a comprehensive steel fabrication management platform built with Next.js and TypeScript. It provides project management, workforce tracking, material calculations, timeline management, and dispatch tracking specifically designed for construction and steel fabrication professionals.

## Key Features

- **Material Calculations**: Advanced steel profile calculations with structural analysis
- **Project Management**: Complete project lifecycle management with tasks, timelines, and progress tracking
- **Workforce Management**: Worker and machinery tracking with time logging
- **Material Catalog**: Centralized materials database with pricing and specifications
- **Dispatch Management**: Material delivery tracking and inventory management
- **Multi-language Support**: i18n implementation with context-based translations
- **PWA Support**: Progressive Web App with offline capabilities
- **Responsive Design**: Mobile-first design with touch-friendly interfaces

## Technology Stack

### Core Framework
- **Next.js 15.2.4**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript 5.8.3**: Type safety

### UI & Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **Lucide React**: Icon library
- **Next Themes**: Dark/light theme support
- **Recharts**: Data visualization and charts

### State Management & Forms
- **React Hook Form 7.54.1**: Form handling
- **Zod 3.24.1**: Schema validation
- **Context API**: Global state management

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Cross-env**: Environment variable management

## Project Structure

```
/root/repo/
├── app/                           # Next.js App Router pages
│   ├── calculator/               # Material calculation page
│   ├── management/              # Project management dashboard
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Home page
├── components/                  # React components
│   ├── ui/                     # Reusable UI components (Radix-based)
│   ├── dispatch/               # Dispatch management components
│   ├── tasks/                  # Task management components
│   ├── workforce/              # Workforce management components
│   └── profile-diagrams/       # Material profile visualizations
├── contexts/                   # React context providers
│   ├── calculation-context.tsx # Material calculations state
│   ├── project-context.tsx     # Project management state
│   ├── task-context.tsx        # Task management state
│   ├── material-context.tsx    # Material data state
│   ├── i18n-context.tsx        # Internationalization state
│   └── color-theme-context.tsx # Theme customization state
├── hooks/                      # Custom React hooks
│   ├── use-cache.ts           # Caching utilities
│   ├── use-mobile.tsx         # Mobile detection
│   └── use-user-preferences.ts # User settings
├── lib/                       # Core business logic
│   ├── calculations.ts        # Material calculation algorithms
│   ├── database.ts           # Local storage management
│   ├── types.ts              # TypeScript type definitions
│   ├── material-data/        # Material specifications database
│   ├── pricing-models.ts     # Cost calculation models
│   ├── project-utils.ts      # Project management utilities
│   ├── task-utils.ts         # Task management utilities
│   ├── workforce-utils.ts    # Workforce calculation utilities
│   └── i18n.ts              # Internationalization utilities
├── public/                   # Static assets
└── styles/                   # Global styles
```

## Key Modules

### Material Calculations (`lib/calculations.ts`)
- Advanced structural analysis for steel profiles
- Cross-sectional area, moment of inertia, section modulus calculations
- Support for I-beams, channels, angles, tubes, and custom profiles
- Weight calculations with material density factors
- Pricing integration with multiple pricing models

### Project Management (`contexts/project-context.tsx`, `lib/project-utils.ts`)
- Project lifecycle management (Planning → Active → Completed)
- Material allocation and tracking
- Timeline management with critical path analysis
- Budget tracking and cost analysis
- Integration with calculations and dispatch systems

### Task System (`contexts/task-context.tsx`, `lib/task-utils.ts`)
- Task type categorization (Planning, Procurement, Fabrication, etc.)
- Dependency management and critical path tracking
- Progress tracking with weighted completion metrics
- Assignment to workers and machinery
- Integration with time logging system

### Workforce Management (`components/workforce-management.tsx`)
- Worker and machinery database
- Skill-based assignment system
- Time tracking and cost calculation
- Daily timesheet management
- Multi-project hour allocation

### Material Catalog (`contexts/material-catalog-context.tsx`)
- Centralized materials database
- Material type categorization (Steel, Aluminum, Stainless, etc.)
- Profile compatibility system
- Pricing and availability tracking
- Template system for common configurations

### Dispatch System (`components/dispatch/`)
- Material delivery tracking
- Supplier management
- Inventory allocation system
- Quality control and inspection tracking
- Integration with project materials

## Data Models

The application uses comprehensive TypeScript interfaces defined in `lib/types.ts`:

- **Project**: Core project entity with materials, tasks, and timeline
- **ProjectMaterial**: Enhanced material tracking with status and sourcing
- **ProjectTask**: Task management with dependencies and progress
- **Worker/Machinery**: Workforce resource management
- **MaterialCatalog**: Centralized material specifications
- **DispatchNote**: Material delivery and tracking
- **DailyTimesheet**: Time and cost tracking

## State Management

The application uses React Context for state management:

- **ProjectProvider**: Project data and operations
- **TaskProvider**: Task management and dependencies
- **CalculationProvider**: Material calculations and history
- **MaterialProvider**: Material data and catalog
- **I18nProvider**: Internationalization and language switching
- **ColorThemeProvider**: Theme customization

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Key Features Implementation

### PWA Support
- Service worker with caching strategies
- Offline functionality for critical features
- App manifest for installation
- Background sync for data updates

### Responsive Design
- Mobile-first approach with touch interfaces
- Adaptive layouts for different screen sizes
- Swipe gestures and mobile-optimized interactions
- Separate mobile components for complex features

### Internationalization
- Context-based translation system
- Dynamic language switching
- Bosnian translation implementation
- Extensible for additional languages

### Data Persistence
- Browser localStorage for offline functionality
- Automatic data migration system
- Backup and restore capabilities
- Conflict resolution for concurrent edits

## Security Considerations

- No external API dependencies for core functionality
- Client-side data storage with encryption considerations
- Input validation with Zod schemas
- XSS protection through React's built-in sanitization

## Performance Optimizations

- Code splitting with Next.js dynamic imports
- Memoization of expensive calculations
- Virtual scrolling for large lists
- Progressive loading of material data
- Caching strategies for frequent operations

## Testing Strategy

The codebase includes comprehensive error boundaries and loading states. Key testing considerations:

- Unit tests for calculation algorithms
- Integration tests for context providers
- End-to-end tests for critical user workflows
- Performance testing for large datasets

## Deployment Notes

- Supports deployment on various platforms (Vercel, Netlify, etc.)
- Environment variable configuration
- Production build optimization
- PWA requirements for HTTPS deployment