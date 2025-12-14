'use client';

import { useEffect, useState } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { ArrowLeft, Building2, Calendar, CreditCard, Tag, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '@/lib/types/transaction';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories';
import { useSettings } from '@/providers/settings-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface TransactionDetailProps {
    transaction: Transaction | null;
    onBack?: () => void;
    isMobile?: boolean;
}

export function TransactionDetail({ transaction, onBack, isMobile = false }: TransactionDetailProps) {
    const { t, i18n } = useTranslation();
    const locale = getIntlLocale(i18n.language);
    const { getOption } = useSettings();
    const categoryIconBgColor = getOption<string>('categoryIconBgColor');

    const { data: categoriesData } = useCategories({ type: transaction?.type });
    const categories = categoriesData?.data || [];

    const [notes, setNotes] = useState(transaction?.notes || '');
    const [tags, setTags] = useState(transaction?.tags?.join(', ') || '');
    const [goal, setGoal] = useState(transaction?.goal || '');

    const isIconUrl = transaction?.category.icon?.startsWith('http');

    useEffect(() => {
        setNotes(transaction?.notes || '');
        setTags(transaction?.tags?.join(', ') || '');
        setGoal(transaction?.goal || '');
    }, [transaction?.id, transaction?.notes, transaction?.tags, transaction?.goal]);

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
                </div>

                <div className="mb-6">
                    <p
                        className={cn(
                            'text-3xl font-bold mb-1',
                            transaction.type === 'income'
                                ? 'text-green-600 dark:text-green-500'
                                : 'text-red-600 dark:text-red-500',
                        )}
                    >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formattedAmount}
                    </p>
                    <h2 className="text-lg font-semibold text-foreground mb-1">{transaction.merchant}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formattedDate}
                    </p>
                </div>

                <Separator className="mb-6" />

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="h-4 w-4" />
                            {t('transactions.detail.category')}
                        </Label>
                        <Select defaultValue={transaction.category.id}>
                            <SelectTrigger>
                                <SelectValue>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="flex h-6 w-6 items-center justify-center rounded"
                                            style={{ backgroundColor: categoryIconBgColor }}
                                        >
                                            {isIconUrl ? (
                                                <img
                                                    src={transaction.category.icon}
                                                    alt={transaction.category.name}
                                                    className="h-4 w-4 object-contain"
                                                />
                                            ) : (
                                                <span
                                                    className="material-symbols-outlined text-foreground"
                                                    style={{ fontSize: '16px' }}
                                                >
                                                    {transaction.category.icon}
                                                </span>
                                            )}
                                        </div>
                                        {transaction.category.name}
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => {
                                    const catIsIconUrl = cat.icon?.startsWith('http');
                                    return (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="flex h-6 w-6 items-center justify-center rounded"
                                                    style={{ backgroundColor: categoryIconBgColor }}
                                                >
                                                    {catIsIconUrl ? (
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
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            {t('transactions.detail.account')}
                        </Label>
                        <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                                {transaction.account.name} (****{transaction.account.lastFourDigits})
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            {t('transactions.detail.goal')}
                        </Label>
                        <Input
                            placeholder={t('transactions.detail.goalPlaceholder')}
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            {t('transactions.detail.notes')}
                        </Label>
                        <Textarea
                            placeholder={t('transactions.detail.notesPlaceholder')}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            {t('transactions.detail.tags')}
                        </Label>
                        <Input
                            placeholder={t('transactions.detail.tagsPlaceholder')}
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                        {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {transaction.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" size="sm">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <Button className="w-full">{t('common.buttons.save')}</Button>
                </div>
            </div>
        </ScrollArea>
    );
}
