'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { IPaginatedResponse } from '@/api/types/pagination';
import type { IWalletDetail } from '@/api/types/wallet';
import { callApiGetWallets } from '@/api/wallet';
import { coercePaginated } from '@/utils/pagination';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AlertCircle, EllipsisVertical, Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toolbar, ToolbarActions, ToolbarHeading, ToolbarTitle } from '@/components/common/toolbar';
import { WalletsDropdownMenu } from './wallets-dropdown-menu';
import AddWalletForm from './add-wallet-form';
import EditWalletForm from './edit-wallet-form';
import { formatMoneyCompact } from '@/utils/format';

export default function WalletsPage() {
    const { t } = useTranslation();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingWallet, setEditingWallet] = useState<IWalletDetail | null>(null);
    const { data, isLoading, isError, refetch, isFetchingNextPage, fetchNextPage, hasNextPage } =
        useInfiniteQuery<IPaginatedResponse<IWalletDetail> | null>({
            queryKey: ['wallets'],
            initialPageParam: 1,
            queryFn: async ({ pageParam }) => {
                const raw = await callApiGetWallets({ pageParam: Number(pageParam) });
                return coercePaginated<IWalletDetail>(raw);
            },
            getNextPageParam: (lastPage) => {
                if (!lastPage) return undefined;
                return lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined;
            },
            staleTime: 30_000,
        });

    const items: IWalletDetail[] = useMemo(() => {
        const pages = data?.pages ?? [];
        return pages.flatMap((p) => p?.data ?? []);
    }, [data]);

    const formatBalanceValue = (value: string | number): string =>
        formatMoneyCompact(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // Infinite scroll sentinel
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
                    <ToolbarTitle>{t('wallets.title') ?? 'Wallets'}</ToolbarTitle>
                </ToolbarHeading>
                <ToolbarActions>
                    <Button onClick={() => setIsFormOpen(true)} mode="icon" variant="primary">
                        <Plus className="h-4 w-4 text-white" />
                    </Button>
                </ToolbarActions>
            </Toolbar>

            {isLoading ? (
                <div className="flex flex-col gap-5 lg:gap-7.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-7.5">
                            <div className="flex items-center flex-wrap justify-between gap-5">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex flex-col">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-4 w-64" />
                                    </div>
                                </div>
                                <div className="flex items-center lg:justify-center flex-wrap gap-2 lg:gap-5">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : isError || !data ? (
                <div className="space-y-4">
                    <Alert variant="destructive">
                        <AlertIcon>
                            <AlertCircle />
                        </AlertIcon>
                        <AlertTitle>{t('wallets.load_failed') ?? 'Failed to load wallets'}</AlertTitle>
                    </Alert>
                    <Button variant="secondary" onClick={() => refetch()}>
                        {t('common.actions.retry') ?? 'Retry'}
                    </Button>
                </div>
            ) : (
                <>
                    <div id="wallets_list">
                        <div className="flex flex-col gap-5 lg:gap-7.5">
                            {items.map((w, index) => (
                                <Card key={`${w.id}-${index}`} className="p-7.5">
                                    <div className="flex items-center flex-wrap justify-between gap-5">
                                        <div className="flex items-center gap-3.5">
                                            <div className="flex flex-col">
                                                <div className="text-lg font-medium text-mono">{w.name}</div>
                                                <div className="text-sm text-secondary-foreground">
                                                    {w.description ?? ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center flex-wrap gap-5 lg:gap-14">
                                            <div className="flex items-center lg:justify-center flex-wrap gap-2 lg:gap-5">
                                                <div className="grid grid-cols-1 content-between gap-1.5 border border-dashed border-input shrink-0 rounded-md px-2.5 py-2 min-w-24 max-w-auto">
                                                    <span className="text-mono text-sm leading-none font-semibold">
                                                        {formatBalanceValue(w.balance)} {w.currency}
                                                    </span>
                                                    <span className="text-secondary-foreground text-xs font-medium">
                                                        {t('wallets.balance') ?? 'Balance'}
                                                    </span>
                                                </div>
                                            </div>
                                            <WalletsDropdownMenu
                                                trigger={
                                                    <Button variant="ghost" mode="icon">
                                                        <EllipsisVertical />
                                                    </Button>
                                                }
                                            >
                                                <button
                                                    className="w-full text-left px-2.5 py-1.5 text-sm hover:bg-accent"
                                                    onClick={() => {
                                                        setEditingWallet(w);
                                                        setIsEditOpen(true);
                                                    }}
                                                >
                                                    {t('common.buttons.edit') ?? 'Edit'}
                                                </button>
                                            </WalletsDropdownMenu>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

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
            <AddWalletForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
            <EditWalletForm isOpen={isEditOpen} onOpenChange={setIsEditOpen} wallet={editingWallet} />
        </div>
    );
}
