'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { filterTransactions, groupTransactionsByDate, mockTransactions } from '@/lib/data/mock-transactions';
import type { Transaction, TransactionSortBy } from '@/lib/types/transaction';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterBar } from './filter-bar';
import { TransactionDetail } from './transaction-detail';
import { TransactionRow } from './transaction-row';

// Custom hook for detecting if screen is large enough for split view (xl: 1280px)
function useIsLargeScreen() {
    const [isLarge, setIsLarge] = useState(false);

    useEffect(() => {
        const checkSize = () => setIsLarge(window.innerWidth >= 1280);
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    return isLarge;
}

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
        return filterTransactions(mockTransactions, searchValue, sortBy);
    }, [searchValue, sortBy]);

    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        return groupTransactionsByDate(filteredTransactions, t);
    }, [filteredTransactions, t]);

    // Update URL when selecting a transaction
    const updateUrlWithTransaction = useCallback(
        (transactionId: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('id', transactionId);
            router.push(`/transactions?${params.toString()}`, { scroll: false });
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
    }, []);

    // Mobile/Tablet view (<1280px): show either list or detail
    if (!isLargeScreen) {
        if (showDetail && selectedTransaction) {
            return (
                <div className="h-[calc(100vh-64px)] bg-background">
                    <TransactionDetail transaction={selectedTransaction} onBack={handleBackToList} isMobile />
                </div>
            );
        }

        return (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-background">
                <FilterBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />
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
                                            isSelected={selectedTransaction?.id === transaction.id}
                                            onClick={() => handleTransactionSelect(transaction)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>{t('transactions.noResults')}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
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
                />
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
                                            isSelected={selectedTransaction?.id === transaction.id}
                                            onClick={() => handleTransactionSelect(transaction)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>{t('transactions.noResults')}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Pane - Transaction Detail */}
            <div className="overflow-hidden">
                <TransactionDetail transaction={selectedTransaction} />
            </div>
        </div>
    );
}
