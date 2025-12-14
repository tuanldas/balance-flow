'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpNarrowWide, Building2, Plus, Search, Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUniqueTags, mockAccounts, mockCategories } from '@/lib/data/mock-transactions';
import type { TransactionFilters, TransactionSortBy, TransactionType } from '@/lib/types/transaction';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FilterSubmenu } from './filter-submenu';

interface FilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    sortBy: TransactionSortBy;
    onSortChange: (sort: TransactionSortBy) => void;
    filters: TransactionFilters;
    onFiltersChange: (filters: TransactionFilters) => void;
}

export function FilterBar({
    searchValue,
    onSearchChange,
    sortBy,
    onSortChange,
    filters,
    onFiltersChange,
}: FilterBarProps) {
    const { t } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus input when popover opens
    useEffect(() => {
        if (isSearchOpen) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isSearchOpen]);

    const sortOptions: { value: TransactionSortBy; label: string; icon: React.ReactNode }[] = [
        { value: 'date', label: t('transactions.sort.date'), icon: <ArrowDownAZ className="h-4 w-4" /> },
        {
            value: 'amount_desc',
            label: t('transactions.sort.amountHighToLow'),
            icon: <ArrowDownWideNarrow className="h-4 w-4" />,
        },
        {
            value: 'amount_asc',
            label: t('transactions.sort.amountLowToHigh'),
            icon: <ArrowUpNarrowWide className="h-4 w-4" />,
        },
    ];

    const currentSort = sortOptions.find((opt) => opt.value === sortBy);

    // Toggle array filter helper
    const toggleArrayFilter = (key: 'accountIds' | 'categoryIds' | 'tags', id: string) => {
        const current = filters[key] || [];
        const updated = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
        onFiltersChange({ ...filters, [key]: updated.length > 0 ? updated : undefined });
    };

    // Set single value filter helper
    const setFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K] | undefined) => {
        const updated = { ...filters };
        if (value === undefined) {
            delete updated[key];
        } else {
            updated[key] = value;
        }
        onFiltersChange(updated);
    };

    // Get account items with colors
    const accountItems = useMemo(() => {
        const colors = ['#EF4444', '#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'];
        return mockAccounts.map((acc, idx) => ({
            id: acc.id,
            name: `${acc.name} (****${acc.lastFourDigits})`,
            color: colors[idx % colors.length],
        }));
    }, []);

    // Get category items
    const categoryItems = useMemo(() => {
        return mockCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
        }));
    }, []);

    // Get unique tags from transactions data
    const tagItems = useMemo(() => getUniqueTags(), []);

    // Type options
    const typeOptions: { value: TransactionType; label: string }[] = [
        { value: 'income', label: t('transactions.filter.income') },
        { value: 'expense', label: t('transactions.filter.expense') },
    ];

    // Calculate active filter count
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.accountIds?.length) count += filters.accountIds.length;
        if (filters.categoryIds?.length) count += filters.categoryIds.length;
        if (filters.tags?.length) count += filters.tags.length;
        if (filters.type) count += 1;
        return count;
    }, [filters]);

    const hasActiveFilters = searchValue.trim().length > 0 || activeFilterCount > 0;

    // Clear all filters
    const clearAllFilters = () => {
        onSearchChange('');
        onFiltersChange({});
    };

    // Get filter badges for display
    const getFilterBadges = () => {
        const badges: { key: string; label: string; color?: string; onRemove: () => void }[] = [];

        // Search badge
        if (searchValue.trim()) {
            badges.push({
                key: 'search',
                label: searchValue,
                onRemove: () => onSearchChange(''),
            });
        }

        // Account badges
        filters.accountIds?.forEach((id) => {
            const account = accountItems.find((a) => a.id === id);
            if (account) {
                badges.push({
                    key: `account-${id}`,
                    label: account.name,
                    color: account.color,
                    onRemove: () => toggleArrayFilter('accountIds', id),
                });
            }
        });

        // Category badges
        filters.categoryIds?.forEach((id) => {
            const category = categoryItems.find((c) => c.id === id);
            if (category) {
                badges.push({
                    key: `category-${id}`,
                    label: category.name,
                    color: category.color,
                    onRemove: () => toggleArrayFilter('categoryIds', id),
                });
            }
        });

        // Tag badges
        filters.tags?.forEach((tag) => {
            badges.push({
                key: `tag-${tag}`,
                label: `#${tag}`,
                onRemove: () => toggleArrayFilter('tags', tag),
            });
        });

        // Type badge
        if (filters.type) {
            const type = typeOptions.find((t) => t.value === filters.type);
            if (type) {
                badges.push({
                    key: 'type',
                    label: type.label,
                    onRemove: () => setFilter('type', undefined),
                });
            }
        }

        return badges;
    };

    const filterBadges = getFilterBadges();

    return (
        <div className="border-b border-border">
            {/* Main Filter Bar */}
            <div className="flex items-center justify-end gap-2 p-4">
                {/* Search Popover */}
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn('px-2.5', searchValue && 'border-primary text-primary')}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 p-2">
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder={t('transactions.searchPlaceholder')}
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-9"
                        />
                    </PopoverContent>
                </Popover>

                {/* Multi-layer Filter Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('transactions.filterButton')}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                        {/* Account Filter */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Building2 className="h-4 w-4 mr-2" />
                                {t('transactions.filter.account')}
                                {filters.accountIds?.length ? (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filters.accountIds.length}
                                    </span>
                                ) : null}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <FilterSubmenu
                                        items={accountItems}
                                        selectedIds={filters.accountIds || []}
                                        onToggle={(id) => toggleArrayFilter('accountIds', id)}
                                        searchPlaceholder={t('transactions.filter.searchPlaceholder')}
                                    />
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>

                        {/* Category Filter */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Tag className="h-4 w-4 mr-2" />
                                {t('transactions.filter.category')}
                                {filters.categoryIds?.length ? (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {filters.categoryIds.length}
                                    </span>
                                ) : null}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <FilterSubmenu
                                        items={categoryItems}
                                        selectedIds={filters.categoryIds || []}
                                        onToggle={(id) => toggleArrayFilter('categoryIds', id)}
                                        searchPlaceholder={t('transactions.filter.searchPlaceholder')}
                                    />
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>

                        {/* Tags Filter */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Tag className="h-4 w-4 mr-2" />
                                {t('transactions.filter.tags')}
                                {filters.tags?.length ? (
                                    <span className="ml-auto text-xs text-muted-foreground">{filters.tags.length}</span>
                                ) : null}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <FilterSubmenu
                                        items={tagItems}
                                        selectedIds={filters.tags || []}
                                        onToggle={(id) => toggleArrayFilter('tags', id)}
                                        searchPlaceholder={t('transactions.filter.searchPlaceholder')}
                                    />
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        {/* Type Filter */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                {t('transactions.filter.type')}
                                {filters.type && <span className="ml-auto text-xs text-muted-foreground">1</span>}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent className="min-w-[150px]">
                                    <DropdownMenuCheckboxItem
                                        checked={filters.type === undefined}
                                        onCheckedChange={() => setFilter('type', undefined)}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {t('transactions.filter.all')}
                                    </DropdownMenuCheckboxItem>
                                    {typeOptions.map((option) => (
                                        <DropdownMenuCheckboxItem
                                            key={option.value}
                                            checked={filters.type === option.value}
                                            onCheckedChange={() => setFilter('type', option.value)}
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            {option.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>

                        {/* Clear All */}
                        {activeFilterCount > 0 && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={clearAllFilters} className="text-destructive">
                                    <X className="h-4 w-4 mr-2" />
                                    {t('transactions.filter.clearAll')}
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            {currentSort?.icon}
                            <span className="hidden sm:inline">{t('transactions.sortButton')}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>{t('transactions.sortBy')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {sortOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => onSortChange(option.value)}
                                className="gap-2"
                            >
                                {option.icon}
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
                    {filterBadges.map((badge) => (
                        <button
                            key={badge.key}
                            onClick={badge.onRemove}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                            style={{
                                backgroundColor: badge.color ? `${badge.color}20` : 'hsl(var(--primary))',
                                color: badge.color || 'hsl(var(--primary-foreground))',
                            }}
                        >
                            {badge.key === 'search' && <Search className="h-3.5 w-3.5" />}
                            {badge.color && (
                                <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: badge.color }}
                                />
                            )}
                            <span className="max-w-[150px] truncate">{badge.label}</span>
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
