'use client';

import { useEffect, useMemo, useState } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, Calendar, CreditCard, Tag, Target, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Transaction } from '@/lib/types/transaction';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories';
import { useDeleteTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { useSettings } from '@/providers/settings-provider';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getTransactionSchema, type TransactionSchemaType } from './transaction-schema';

interface TransactionDetailProps {
    transaction: Transaction | null;
    onBack?: () => void;
    isMobile?: boolean;
    onEditSuccess?: () => void;
    onDeleteSuccess?: () => void;
}

export function TransactionDetail({
    transaction,
    onBack,
    isMobile = false,
    onEditSuccess,
    onDeleteSuccess,
}: TransactionDetailProps) {
    const { t, i18n } = useTranslation();
    const locale = getIntlLocale(i18n.language);
    const { getOption } = useSettings();
    const categoryIconBgColor = getOption<string>('categoryIconBgColor');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);

    const deleteMutation = useDeleteTransaction();
    const updateMutation = useUpdateTransaction();

    // Fetch categories for the current transaction type
    const { data: categoriesData } = useCategories({ type: transaction?.type });
    const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

    // Initialize form with transaction data
    const form = useForm<TransactionSchemaType>({
        resolver: zodResolver(getTransactionSchema()),
        defaultValues: {
            category_id: transaction?.category.id || '',
            amount: transaction?.amount || 0,
            transaction_date: transaction?.date.slice(0, 16) || '', // ISO to datetime-local
            notes: transaction?.notes || '',
            status: (transaction?.status as 'completed' | 'pending' | 'cancelled') || 'completed',
        },
    });

    // Reset form when transaction changes
    useEffect(() => {
        if (transaction) {
            form.reset({
                category_id: transaction.category.id,
                amount: transaction.amount,
                transaction_date: transaction.date.slice(0, 16),
                notes: transaction.notes || '',
                status: transaction.status as 'completed' | 'pending' | 'cancelled',
            });
            setIsEditingAmount(false);
        }
    }, [transaction, form]);

    const handleSave = async (data: TransactionSchemaType) => {
        if (!transaction) return;

        try {
            await updateMutation.mutateAsync({
                id: transaction.id,
                data: {
                    category_id: data.category_id,
                    amount: data.amount,
                    transaction_date: new Date(data.transaction_date).toISOString(),
                    notes: data.notes || undefined,
                    status: data.status || 'completed',
                },
            });
            toast.success(t('transactions.messages.updateSuccess'));
            setIsEditingAmount(false);
            onEditSuccess?.();
        } catch (error) {
            console.error('Error updating transaction:', error);
            toast.error(t('transactions.messages.updateError'));
        }
    };

    const handleDelete = async () => {
        if (!transaction) return;

        try {
            await deleteMutation.mutateAsync(transaction.id);
            toast.success(t('transactions.messages.deleteSuccess'));
            setIsDeleteDialogOpen(false);
            onDeleteSuccess?.();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error(t('transactions.messages.deleteError'));
        }
    };

    if (!transaction) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/30">
                <div className="text-center text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">{t('transactions.detail.noSelection')}</p>
                    <p className="text-sm">{t('transactions.detail.selectPrompt')}</p>
                </div>
            </div>
        );
    }

    const formattedAmount = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: transaction.currency,
        minimumFractionDigits: 2,
    }).format(transaction.amount);

    const formattedDate = new Date(transaction.date).toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const isLoading = updateMutation.isPending;

    return (
        <ScrollArea className="h-full">
            <div className="p-6">
                {isMobile && onBack && (
                    <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2 gap-1.5">
                        <ArrowLeft className="h-4 w-4" />
                        {t('common.buttons.back')}
                    </Button>
                )}

                <div className="flex items-center gap-2 mb-6">
                    {transaction.status === 'to_review' && (
                        <Badge variant="warning" appearance="light" size="sm">
                            {t('transactions.status.toReview')}
                        </Badge>
                    )}
                    {transaction.status === 'completed' && (
                        <Badge variant="success" appearance="light" size="sm">
                            {t('transactions.status.completed')}
                        </Badge>
                    )}
                    {transaction.status === 'pending' && (
                        <Badge variant="default" appearance="light" size="sm">
                            {t('transactions.status.pending')}
                        </Badge>
                    )}
                    {transaction.status === 'cancelled' && (
                        <Badge variant="destructive" appearance="light" size="sm">
                            {t('transactions.status.cancelled')}
                        </Badge>
                    )}
                </div>

                {/* Amount - Click to Edit */}
                <div className="mb-6">
                    {isEditingAmount ? (
                        <Form {...form}>
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                className="text-3xl font-bold h-auto px-2 py-1"
                                                autoFocus
                                                onBlur={() => setIsEditingAmount(false)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </Form>
                    ) : (
                        <p
                            className={cn(
                                'text-3xl font-bold mb-1 cursor-pointer hover:opacity-70 transition-opacity',
                                transaction.type === 'income'
                                    ? 'text-green-600 dark:text-green-500'
                                    : 'text-red-600 dark:text-red-500',
                            )}
                            onClick={() => setIsEditingAmount(true)}
                        >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formattedAmount}
                        </p>
                    )}
                    <h2 className="text-lg font-semibold text-foreground mb-1">{transaction.merchant}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formattedDate}
                    </p>
                </div>

                <Separator className="mb-6" />

                {/* Editable Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
                        {/* Category - Always Editable */}
                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                        <Tag className="h-4 w-4" />
                                        {t('transactions.detail.category')}
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
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

                        {/* Transaction Date - Always Editable */}
                        <FormField
                            control={form.control}
                            name="transaction_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {t('transactions.form.date')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Account - Read Only */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                                {t('transactions.detail.account')}
                            </Label>
                            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {transaction.account.name} (****{transaction.account.lastFourDigits})
                                </span>
                            </div>
                        </div>

                        {/* Status - Always Editable */}
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('transactions.form.status')}</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="completed">
                                                {t('transactions.status.completed')}
                                            </SelectItem>
                                            <SelectItem value="pending">{t('transactions.status.pending')}</SelectItem>
                                            <SelectItem value="cancelled">
                                                {t('transactions.status.cancelled')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes - Always Editable */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('transactions.detail.notes')}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t('transactions.detail.notesPlaceholder')}
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tags - Display Only for now */}
                        {transaction.tags && transaction.tags.length > 0 && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    {t('transactions.detail.tags')}
                                </Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {transaction.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" size="sm">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Goal - Display Only for now */}
                        {transaction.goal && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <Target className="h-4 w-4" />
                                    {t('transactions.detail.goal')}
                                </Label>
                                <div className="px-3 py-2 border rounded-md bg-muted/50">
                                    <span className="text-sm">{transaction.goal}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-4 space-y-3">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? t('common.messages.loading') : t('common.buttons.save')}
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full gap-2"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                disabled={isLoading}
                            >
                                <Trash2 className="h-4 w-4" />
                                {t('common.buttons.delete')}
                            </Button>
                        </div>
                    </form>
                </Form>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                </div>
                                <AlertDialogTitle>{t('transactions.messages.confirmDelete')}</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="pt-2">
                                {t('transactions.messages.deleteWarning')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleteMutation.isPending}>
                                {t('common.buttons.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? t('common.messages.loading') : t('common.buttons.delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </ScrollArea>
    );
}
