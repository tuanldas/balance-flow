'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout11 } from '@/layouts/layout-11';
import { useAuth } from '@/providers/auth-provider';
import { ScreenLoader } from '@/components/common/screen-loader';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/signin');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <ScreenLoader />;
    }

    return isAuthenticated ? <Layout11>{children}</Layout11> : null;
}
