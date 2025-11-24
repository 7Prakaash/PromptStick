# PromptStick - AI Prompt Generator

## Recent Changes

### November 24, 2025 - Template Deep-Link URL Format Change
- **Changed URL format from query parameters to hash fragments** - Template deep-links now use `#template-id` instead of `?template-id`
  - Example: `/templates/content-writing#blog-post-outline` instead of `/templates/content-writing?template-id=blog-post-outline`
- **Improved hash management** - Using `history.replaceState()` to properly add/remove hash fragments without history stack pollution
- **Preserved query strings** - Hash manipulation now preserves any existing query parameters in the URL
- **Added hash change listener** - Properly handles browser hash changes with complete effect dependencies to prevent stale closures
- **Updated share links** - Both TemplateDetail.tsx and PromptTemplateDialog.tsx now generate share URLs with hash format
- **Production-ready implementation** - All edge cases handled (manual hash edits, navigation, etc.)

### November 21, 2025 - Migrated to Frontend-Only Architecture
- **Removed backend server** - Eliminated Express.js server and all backend infrastructure
- **Deleted server/ and shared/ directories** - Cleaned up unused backend code
- **Centralized types** - Moved all TypeScript interfaces to `client/src/types.ts` for consistency
- **Updated Vite configuration** - Configured standalone Vite dev server on port 5000 (host: 0.0.0.0)
- **Simplified package scripts** - Updated to run Vite directly: `npm run dev`, `npm run build`, `npm run preview`
- **Removed backend dependencies** - Cleaned up Express, Drizzle ORM, PostgreSQL, Passport, and related packages
- **Streamlined queryClient** - Removed unused API request functions, kept QueryClient for future Supabase integration
- **Updated deployment** - Configured for static site deployment
- **All functionality preserved** - Application continues to use localStorage for data persistence
- **Ready for Supabase** - Clean foundation prepared for future authentication and database integration

### November 13, 2025 - Independent Scrolling for Saved Prompts Page
- **Enhanced scrolling behavior** - Both the folder sidebar and main prompts section now scroll independently
- **Contained layout** - Applied `max-h-[calc(100vh-12rem)] overflow-y-auto` to both sections to prevent page expansion
- **Improved UX** - Users can now scroll through long lists of folders without affecting the prompts view, and vice versa
- **Grid structure preserved** - Proper indentation ensures both columns remain within the grid container for correct layout

### November 12, 2025 - Folder UI Improvements & Drag-and-Drop Restoration
- **Simplified folder UI** - Removed GripVertical (::) drag icon from folder items for cleaner appearance
- **Enhanced folder menu interaction**
  - Replaced visible delete button with three-dot menu (⋯) that appears on hover
  - Added dropdown menu with "Rename Folder" and "Delete Folder" options
- **Added prompt preview in folders**
  - Click the chevron (>) to expand a folder and see all saved prompts in that folder
  - Each prompt shows its query name for quick identification
  - Prompts are clickable and styled with hover effects
- **Drag-and-drop for prompts**
  - Fully functional drag-and-drop system to move prompts between folders
  - Visual feedback (blue ring) shows valid drop zones when dragging
  - Drag prompts into folders or back to "All Prompts" section
  - Drop zones work seamlessly with the new folder UI

### November 12, 2025 - URL Routing Update
- Updated generator routes from `/generator/:type` to dedicated URLs:
  - `/text-prompt-generator`
  - `/image-prompt-generator`
  - `/video-prompt-generator`
- Changed template navigation from modal popup to dedicated detail pages at `/templates/:categoryId`
- Added legacy redirects for backwards compatibility
- Created centralized routing utilities in `client/src/lib/routes.ts`

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
- Main routes: 
  - Landing: `/`
  - Generator Selection: `/generators`
  - Text Generator: `/text-prompt-generator`
  - Image Generator: `/image-prompt-generator`
  - Video Generator: `/video-prompt-generator`
  - Templates Library: `/templates`
  - Template Detail: `/templates/:categoryId` (e.g., `/templates/content-writing`)
  - Saved Prompts: `/saved`
- Legacy redirects from `/generator/:type` to new dedicated routes for backwards compatibility
- Centralized routing utilities in `client/src/lib/routes.ts` for consistent URL generation

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

**Current State**: Frontend-only application (as of November 21, 2025)
- No backend server - application runs entirely in the browser
- All data stored in browser localStorage
- Vite serves the static frontend on port 5000
- Deployed as static site

**Future Plans**: Supabase integration
- Authentication (user signup/login)
- PostgreSQL database for cloud storage of prompts and folders
- Real-time sync across devices
- Usage tracking in cloud database
- Type definitions already centralized in `client/src/types.ts` ready for Supabase schemas

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

**Type Definitions** (`client/src/types.ts`):
- SavedPrompt: All prompt data (id, type, query, generatedPrompt, llm, tone, style, timestamp, folderId, isFavorite)
- Folder: Folder hierarchy (id, name, parentId, createdAt, order)
- UsageStats: Usage tracking (daily, monthly counts with date tracking)
- Centralized for consistency and ready for Supabase schema generation

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

**Current State**: No authentication (frontend-only app)
- All features available without login
- Data stored locally in browser
- No user accounts or cloud storage

**Future State** (with Supabase):
- User registration and login
- Row-level security for user data
- Cloud sync of prompts and folders across devices

## External Dependencies

### Core Framework Dependencies
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and development server
- **Wouter**: Lightweight routing library

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
- **Vite**: Build tool and production bundler
- Static site deployment configuration
- Port 5000 for both development and preview

### Notable Configurations
- **Path Aliases**: `@/*` → client/src, `@assets/*` → attached_assets
- **Development Server**: Vite dev server on 0.0.0.0:5000 with HMR
- **Font Loading**: Google Fonts (Inter, JetBrains Mono via CDN in index.html)
- **Build Output**: Compiled to `dist/` directory