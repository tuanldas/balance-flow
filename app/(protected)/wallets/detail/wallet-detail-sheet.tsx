'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { IWalletDetail, IWalletTransactionItem } from '@/api/types/wallet';
import { callApiGetWalletById, callApiGetWalletTransactions } from '@/api/wallet';
import { formatMoneyCompact } from '@/utils/format';
import { groupTimelineItems, type TimelineItem } from '@/utils/transactions-timeline';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Bus, CreditCard, Ticket } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SheetContent as SheetContentBase, Sheet as SheetRoot } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

interface WalletDetailSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    walletId?: string | null;
}

export default function WalletDetailSheet({ isOpen, onOpenChange, walletId }: WalletDetailSheetProps) {
    const { t, i18n } = useTranslation();

    const { data, isLoading, isError } = useQuery<IWalletDetail | null>({
        queryKey: ['wallet-detail', walletId],
        enabled: Boolean(isOpen && walletId),
        queryFn: async () => {
            if (!walletId) return null;
            return callApiGetWalletById(walletId);
        },
        staleTime: 30_000,
    });

    useMemo(() => data?.name ?? t('wallet.detail.title') ?? 'Wallet detail', [data?.name, t]);

    const {
        data: txPages,
        isLoading: isTxLoading,
        isError: isTxError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery<{ data: IWalletTransactionItem[]; current_page: number; last_page: number } | null>({
        queryKey: ['wallet-transactions', walletId],
        enabled: Boolean(isOpen && walletId),
        initialPageParam: 1,
        queryFn: async ({ pageParam }) => {
            if (!walletId) return null;
            return callApiGetWalletTransactions(walletId, { page: Number(pageParam), per_page: 20 });
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage) return undefined;
            return lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined;
        },
        staleTime: 30_000,
    });

    const transactions: IWalletTransactionItem[] = useMemo(() => {
        const pages = txPages?.pages ?? [];
        const items = pages.flatMap((p) => (p?.data ?? []) as IWalletTransactionItem[]);
        return items;
    }, [txPages]);

    const timelineItems = useMemo<TimelineItem[]>(() => {
        return transactions.map((tx) => {
            const categoryName = tx.category?.name ?? tx.transaction_type;
            const lowered = categoryName.toLowerCase();
            const icon = lowered.includes('transport')
                ? 'transportation'
                : lowered.includes('entertain')
                  ? 'entertainment'
                  : 'other';
            const signedValue = (tx.transaction_type === 'income' ? 1 : -1) * Number(tx.amount);
            return {
                id: tx.id,
                title: tx.description ?? categoryName,
                account: '',
                category: { name: categoryName, icon },
                amount: { value: Number.isNaN(signedValue) ? 0 : signedValue, currency: undefined },
                date: new Date(tx.transaction_date),
            };
        });
    }, [transactions]);

    const { today: todayGroup, months: groupsByMonth } = useMemo(
        () => groupTimelineItems(timelineItems, i18n?.language),
        [timelineItems, i18n?.language],
    );

    // Infinite scroll sentinel
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <SheetRoot open={isOpen} onOpenChange={onOpenChange}>
            <SheetContentBase side="right" className="sm:max-w-none sm:w-2/3">
                <div className="py-5 space-y-6">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-72" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : isError || !data ? (
                        <div className="text-sm text-destructive">
                            {t('common.messages.error') ?? 'An error occurred'}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-xl border bg-gradient-to-b from-primary/5 to-transparent p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-xs text-muted-foreground">
                                            {t('wallet.detail.title') ?? 'Wallet'}
                                        </div>
                                        <div className="text-lg font-semibold text-mono">{data.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">
                                            {t('wallets.balance') ?? 'Balance'}
                                        </div>
                                        <div className="text-2xl font-semibold text-mono">
                                            {formatMoneyCompact(data.balance, { minimumFractionDigits: 0 })}{' '}
                                            {data.currency}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-1">
                                    {['1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map((p, i) => (
                                        <button
                                            key={p}
                                            className={
                                                'rounded-md px-2 py-1 text-xs border ' +
                                                (i === 1
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'border-input hover:bg-accent')
                                            }
                                            type="button"
                                            aria-label={`range-${p}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {data.description ? (
                                <div className="space-y-1">
                                    <div className="text-xs text-muted-foreground">
                                        {t('common.labels.description') ?? 'Description'}
                                    </div>
                                    <div className="text-sm">{data.description}</div>
                                </div>
                            ) : null}

                            <div className="space-y-3">
                                <div className="space-y-6">
                                    {isTxLoading && transactions.length === 0 ? (
                                        <div className="space-y-3">
                                            <Skeleton className="h-4 w-3/5" />
                                            <Skeleton className="h-4 w-2/5" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    ) : isTxError ? (
                                        <div className="text-sm text-destructive">
                                            {t('common.messages.error') ?? 'An error occurred'}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {todayGroup && (
                                                <div className="space-y-3">
                                                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                                                        {t('common.today') ?? 'Today'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        {todayGroup.items.map((it: TimelineItem) => {
                                                            const amountNum = it.amount.value;
                                                            const isIncome = amountNum > 0;
                                                            const sign = isIncome ? '+' : '-';
                                                            const cat = it.category.name;
                                                            const icon = it.category.icon;
                                                            return (
                                                                <div
                                                                    key={it.id}
                                                                    className="flex items-center gap-3 py-3 border-b border-border last:border-b-0"
                                                                >
                                                                    <Checkbox className="mt-0.5" />
                                                                    <div className="flex flex-col grow min-w-0">
                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                            <div className="text-mono text-sm font-medium truncate">
                                                                                {it.title}
                                                                            </div>
                                                                            <span className="text-xs text-secondary-foreground truncate">
                                                                                {format(new Date(it.date), 'p')}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="shrink-0 flex items-center gap-3">
                                                                        <Badge
                                                                            appearance="light"
                                                                            variant="outline"
                                                                            className="gap-1 text-xs"
                                                                        >
                                                                            {icon === 'transportation' ? (
                                                                                <Bus size={14} className="me-1" />
                                                                            ) : icon === 'entertainment' ? (
                                                                                <Ticket size={14} className="me-1" />
                                                                            ) : (
                                                                                <CreditCard
                                                                                    size={14}
                                                                                    className="me-1"
                                                                                />
                                                                            )}
                                                                            {cat}
                                                                        </Badge>
                                                                        <span
                                                                            className={
                                                                                isIncome
                                                                                    ? 'text-green-600 text-sm font-medium text-mono'
                                                                                    : 'text-sm font-medium text-mono'
                                                                            }
                                                                        >
                                                                            {sign}
                                                                            {formatMoneyCompact(Math.abs(amountNum), {
                                                                                minimumFractionDigits: 0,
                                                                            })}{' '}
                                                                            {it.amount.currency ?? data?.currency}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="border-b border-input" />
                                                </div>
                                            )}
                                            {groupsByMonth.map((month, monthIndex) => (
                                                <div key={`${month.label}-${monthIndex}`} className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-base font-semibold text-mono">
                                                            {month.label}
                                                        </h3>
                                                        <span
                                                            className={
                                                                'text-base font-semibold text-mono ' +
                                                                (month.total.value > 0 ? 'text-green-600' : '')
                                                            }
                                                        >
                                                            {month.total.value < 0
                                                                ? '-'
                                                                : month.total.value > 0
                                                                  ? '+'
                                                                  : ''}
                                                            {formatMoneyCompact(Math.abs(month.total.value), {
                                                                minimumFractionDigits: 0,
                                                            })}{' '}
                                                            {month.total.currency ?? data?.currency}
                                                        </span>
                                                    </div>
                                                    {month.days.map((group, groupIndex) => (
                                                        <div key={`${group.label}-${groupIndex}`} className="space-y-3">
                                                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                                                                {group.label}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                {group.items.map((it: TimelineItem) => {
                                                                    const amountNum = it.amount.value;
                                                                    const isIncome = amountNum > 0;
                                                                    const sign = isIncome ? '+' : '-';
                                                                    const cat = it.category.name;
                                                                    const icon = it.category.icon;
                                                                    return (
                                                                        <div
                                                                            key={it.id}
                                                                            className="flex items-center gap-3 py-3 border-b border-border last:border-b-0"
                                                                        >
                                                                            <Checkbox className="mt-0.5" />
                                                                            <div className="flex flex-col grow min-w-0">
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    <div className="text-mono text-sm font-medium truncate">
                                                                                        {it.title}
                                                                                    </div>
                                                                                    <span className="text-xs text-secondary-foreground truncate">
                                                                                        {format(new Date(it.date), 'p')}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="shrink-0 flex items-center gap-3">
                                                                                <Badge
                                                                                    appearance="light"
                                                                                    variant="outline"
                                                                                    className="gap-1 text-xs"
                                                                                >
                                                                                    {icon === 'transportation' ? (
                                                                                        <Bus
                                                                                            size={14}
                                                                                            className="me-1"
                                                                                        />
                                                                                    ) : icon === 'entertainment' ? (
                                                                                        <Ticket
                                                                                            size={14}
                                                                                            className="me-1"
                                                                                        />
                                                                                    ) : (
                                                                                        <CreditCard
                                                                                            size={14}
                                                                                            className="me-1"
                                                                                        />
                                                                                    )}
                                                                                    {cat}
                                                                                </Badge>
                                                                                <span
                                                                                    className={
                                                                                        isIncome
                                                                                            ? 'text-green-600 text-sm font-medium text-mono'
                                                                                            : 'text-sm font-medium text-mono'
                                                                                    }
                                                                                >
                                                                                    {sign}
                                                                                    {formatMoneyCompact(
                                                                                        Math.abs(amountNum),
                                                                                        { minimumFractionDigits: 0 },
                                                                                    )}{' '}
                                                                                    {it.amount.currency ??
                                                                                        data?.currency}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                            <div
                                                ref={sentinelRef}
                                                className="text-center py-2 text-xs text-muted-foreground"
                                            >
                                                {hasNextPage
                                                    ? isFetchingNextPage
                                                        ? (t('common.messages.loading') ?? 'Loading...')
                                                        : ''
                                                    : ''}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContentBase>
        </SheetRoot>
    );
}
