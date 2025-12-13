'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpNarrowWide, Filter, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TransactionSortBy } from '@/lib/types/transaction';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    sortBy: TransactionSortBy;
    onSortChange: (sort: TransactionSortBy) => void;
}

export function FilterBar({ searchValue, onSearchChange, sortBy, onSortChange }: FilterBarProps) {
    const { t } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus input when popover opens
    useEffect(() => {
        if (isSearchOpen) {
            // Small delay to ensure popover is rendered
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

    const filterOptions = [
        { value: 'account', label: t('transactions.filter.account') },
        { value: 'category', label: t('transactions.filter.category') },
        { value: 'date', label: t('transactions.filter.date') },
        { value: 'goals', label: t('transactions.filter.goals') },
        { value: 'keywords', label: t('transactions.filter.keywords') },
        { value: 'tags', label: t('transactions.filter.tags') },
    ];

    const currentSort = sortOptions.find((opt) => opt.value === sortBy);

    return (
        <div className="flex items-center gap-2 p-4 border-b border-border">
            {/* Search Popover */}
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className={cn('h-9 w-9', searchValue && 'border-primary text-primary')}
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-2">
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

            {/* Spacer */}
            <div className="flex-1" />

            {/* Filter Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('transactions.filterButton')}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>{t('transactions.filterBy')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {filterOptions.map((option) => (
                        <DropdownMenuItem key={option.value}>{option.label}</DropdownMenuItem>
                    ))}
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
    );
}
