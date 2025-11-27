# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router, React 19, TypeScript, and Tailwind CSS v4. The project was bootstrapped with `create-next-app`.

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Framework & Routing
- **Next.js 16 with App Router**: Uses the modern `app/` directory structure for routing
- **File-based routing**: Pages are defined by the file structure in the `app/` directory
- **Server Components by default**: Components are React Server Components unless marked with `'use client'`

### Styling
- **Tailwind CSS v4**: Configured via PostCSS (`@tailwindcss/postcss`)
- **Custom fonts**: Uses Geist Sans and Geist Mono via `next/font/google`
- **Dark mode support**: Implemented via CSS classes (`dark:` prefix)
- **Global styles**: Defined in `app/globals.css`

### TypeScript Configuration
- **Path alias**: `@/*` maps to the project root (e.g., `@/app/page.tsx`)
- **Strict mode enabled**: Full TypeScript strict checking
- **Target**: ES2017
- **JSX**: Uses `react-jsx` transform

### Project Structure
- `app/` - Application pages and layouts using App Router
  - `layout.tsx` - Root layout with font configuration and metadata
  - `page.tsx` - Home page component
  - `globals.css` - Global styles and Tailwind directives
- `components/` - Reusable React components
  - `ui/` - Base UI components (shadcn/ui based)
  - `layouts/` - Pre-built layout themes (see Layout Themes section below)
- `lib/` - Utility functions and helpers
  - `utils.ts` - Common utility functions (cn, etc.)
  - `helpers.ts` - Additional helper functions
- `public/` - Static assets served from root URL
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.mjs` - ESLint configuration using Next.js presets
- `components.json` - shadcn/ui component configuration

## Layout Themes

The project includes five pre-built, production-ready layout themes in `components/layouts/`:

### Available Layouts

1. **AI Layout** (`components/layouts/ai/`)
   - Modern AI chat interface with sidebar navigation
   - Features: Model selector, chat history, pinned chats, quick actions
   - Context providers: `LayoutProvider`, `ChatsProvider`, `NewChatProvider`
   - Customizable via CSS variables (sidebar width, header height, etc.)
   - Import: `import { DefaultLayout } from '@/components/layouts/ai'`

2. **Mail Layout** (`components/layouts/mail/`)
   - Gmail-style email client interface
   - Features: Sidebar with folders/labels, mail list, message view, compose
   - Components: Mail list, message viewer, contacts, labels, AI compose
   - Context provider: `LayoutProvider` with sidebar collapse support
   - Import: `import { DefaultLayout } from '@/components/layouts/mail'`

3. **Calendar Layout** (`components/layouts/calendar/`)
   - Full-featured calendar application interface
   - Features: Sidebar navigation, calendar views, event management
   - Context provider: `LayoutProvider` for sidebar state management
   - Mobile-responsive with collapsible sidebar
   - Import: `import { DefaultLayout } from '@/components/layouts/calendar'`

4. **CRM Layout** (`components/layouts/crm/`)
   - Professional CRM dashboard interface
   - Features: Dual sidebar (default + workspace), header with search, content areas
   - Navigation configured via `MAIN_NAV` config
   - Context provider: `LayoutProvider` with nav items configuration
   - Import: `import { DefaultLayout } from '@/components/layouts/crm'`

5. **Store Inventory Layout** (`components/layouts/store-inventory/`)
   - E-commerce inventory management interface
   - Features: Sidebar menu, notifications sheet, chat, search, breadcrumbs
   - Context provider: Layout context for sidebar state
   - Includes avatar groups and notification system
   - Import: `import { DefaultLayout } from '@/components/layouts/store-inventory'`

### Using Layout Themes

Each layout exports a `DefaultLayout` component that wraps page content:

```tsx
import { DefaultLayout } from '@/components/layouts/ai';

export default function Page() {
  return (
    <DefaultLayout>
      {/* Your page content here */}
    </DefaultLayout>
  );
}
```

### Layout Architecture

- All layouts use **Client Components** (`'use client'`)
- Each includes a **context provider** for state management
- Customizable via **CSS custom properties** (passed as inline styles)
- Responsive design with mobile-specific components
- Modular component structure in `components/` subdirectory

### Common Layout Features

- **Sidebar navigation**: Collapsible sidebars with responsive behavior
- **Header components**: Search, notifications, user menus
- **Context management**: React Context for layout state
- **Theme support**: Dark mode compatible
- **Mobile responsive**: Dedicated mobile headers and navigation

## UI Components

The project uses **shadcn/ui** components with extensive customization:

### Component Library
- Based on Radix UI primitives with Tailwind CSS styling
- Located in `components/ui/`
- Configured via `components.json`
- Includes 80+ components (forms, navigation, data display, etc.)

### Key Component Categories

1. **Forms & Input**: Button, Input, Textarea, Select, Checkbox, Radio, etc.
2. **Navigation**: Breadcrumb, Tabs, Navigation Menu, Pagination
3. **Data Display**: Table, Data Grid (with sorting, filtering), Card, Badge
4. **Overlays**: Dialog, Sheet, Popover, Tooltip, Alert Dialog
5. **Feedback**: Alert, Toast (Sonner), Progress, Skeleton
6. **Advanced**: Calendar, Kanban, Sortable, Tree, Rating
7. **Animations**: Marquee, Typing Text, Counting Number, Text Reveal

### Special Components

- **Data Grid** (`data-grid.tsx`): Advanced table with sorting, filtering, pagination, DnD
- **Calendar** (`calendar/`): Full calendar system with multiple views (month, week, day, agenda)
- **Kanban** (`kanban.tsx`): Drag-and-drop board component
- **File Upload** (`file-upload.tsx`): File upload with drag & drop
- **Avatar Group** (`avatar-group.tsx`): Stacked avatar display

## Key Conventions

- All components use TypeScript (`.tsx` extension)
- Root layout defines HTML structure and applies global fonts via CSS variables
- Metadata is exported from layouts and pages using Next.js Metadata API
- CSS uses Tailwind utility classes with dark mode variants
- Layout themes are client components with context providers
- Use `cn()` utility from `@/lib/utils` for conditional class names
