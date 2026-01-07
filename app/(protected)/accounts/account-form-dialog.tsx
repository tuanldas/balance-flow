'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Account } from '@/lib/types/account';
import { useCreateAccount, useUpdateAccount } from '@/hooks/use-accounts';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { accountSchema, type AccountFormData } from './account-schema';

interface AccountFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    account?: Account | null;
    accountTypes: Array<{ id: string; name: string }>;
    onSuccess?: () => void;
}

export function AccountFormDialog({ open, onOpenChange, account, accountTypes, onSuccess }: AccountFormDialogProps) {
    const { t } = useTranslation();
    const isEditMode = !!account;

    const createMutation = useCreateAccount();
    const updateMutation = useUpdateAccount();

    const form = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            account_type_id: '',
            name: '',
            balance: 0,
            currency: 'VND',
            icon: '💰',
            color: '#6b7280',
            description: '',
            is_active: true,
        },
    });

    // Reset form when dialog opens/closes or account changes
    useEffect(() => {
        if (open) {
            if (account) {
                form.reset({
                    account_type_id: account.account_type_id,
                    name: account.name,
                    balance: parseFloat(account.balance),
                    currency: account.currency,
                    icon: account.icon || '💰',
                    color: account.color || '#6b7280',
                    description: account.description || '',
                    is_active: account.is_active,
                });
            } else {
                form.reset({
                    account_type_id: '',
                    name: '',
                    balance: 0,
                    currency: 'VND',
                    icon: '💰',
                    color: '#6b7280',
                    description: '',
                    is_active: true,
                });
            }
        }
    }, [open, account, form]);

    const onSubmit = async (data: AccountFormData) => {
        try {
            if (isEditMode) {
                await updateMutation.mutateAsync({
                    id: account.id,
                    data: {
                        name: data.name,
                        icon: data.icon,
                        color: data.color,
                        description: data.description,
                        is_active: data.is_active,
                    },
                });
                toast.success(t('accounts.messages.updateSuccess'));
            } else {
                await createMutation.mutateAsync(data);
                toast.success(t('accounts.messages.createSuccess'));
            }
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(isEditMode ? t('accounts.messages.updateError') : t('accounts.messages.createError'));
        }
    };

    const currencyOptions = [
        { value: 'VND', label: 'VND (₫)' },
        { value: 'USD', label: 'USD ($)' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? t('accounts.form.editTitle') : t('accounts.form.createTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode ? t('accounts.form.editTitle') : t('accounts.form.createTitle')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Account Type */}
                        <FormField
                            control={form.control}
                            name="account_type_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('accounts.form.accountType')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('accounts.form.accountTypePlaceholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accountTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('accounts.form.name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('accounts.form.namePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Balance (only for create) */}
                        {!isEditMode && (
                            <FormField
                                control={form.control}
                                name="balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('accounts.form.balance')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder={t('accounts.form.balancePlaceholder')}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Currency (only for create) */}
                        {!isEditMode && (
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('accounts.form.currency')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('accounts.form.currencyPlaceholder')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {currencyOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Icon */}
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('accounts.form.icon')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('accounts.form.iconPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Color */}
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('accounts.form.color')}</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <Input type="color" className="w-16 h-10 cursor-pointer" {...field} />
                                            <Input
                                                type="text"
                                                placeholder={t('accounts.form.colorPlaceholder')}
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('accounts.form.description')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('accounts.form.descriptionPlaceholder')}
                                            {...field}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Is Active */}
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>{t('accounts.form.isActive')}</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {t('accounts.form.cancelButton')}
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {isEditMode ? t('accounts.form.updateButton') : t('accounts.form.createButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
