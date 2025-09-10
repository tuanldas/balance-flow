'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout11 } from '@/layouts/layout-11';
import { useSession } from 'next-auth/react';
import { ScreenLoader } from '@/components/common/screen-loader';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <ScreenLoader />;
    }

    return session ? <Layout11>{children}</Layout11> : null;
}
