'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpNarrowWide, Plus, Search, Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TransactionSortBy } from '@/lib/types/transaction';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/use-categories';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
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
    categoryIds: string[];
    onCategoryIdsChange: (categoryIds: string[]) => void;
    onCreateClick?: () => void;
}

export function FilterBar({
    searchValue,
    onSearchChange,
    sortBy,
    onSortChange,
    categoryIds,
    onCategoryIdsChange,
    onCreateClick,
}: FilterBarProps) {
    const { t } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { data: categoriesData } = useCategories();

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

    const categoryItems = useMemo(() => {
        const categories = categoriesData?.data || [];
        return categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            icon: cat.icon,
        }));
    }, [categoriesData?.data]);

    const toggleCategory = (id: string) => {
        if (categoryIds.includes(id)) {
            onCategoryIdsChange(categoryIds.filter((cid) => cid !== id));
        } else {
            onCategoryIdsChange([...categoryIds, id]);
        }
    };

    const hasActiveFilters = searchValue.trim().length > 0 || categoryIds.length > 0;

    const clearAllFilters = () => {
        onSearchChange('');
        onCategoryIdsChange([]);
    };

    const getFilterBadges = () => {
        const badges: { key: string; label: string; color?: string; onRemove: () => void }[] = [];

        if (searchValue.trim()) {
            badges.push({
                key: 'search',
                label: searchValue,
                onRemove: () => onSearchChange(''),
            });
        }

        categoryIds.forEach((id) => {
            const category = categoryItems.find((c) => c.id === id);
            if (category) {
                badges.push({
                    key: `category-${id}`,
                    label: category.name,
                    color: category.color,
                    onRemove: () => toggleCategory(id),
                });
            }
        });

        return badges;
    };

    const filterBadges = getFilterBadges();

    return (
        <div className="border-b border-border">
            <div className="flex items-center justify-between gap-2 p-4">
                {/* Left side - Create button */}
                {onCreateClick && (
                    <Button onClick={onCreateClick} size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('common.buttons.add')}</span>
                    </Button>
                )}

                {/* Right side - Filter buttons */}
                <div className="flex items-center gap-2">
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

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('transactions.filterButton')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Tag className="h-4 w-4 mr-2" />
                                    {t('transactions.filter.category')}
                                    {categoryIds.length > 0 && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {categoryIds.length}
                                        </span>
                                    )}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        <FilterSubmenu
                                            items={categoryItems}
                                            selectedIds={categoryIds}
                                            onToggle={toggleCategory}
                                            searchPlaceholder={t('transactions.filter.searchPlaceholder')}
                                        />
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>

                            {categoryIds.length > 0 && (
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
            </div>

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
