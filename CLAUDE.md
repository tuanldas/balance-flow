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
- `public/` - Static assets served from root URL
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.mjs` - ESLint configuration using Next.js presets

## Key Conventions

- All components use TypeScript (`.tsx` extension)
- Root layout defines HTML structure and applies global fonts via CSS variables
- Metadata is exported from layouts and pages using Next.js Metadata API
- CSS uses Tailwind utility classes with dark mode variants
