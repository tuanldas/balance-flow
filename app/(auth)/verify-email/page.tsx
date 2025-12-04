'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Page() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyEmail } = useAuth();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);

    const verify = useCallback(
        async (id: string, hash: string) => {
            try {
                setIsVerifying(true);
                await verifyEmail(id, hash);

                setError(null);
                setMessage(t('auth.verifyEmail.successMessage'));
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
            } catch (err) {
                setMessage(null);
                setError(err instanceof Error ? err.message : t('auth.verifyEmail.verifyError'));
            } finally {
                setIsVerifying(false);
            }
        },
        [router, verifyEmail, t],
    );

    useEffect(() => {
        const id = searchParams?.get('id');
        const hash = searchParams?.get('hash');

        if (!id || !hash) {
            setMessage(null);
            setError(t('auth.verifyEmail.noToken'));
            setIsVerifying(false);
            return;
        }

        verify(id, hash);
    }, [searchParams, verify, t]);

    return (
        <Suspense>
            <div className="w-full space-y-6">
                <h1 className="text-2xl font-semibold">{t('auth.verifyEmail.title')}</h1>
                {error && (
                    <>
                        <Alert variant="destructive">
                            <AlertIcon>
                                <AlertCircle />
                            </AlertIcon>
                            <AlertTitle>{error}</AlertTitle>
                        </Alert>

                        <Button asChild>
                            <Link href="/signin" className="text-primary">
                                {t('auth.verifyEmail.backToLogin')}
                            </Link>
                        </Button>
                    </>
                )}

                {isVerifying && !error && (
                    <Alert>
                        <AlertIcon>
                            <LoaderCircleIcon className="size-4 animate-spin stroke-muted-foreground" />
                        </AlertIcon>
                        <AlertTitle>{t('auth.verifyEmail.verifying')}</AlertTitle>
                    </Alert>
                )}

                {message && !isVerifying && (
                    <Alert>
                        <AlertIcon>
                            <LoaderCircleIcon className="size-4 animate-spin stroke-muted-foreground" />
                        </AlertIcon>
                        <AlertTitle>{message}</AlertTitle>
                    </Alert>
                )}
            </div>
        </Suspense>
    );
}
