'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Transaction, TransactionApiFilters, TransactionGroup, TransactionSortBy } from '@/lib/types/transaction';
import { apiTransactionToLegacy } from '@/lib/types/transaction';
import { groupTransactionsByDate } from '@/lib/utils/transaction-utils';
import { useIsLargeScreen } from '@/hooks/use-large-screen';
import { useBulkDeleteTransactions, useInfiniteTransactions } from '@/hooks/use-transactions';
import { useUrlFilters } from '@/hooks/use-url-filters';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { BulkActionBar } from './bulk-action-bar';
import { EmptyState } from './empty-state';
import { FilterBar } from './filter-bar';
import { TransactionDetail } from './transaction-detail';
import { TransactionListSkeleton } from './transaction-list-skeleton';
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
    hasFilters?: boolean;
    onCreateClick?: () => void;
    onClearFilters?: () => void;
    selectedIds?: Set<string>;
    onToggleSelection?: (id: string) => void;
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
    hasFilters,
    onCreateClick,
    onClearFilters,
    selectedIds,
    onToggleSelection,
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
        return <TransactionListSkeleton />;
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
                                    onClick={() => {
                                        // If has selections, clicking toggles selection
                                        // Otherwise, opens detail view
                                        if (selectedIds && selectedIds.size > 0 && onToggleSelection) {
                                            onToggleSelection(transaction.id);
                                        } else {
                                            onTransactionSelect(transaction);
                                        }
                                    }}
                                    isChecked={selectedIds?.has(transaction.id)}
                                    onCheckChange={() => {
                                        if (onToggleSelection) {
                                            onToggleSelection(transaction.id);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {filteredTransactionsCount === 0 && !isFetchingNextPage && (
                    <EmptyState hasFilters={hasFilters} onCreateClick={onCreateClick} onClearFilters={onClearFilters} />
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

    // Get transaction ID and mode from URL
    const transactionIdFromUrl = searchParams.get('id');
    const modeFromUrl = searchParams.get('mode') as 'view' | 'create' | null;

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const { searchValue, setSearchValue, sortBy, setSortBy, categoryIds, setCategoryIds, dateRange, setDateRange } =
        useUrlFilters({ defaultSort: 'date' });
    const [showDetail, setShowDetail] = useState(
        (!!transactionIdFromUrl || modeFromUrl === 'create') && !isLargeScreen,
    );
    const [detailMode, setDetailMode] = useState<'view' | 'create'>(modeFromUrl || 'view');

    // Bulk actions state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const bulkDeleteMutation = useBulkDeleteTransactions();

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

        // Format dates to ISO string for API
        const formatDateForAPI = (date: Date): string => {
            return date.toISOString();
        };

        return {
            ...sortMapping[sortBy],
            category_id: categoryIds.length > 0 ? categoryIds.join(',') : undefined,
            search: searchValue || undefined,
            start_date: dateRange.from ? formatDateForAPI(dateRange.from) : undefined,
            end_date: dateRange.to ? formatDateForAPI(dateRange.to) : undefined,
        };
    }, [sortBy, categoryIds, searchValue, dateRange]);

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

    // Sync detailMode with URL
    useEffect(() => {
        if (modeFromUrl) {
            setDetailMode(modeFromUrl);
            if (modeFromUrl === 'create') {
                setSelectedTransaction(null);
                if (!isLargeScreen) {
                    setShowDetail(true);
                }
            }
        }
    }, [modeFromUrl, isLargeScreen]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        return groupTransactionsByDate(allTransactions, t);
    }, [allTransactions, t]);

    const handleTransactionSelect = useCallback(
        (transaction: Transaction) => {
            setSelectedTransaction(transaction);
            setDetailMode('view');
            // Clear mode param and set transaction id
            const params = new URLSearchParams(searchParams.toString());
            params.set('id', transaction.id);
            params.delete('mode');
            router.replace(`/transactions?${params.toString()}`, { scroll: false });
            if (!isLargeScreen) {
                setShowDetail(true);
            }
        },
        [isLargeScreen, router, searchParams],
    );

    const handleBackToList = useCallback(() => {
        setShowDetail(false);
        setDetailMode('view');
        // Clear all params
        router.push('/transactions', { scroll: false });
    }, [router]);

    const handleCreateClick = useCallback(() => {
        setDetailMode('create');
        setSelectedTransaction(null);
        // Update URL with mode=create
        const params = new URLSearchParams(searchParams.toString());
        params.delete('id');
        params.set('mode', 'create');
        router.replace(`/transactions?${params.toString()}`, { scroll: false });
        if (!isLargeScreen) {
            setShowDetail(true);
        }
    }, [isLargeScreen, router, searchParams]);

    const handleCreateSuccess = useCallback(() => {
        // Data will be automatically refetched by React Query invalidation
        // Close side panel or switch back to view mode
        if (!isLargeScreen) {
            setShowDetail(false);
        }
        setDetailMode('view');
        // Clear mode from URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete('mode');
        router.replace(`/transactions?${params.toString()}`, { scroll: false });
    }, [isLargeScreen, router, searchParams]);

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

    // Check if any filters are applied
    const hasFilters = useMemo(() => {
        return (
            searchValue.trim() !== '' ||
            categoryIds.length > 0 ||
            dateRange.from !== undefined ||
            dateRange.to !== undefined
        );
    }, [searchValue, categoryIds, dateRange]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchValue('');
        setCategoryIds([]);
        setDateRange({ from: undefined, to: undefined });
    }, [setSearchValue, setCategoryIds, setDateRange]);

    // Bulk actions handlers
    const handleToggleSelection = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleCancelBulkMode = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const handleBulkDelete = useCallback(async () => {
        if (selectedIds.size === 0) return;

        const count = selectedIds.size;
        const confirmed = window.confirm(t('transactions.bulkActions.confirmDeleteMessage', { count }));

        if (!confirmed) return;

        try {
            await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
            toast.success(t('transactions.bulkActions.deleteSuccess', { count }));
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error(t('transactions.bulkActions.deleteError'));
        }
    }, [selectedIds, bulkDeleteMutation, t]);

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
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onCreateClick={handleCreateClick}
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
                    hasFilters={hasFilters}
                    onCreateClick={handleCreateClick}
                    onClearFilters={handleClearFilters}
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggleSelection}
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
                        <SheetTitle className="sr-only">
                            {detailMode === 'create'
                                ? t('transactions.form.createTitle')
                                : t('transactions.detail.title')}
                        </SheetTitle>
                        <TransactionDetail
                            transaction={selectedTransaction}
                            mode={detailMode}
                            onBack={handleBackToList}
                            isMobile
                            onEditSuccess={handleEditSuccess}
                            onDeleteSuccess={handleDeleteSuccess}
                            onCreateSuccess={handleCreateSuccess}
                        />
                    </SheetContent>
                </Sheet>

                {/* Floating Bulk Action Bar */}
                <BulkActionBar
                    selectedCount={selectedIds.size}
                    onDelete={handleBulkDelete}
                    onCancel={handleCancelBulkMode}
                    isDeleting={bulkDeleteMutation.isPending}
                    show={selectedIds.size > 0}
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
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onCreateClick={handleCreateClick}
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
                    hasFilters={hasFilters}
                    onCreateClick={handleCreateClick}
                    onClearFilters={handleClearFilters}
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggleSelection}
                />
            </div>

            {/* Right Pane - Transaction Detail */}
            <div className="overflow-hidden">
                <TransactionDetail
                    transaction={selectedTransaction}
                    mode={detailMode}
                    onEditSuccess={handleEditSuccess}
                    onDeleteSuccess={handleDeleteSuccess}
                    onCreateSuccess={handleCreateSuccess}
                />
            </div>

            {/* Floating Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedIds.size}
                onDelete={handleBulkDelete}
                onCancel={handleCancelBulkMode}
                isDeleting={bulkDeleteMutation.isPending}
                show={selectedIds.size > 0}
            />
        </div>
    );
}
