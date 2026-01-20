'use client';

import { memo } from 'react';
import { getIntlLocale } from '@/i18n/config';
import { ArrowLeft, HelpCircle, MoreHorizontal, RefreshCw, TrendingUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Recurring } from '@/lib/types/recurring';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PaymentTimeline } from './payment-timeline';

interface RecurringDetailProps {
    recurring: Recurring | null;
    onBack?: () => void;
    isMobile?: boolean;
}

function RecurringDetailComponent({ recurring, onBack, isMobile = false }: RecurringDetailProps) {
    const { i18n, t } = useTranslation();
    const locale = getIntlLocale(i18n.language);

    const formatCurrency = (amount: number, currency: string = 'USD') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateShort = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(locale, {
            month: 'short',
            day: 'numeric',
        });
    };

    if (!recurring) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/30">
                <div className="text-center text-muted-foreground">
                    <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">{t('recurring.detail.noSelection')}</p>
                    <p className="text-sm">{t('recurring.detail.selectPrompt')}</p>
                </div>
            </div>
        );
    }

    const frequencyLabel =
        recurring.frequency === 'yearly'
            ? t('recurring.frequencyLabel.yearly')
            : recurring.frequency === 'monthly'
              ? t('recurring.frequencyLabel.monthly')
              : recurring.frequency === 'weekly'
                ? t('recurring.frequencyLabel.weekly')
                : t('recurring.frequencyLabel.daily');

    return (
        <div className="h-full flex flex-col">
            {/* Header with back button (mobile) and menu */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    {isMobile && onBack && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={onBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <span className="text-sm text-muted-foreground font-medium">{frequencyLabel}</span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>{t('common.buttons.edit')}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">{t('common.buttons.delete')}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6">
                    {/* Main info section */}
                    <div className="mb-6">
                        {/* Category Badge */}
                        <Badge
                            variant="outline"
                            size="sm"
                            className="font-medium text-[10px] uppercase tracking-wide px-2 py-0.5 rounded mb-4"
                            style={{
                                backgroundColor: `${recurring.color}15`,
                                borderColor: `${recurring.color}40`,
                                color: recurring.color,
                            }}
                        >
                            <span className="mr-1 text-xs">{recurring.icon}</span>
                            {recurring.categoryName}
                        </Badge>

                        {/* Name and Next Payment */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                    <span>{recurring.icon}</span>
                                    {recurring.name}
                                </h2>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wide text-primary font-medium mb-1">
                                    {t('recurring.detail.nextPayment')}
                                </p>
                                <p className="text-xl font-bold text-foreground tabular-nums">
                                    {formatCurrency(recurring.nextPaymentAmount, recurring.currency)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {t('recurring.detail.around')} {formatDate(recurring.nextPaymentDate)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rules Section */}
                    <div className="mb-6">
                        <h3 className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-3">
                            {t('recurring.detail.rules')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {recurring.rules.minAmount !== undefined && recurring.rules.maxAmount !== undefined && (
                                <Badge variant="outline" size="md" className="font-normal bg-background">
                                    {t('recurring.rules.from')}{' '}
                                    <span className="text-primary font-medium">
                                        {formatCurrency(recurring.rules.minAmount, recurring.currency)}
                                    </span>{' '}
                                    {t('recurring.rules.to')}{' '}
                                    <span className="text-primary font-medium">
                                        {formatCurrency(recurring.rules.maxAmount, recurring.currency)}
                                    </span>
                                </Badge>
                            )}
                            <Badge variant="outline" size="md" className="font-normal bg-background">
                                {t('recurring.rules.on')}{' '}
                                <span className="font-medium ml-1">
                                    {recurring.rules.dayOfMonth === 'any'
                                        ? t('recurring.rules.anyDayOfMonth')
                                        : t('recurring.rules.dayNumber', { day: recurring.rules.dayOfMonth })}
                                </span>
                            </Badge>
                            <Badge variant="outline" size="md" className="font-normal bg-background">
                                {t('recurring.rules.every')}{' '}
                                <span className="font-medium ml-1">{t(`recurring.rules.${recurring.frequency}`)}</span>
                            </Badge>
                        </div>
                    </div>

                    {/* Payment Timeline Chart */}
                    {recurring.paymentHistory.length > 0 && (
                        <div className="mb-6">
                            <PaymentTimeline payments={recurring.paymentHistory} currency={recurring.currency} />
                        </div>
                    )}

                    {/* Key Metrics Section */}
                    {recurring.metrics.length > 0 && (
                        <div className="mb-6">
                            {/* Top separator */}
                            <div className="border-t border-border mb-6" />

                            {/* Header row */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {t('recurring.detail.keyMetrics')}
                                    </h3>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground/50" />
                                </div>
                                <div className="flex items-center gap-16">
                                    <span className="text-sm text-muted-foreground">
                                        {t('recurring.metrics.spentPerYear')}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {t('recurring.metrics.avgTransaction')}
                                    </span>
                                </div>
                            </div>

                            {/* Data rows */}
                            {recurring.metrics.map((metric) => (
                                <div key={metric.year} className="flex items-center justify-between py-2">
                                    <span className="text-sm text-muted-foreground">{metric.year}</span>
                                    <div className="flex items-center gap-16">
                                        <span className="text-sm font-semibold text-foreground tabular-nums min-w-20 text-right">
                                            {formatCurrency(metric.spentPerYear, recurring.currency)}
                                        </span>
                                        <span className="text-sm font-semibold text-foreground tabular-nums min-w-20 text-right">
                                            {formatCurrency(metric.avgTransaction, recurring.currency)}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Bottom separator */}
                            <div className="border-t border-border mt-4" />
                        </div>
                    )}

                    {/* Last Account Used Section */}
                    {recurring.lastAccountUsed && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-foreground mb-3">
                                {t('recurring.detail.lastAccountUsed')}
                            </h3>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                        style={{ backgroundColor: `${recurring.lastAccountUsed.color}20` }}
                                    >
                                        {recurring.lastAccountUsed.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {recurring.lastAccountUsed.name}{' '}
                                            {recurring.lastAccountUsed.lastFour && (
                                                <span className="text-muted-foreground">
                                                    {recurring.lastAccountUsed.lastFour}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {recurring.lastAccountUsed.lastUsed}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Mini Sparkline */}
                                    {recurring.lastAccountUsed.sparklineData && (
                                        <div className="w-16 h-6">
                                            <svg
                                                viewBox="0 0 64 24"
                                                className="w-full h-full"
                                                preserveAspectRatio="none"
                                            >
                                                <polyline
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="text-yellow-500"
                                                    points={recurring.lastAccountUsed.sparklineData
                                                        .map((val, i) => {
                                                            const x =
                                                                (i /
                                                                    (recurring.lastAccountUsed!.sparklineData!.length -
                                                                        1)) *
                                                                64;
                                                            const max = Math.max(
                                                                ...recurring.lastAccountUsed!.sparklineData!,
                                                            );
                                                            const min = Math.min(
                                                                ...recurring.lastAccountUsed!.sparklineData!,
                                                            );
                                                            const y = 24 - ((val - min) / (max - min)) * 20 - 2;
                                                            return `${x},${y}`;
                                                        })
                                                        .join(' ')}
                                                />
                                            </svg>
                                        </div>
                                    )}
                                    {/* Change Percent */}
                                    <div className="flex items-center gap-1">
                                        <span
                                            className={cn(
                                                'text-xs font-medium flex items-center gap-0.5',
                                                recurring.lastAccountUsed.changePercent >= 0
                                                    ? 'text-green-500'
                                                    : 'text-red-500',
                                            )}
                                        >
                                            <TrendingUp
                                                className={cn(
                                                    'h-3 w-3',
                                                    recurring.lastAccountUsed.changePercent < 0 && 'rotate-180',
                                                )}
                                            />
                                            {Math.abs(recurring.lastAccountUsed.changePercent).toFixed(2)}%
                                        </span>
                                    </div>
                                    {/* Balance */}
                                    <span className="font-semibold text-sm tabular-nums">
                                        {formatCurrency(recurring.lastAccountUsed.balance, recurring.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator className="my-6" />

                    {/* Transactions Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-foreground">
                                {t('recurring.detail.transactions')}
                            </h3>
                            <Button variant="ghost" size="sm" className="text-xs text-primary h-auto p-0">
                                {t('common.buttons.add').toUpperCase()}
                            </Button>
                        </div>
                        {recurring.transactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                {t('recurring.detail.noTransactions')}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {recurring.transactions.map((txn) => (
                                    <div
                                        key={txn.id}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-12">
                                                {formatDateShort(txn.date)}
                                            </span>
                                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{txn.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {txn.accountName}
                                                    {txn.accountLastFour && `...${txn.accountLastFour}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                                {txn.categoryName}
                                            </Badge>
                                            <span className="font-semibold text-sm tabular-nums">
                                                {formatCurrency(txn.amount, txn.currency)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

export const RecurringDetail = memo(RecurringDetailComponent);
