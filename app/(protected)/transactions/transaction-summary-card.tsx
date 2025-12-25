'use client';

import { getIntlLocale } from '@/i18n/config';
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTransactionSummary } from '@/hooks/use-transactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionSummaryCardProps {
    /**
     * Optional filters to apply to summary
     */
    filters?: {
        start_date?: string;
        end_date?: string;
    };
}

export function TransactionSummaryCard({ filters }: TransactionSummaryCardProps) {
    const { t, i18n } = useTranslation();
    const locale = getIntlLocale(i18n.language);

    const { data, isLoading, isError } = useTransactionSummary(filters);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !data?.success) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">{t('common.errors.query.default')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { total_income, total_expense, balance } = data.data;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Total Income Card */}
            <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('transactions.summary.totalIncome')}
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                        <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                        {formatCurrency(total_income)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('transactions.summary.incomeDescription')}</p>
                </CardContent>
            </Card>

            {/* Total Expense Card */}
            <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('transactions.summary.totalExpense')}
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                        <ArrowDownLeft className="h-4 w-4 text-red-600 dark:text-red-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                        {formatCurrency(total_expense)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('transactions.summary.expenseDescription')}</p>
                </CardContent>
            </Card>

            {/* Balance Card */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {t('transactions.summary.balance')}
                    </CardTitle>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div
                        className={`text-2xl font-bold ${
                            balance >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-orange-600 dark:text-orange-500'
                        }`}
                    >
                        {formatCurrency(balance)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {balance >= 0
                            ? t('transactions.summary.positiveBalance')
                            : t('transactions.summary.negativeBalance')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
