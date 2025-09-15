'use client';

import { useState } from 'react';
import { callApiCreateWallet } from '@/api/wallet';
import type { IWalletFormData } from '@/api/types/wallet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import CurrencyCombobox from './currency-combobox';

interface AddWalletFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const AddWalletForm = ({ isOpen, onOpenChange }: AddWalletFormProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [displayValue, setDisplayValue] = useState('');
    const [rawValue, setRawValue] = useState('0');

    const formSchema = z.object({
        name: z.string().min(1, { message: t('wallet.form.errors.name_required') ?? 'Name is required' }),
        balance: z.string().min(1, { message: t('wallet.form.errors.initial_balance_required') ?? 'Initial balance is required' }),
        currency: z.string().min(1, { message: t('wallet.form.errors.currency_required') ?? 'Currency is required' }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            balance: '0',
            currency: 'VND',
        },
    });

    const currency = useWatch({
        control: form.control,
        name: 'currency',
    });

    const formatCurrency = (value: string): string => {
        if (!value || isNaN(Number(value))) return value;
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(Number(value));
        } catch {
            return value;
        }
    };

    const createWalletMutation = useMutation({
        mutationFn: (data: IWalletFormData) => callApiCreateWallet(data),
        onSuccess: () => {
            toast.success(t('wallet.form.success') ?? 'Wallet created');
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            form.reset();
            setRawValue('0');
            setDisplayValue('0');
            onOpenChange(false);
            setIsSubmitting(false);
        },
        onError: (error) => {
            const message = (error as Error)?.message || (t('wallet.form.error') ?? 'Failed to create wallet');
            toast.error(message);
            setIsSubmitting(false);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        const formData: IWalletFormData = {
            name: values.name,
            balance: rawValue,
            currency: values.currency,
        };
        createWalletMutation.mutate(formData);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t('wallet.add_new') ?? 'Add new wallet'}</SheetTitle>
                    <SheetDescription>{t('wallet.form.description') ?? 'Create a new wallet'}</SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('wallet.form.name') ?? 'Name'}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('wallet.form.name_placeholder') ?? 'Wallet name'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('wallet.form.initial_balance') ?? 'Initial balance'}</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="0"
                                                    value={displayValue}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                        setRawValue(value || '0');
                                                        field.onChange(value || '0');
                                                        setDisplayValue(value ? formatCurrency(value) : '');
                                                    }}
                                                    onFocus={() => {
                                                        if (rawValue === '0') {
                                                            setDisplayValue('');
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (!rawValue || rawValue === '0') {
                                                            setRawValue('0');
                                                            setDisplayValue('0');
                                                        } else {
                                                            setDisplayValue(formatCurrency(rawValue));
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            {currency && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                                                    {currency}
                                                </div>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('wallet.form.currency') ?? 'Currency'}</FormLabel>
                                        <FormControl>
                                            <CurrencyCombobox value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>
                <SheetFooter>
                    <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting ? t('common.messages.loading') ?? 'Saving...' : t('common.buttons.save') ?? 'Save'}
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline">
                            <X className="mr-2 h-4 w-4" />
                            {t('common.buttons.cancel') ?? 'Cancel'}
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default AddWalletForm;


