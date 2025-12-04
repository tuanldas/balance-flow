'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/auth-provider';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getSignupSchema, SignupSchemaType } from '../forms/signup-schema';

export default function Page() {
    const { t } = useTranslation();
    const { register } = useAuth();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(false);

    const form = useForm<SignupSchemaType>({
        resolver: zodResolver(getSignupSchema()),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            passwordConfirmation: '',
        },
    });

    const handleSubmit = async (values: SignupSchemaType) => {
        try {
            setIsProcessing(true);
            setError(null);

            // Use register method from AuthProvider
            await register(values.name, values.email, values.password, values.passwordConfirmation);

            // After successful registration, show success message
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.errors.unexpected'));
        } finally {
            setIsProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-4">
                <Alert>
                    <AlertIcon>
                        <Check />
                    </AlertIcon>
                    <AlertTitle>{t('auth.signup.successMessage')}</AlertTitle>
                </Alert>
                <Button asChild className="w-full">
                    <Link href="/signin">{t('auth.signup.loginLink')}</Link>
                </Button>
            </div>
        );
    }

    return (
        <Suspense>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="block w-full space-y-5">
                    <div className="space-y-1.5 pb-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-center">{t('auth.signup.title')}</h1>
                    </div>

                    {/* Google Sign-up button removed - can be added back when OAuth is configured */}

                    {error && (
                        <Alert variant="destructive" onClose={() => setError(null)}>
                            <AlertIcon>
                                <AlertCircle />
                            </AlertIcon>
                            <AlertTitle>{error}</AlertTitle>
                        </Alert>
                    )}

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('auth.signup.nameLabel')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('auth.signup.namePlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('auth.signup.emailLabel')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('auth.signup.emailPlaceholder')} {...field} />
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
                                <FormLabel>{t('auth.signup.passwordLabel')}</FormLabel>
                                <div className="relative">
                                    <Input
                                        placeholder={t('auth.signup.passwordPlaceholder')}
                                        type={passwordVisible ? 'text' : 'password'}
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        mode="icon"
                                        size="sm"
                                        tabIndex={-1}
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                                        aria-label={
                                            passwordVisible
                                                ? t('auth.signup.hidePassword')
                                                : t('auth.signup.showPassword')
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

                    <FormField
                        control={form.control}
                        name="passwordConfirmation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('auth.signup.confirmPasswordLabel')}</FormLabel>
                                <div className="relative">
                                    <Input
                                        type={passwordConfirmationVisible ? 'text' : 'password'}
                                        {...field}
                                        placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        mode="icon"
                                        size="sm"
                                        tabIndex={-1}
                                        onClick={() => setPasswordConfirmationVisible(!passwordConfirmationVisible)}
                                        className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                                        aria-label={
                                            passwordConfirmationVisible
                                                ? t('auth.signup.hideConfirmPassword')
                                                : t('auth.signup.showConfirmPassword')
                                        }
                                    >
                                        {passwordConfirmationVisible ? (
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
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
                            {t('auth.signup.continueButton')}
                        </Button>
                    </div>

                    <div className="text-sm text-muted-foreground text-center">
                        {t('auth.signup.haveAccount')}{' '}
                        <Link
                            href="/signin"
                            className="text-sm text-sm font-semibold text-foreground hover:text-primary"
                        >
                            {t('auth.signup.signinLink')}
                        </Link>
                    </div>
                </form>
            </Form>
        </Suspense>
    );
}
