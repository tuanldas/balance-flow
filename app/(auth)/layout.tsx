'use client';

import { ReactNode } from 'react';
import { ClassicLayout } from '@/app/(auth)/layouts/classic';

export default function Layout({ children }: { children: ReactNode }) {
    return <ClassicLayout>{children}</ClassicLayout>;
}
