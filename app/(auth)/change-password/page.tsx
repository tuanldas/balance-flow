'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
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
    const { changePassword } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const formSchema = z
        .object({
            currentPassword: z.string().min(1, { message: t('auth.validation.passwordRequired') }),
            newPassword: z
                .string()
                .min(8, { message: t('auth.validation.passwordMinLength') })
                .regex(/[A-Z]/, { message: t('auth.validation.passwordUppercase') })
                .regex(/[a-z]/, { message: t('auth.validation.passwordLowercase') })
                .regex(/[0-9]/, { message: t('auth.validation.passwordNumber') }),
            confirmPassword: z.string().min(1, { message: t('auth.validation.confirmPasswordRequired') }),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: t('auth.validation.passwordsNotMatch'),
            path: ['confirmPassword'],
        });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsProcessing(true);
            setError(null);
            setSuccess(false);

            await changePassword(values.currentPassword, values.newPassword, values.confirmPassword);

            setSuccess(true);
            form.reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('auth.errors.unexpected'));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="block w-full space-y-5">
                <div className="text-center space-y-1 pb-3">
                    <h1 className="text-2xl font-semibold tracking-tight">{t('auth.changePassword.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('auth.changePassword.description')}</p>
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
                        <AlertTitle>{t('auth.changePassword.successMessage')}</AlertTitle>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('auth.changePassword.currentPasswordLabel')}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder={t('auth.changePassword.currentPasswordPlaceholder')}
                                        disabled={success || isProcessing}
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showCurrentPassword ? (
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

                <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('auth.changePassword.newPasswordLabel')}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? 'text' : 'password'}
                                        placeholder={t('auth.changePassword.newPasswordPlaceholder')}
                                        disabled={success || isProcessing}
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
                            <FormLabel>{t('auth.changePassword.confirmPasswordLabel')}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder={t('auth.changePassword.confirmPasswordPlaceholder')}
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
                    {t('auth.changePassword.submitButton')}
                </Button>
            </form>
        </Form>
    );
}
