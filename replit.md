# PromptStick - AI Prompt Generator

## Overview

PromptStick is a developer-focused SaaS application for generating, organizing, and managing AI prompts across multiple model types (text, image, and video). The application provides an intuitive interface for creating optimized prompts tailored to specific LLMs (GPT, Claude, DALL-E, Midjourney, etc.), with features for saving, categorizing, and tracking usage.

**Core Purpose**: Enable users to quickly generate high-quality, model-specific AI prompts with customizable parameters (tone, style, LLM type), store them in an organized library, and monitor usage limits.

**Key Features**:
- Multi-type prompt generation (text, image, video)
- LLM-specific optimization
- Style selection toggles for customizing prompt output (detailed, concise, step-by-step, etc.)
- 70-character input limit with character counter for focused queries
- Smart error handling - shows dialog when no keyword matches are found
- Save-once functionality to prevent duplicate saves
- Folder-based organization system
- Template library for common use cases
- Usage tracking and limits (daily/monthly) - credits only deducted for successful generations
- Local storage persistence

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript using Vite as the build tool

**Routing**: Wouter for lightweight client-side routing
- Main routes: Landing (`/`), Generator (`/generator/:type`), Saved Prompts (`/saved`), Templates (`/templates`)
- Type-safe route parameters for generator pages (text/image/video)

**State Management**: 
- React hooks for local component state
- TanStack React Query for server state management (though currently minimal backend integration)
- LocalStorage utilities for data persistence without backend dependency

**UI Component Library**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- Design system inspired by Linear, Vercel, and Notion
- Customized theme with HSL color system
- "New York" variant style configuration
- Component aliases configured for clean imports (`@/components`, `@/lib`, etc.)

**Styling System**:
- Tailwind CSS with custom configuration
- CSS variables for theming (light mode default)
- Custom utility classes: `hover-elevate`, `active-elevate-2` for interactive feedback
- Typography: Inter (UI), JetBrains Mono/IBM Plex Mono (code)
- Spacing units: Tailwind's 2, 4, 6, 8, 12, 16, 24 system

**Design Philosophy**: 
- Clean, functional design prioritizing usability and readability
- Developer-focused with code-style outputs
- Mobile-responsive with hamburger navigation for small screens

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**Current State**: Minimal backend implementation
- Basic Express server setup with route registration structure
- Placeholder storage interface (in-memory implementation)
- Request logging middleware with JSON response capture
- CORS and body parsing configured

**Database Layer**: 
- Drizzle ORM configured for PostgreSQL
- Schema defined for users table (username/password authentication planned)
- Migration system configured (`drizzle-kit`)
- Currently using Neon serverless driver for PostgreSQL connections

**Storage Strategy**:
- Current: In-memory storage via `MemStorage` class implementing `IStorage` interface
- Designed for database integration: Interface includes CRUD methods for users
- Frontend uses LocalStorage for all prompt/folder/usage data persistence
- Clear separation between storage interface and implementation allows easy swap to database

**API Design**:
- Routes prefixed with `/api`
- RESTful structure intended (not yet implemented)
- Server-side rendering support via Vite middleware in development

### Data Architecture

**LocalStorage Schema** (Client-side persistence):

1. **Prompts** (`promptstick_prompts`):
   - Fields: id, type, query, generatedPrompt, llm, tone, style, timestamp, folderId, isFavorite
   - No server sync currently implemented

2. **Folders** (`promptstick_folders`):
   - Hierarchical structure with parent/child relationships
   - Fields: id, name, parentId, createdAt

3. **Usage Stats** (`promptstick_usage`):
   - Daily/monthly counters with date tracking
   - Enforced limits: 50 daily, 500 monthly
   - Resets handled client-side based on date comparison

**Database Schema** (Configured but minimal use):
- Users table with UUID primary keys, username (unique), password
- Drizzle schema with PostgreSQL dialect
- Zod validation schemas generated from Drizzle schemas

### Prompt Generation Logic

**Text Prompts** (`utils/textPromptGen.ts`):
- Tone mapping (professional, casual, creative, technical, friendly, formal)
- Style modifiers (expert, detailed, concise, step-by-step, with-examples, formatted)
- LLM-specific optimizations (structure, formatting preferences)

**Image Prompts** (`utils/imagePromptGen.ts`):
- Style presets (photorealistic, artistic, minimalist, detailed, vibrant, cinematic)
- Model-specific formatting (DALL-E 3 natural language vs Midjourney parameter syntax)
- Quality/detail enhancements based on selections

**Video Prompts** (`utils/videoPromptGen.ts`):
- Format guidance (short-form, long-form, tutorial, cinematic)
- Structural elements (hooks, timestamps, shot descriptions)
- Script vs. production-focused outputs

### Authentication & Authorization

**Planned but Not Implemented**:
- User schema exists in database
- Insert/select methods defined in storage interface
- No authentication middleware or session management currently active
- `connect-pg-simple` included for session storage (unused)

**Current State**: No user authentication; all features available without login

## External Dependencies

### Core Framework Dependencies
- **React 18**: UI framework
- **Express.js**: Backend server
- **TypeScript**: Type safety across full stack
- **Vite**: Build tool and development server
- **Wouter**: Lightweight routing library

### Database & ORM
- **Drizzle ORM** (`drizzle-orm`): Type-safe database queries
- **Drizzle Kit** (`drizzle-kit`): Schema management and migrations
- **Neon Serverless** (`@neondatabase/serverless`): PostgreSQL serverless driver
- **PostgreSQL**: Database dialect (requires `DATABASE_URL` environment variable)

### UI Component Libraries
- **Radix UI**: Headless component primitives (@radix-ui/react-*)
  - Complete set: accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, select, slider, switch, tabs, toast, tooltip, and more
- **shadcn/ui**: Pre-built component patterns using Radix + Tailwind
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge + clsx**: Conditional class name utilities

### Form & Data Management
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **Zod**: Schema validation
- **TanStack React Query**: Server state and caching

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### Development Tools
- **Replit Plugins** (development only):
  - `@replit/vite-plugin-runtime-error-modal`: Error overlay
  - `@replit/vite-plugin-cartographer`: Code navigation
  - `@replit/vite-plugin-dev-banner`: Development banner

### Utility Libraries
- **date-fns**: Date formatting and manipulation
- **nanoid**: Unique ID generation
- **embla-carousel-react**: Carousel component

### Build & Deployment
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development server
- Environment-based configuration (NODE_ENV, DATABASE_URL, REPL_ID)

### Notable Configurations
- **Path Aliases**: `@/*` → client/src, `@shared/*` → shared, `@assets/*` → attached_assets
- **Database**: Requires `DATABASE_URL` environment variable; throws error if missing
- **Session Storage**: `connect-pg-simple` included but not actively used
- **Font Loading**: Google Fonts (Inter, JetBrains Mono via CDN in index.html)