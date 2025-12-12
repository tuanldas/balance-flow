'use client';

import { memo } from 'react';
import {
    Banknote,
    Car,
    Film,
    Heart,
    Laptop,
    Receipt,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
    Utensils,
} from 'lucide-react';
import type { Transaction } from '@/lib/types/transaction';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TransactionRowProps {
    transaction: Transaction;
    isSelected: boolean;
    onClick: () => void;
}

// Map category icon names to Lucide icons
const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    utensils: Utensils,
    'shopping-bag': ShoppingBag,
    car: Car,
    film: Film,
    'shopping-cart': ShoppingCart,
    receipt: Receipt,
    heart: Heart,
    banknote: Banknote,
    laptop: Laptop,
    'trending-up': TrendingUp,
};

function TransactionRowComponent({ transaction, isSelected, onClick }: TransactionRowProps) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: transaction.currency,
        minimumFractionDigits: 2,
    }).format(transaction.amount);

    const transactionTime = new Date(transaction.date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    const CategoryIcon = categoryIconMap[transaction.category.icon] || ShoppingBag;

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
                        transaction.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-foreground',
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
