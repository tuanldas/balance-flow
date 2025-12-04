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

### State Management & Data Fetching

- **React Query:** Used for server state management (`@tanstack/react-query`)
- **Context API:** Layout-specific state via context providers (`components/layouts/layout-{N}/components/context.tsx`)
- **Custom Hooks:** Common hooks in `hooks/` directory (menu, mobile detection, scroll position, viewport, etc.)

### Internationalization (i18n)

- **i18next:** Used for internationalization with `react-i18next` integration
- **Supported Languages:** Vietnamese (vi) and English (en)
- **Default Language:** Vietnamese (vi)
- **Translation Files:** Located in `i18n/messages/` directory
  - `vi.json` - Vietnamese translations
  - `en.json` - English translations
- **Configuration:** `i18n/config.ts` defines available languages and their properties
- **Provider:** `I18nProvider` in `providers/i18n-provider.tsx` initializes i18next
- **Usage Pattern:** Import `useTranslation` hook in components:
  ```tsx
  import { useTranslation } from 'react-i18next';

  export function Component() {
      const { t } = useTranslation();
      return <div>{t('common.buttons.save')}</div>;
  }
  ```
- **Translation Structure:** All translations are organized under the `common` namespace with sections for:
  - `common.buttons` - Button labels (save, cancel, delete, edit, add, remove, submit, close, logout)
  - `common.labels` - Form labels (name, email, password, username, phone, address)
  - `common.messages` - System messages (welcome, loading, error, success, confirm)
  - `common.theme` - Theme toggle labels (light, dark)
  - `common.status` - User status labels (online, offline, away, busy)
- **Formatting Utilities:** `i18n/format.ts` provides locale-aware formatting functions:
  - `formatDate()` - Format dates
  - `formatDateTime()` - Format dates with time
  - `formatTime()` - Format time only
  - `formatMoney()` - Format currency amounts
- **Timezone Helper:** `i18n/timezones.ts` provides `getTimeZones()` function to get all available timezones with formatted labels

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

## Git Workflow

This project follows Git Flow branching model with the following configuration:

### Branch Structure

- **Production branch:** `main`
- **Development branch:** `dev`
- **Feature branches:** `feature/`
- **Release branches:** `release/`
- **Hotfix branches:** `hotfix/`
- **Support branches:** `support/`
- **Bugfix branches:** `bugfix/`

### Commit Message Rules

**IMPORTANT:** All commit messages MUST be written in Vietnamese.

**DO NOT include the following text in commit messages:**

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Workflow Rules

**CRITICAL RULES - MUST FOLLOW:**

1. **Never commit without explicit user request**
    - DO NOT create commits automatically after making changes
    - ALWAYS ask the user before committing
    - Only commit when the user explicitly says to commit

2. **Always ask about branching before making changes**
    - When adding new features or making modifications, ALWAYS ask: "Bạn có muốn tạo nhánh mới để xử lý không?"
    - Suggest appropriate branch type based on the work (feature/, bugfix/, hotfix/)
    - Wait for user confirmation before proceeding with changes

### Git Flow Commands

```bash
# Initialize git flow (if not already done)
git flow init

# Start a new feature
git flow feature start <feature-name>

# Finish a feature with --no-ff to preserve branch history
git flow feature finish --no-ff <feature-name>

# Start a release
git flow release start <version>

# Finish a release
git flow release finish <version>

# Start a hotfix
git flow hotfix start <version>

# Finish a hotfix
git flow hotfix finish <version>
```

### Merge Strategy

**IMPORTANT:** Always use `--no-ff` (no fast-forward) when finishing features to preserve branch history.

**Why use `--no-ff`:**

- Keeps a clear visual history of feature branches in the git tree
- Makes it easy to see when features were merged
- Allows reverting entire features by reverting the merge commit
- Shows the project's development timeline more clearly

**How to merge with `--no-ff`:**

**Option 1: Using git flow (recommended)**

```bash
git flow feature finish --no-ff <feature-name>
```

**Option 2: Manual merge**

```bash
git checkout dev
git merge --no-ff feature/<feature-name> -m "Merge feature/<feature-name>: Brief description"
git branch -d feature/<feature-name>
```

**Without `--no-ff`:**

```
* commit 3
* commit 2  (feature merged, but looks linear)
* commit 1
```

**With `--no-ff`:**

```
*   merge commit (clear merge point)
|\
| * commit 2  (feature branch visible)
|/
* commit 1
```

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
