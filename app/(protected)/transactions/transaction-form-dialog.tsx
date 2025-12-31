'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/use-categories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { useSettings } from '@/providers/settings-provider';
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
import { Textarea } from '@/components/ui/textarea';
import { getTransactionSchema, type TransactionSchemaType } from './transaction-schema';

interface TransactionFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    transaction?: {
        id: string;
        category_id: string;
        amount: number;
        transaction_date: string;
        notes?: string | null;
    } | null;
    onSuccess?: () => void;
}

export function TransactionFormDialog({
    open,
    onOpenChange,
    mode,
    transaction,
    onSuccess,
}: TransactionFormDialogProps) {
    const { t } = useTranslation();
    const { getOption } = useSettings();
    const categoryIconBgColor = getOption<string>('categoryIconBgColor');

    // Determine category type based on transaction or mode
    const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');

    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();

    // Fetch categories based on type
    const { data: categoriesData } = useCategories({ type: categoryType });
    const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

    const form = useForm<TransactionSchemaType>({
        resolver: zodResolver(getTransactionSchema()),
        defaultValues: {
            category_id: '',
            amount: 0,
            transaction_date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
            notes: '',
        },
    });

    // Watch category to determine type
    const watchedCategoryId = form.watch('category_id');

    useEffect(() => {
        if (watchedCategoryId && categories.length > 0) {
            const selectedCategory = categories.find((cat) => cat.id === watchedCategoryId);
            if (selectedCategory) {
                setCategoryType(selectedCategory.category_type);
            }
        }
    }, [watchedCategoryId, categories]);

    // Reset form when dialog opens/closes or mode changes
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && transaction) {
                // Extract category type from transaction
                const selectedCategory = categories.find((cat) => cat.id === transaction.category_id);
                if (selectedCategory) {
                    setCategoryType(selectedCategory.category_type);
                }

                form.reset({
                    category_id: transaction.category_id,
                    amount: transaction.amount,
                    transaction_date: transaction.transaction_date.slice(0, 16), // ISO to datetime-local format
                    notes: transaction.notes || '',
                });
            } else {
                // Create mode - reset to defaults
                form.reset({
                    category_id: '',
                    amount: 0,
                    transaction_date: new Date().toISOString().slice(0, 16),
                    notes: '',
                });
                setCategoryType('expense'); // Default to expense
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, transaction, form]);

    const onSubmit = async (data: TransactionSchemaType) => {
        try {
            const submitData = {
                category_id: data.category_id,
                amount: data.amount,
                transaction_date: new Date(data.transaction_date).toISOString(), // Convert to ISO 8601
                notes: data.notes || undefined,
            };

            if (mode === 'edit' && transaction) {
                await updateMutation.mutateAsync({
                    id: transaction.id,
                    data: submitData,
                });
                toast.success(t('transactions.messages.updateSuccess'));
            } else {
                await createMutation.mutateAsync(submitData);
                toast.success(t('transactions.messages.createSuccess'));
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error saving transaction:', error);
            toast.error(
                mode === 'edit' ? t('transactions.messages.updateError') : t('transactions.messages.createError'),
            );
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'edit' ? t('transactions.form.editTitle') : t('transactions.form.createTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'edit' ? t('transactions.detail.title') : t('transactions.form.createTitle')}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Category */}
                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('transactions.form.category')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('transactions.form.categoryPlaceholder')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((cat) => {
                                                const isIconUrl = cat.icon?.startsWith('http');
                                                return (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="flex h-6 w-6 items-center justify-center rounded"
                                                                style={{ backgroundColor: categoryIconBgColor }}
                                                            >
                                                                {isIconUrl ? (
                                                                    <img
                                                                        src={cat.icon}
                                                                        alt={cat.name}
                                                                        className="h-4 w-4 object-contain"
                                                                    />
                                                                ) : (
                                                                    <span
                                                                        className="material-symbols-outlined text-foreground"
                                                                        style={{ fontSize: '16px' }}
                                                                    >
                                                                        {cat.icon}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {cat.name}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Amount */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('transactions.form.amount')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder={t('transactions.form.amountPlaceholder')}
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Transaction Date */}
                        <FormField
                            control={form.control}
                            name="transaction_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('transactions.form.date')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="datetime-local"
                                            placeholder={t('transactions.form.datePlaceholder')}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('transactions.form.notes')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('transactions.form.notesPlaceholder')}
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                {t('transactions.form.cancelButton')}
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? t('common.messages.loading')
                                    : mode === 'edit'
                                      ? t('transactions.form.updateButton')
                                      : t('transactions.form.createButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
