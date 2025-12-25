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
import { useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getTransactionSchema, type TransactionSchemaType } from './transaction-schema';

interface TransactionDetailProps {
    transaction: Transaction | null;
    mode?: 'view' | 'create';
    onBack?: () => void;
    isMobile?: boolean;
    onEditSuccess?: () => void;
    onDeleteSuccess?: () => void;
    onCreateSuccess?: () => void;
}

// Helper function to get local datetime string in format YYYY-MM-DDTHH:mm
function getLocalDateTimeString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Helper function to convert ISO datetime string to local datetime string
function convertUTCToLocal(utcDateString: string): string {
    const date = new Date(utcDateString);
    return getLocalDateTimeString(date);
}

export function TransactionDetail({
    transaction,
    mode = 'view',
    onBack,
    isMobile = false,
    onEditSuccess,
    onDeleteSuccess,
    onCreateSuccess,
}: TransactionDetailProps) {
    const { t, i18n } = useTranslation();
    const locale = getIntlLocale(i18n.language);
    const { getOption } = useSettings();
    const categoryIconBgColor = getOption<string>('categoryIconBgColor');

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
        mode === 'create' ? 'expense' : transaction?.type || 'expense',
    );

    const deleteMutation = useDeleteTransaction();
    const updateMutation = useUpdateTransaction();
    const createMutation = useCreateTransaction();

    // Fetch categories based on transaction type (or selected type in create mode)
    const { data: categoriesData } = useCategories({
        type: mode === 'create' ? transactionType : transaction?.type,
    });
    const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

    // Initialize form with transaction data or empty for create mode
    const form = useForm<TransactionSchemaType>({
        resolver: zodResolver(getTransactionSchema()),
        defaultValues:
            mode === 'create'
                ? {
                      name: '',
                      category_id: '',
                      amount: 0,
                      transaction_date: getLocalDateTimeString(),
                      notes: '',
                  }
                : {
                      name: transaction?.merchant || '',
                      category_id: transaction?.category.id || '',
                      amount: transaction?.amount || 0,
                      transaction_date: transaction?.date ? convertUTCToLocal(transaction.date) : '',
                      notes: transaction?.notes || '',
                  },
    });

    // Reset form when transaction changes or mode changes
    useEffect(() => {
        if (mode === 'create') {
            form.reset({
                name: '',
                category_id: '',
                amount: 0,
                transaction_date: getLocalDateTimeString(),
                notes: '',
            });
            setIsEditingAmount(false);
        } else if (transaction) {
            form.reset({
                name: transaction.merchant,
                category_id: transaction.category.id,
                amount: transaction.amount,
                transaction_date: convertUTCToLocal(transaction.date),
                notes: transaction.notes || '',
            });
            setIsEditingAmount(false);
            setTransactionType(transaction.type);
        }
    }, [transaction, mode, form]);

    const handleSave = async (data: TransactionSchemaType) => {
        try {
            const submitData = {
                name: data.name,
                category_id: data.category_id,
                amount: data.amount,
                transaction_date: new Date(data.transaction_date).toISOString(),
                notes: data.notes || undefined,
            };

            if (mode === 'create') {
                await createMutation.mutateAsync(submitData);
                toast.success(t('transactions.messages.createSuccess'));
                onCreateSuccess?.();
            } else {
                if (!transaction) return;
                await updateMutation.mutateAsync({
                    id: transaction.id,
                    data: submitData,
                });
                toast.success(t('transactions.messages.updateSuccess'));
                setIsEditingAmount(false);
                onEditSuccess?.();
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            toast.error(
                mode === 'create' ? t('transactions.messages.createError') : t('transactions.messages.updateError'),
            );
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

    if (!transaction && mode !== 'create') {
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

    const formattedAmount =
        mode === 'view' && transaction
            ? new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: transaction.currency,
                  minimumFractionDigits: 2,
              }).format(transaction.amount)
            : '';

    const formattedDate =
        mode === 'view' && transaction
            ? new Date(transaction.date).toLocaleDateString(locale, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              })
            : '';

    const isLoading = mode === 'create' ? createMutation.isPending : updateMutation.isPending;

    return (
        <ScrollArea className="h-full">
            <div className="p-6">
                {isMobile && onBack && (
                    <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2 gap-1.5">
                        <ArrowLeft className="h-4 w-4" />
                        {t('common.buttons.back')}
                    </Button>
                )}

                {/* Title for Create Mode */}
                {mode === 'create' && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold">{t('transactions.form.createTitle')}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{t('transactions.form.createDescription')}</p>
                    </div>
                )}

                {/* Amount Header - View Mode Only */}
                {mode === 'view' && transaction && (
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
                )}

                <Separator className="mb-6" />

                {/* Editable Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
                        {/* Transaction Type Selector - Create Mode Only */}
                        {mode === 'create' && (
                            <div className="space-y-2">
                                <Label>{t('transactions.form.type')}</Label>
                                <Tabs
                                    value={transactionType}
                                    onValueChange={(value) => {
                                        setTransactionType(value as 'income' | 'expense');
                                        // Reset category when type changes
                                        form.setValue('category_id', '');
                                    }}
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="expense">{t('transactions.type.expense')}</TabsTrigger>
                                        <TabsTrigger value="income">{t('transactions.type.income')}</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        )}

                        {/* Transaction Name - Always Editable */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('transactions.form.merchant')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('transactions.form.merchantPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                        {/* Amount - Create Mode Only (in form) */}
                        {mode === 'create' && (
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
                        )}

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

                        {/* Account - Read Only - View Mode Only */}
                        {mode === 'view' && transaction && (
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
                        )}

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

                        {/* Tags - Display Only for now - View Mode Only */}
                        {mode === 'view' && transaction?.tags && transaction.tags.length > 0 && (
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

                        {/* Goal - Display Only for now - View Mode Only */}
                        {mode === 'view' && transaction?.goal && (
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
                                {isLoading
                                    ? t('common.messages.loading')
                                    : mode === 'create'
                                      ? t('transactions.form.createButton')
                                      : t('common.buttons.save')}
                            </Button>
                            {mode === 'view' && (
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
                            )}
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
