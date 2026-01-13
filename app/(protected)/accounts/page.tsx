'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Account } from '@/lib/types/account';
import { useAccountTypes } from '@/hooks/use-account-types';
import { useAccounts, useBulkDeleteAccounts } from '@/hooks/use-accounts';
import { useIsLargeScreen } from '@/hooks/use-large-screen';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { AccountDetail } from './account-detail';
import { AccountListSkeleton } from './account-list-skeleton';
import { AccountRow } from './account-row';
import { BulkActionBar } from './bulk-action-bar';
import { EmptyState } from './empty-state';
import { FilterBar } from './filter-bar';

// Extracted AccountList component
interface AccountListProps {
    accounts: Account[];
    selectedAccountId?: string;
    onAccountSelect: (account: Account) => void;
    isLoading?: boolean;
    error?: Error | null;
    hasFilters?: boolean;
    onClearFilters?: () => void;
    selectedIds?: Set<string>;
    onToggleSelection?: (id: string) => void;
}

const AccountList = memo(function AccountList({
    accounts,
    selectedAccountId,
    onAccountSelect,
    isLoading,
    error,
    hasFilters,
    onClearFilters,
    selectedIds,
    onToggleSelection,
}: AccountListProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return <AccountListSkeleton />;
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
                {accounts.length === 0 ? (
                    <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
                ) : (
                    <div className="space-y-1">
                        {accounts.map((account) => (
                            <AccountRow
                                key={account.id}
                                account={account}
                                isSelected={selectedAccountId === account.id}
                                onClick={() => {
                                    // If has selections, clicking toggles selection
                                    // Otherwise, opens detail view
                                    if (selectedIds && selectedIds.size > 0 && onToggleSelection) {
                                        onToggleSelection(account.id);
                                    } else {
                                        onAccountSelect(account);
                                    }
                                }}
                                isChecked={selectedIds?.has(account.id)}
                                onCheckChange={() => {
                                    if (onToggleSelection) {
                                        onToggleSelection(account.id);
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default function AccountsPage() {
    const { t } = useTranslation();
    const isLargeScreen = useIsLargeScreen();

    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [detailMode, setDetailMode] = useState<'view' | 'create'>('view');

    // Filter state
    const [searchValue, setSearchValue] = useState('');
    const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');

    // Bulk actions state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const bulkDeleteMutation = useBulkDeleteAccounts();

    // Fetch account types
    const { data: accountTypesData } = useAccountTypes();
    const accountTypes = useMemo(() => accountTypesData?.data || [], [accountTypesData?.data]);

    // Build query params based on filters
    const queryParams = useMemo(() => {
        const params: {
            account_type_id?: string;
        } = {};

        if (accountTypeFilter !== 'all') {
            params.account_type_id = accountTypeFilter;
        }

        return params;
    }, [accountTypeFilter]);

    // Fetch accounts
    const { data: accountsData, isLoading, error } = useAccounts(queryParams);
    const allAccounts = useMemo(() => accountsData?.data || [], [accountsData?.data]);

    // Filter accounts by search (client-side)
    const filteredAccounts = useMemo(() => {
        if (!searchValue.trim()) return allAccounts;

        const searchLower = searchValue.toLowerCase().trim();
        return allAccounts.filter(
            (account) =>
                account.name.toLowerCase().includes(searchLower) ||
                account.account_type?.name.toLowerCase().includes(searchLower) ||
                account.description?.toLowerCase().includes(searchLower),
        );
    }, [allAccounts, searchValue]);

    // Select first account by default when data loads, or show create form if no accounts
    useEffect(() => {
        // Don't auto-select if user is in create mode
        if (detailMode === 'create') return;

        if (filteredAccounts.length > 0 && !selectedAccount) {
            setSelectedAccount(filteredAccounts[0]);
            setDetailMode('view');
        } else if (filteredAccounts.length === 0 && !isLoading && allAccounts.length === 0) {
            // Auto show create form when no accounts exist
            setDetailMode('create');
            setSelectedAccount(null);
        }
    }, [filteredAccounts, selectedAccount, isLoading, allAccounts.length, detailMode]);

    // Update selected account when data changes (to reflect updates)
    useEffect(() => {
        if (selectedAccount && filteredAccounts.length > 0) {
            const updatedAccount = filteredAccounts.find((acc) => acc.id === selectedAccount.id);
            if (updatedAccount) {
                setSelectedAccount(updatedAccount);
            }
        }
    }, [filteredAccounts, selectedAccount]);

    const handleAccountSelect = useCallback(
        (account: Account) => {
            setSelectedAccount(account);
            setDetailMode('view');
            if (!isLargeScreen) {
                setShowDetail(true);
            }
        },
        [isLargeScreen],
    );

    const handleBackToList = useCallback(() => {
        setShowDetail(false);
        setDetailMode('view');
    }, []);

    const handleCreateClick = useCallback(() => {
        setDetailMode('create');
        setSelectedAccount(null);
        if (!isLargeScreen) {
            setShowDetail(true);
        }
    }, [isLargeScreen]);

    const handleCreateSuccess = useCallback(() => {
        // Data will be automatically refetched by React Query
        // Close side panel or switch back to view mode
        if (!isLargeScreen) {
            setShowDetail(false);
        }
        setDetailMode('view');
    }, [isLargeScreen]);

    const handleEditSuccess = useCallback(() => {
        // Data will be automatically refetched by React Query
    }, []);

    const handleDeleteSuccess = useCallback(() => {
        setSelectedAccount(null);
        if (!isLargeScreen) {
            setShowDetail(false);
        }
    }, [isLargeScreen]);

    // Check if any filters are applied
    const hasFilters = useMemo(() => {
        return searchValue.trim() !== '' || accountTypeFilter !== 'all';
    }, [searchValue, accountTypeFilter]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchValue('');
        setAccountTypeFilter('all');
    }, []);

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
        const confirmed = window.confirm(t('accounts.bulkActions.confirmDeleteMessage', { count }));

        if (!confirmed) return;

        try {
            await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
            toast.success(t('accounts.bulkActions.deleteSuccess', { count }));
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Bulk delete error:', error);
            toast.error(t('accounts.bulkActions.deleteError'));
        }
    }, [selectedIds, bulkDeleteMutation, t]);

    // Mobile/Tablet view (<1280px): show list with Sheet for detail
    if (!isLargeScreen) {
        return (
            <div className="h-[calc(100vh-64px)] flex flex-col bg-background">
                <FilterBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    accountTypeFilter={accountTypeFilter}
                    onAccountTypeFilterChange={setAccountTypeFilter}
                    accountTypes={accountTypes}
                    onCreateClick={handleCreateClick}
                />
                <AccountList
                    accounts={filteredAccounts}
                    selectedAccountId={selectedAccount?.id}
                    onAccountSelect={handleAccountSelect}
                    isLoading={isLoading}
                    error={error as Error | null}
                    hasFilters={hasFilters}
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
                            {detailMode === 'create' ? t('accounts.form.createTitle') : t('accounts.detail.title')}
                        </SheetTitle>
                        <AccountDetail
                            account={selectedAccount}
                            mode={detailMode}
                            accountTypes={accountTypes}
                            onBack={handleBackToList}
                            isMobile
                            onDeleteSuccess={handleDeleteSuccess}
                            onCreateSuccess={handleCreateSuccess}
                            onEditSuccess={handleEditSuccess}
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
            {/* Left Pane - Account List */}
            <div className="flex flex-col border-r border-border overflow-hidden">
                <FilterBar
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    accountTypeFilter={accountTypeFilter}
                    onAccountTypeFilterChange={setAccountTypeFilter}
                    accountTypes={accountTypes}
                    onCreateClick={handleCreateClick}
                />
                <AccountList
                    accounts={filteredAccounts}
                    selectedAccountId={selectedAccount?.id}
                    onAccountSelect={handleAccountSelect}
                    isLoading={isLoading}
                    error={error as Error | null}
                    hasFilters={hasFilters}
                    onClearFilters={handleClearFilters}
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggleSelection}
                />
            </div>

            {/* Right Pane - Account Detail */}
            <div className="overflow-hidden">
                <AccountDetail
                    account={selectedAccount}
                    mode={detailMode}
                    accountTypes={accountTypes}
                    onDeleteSuccess={handleDeleteSuccess}
                    onCreateSuccess={handleCreateSuccess}
                    onEditSuccess={handleEditSuccess}
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
