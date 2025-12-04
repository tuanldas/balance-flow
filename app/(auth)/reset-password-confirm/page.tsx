'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

function ResetPasswordConfirmContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { resetPassword } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams?.get('token');
        const emailParam = searchParams?.get('email');

        if (!tokenParam || !emailParam) {
            setError(t('auth.resetPasswordConfirm.invalidLink'));
            return;
        }

        setToken(tokenParam);
        setEmail(emailParam);
    }, [searchParams, t]);

    const formSchema = z
        .object({
            password: z
                .string()
                .min(8, { message: t('auth.validation.passwordMinLength') })
                .regex(/[A-Z]/, { message: t('auth.validation.passwordUppercase') })
                .regex(/[a-z]/, { message: t('auth.validation.passwordLowercase') })
                .regex(/[0-9]/, { message: t('auth.validation.passwordNumber') }),
            confirmPassword: z.string().min(1, { message: t('auth.validation.confirmPasswordRequired') }),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t('auth.validation.passwordsNotMatch'),
            path: ['confirmPassword'],
        });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!token || !email) {
            setError(t('auth.resetPasswordConfirm.invalidLink'));
            return;
        }

        try {
            setIsProcessing(true);
            setError(null);
            setSuccess(false);

            await resetPassword(token, email, values.password, values.confirmPassword);

            setSuccess(true);
            form.reset();

            setTimeout(() => {
                router.push('/signin');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.errors.unexpected'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="w-full space-y-5">
                <div className="text-center space-y-1 pb-3">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {t('auth.resetPasswordConfirm.title')}
                    </h1>
                </div>

                <Alert variant="destructive">
                    <AlertIcon>
                        <AlertCircle />
                    </AlertIcon>
                    <AlertTitle>{error || t('auth.resetPasswordConfirm.invalidLink')}</AlertTitle>
                </Alert>

                <Button variant="outline" className="w-full" asChild>
                    <Link href="/reset-password">
                        <ArrowLeft className="size-3.5" /> {t('auth.resetPasswordConfirm.requestNewLink')}
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="block w-full space-y-5">
                <div className="text-center space-y-1 pb-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{t('auth.resetPasswordConfirm.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('auth.resetPasswordConfirm.description')}</p>
                </div>

                {error && (
                    <Alert variant="destructive" onClose={() => setError(null)}>
                        <AlertIcon>
                            <AlertCircle />
                        </AlertIcon>
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}

                {success && (
                    <Alert onClose={() => setSuccess(false)}>
                        <AlertIcon>
                            <Check />
                        </AlertIcon>
                        <AlertTitle>{t('auth.resetPasswordConfirm.successMessage')}</AlertTitle>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('auth.resetPasswordConfirm.passwordLabel')}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={t('auth.resetPasswordConfirm.passwordPlaceholder')}
                                        disabled={success || isProcessing}
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('auth.resetPasswordConfirm.confirmPasswordLabel')}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder={t('auth.resetPasswordConfirm.confirmPasswordPlaceholder')}
                                        disabled={success || isProcessing}
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={success || isProcessing} className="w-full">
                    {isProcessing ? <LoaderCircleIcon className="animate-spin" /> : null}
                    {t('auth.resetPasswordConfirm.submitButton')}
                </Button>

                <div className="space-y-3">
                    <Button type="button" variant="outline" className="w-full" asChild>
                        <Link href="/signin">
                            <ArrowLeft className="size-3.5" /> {t('auth.resetPasswordConfirm.backButton')}
                        </Link>
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default function Page() {
    return (
        <Suspense>
            <ResetPasswordConfirmContent />
        </Suspense>
    );
}
