'use client';

import { memo } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { useTranslation } from 'react-i18next';
import type { RecurringSummary } from '@/lib/types/recurring';
import { ProgressCircle } from '@/components/ui/progress';

interface RecurringSummaryCardProps {
    summary: RecurringSummary;
}

function RecurringSummaryCardComponent({ summary }: RecurringSummaryCardProps) {
    const { i18n, t } = useTranslation();
    const locale = getIntlLocale(i18n.language);

    const progressPercent = summary.totalAmount > 0 ? (summary.paidSoFar / summary.totalAmount) * 100 : 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: summary.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
                {/* Left - Amount left to pay */}
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground tabular-nums">
                        {formatCurrency(summary.leftToPay)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">{t('recurring.summary.leftToPay')}</span>
                </div>

                {/* Center - Progress Circle */}
                <ProgressCircle
                    value={progressPercent}
                    size={72}
                    strokeWidth={6}
                    indicatorClassName="text-primary"
                    trackClassName="text-muted/40"
                />

                {/* Right - Amount paid so far */}
                <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-foreground tabular-nums">
                        {formatCurrency(summary.paidSoFar)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">{t('recurring.summary.paidSoFar')}</span>
                </div>
            </div>
        </div>
    );
}

export const RecurringSummaryCard = memo(RecurringSummaryCardComponent);
