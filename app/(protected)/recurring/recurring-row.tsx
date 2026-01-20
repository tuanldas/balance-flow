'use client';

import { memo } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Recurring } from '@/lib/types/recurring';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RecurringRowProps {
    recurring: Recurring;
    isSelected: boolean;
    onClick: () => void;
}

function RecurringRowComponent({ recurring, isSelected, onClick }: RecurringRowProps) {
    const { i18n, t } = useTranslation();
    const locale = getIntlLocale(i18n.language);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: recurring.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const frequencyLabel = t(`recurring.frequency.${recurring.frequency}`);

    // Get display date - either "Overdue" or formatted date
    const displayDate = recurring.isOverdue ? t('recurring.overdue') : formatDate(recurring.nextPaymentDate);

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer transition-colors',
                'hover:bg-accent/50',
                isSelected ? 'bg-accent/50' : 'bg-transparent',
            )}
        >
            {/* Left side: Date, Icon, Name, Frequency */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Date */}
                <span
                    className={cn(
                        'text-xs font-medium w-14 shrink-0',
                        recurring.isOverdue ? 'text-destructive' : 'text-muted-foreground',
                    )}
                >
                    {displayDate}
                </span>

                {/* Icon */}
                <span className="text-base shrink-0">{recurring.icon}</span>

                {/* Name and Frequency */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-medium text-sm text-foreground truncate">{recurring.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{frequencyLabel}</span>
                </div>
            </div>

            {/* Right side: Category Badge and Amount */}
            <div className="flex items-center gap-2.5 shrink-0">
                {/* Category Badge */}
                <Badge
                    variant="outline"
                    size="sm"
                    className="font-medium text-[10px] uppercase tracking-wide px-2 py-0.5 rounded"
                    style={{
                        backgroundColor: `${recurring.color}15`,
                        borderColor: `${recurring.color}40`,
                        color: recurring.color,
                    }}
                >
                    <span className="mr-1 text-xs">{recurring.icon}</span>
                    {recurring.categoryName}
                </Badge>

                {/* Amount */}
                <span className="font-semibold text-sm tabular-nums text-foreground min-w-16 text-right">
                    {formatCurrency(recurring.amount)}
                </span>

                {/* Paid indicator */}
                {recurring.isPaid && <Check className="h-4 w-4 text-green-500 shrink-0" />}
            </div>
        </div>
    );
}

export const RecurringRow = memo(RecurringRowComponent);
