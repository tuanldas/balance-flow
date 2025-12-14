'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { filterTransactionsAdvanced, groupTransactionsByDate, mockTransactions } from '@/lib/data/mock-transactions';
import type { Transaction, TransactionFilters, TransactionGroup, TransactionSortBy } from '@/lib/types/transaction';
import { useIsLargeScreen } from '@/hooks/use-large-screen';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { FilterBar } from './filter-bar';
import { TransactionDetail } from './transaction-detail';
import { TransactionRow } from './transaction-row';

// Extracted TransactionList component to avoid duplication
interface TransactionListProps {
    groupedTransactions: TransactionGroup[];
    filteredTransactionsCount: number;
    selectedTransactionId?: string;
    onTransactionSelect: (transaction: Transaction) => void;
}

const TransactionList = memo(function TransactionList({
    groupedTransactions,
    filteredTransactionsCount,
    selectedTransactionId,
    onTransactionSelect,
}: TransactionListProps) {
    const { t } = useTranslation();

    return (
        <ScrollArea className="flex-1">
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

                {filteredTransactionsCount === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>{t('transactions.noResults')}</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
});

export default function TransactionsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isLargeScreen = useIsLargeScreen();

    // Get transaction ID from URL
    const transactionIdFromUrl = searchParams.get('id');

    // Find transaction from URL or default to first one
    const getInitialTransaction = useCallback((): Transaction | null => {
        if (transactionIdFromUrl) {
            const found = mockTransactions.find((txn) => txn.id === transactionIdFromUrl);
            if (found) return found;
        }
        return mockTransactions[0] || null;
    }, [transactionIdFromUrl]);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(getInitialTransaction);
    const [searchValue, setSearchValue] = useState('');
    const [sortBy, setSortBy] = useState<TransactionSortBy>('date');
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [showDetail, setShowDetail] = useState(!!transactionIdFromUrl && !isLargeScreen);

    // Sync selected transaction with URL on mount and URL changes
    useEffect(() => {
        const transaction = getInitialTransaction();
        setSelectedTransaction(transaction);
        if (transactionIdFromUrl && !isLargeScreen) {
            setShowDetail(true);
        }
    }, [transactionIdFromUrl, getInitialTransaction, isLargeScreen]);

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        return filterTransactionsAdvanced(
            mockTransactions,
            {
                search: searchValue,
                accountIds: filters.accountIds,
                categoryIds: filters.categoryIds,
                tags: filters.tags,
                type: filters.type,
            },
            sortBy,
        );
    }, [searchValue, sortBy, filters]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        return groupTransactionsByDate(filteredTransactions, t);
    }, [filteredTransactions, t]);

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

    // Mobile/Tablet view (<1280px): show list with Sheet for detail
    if (!isLargeScreen) {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-background">
                <FilterBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    filters={filters}
                    onFiltersChange={setFilters}
                />
                <TransactionList
                    groupedTransactions={groupedTransactions}
                    filteredTransactionsCount={filteredTransactions.length}
                    selectedTransactionId={selectedTransaction?.id}
                    onTransactionSelect={handleTransactionSelect}
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
                        <TransactionDetail transaction={selectedTransaction} onBack={handleBackToList} isMobile />
                    </SheetContent>
                </Sheet>
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
                    filters={filters}
                    onFiltersChange={setFilters}
                />
                <TransactionList
                    groupedTransactions={groupedTransactions}
                    filteredTransactionsCount={filteredTransactions.length}
                    selectedTransactionId={selectedTransaction?.id}
                    onTransactionSelect={handleTransactionSelect}
                />
            </div>

            {/* Right Pane - Transaction Detail */}
            <div className="overflow-hidden">
                <TransactionDetail transaction={selectedTransaction} />
            </div>
        </div>
    );
}
