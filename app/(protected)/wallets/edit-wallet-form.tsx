'use client';

import { useEffect, useState } from 'react';
import type { IWalletDetail, IWalletUpdateFormData } from '@/api/types/wallet';
import { callApiUpdateWallet } from '@/api/wallet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import CurrencyCombobox from './currency-combobox';

interface EditWalletFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    wallet?: Pick<IWalletDetail, 'id' | 'name' | 'currency'> | null;
}

const EditWalletForm = ({ isOpen, onOpenChange, wallet }: EditWalletFormProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formSchema = z.object({
        name: z.string().min(1, { message: t('wallet.form.errors.name_required') ?? 'Name is required' }),
        currency: z.string().min(1, { message: t('wallet.form.errors.currency_required') ?? 'Currency is required' }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: wallet?.name || '',
            currency: wallet?.currency || 'VND',
        },
    });

    useEffect(() => {
        if (wallet) {
            form.reset({ name: wallet.name || '', currency: wallet.currency || 'VND' });
        }
    }, [wallet, form]);

    const updateWalletMutation = useMutation({
        mutationFn: (data: IWalletUpdateFormData) => {
            if (!wallet?.id) throw new Error(t('wallet.errors.id_required') || 'Wallet id is required');
            return callApiUpdateWallet(wallet.id, data);
        },
        onSuccess: () => {
            toast.success(t('wallet.form.update_success') || 'Wallet updated');
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            onOpenChange(false);
            setIsSubmitting(false);
        },
        onError: (error) => {
            const message = (error as Error)?.message || (t('wallet.form.error') ?? 'Failed to update wallet');
            toast.error(message);
            setIsSubmitting(false);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        const formData: IWalletUpdateFormData = { name: values.name, currency: values.currency };
        updateWalletMutation.mutate(formData);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t('wallet.edit') || 'Edit wallet'}</SheetTitle>
                    <SheetDescription>{t('wallet.form.edit_description') || 'Update wallet details'}</SheetDescription>
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
                                            <Input
                                                placeholder={t('wallet.form.name_placeholder') ?? 'Wallet name'}
                                                {...field}
                                            />
                                        </FormControl>
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
                        {isSubmitting
                            ? (t('common.messages.loading') ?? 'Saving...')
                            : (t('common.buttons.save') ?? 'Save')}
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

export default EditWalletForm;
