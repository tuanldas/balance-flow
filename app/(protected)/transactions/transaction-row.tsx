'use client';

import { memo } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '@/lib/types/transaction';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/settings-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

interface TransactionRowProps {
    transaction: Transaction;
    isSelected: boolean;
    onClick: () => void;
    isChecked?: boolean;
    onCheckChange?: (checked: boolean) => void;
}

function TransactionRowComponent({ transaction, isSelected, onClick, isChecked, onCheckChange }: TransactionRowProps) {
    const { i18n } = useTranslation();
    const locale = getIntlLocale(i18n.language);
    const { getOption } = useSettings();
    const categoryIconBgColor = getOption<string>('categoryIconBgColor');

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

    const isIconUrl = transaction.category.icon?.startsWith('http');

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                'hover:bg-accent/50',
                isChecked ? 'bg-accent' : isSelected ? 'bg-accent/50' : 'bg-transparent',
            )}
        >
            {/* Checkbox for bulk selection - always visible */}
            <div
                className="flex items-center pr-3"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <Checkbox
                    checked={isChecked}
                    onCheckedChange={onCheckChange}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                />
            </div>

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

            {/* Right side: Category and amount */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Category Badge: Icon + Name */}
                <div
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                    style={{ backgroundColor: categoryIconBgColor }}
                >
                    {isIconUrl ? (
                        <img
                            src={transaction.category.icon}
                            alt={transaction.category.name}
                            className="h-5 w-5 object-contain shrink-0"
                        />
                    ) : (
                        <span
                            className="material-symbols-outlined text-foreground shrink-0"
                            style={{ fontSize: '20px' }}
                        >
                            {transaction.category.icon}
                        </span>
                    )}
                    <span className="text-sm text-foreground hidden sm:inline max-w-24 truncate">
                        {transaction.category.name}
                    </span>
                </div>
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
