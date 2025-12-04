'use client';

import { ReactNode } from 'react';
import { ClassicLayout } from '@/app/(auth)/layouts/classic';
import { BrandedLayout } from '@/app/(auth)/layouts/branded';

export default function Layout({ children }: { children: ReactNode }) {
    return <ClassicLayout>{children}</ClassicLayout>;
}
