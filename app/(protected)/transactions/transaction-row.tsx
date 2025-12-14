'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '@/lib/types/transaction';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { categoryIconMap, DefaultCategoryIcon, localeMap } from './constants';

interface TransactionRowProps {
    transaction: Transaction;
    isSelected: boolean;
    onClick: () => void;
}

function TransactionRowComponent({ transaction, isSelected, onClick }: TransactionRowProps) {
    const { i18n } = useTranslation();
    const locale = localeMap[i18n.language] || 'en-US';

    const formattedAmount = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: transaction.currency,
        minimumFractionDigits: 2,
    }).format(transaction.amount);

    const transactionTime = new Date(transaction.date).toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    const CategoryIcon = categoryIconMap[transaction.category.icon] || DefaultCategoryIcon;

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                'hover:bg-accent/50',
                isSelected ? 'bg-accent' : 'bg-transparent',
            )}
        >
            {/* Left side: Merchant info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 shrink-0">
                    {transaction.merchantLogo ? (
                        <AvatarImage src={transaction.merchantLogo} alt={transaction.merchant} />
                    ) : null}
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                        {transaction.merchant.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{transaction.merchant}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {transactionTime}
                        {transaction.notes && ` - ${transaction.notes}`}
                    </p>
                </div>
            </div>

            {/* Right side: Category badge and amount */}
            <div className="flex items-center gap-3 shrink-0">
                <Badge
                    variant="secondary"
                    appearance="light"
                    size="sm"
                    className="gap-1"
                    style={
                        {
                            '--badge-bg': `${transaction.category.color}15`,
                            '--badge-text': transaction.category.color,
                            backgroundColor: 'var(--badge-bg)',
                            color: 'var(--badge-text)',
                        } as React.CSSProperties
                    }
                >
                    <CategoryIcon className="h-3 w-3" />
                    <span className="hidden sm:inline">{transaction.category.name}</span>
                </Badge>
                <span
                    className={cn(
                        'font-semibold text-sm tabular-nums',
                        transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-500'
                            : 'text-red-600 dark:text-red-500',
                    )}
                >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formattedAmount}
                </span>
            </div>
        </div>
    );
}

export const TransactionRow = memo(TransactionRowComponent);
