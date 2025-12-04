'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getSigninSchema, SigninSchemaType } from '../forms/signin-schema';

export default function Page() {
    const { t } = useTranslation();
    const router = useRouter();
    const { login } = useAuth();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<SigninSchemaType>({
        resolver: zodResolver(getSigninSchema()),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: SigninSchemaType) {
        setIsProcessing(true);
        setError(null);

        try {
            await login(values.email, values.password);
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.errors.unexpected'));
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="block w-full space-y-5">
                <div className="space-y-1.5 pb-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-center">{t('auth.signin.title')}</h1>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertIcon>
                            <AlertCircle />
                        </AlertIcon>
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('auth.signin.emailLabel')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('auth.signin.emailPlaceholder')} tabIndex={1} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center gap-2.5">
                                <FormLabel>{t('auth.signin.passwordLabel')}</FormLabel>
                                <Link
                                    href="/reset-password"
                                    className="text-sm font-semibold text-foreground hover:text-primary"
                                >
                                    {t('auth.signin.forgotPassword')}
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    placeholder={t('auth.signin.passwordPlaceholder')}
                                    type={passwordVisible ? 'text' : 'password'} // Toggle input type
                                    tabIndex={2}
                                    {...field}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    mode="icon"
                                    size="sm"
                                    tabIndex={-1}
                                    onClick={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
                                    className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                                    aria-label={
                                        passwordVisible ? t('auth.signin.hidePassword') : t('auth.signin.showPassword')
                                    }
                                >
                                    {passwordVisible ? (
                                        <EyeOff className="text-muted-foreground" />
                                    ) : (
                                        <Eye className="text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-2.5">
                    <Button type="submit" disabled={isProcessing} tabIndex={3}>
                        {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
                        {t('auth.signin.continueButton')}
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                    {t('auth.signin.noAccount')}{' '}
                    <Link
                        href="/signup"
                        className="text-sm font-semibold text-foreground hover:text-primary"
                        tabIndex={4}
                    >
                        {t('auth.signin.signupLink')}
                    </Link>
                </p>
            </form>
        </Form>
    );
}
