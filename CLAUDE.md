# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Balance Flow is a Next.js 16 application showcasing multiple dashboard layout configurations. The project is built with React 19, TypeScript, and Tailwind CSS 4, demonstrating various UI/UX patterns for admin dashboards and application interfaces.

## Development Commands

**IMPORTANT: Always run commands inside Docker container**

When working with this project, ALWAYS execute commands inside the Docker container using `docker compose exec app <command>` instead of running them directly on the host machine. This ensures consistency across development environments.

**Development:**

```bash
# Setup Docker environment first
cp compose-dev.yml compose.override.yml  # For development
docker compose up -d                      # Start containers

# Run commands inside container
docker compose exec app npm run dev       # Start development server
docker compose exec app npm run build     # Production build
docker compose exec app npm run start     # Start production server
docker compose exec app npm install <pkg> # Install new package
```

**Code Quality:**

```bash
docker compose exec app npm run lint      # Run ESLint
docker compose exec app npm run format    # Format code with Prettier
```

**Direct execution (NOT recommended - use Docker instead):**

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
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

### Authentication

- **AuthProvider:** Custom authentication provider in `providers/auth-provider.tsx` using React Context
- **Backend API:** Laravel Sanctum token-based authentication
- **API Base URL:** Configure `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (default: `http://localhost:8080`)
- **Token Storage:** Access tokens stored in localStorage
- **Authentication Hook:** `useAuth()` hook provides authentication state and methods

    ```tsx
    import { useAuth } from '@/providers/auth-provider';

    export function Component() {
        const { user, isAuthenticated, login, logout } = useAuth();

        // Available methods:
        // - login(email, password)
        // - register(name, email, password, passwordConfirmation)
        // - logout()
        // - logoutAll()
        // - updateProfile({ name?, email? })
        // - changePassword(currentPassword, newPassword, newPasswordConfirmation)
        // - requestPasswordReset(email)
        // - resetPassword(token, email, password, passwordConfirmation)
        // - verifyEmail(id, hash)
        // - resendVerificationEmail()
        // - refreshUser()

        // Available state:
        // - user: User | null
        // - accessToken: string | null
        // - isLoading: boolean
        // - isAuthenticated: boolean

        return isAuthenticated ? <div>Hello, {user?.name}</div> : <LoginForm />;
    }
    ```

- **API Integration:** All API calls automatically include:
    - `Authorization: Bearer {token}` header (when authenticated)
    - `Accept-Language` header based on current i18n locale
    - Standard response format: `{ success: boolean, message: string, data?: T }`

- **Authentication Pages:**
    - `/signin` - Login page
    - `/signup` - Registration page (sends verification email)
    - `/reset-password` - Request password reset (forgot password)
    - `/reset-password-confirm` - Reset password form from email link (requires `token` and `email` params)
    - `/change-password` - Change password for authenticated users (requires current password)
    - `/verify-email` - Email verification from email link (requires `id` and `hash` params)

- **API Endpoints:** (Backend: Laravel)
    - `POST /api/auth/register` - Register new user
    - `POST /api/auth/login` - Login user
    - `GET /api/auth/me` - Get current user
    - `PUT /api/auth/profile` - Update profile
    - `PUT /api/auth/password` - Change password (requires authentication)
    - `POST /api/auth/logout` - Logout current device
    - `POST /api/auth/logout-all` - Logout all devices
    - `POST /api/auth/forgot-password` - Request password reset email
    - `POST /api/auth/reset-password` - Reset password with token (body: `{ token, email, password, password_confirmation }`)
    - `POST /api/auth/verify-email` - Verify email (body: `{ id, hash }`)
    - `POST /api/auth/resend-verification-email` - Resend verification email

- **Email Links Configuration:** Backend should send email links pointing to frontend:
    - Password reset: `FRONTEND_URL/reset-password-confirm?token={token}&email={email}`
    - Email verification: `FRONTEND_URL/verify-email?id={user_id}&hash={hash}`

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

### Categories Management

The application includes a complete Categories Management system for income and expense categories:

- **Location:** `app/(protected)/categories/` - Main categories management page
- **API Layer:**
    - Types: `lib/types/category.ts` - TypeScript interfaces for Category API
    - API Service: `lib/api/categories.ts` - Full CRUD operations (getAll, getById, getSubcategories, create, update, patch, delete)
    - Icons API: `lib/api/category-icons.ts` - Fetch available category icons from backend
- **React Query Hooks:** `hooks/use-categories.ts` - Custom hooks with cache management:
    - `useCategories(filters?)` - Fetch all categories with optional filters
    - `useCategory(id)` - Fetch single category
    - `useSubcategories(id)` - Fetch subcategories
    - `useCreateCategory()` - Create new category
    - `useUpdateCategory()` - Update category
    - `usePatchCategory()` - Partial update
    - `useDeleteCategory()` - Delete category
