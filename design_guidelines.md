# PromptStick Design Guidelines

## Design Approach

**System:** Modern SaaS Design inspired by Linear, Vercel, and Notion
**Rationale:** As a developer-focused productivity tool with code outputs, PromptStick requires clean, functional design that prioritizes usability and readability while maintaining visual polish.

## Typography System

**Font Stack:**
- Primary: 'Inter' (Google Fonts) - UI text, headings, body
- Monospace: 'JetBrains Mono' (Google Fonts) - Code snippets, generated prompts

**Hierarchy:**
- Hero Headline: text-5xl md:text-6xl font-bold
- Page Titles: text-3xl md:text-4xl font-bold
- Section Headers: text-2xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base font-normal
- Code Output: text-sm font-mono
- Helper Text: text-sm text-gray-600

## Layout System

**Spacing Units:** Use Tailwind units of 2, 4, 6, 8, 12, 16, and 24
- Component padding: p-4 to p-8
- Section spacing: py-12 md:py-16
- Card gaps: gap-6
- Form field spacing: space-y-4

**Container Strategy:**
- Max width: max-w-7xl mx-auto px-4 md:px-6
- Forms/Generators: max-w-4xl mx-auto
- Code output areas: max-w-5xl

## Core Components

### Navigation Header
- Sticky top navigation (sticky top-0 z-50)
- Logo left, navigation center, CTA button right
- Height: h-16
- Include: Home, Generators dropdown, Templates, Saved Prompts
- Mobile: Hamburger menu with slide-in drawer

### Landing Page Structure
1. **Hero Section** (h-screen or min-h-[600px])
   - Large headline emphasizing "AI Prompt Generator"
   - Subtitle explaining value proposition
   - Two CTAs: "Start Generating" (primary) + "View Templates" (secondary)
   - Hero image: Abstract illustration of AI/prompt generation workflow (right side on desktop, full-width on mobile)
   
2. **Feature Cards Grid** (3 columns on desktop, 1 on mobile)
   - Icon at top (size-12)
   - Feature title
   - 2-3 line description
   - Features: Text Prompts, Image Prompts, Video Prompts, Saved Library, Usage Tracking, Templates

3. **How It Works** (3-step process with numbers)
   - Large step numbers (text-4xl)
   - Visual flow indicators between steps

4. **CTA Section**
   - Centered heading "Ready to generate better prompts?"
   - Primary CTA button

### Generator Pages Layout
**Two-Column Split:**
- Left Column (40%): Input Form
  - Query textarea (h-32)
  - Tone selector (dropdown or button group)
  - Style options (chips/tags)
  - LLM dropdown
  - Generate button (w-full, prominent)
  
- Right Column (60%): Output Area
  - Code-snippet-style container with header showing "Generated Prompt"
  - Copy button (top-right corner)
  - Monospace text display
  - Save to library button below
  - Usage counter indicator

**Mobile:** Stack vertically (form on top)

### Saved Prompts Page
**Layout:**
- Sidebar (20%, collapsible on mobile): Folder navigation tree
  - "All Prompts" default view
  - Custom folders with indent levels
  - Add folder button at bottom
  
- Main Area (80%):
  - Top bar: Search input + "Add Custom Prompt" button + View toggle (grid/list)
  - Prompt cards in grid (2-3 columns) or list view
  - Each card shows: Prompt type badge, truncated text, LLM used, copy/edit/delete actions
  - Drag indicators on hover for folder organization

### Prompt Cards
- Compact card design (p-4)
- Type badge (top-left corner): Text/Image/Video with icon
- Prompt preview (2-3 lines, truncated)
- Metadata footer: LLM name, date saved, favorite star
- Hover state: Subtle elevation increase

### Templates Page
**Grid Layout:**
- Category cards (2-3 columns)
- Each category: Icon, title, prompt count
- Click opens modal with template list

**Template Modal:**
- Full-screen overlay with close button
- Template list items showing: Name, description, "Use Template" button
- Each template pre-fills the generator form

### Modals System
- Backdrop: Semi-transparent overlay
- Modal container: max-w-2xl, centered, with padding p-6
- Header with title and close X button
- Content area with scroll if needed
- Footer with action buttons

### Usage Limit UI
**Warning States:**
- Toast notification when approaching limit (80%)
- Modal when limit reached with upgrade messaging
- Progress bar in header showing usage: "15/50 prompts today"

### Form Controls
- Input fields: Rounded borders (rounded-lg), clear focus states
- Dropdowns: Custom styled with chevron icons
- Textareas: Resize-y enabled for query inputs
- Buttons: Rounded (rounded-lg), different sizes (sm, md, lg)
- Checkbox/Radio: Custom styled with checkmarks

## Animations

**Use Sparingly:**
- Page transitions: Subtle fade-in (duration-200)
- Card hover: Slight scale (scale-105) and shadow increase
- Modal entry: Fade + scale from 95% to 100%
- Button interactions: Standard Tailwind hover/active states
- Drag-and-drop: Smooth position transitions

## Icons

**Library:** Heroicons (via CDN)
- Navigation icons: outline style
- Feature cards: outline style, size-8 to size-12
- Actions (copy, edit, delete): size-5, outline style
- Type badges: size-4, solid style

## Images

**Hero Section:**
- Placement: Right side on desktop (50% width), full-width background on mobile
- Description: Modern, abstract illustration showing AI concept, neural networks, or prompt generation workflow with vibrant gradients
- Style: Isometric or flat illustration style

**Feature Icons:**
- Use Heroicons for all feature representations
- No additional images needed beyond hero

## Accessibility

- All interactive elements have clear focus indicators
- Form labels properly associated with inputs
- Modal traps focus when open
- Keyboard navigation for drag-drop (alternative move buttons)
- ARIA labels for icon-only buttons
- Minimum touch target size: 44x44px

## Responsive Breakpoints

- Mobile: base (< 640px) - Single column, stacked layouts
- Tablet: md (768px) - Two columns where appropriate
- Desktop: lg (1024px+) - Full multi-column layouts

**Priority:** Mobile-first approach with progressive enhancement