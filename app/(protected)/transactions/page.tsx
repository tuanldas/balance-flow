'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Transaction, TransactionApiFilters, TransactionGroup, TransactionSortBy } from '@/lib/types/transaction';
import { apiTransactionToLegacy } from '@/lib/types/transaction';
import { groupTransactionsByDate } from '@/lib/utils/transaction-utils';
import { useIsLargeScreen } from '@/hooks/use-large-screen';
import { useInfiniteTransactions } from '@/hooks/use-transactions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { FilterBar } from './filter-bar';
import { TransactionDetail } from './transaction-detail';
import { TransactionFormDialog } from './transaction-form-dialog';
import { TransactionRow } from './transaction-row';

// Extracted TransactionList component to avoid duplication
interface TransactionListProps {
    groupedTransactions: TransactionGroup[];
    filteredTransactionsCount: number;
    selectedTransactionId?: string;
    onTransactionSelect: (transaction: Transaction) => void;
    isLoading?: boolean;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
    error?: Error | null;
}

const TransactionList = memo(function TransactionList({
    groupedTransactions,
    filteredTransactionsCount,
    selectedTransactionId,
    onTransactionSelect,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    onLoadMore,
    error,
}: TransactionListProps) {
    const { t } = useTranslation();
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!loadMoreRef.current || !onLoadMore || !hasNextPage || isFetchingNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(loadMoreRef.current);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">{t('common.messages.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 p-4">
                <Alert variant="destructive">
                    <AlertDescription>{error.message || t('common.messages.error')}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
                {groupedTransactions.map((group) => (
                    <div key={group.date}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">{group.label}</h3>
                        <div className="space-y-1">
                            {group.transactions.map((transaction) => (
                                <TransactionRow
                                    key={transaction.id}
                                    transaction={transaction}
                                    isSelected={selectedTransactionId === transaction.id}
                                    onClick={() => onTransactionSelect(transaction)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {filteredTransactionsCount === 0 && !isFetchingNextPage && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>{t('transactions.noResults')}</p>
                    </div>
                )}

                {/* Load more trigger element */}
                <div ref={loadMoreRef} className="py-4">
                    {isFetchingNextPage && (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{t('common.messages.loading')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default function TransactionsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isLargeScreen = useIsLargeScreen();

    // Get transaction ID from URL
    const transactionIdFromUrl = searchParams.get('id');

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [sortBy, setSortBy] = useState<TransactionSortBy>('date');
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [showDetail, setShowDetail] = useState(!!transactionIdFromUrl && !isLargeScreen);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Build API filters based on UI state
    const apiFilters = useMemo((): Omit<TransactionApiFilters, 'page'> => {
        const sortMapping: Record<
            TransactionSortBy,
            { sort_by: 'transaction_date' | 'amount'; sort_direction: 'asc' | 'desc' }
        > = {
            date: { sort_by: 'transaction_date', sort_direction: 'desc' },
            amount_asc: { sort_by: 'amount', sort_direction: 'asc' },
            amount_desc: { sort_by: 'amount', sort_direction: 'desc' },
        };

        return {
            ...sortMapping[sortBy],
            category_id: categoryIds.length > 0 ? categoryIds.join(',') : undefined,
            search: searchValue || undefined,
        };
    }, [sortBy, categoryIds, searchValue]);

    // Fetch transactions from API with infinite scroll
    const {
        data: transactionsData,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteTransactions(apiFilters, 10);

    // Convert API transactions to legacy format (flatten all pages)
    const allTransactions = useMemo(() => {
        if (!transactionsData?.pages) return [];
        return transactionsData.pages.flatMap((page) => page.data.map(apiTransactionToLegacy));
    }, [transactionsData?.pages]);

    // Handle load more
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    // Find transaction from URL or default to first one
    const getInitialTransaction = useCallback((): Transaction | null => {
        if (transactionIdFromUrl) {
            const found = allTransactions.find((txn) => txn.id === transactionIdFromUrl);
            if (found) return found;
        }
        return allTransactions[0] || null;
    }, [transactionIdFromUrl, allTransactions]);

    // Sync selected transaction with data on mount and URL changes
    useEffect(() => {
        if (allTransactions.length > 0) {
            const transaction = getInitialTransaction();
            setSelectedTransaction(transaction);
            if (transactionIdFromUrl && !isLargeScreen) {
                setShowDetail(true);
            }
        }
    }, [transactionIdFromUrl, getInitialTransaction, isLargeScreen, allTransactions.length]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        return groupTransactionsByDate(allTransactions, t);
    }, [allTransactions, t]);

    // Update URL when selecting a transaction (use replace to avoid history pollution)
    const updateUrlWithTransaction = useCallback(
        (transactionId: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('id', transactionId);
            router.replace(`/transactions?${params.toString()}`, { scroll: false });
        },
        [router, searchParams],
    );

    const handleTransactionSelect = useCallback(
        (transaction: Transaction) => {
            setSelectedTransaction(transaction);
            updateUrlWithTransaction(transaction.id);
            if (!isLargeScreen) {
                setShowDetail(true);
            }
        },
        [isLargeScreen, updateUrlWithTransaction],
    );

    const handleBackToList = useCallback(() => {
        setShowDetail(false);
        router.push('/transactions', { scroll: false });
    }, [router]);

    const handleCreateSuccess = useCallback(() => {
        // Data will be automatically refetched by React Query invalidation
    }, []);

    const handleEditSuccess = useCallback(() => {
        // Data will be automatically refetched by React Query invalidation
    }, []);

    const handleDeleteSuccess = useCallback(() => {
        // Reset selection and go back to list
        setSelectedTransaction(null);
        if (!isLargeScreen) {
            setShowDetail(false);
        }
        router.push('/transactions', { scroll: false });
    }, [isLargeScreen, router]);

    // Mobile/Tablet view (<1280px): show list with Sheet for detail
    if (!isLargeScreen) {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-background">
                <FilterBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    categoryIds={categoryIds}
                    onCategoryIdsChange={setCategoryIds}
                    onCreateClick={() => setIsCreateDialogOpen(true)}
                />
                <TransactionList
                    groupedTransactions={groupedTransactions}
                    filteredTransactionsCount={allTransactions.length}
                    selectedTransactionId={selectedTransaction?.id}
                    onTransactionSelect={handleTransactionSelect}
                    isLoading={isLoading}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    onLoadMore={handleLoadMore}
                    error={error as Error | null}
                />

                <Sheet
                    open={showDetail}
                    onOpenChange={(open) => {
                        if (!open) {
                            handleBackToList();
                        }
                    }}
                >
                    <SheetContent side="right" className="w-full sm:max-w-md p-0" close={false}>
                        <SheetTitle className="sr-only">{t('transactions.detail.title')}</SheetTitle>
                        <TransactionDetail
                            transaction={selectedTransaction}
                            onBack={handleBackToList}
                            isMobile
                            onEditSuccess={handleEditSuccess}
                            onDeleteSuccess={handleDeleteSuccess}
                        />
                    </SheetContent>
                </Sheet>

                <TransactionFormDialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                    mode="create"
                    onSuccess={handleCreateSuccess}
                />
            </div>
        );
    }

    // Desktop view (≥1280px): split pane using CSS Grid
    return (
        <div className="h-[calc(100vh-64px)] grid grid-cols-2 bg-background">
            {/* Left Pane - Transaction List */}
            <div className="flex flex-col border-r border-border overflow-hidden">
                <FilterBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    categoryIds={categoryIds}
                    onCategoryIdsChange={setCategoryIds}
                    onCreateClick={() => setIsCreateDialogOpen(true)}
                />
                <TransactionList
                    groupedTransactions={groupedTransactions}
                    filteredTransactionsCount={allTransactions.length}
                    selectedTransactionId={selectedTransaction?.id}
                    onTransactionSelect={handleTransactionSelect}
                    isLoading={isLoading}
                    isFetchingNextPage={isFetchingNextPage}
                    hasNextPage={hasNextPage}
                    onLoadMore={handleLoadMore}
                    error={error as Error | null}
                />
            </div>

            {/* Right Pane - Transaction Detail */}
            <div className="overflow-hidden">
                <TransactionDetail
                    transaction={selectedTransaction}
                    onEditSuccess={handleEditSuccess}
                    onDeleteSuccess={handleDeleteSuccess}
                />
            </div>

            <TransactionFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                mode="create"
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
