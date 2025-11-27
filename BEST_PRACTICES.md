# Next.js Best Practices - Balance Flow Project

## 1. Cấu trúc thư mục (Folder Structure)

### Recommended Structure
```
app/
├── (marketing)/          # Route group: public pages
│   ├── page.tsx
│   └── about/
├── (app)/               # Route group: authenticated app
│   ├── dashboard/
│   └── settings/
├── api/                 # API routes
│   └── [...route]/
├── components/          # Reusable components
│   ├── ui/             # Basic UI components
│   ├── forms/          # Form components
│   └── layouts/        # Layout components
├── lib/                # Utilities & helpers
│   ├── utils.ts
│   ├── api.ts
│   └── validations.ts
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
├── constants/          # App constants
└── styles/             # Additional styles
```

### Key Principles
- **Route Groups**: Sử dụng `(folderName)` để tổ chức routes mà không ảnh hưởng URL
- **Colocation**: Đặt components gần với nơi sử dụng nếu chỉ dùng 1 lần
- **Shared Code**: Code dùng nhiều lần đặt trong `components/`, `lib/`, `hooks/`

## 2. Server Components vs Client Components

### Mặc định sử dụng Server Components
```tsx
// app/dashboard/page.tsx - Server Component (default)
export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/data');
  return <div>{/* render data */}</div>;
}
```

### Chỉ dùng Client Components khi cần:
```tsx
// components/Counter.tsx
'use client'

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Khi nào dùng Client Components:**
- Cần hooks (useState, useEffect, useContext)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Interactive components

## 3. Data Fetching Best Practices

### Server-side Fetching (Recommended)
```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}
```

### Caching Strategies
```tsx
// Static (default) - cache indefinitely
fetch('https://api.example.com/static')

// Revalidate every hour
fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }
})

// No cache - always fresh
fetch('https://api.example.com/realtime', {
  cache: 'no-store'
})

// Tag-based revalidation
fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})
```

## 4. TypeScript Best Practices

### Định nghĩa types rõ ràng
```tsx
// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

// Component props types
export interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}
```

### Sử dụng TypeScript utilities
```tsx
// Pick, Omit, Partial, Required
type PostPreview = Pick<Post, 'id' | 'title'>;
type PostWithoutId = Omit<Post, 'id'>;
type PartialUser = Partial<User>;
```

## 5. Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // For above-fold images
  placeholder="blur" // Optional blur-up effect
/>
```

### Font Optimization
```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Dynamic Imports
```tsx
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable SSR if needed
});
```

## 6. Environment Variables

### Setup
```bash
# .env.local (git-ignored)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_API_URL="https://api.example.com"
```

### Usage
```tsx
// Server-side only (safe)
const dbUrl = process.env.DATABASE_URL;

// Client-side accessible (must have NEXT_PUBLIC_ prefix)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Type-safe env
```tsx
// env.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  API_URL: process.env.NEXT_PUBLIC_API_URL!,
} as const;
```

## 7. Error Handling

### Error boundaries
```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Not Found pages
```tsx
// app/not-found.tsx
export default function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

// app/posts/[id]/page.tsx
import { notFound } from 'next/navigation';

export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  if (!post) notFound();
  return <div>{post.title}</div>;
}
```

## 8. Metadata & SEO

### Static Metadata
```tsx
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Balance Flow',
  description: 'Financial management app',
  openGraph: {
    title: 'Balance Flow',
    description: 'Track your finances',
    images: ['/og-image.jpg'],
  },
};
```

### Dynamic Metadata
```tsx
// app/posts/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.id);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

## 9. API Routes Best Practices

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate body
  const post = await createPost(body);
  return NextResponse.json(post, { status: 201 });
}
```

## 10. Code Quality & Tools

### ESLint Configuration
```js
// .eslintrc.json hoặc eslint.config.mjs
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Prettier (optional)
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 80
}
```

### Git Hooks với Husky
```bash
npm install -D husky lint-staged

# package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

## 11. Security Best Practices

### Content Security Policy
```tsx
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

### Validate User Input
```tsx
// lib/validations.ts
import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

// In API route
const result = postSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { error: result.error },
    { status: 400 }
  );
}
```

## 12. Testing (Recommended)

### Setup Jest & React Testing Library
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Example Test
```tsx
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 13. Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Enable production build optimizations
- [ ] Configure CDN for static assets
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Enable HTTPS
- [ ] Configure robots.txt and sitemap.xml
- [ ] Test performance with Lighthouse
- [ ] Set up error logging

## 14. Useful Libraries to Consider

- **UI Components**: shadcn/ui, Radix UI, Headless UI
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand, Jotai (nếu cần)
- **Data Fetching**: TanStack Query (cho client-side)
- **Styling**: Tailwind CSS, CSS Modules, styled-components
- **Database**: Prisma, Drizzle ORM
- **Authentication**: NextAuth.js, Clerk, Supabase Auth
- **Testing**: Jest, Playwright, Vitest

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
