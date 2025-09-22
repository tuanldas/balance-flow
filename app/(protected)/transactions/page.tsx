'use client';

import {useEffect, useMemo, useRef} from 'react';
import {callApiGetUserTransactions} from '@/api/transactions';
import type {IPaginatedResponse} from '@/api/types/pagination';
import type {IUserTransactionItem} from '@/api/types/transactions';
import {groupTimelineItems, type TimelineItem} from '@/utils/transactions-timeline';
import {useInfiniteQuery} from '@tanstack/react-query';
import {AlertCircle} from 'lucide-react';
import {useTranslation} from '@/hooks/useTranslation';
import {Alert, AlertIcon, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Toolbar, ToolbarHeading, ToolbarTitle} from '@/components/common/toolbar';
import TransactionsTimeline from '@/components/transactions/transactions-timeline';

export default function TransactionsPage() {
    const {t} = useTranslation();

    const {data, isError, refetch, isFetchingNextPage, fetchNextPage, hasNextPage} =
        useInfiniteQuery<IPaginatedResponse<IUserTransactionItem> | null>({
            queryKey: ['transactions'],
            initialPageParam: 1,
            queryFn: async ({pageParam}) => {
                return await callApiGetUserTransactions({per_page: 20, page: Number(pageParam)});
            },
            getNextPageParam: (lastPage) => {
                if (!lastPage) return undefined;
                return lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined;
            },
            staleTime: 30_000,
        });
    const items: IUserTransactionItem[] = useMemo(() => {
        const pages = data?.pages ?? [];
        return pages.flatMap((p) => p?.data ?? []);
    }, [data]);

    const timelineItems = useMemo<TimelineItem[]>(() => {
        return items.map((tx) => ({
            id: tx.id,
            title: tx.category?.name || '',
            account: tx.wallet?.name || '',
            category: {name: tx.category?.name || ''},
            amount: {value: Number(tx.amount) || 0, currency: tx.wallet?.currency},
            date: new Date(tx.transaction_date),
        }));
    }, [items]);

    const grouped = useMemo(() => groupTimelineItems(timelineItems), [timelineItems]);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 0,
            },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="flex flex-col items-stretch gap-5 lg:gap-7.5">
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarTitle>{t('transactions.title') ?? 'Transactions'}</ToolbarTitle>
                </ToolbarHeading>
            </Toolbar>

            {isError || !data ? (
                <div className="space-y-4">
                    <Alert variant="destructive">
                        <AlertIcon>
                            <AlertCircle/>
                        </AlertIcon>
                        <AlertTitle>{t('transactions.load_failed') ?? 'Failed to load transactions'}</AlertTitle>
                    </Alert>
                    <Button variant="secondary" onClick={() => refetch()}>
                        {t('common.actions.retry') ?? 'Retry'}
                    </Button>
                </div>
            ) : (
                <>
                    <TransactionsTimeline grouped={grouped}/>

                    <div
                        ref={sentinelRef}
                        className="flex items-center justify-center pt-2 pb-6 text-sm text-muted-foreground"
                    >
                        {hasNextPage
                            ? isFetchingNextPage
                                ? (t('common.messages.loading') ?? 'Loading...')
                                : null
                            : null}
                    </div>
                </>
            )}
        </div>
    );
}
