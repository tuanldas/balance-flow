'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Check, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function Page() {
    const { t } = useTranslation();
    const { requestPasswordReset } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const formSchema = z.object({
        email: z
            .string()
            .min(1, { message: t('auth.validation.emailRequired') })
            .email({ message: t('auth.validation.emailInvalid') }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsProcessing(true);
            setError(null);
            setSuccess(false);

            await requestPasswordReset(values.email);

            setSuccess(true);
            form.reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.errors.unexpected'));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Suspense>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="block w-full space-y-5">
                    <div className="text-center space-y-1 pb-3">
                        <h1 className="text-2xl font-semibold tracking-tight">{t('auth.resetPassword.title')}</h1>
                        <p className="text-sm text-muted-foreground">{t('auth.resetPassword.description')}</p>
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
                            <AlertTitle>{t('auth.resetPassword.successMessage')}</AlertTitle>
                        </Alert>
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('auth.resetPassword.emailLabel')}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        placeholder={t('auth.resetPassword.emailPlaceholder')}
                                        disabled={success || isProcessing}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={success || isProcessing} className="w-full">
                        {isProcessing ? <LoaderCircleIcon className="animate-spin" /> : null}
                        {t('auth.resetPassword.submitButton')}
                    </Button>

                    <div className="space-y-3">
                        <Button type="button" variant="outline" className="w-full" asChild>
                            <Link href="/signin">
                                <ArrowLeft className="size-3.5" /> {t('auth.resetPassword.backButton')}
                            </Link>
                        </Button>
                    </div>
                </form>
            </Form>
        </Suspense>
    );
}
