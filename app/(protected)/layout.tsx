'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { ProtectedLayout } from '@/components/layouts/protected';
import { ScreenLoader } from '@/components/screen-loader';

export default function AppProtectedLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check authentication status
        if (!isAuthLoading) {
            if (!isAuthenticated) {
                // Redirect to signin page if not authenticated
                router.push('/signin');
            } else {
                // Simulate short loading time for layout initialization
                const timer = setTimeout(() => {
                    setIsLoading(false);
                }, 1000); // 1 second loading time

                return () => clearTimeout(timer);
            }
        }
    }, [isAuthenticated, isAuthLoading, router]);

    if (isAuthLoading || isLoading) {
        return <ScreenLoader />;
    }

    // Don't render layout if not authenticated
    if (!isAuthenticated) {
        return <ScreenLoader />;
    }

    return <ProtectedLayout>{children}</ProtectedLayout>;
}
