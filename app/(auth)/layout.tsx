'use client';

import { ReactNode } from 'react';
import { BrandedLayout } from '@/app/(auth)/layouts/branded';
import { ClassicLayout } from '@/app/(auth)/layouts/classic';

export default function Layout({ children }: { children: ReactNode }) {
    return <ClassicLayout>{children}</ClassicLayout>;
}
