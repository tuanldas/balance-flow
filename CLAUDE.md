# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Balance Flow is a Next.js 16 application showcasing multiple dashboard layout configurations. The project is built with React 19, TypeScript, and Tailwind CSS 4, demonstrating various UI/UX patterns for admin dashboards and application interfaces.

## Development Commands

**Development:**
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run build:staging # Build with staging environment (.env.staging → .env.local)
```

**Code Quality:**
```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Architecture

### Multi-Layout System

The application uses a unique multi-layout architecture where 38 different layout configurations coexist:

- **Route Structure:** All layouts live under `app/(layouts)/layout-{N}/` route groups (N = 1-38)
- **Layout Components:** Each layout has its implementation in `components/layouts/layout-{N}/`
- **Configuration Files:** Layout-specific config in `config/layout-{N}.config.tsx` containing menu structures and settings
- **Root Redirect:** Root page (`app/page.tsx`) redirects to `/layout-1` by default

### Layout Component Structure

Each layout follows this pattern:
```
components/layouts/layout-{N}/
├── index.tsx              # Main layout export with LayoutProvider
├── components/
│   ├── context.tsx        # Layout-specific state management
│   ├── main.tsx           # Main container component
│   ├── header.tsx         # Header/navigation
│   ├── sidebar.tsx        # Sidebar navigation
│   ├── toolbar.tsx        # Page toolbar components
│   ├── footer.tsx         # Footer
│   └── ...                # Other layout-specific components
└── shared/                # Shared utilities for this layout
```

Each route's `app/(layouts)/layout-{N}/layout.tsx` imports the corresponding layout component and wraps it with a client-side ScreenLoader.

### Configuration System

- **Menu Configuration:** Defined in `config/layout-{N}.config.tsx` files using `MenuConfig` type from `config/types.ts`
- **Menu Items:** Support nested structures with icons (Lucide), paths, badges, collapsible sections, and separators
- **General Settings:** `config/general.config.ts` contains global app settings (purchase links, docs, etc.)

### State Management & Data Fetching

- **React Query:** Used for server state management (`@tanstack/react-query`)
- **Context API:** Layout-specific state via context providers (`components/layouts/layout-{N}/components/context.tsx`)
- **Custom Hooks:** Common hooks in `hooks/` directory (menu, mobile detection, scroll position, viewport, etc.)

### Styling & UI

- **Tailwind CSS 4:** Primary styling system with custom configuration
- **CSS Utilities:** `cn()` utility in `lib/utils.ts` merges Tailwind classes using `clsx` and `tailwind-merge`
- **Theme System:** Dark/light mode via `next-themes` with system preference support
- **Component Library:** Comprehensive UI components in `components/ui/` built on Radix UI and React Aria Components

### Key Dependencies

- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`
- **Forms:** `react-hook-form` + `@hookform/resolvers` + `zod` for validation
- **Tables:** `@tanstack/react-table`
- **Charts:** `recharts`, `apexcharts`, `react-apexcharts`
- **Maps:** `leaflet`, `react-leaflet`
- **Animations:** `motion` (Framer Motion), `tw-animate-css`
- **UI Components:** `cmdk`, `vaul`, `sonner`, `input-otp`, `embla-carousel-react`

## Import Order Convention

Prettier is configured with strict import ordering (see `.prettierrc`):
1. Built-in Node modules
2. React imports
3. Next.js imports
4. Third-party modules
5. Type imports
6. Config imports (`@/config/*`)
7. Lib utilities (`@/lib/*`)
8. Hooks (`@/hooks/*`)
9. Providers, services
10. UI components (`@/components/ui/*`)
11. Other components (`@/components/*`)
12. App imports
13. Relative imports
14. Styles

## Path Aliases

TypeScript paths are configured in `tsconfig.json`:
- `@/*` → Root directory and `app/components/*`

## Code Style

- **Prettier:** 4-space indentation, 120 print width, single quotes, trailing commas
- **ESLint:** Next.js recommended config + React Hooks rules, extends Prettier config
- **TypeScript:** Strict mode enabled, React JSX transform

## Working with Layouts

When adding or modifying layouts:
1. Create/modify route in `app/(layouts)/layout-{N}/`
2. Create/modify component in `components/layouts/layout-{N}/`
3. Create/modify config in `config/layout-{N}.config.tsx`
4. Each layout's `layout.tsx` in app routes should be client-side with ScreenLoader
5. Layout components export a main component with LayoutProvider wrapper
6. Use the `MenuConfig` type for menu structure definitions

## Common Patterns

- **Client Components:** Most layout components use `'use client'` directive
- **Suspense:** Root layout wraps children in Suspense boundary
- **Loading States:** ScreenLoader component provides consistent loading UX
- **Responsive Design:** Use `use-mobile` hook to detect mobile viewports
- **Menu Management:** Use `use-menu` hook for sidebar/menu state