- **UI Components:**
    - `category-item.tsx` - Tree view component with expand/collapse for hierarchical display
    - `category-form-dialog-compact.tsx` - Dialog form with validation (Zod) and icon picker
    - `icon-picker.tsx` - Icon picker component with default icons from API and custom upload support
    - `category-schema.ts` - Zod validation schema
- **Features:**
    - Tree view with parent-child relationships
    - Tabs for Income/Expense separation
    - CRUD operations: Create, Edit, Delete, Add Subcategory
    - Icon picker: Select from default icons or upload custom icon (SVG, PNG, JPG - max 512KB)
    - Random icon selection when creating new category
    - Form validation with Zod
    - i18n support (Vietnamese & English)
    - Loading states & error handling
- **API Response Structure:**
    ```typescript
    {
        "success": boolean,
        "data": Category[],
        "pagination": {
            "current_page": number,
            "per_page": number,
            "total": number,
            "last_page": number,
            "from": number,
            "to": number
        }
    }
    ```
- **Category Model:**
    ```typescript
    {
        "id": string,
        "user_id": string | null,
        "name": string,
        "category_type": "income" | "expense",
        "parent_id": string | null,
        "icon": string,  // URL to SVG icon
        "color": string,  // Hex color code (managed by backend, not editable in frontend)
        "is_system": boolean,
        "created_at": string,
        "updated_at": string,
        "subcategories_count": number,
        "children": Category[]  // Nested subcategories
    }
    ```

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

1. **Never work directly on dev or main branches**
    - ALWAYS check current branch before making any code changes
    - If current branch is `dev` or `main`, IMMEDIATELY stop and ask user to create a new branch
    - DO NOT make any code modifications on `dev` or `main` branches
    - Suggest creating appropriate branch type: feature/, bugfix/, or hotfix/
    - Exception: Only documentation files (like CLAUDE.md, README.md) can be edited on dev/main

2. **Never commit without explicit user request**
    - DO NOT create commits automatically after making changes
    - ALWAYS ask the user before committing
    - Only commit when the user explicitly says to commit

3. **Always ask about branching before making changes**
    - When adding new features or making modifications, ALWAYS ask: "Bạn có muốn tạo nhánh mới để xử lý không?"
    - Suggest appropriate branch type based on the work (feature/, bugfix/, hotfix/)
    - Wait for user confirmation before proceeding with changes

4. **Always run lint and format before committing**
    - Before every commit, MUST run these commands in sequence:
        1. `npm run lint` - Check code quality and fix any errors/warnings
        2. `npm run format` - Format code according to Prettier rules
    - Only proceed with commit after both commands complete successfully
    - This ensures code quality and consistent formatting across the codebase

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

## Docker Development

This project uses Docker for consistent development and deployment environments.

### Docker Setup

**File Structure:**

```
├── Dockerfile              # Multi-stage build (deps → builder → runner)
├── .dockerignore          # Optimize build context
├── compose.yml            # Base configuration
├── compose-dev.yml        # Development overrides (hot reload)
├── compose-prod.yml       # Production overrides (optimized)
└── compose.override.yml   # Active environment (gitignored)
```

### Quick Start

**Development:**

```bash
# Setup development environment
cp compose-dev.yml compose.override.yml
docker compose up -d

# View logs
docker compose logs -f app

# Stop containers
docker compose down
```

**Production:**

```bash
cp compose-prod.yml compose.override.yml
docker compose up --build -d
```

### Running Commands in Docker

**CRITICAL RULE: Always execute commands inside Docker container**

Do NOT run commands directly on host machine. Always use `docker compose exec app <command>`.

**Examples:**

```bash
# Install dependencies
docker compose exec app npm install <package-name>

# Run development server
docker compose exec app npm run dev

# Code quality checks
docker compose exec app npm run lint
docker compose exec app npm run format

# Build application
docker compose exec app npm run build

# Access container shell
docker compose exec app sh

# Run any Node.js script
docker compose exec app node script.js
```

### Environment Variables

Configure in `.env` or `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Docker Development
DEV_PORT=3000        # Host port for development
DEBUG_PORT=9229      # Node.js debugger port
```

### Docker Configuration Details

**Development (`compose-dev.yml`):**

- Uses `builder` stage from Dockerfile
- Hot reload via bind mounts
- Runs `npm run dev`
- Port configurable via `${DEV_PORT}`
- Debug port available: `${DEBUG_PORT}`

**Production (`compose-prod.yml`):**

- Uses optimized `runner` stage
- Resource limits (CPU/Memory)
- No port exposure (use reverse proxy)
- Logging with rotation
- Security hardening

### Troubleshooting

**Hot reload not working:**

```bash
docker compose down
docker compose up --build
```

**Port conflict:**

```bash
# Change port in .env
echo "DEV_PORT=3001" >> .env
docker compose up -d
```

**Clear everything and rebuild:**

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

See `README.docker.md` for detailed documentation.
