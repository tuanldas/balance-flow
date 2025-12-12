'use client';

import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpNarrowWide, Filter, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TransactionSortBy } from '@/lib/types/transaction';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input, InputWrapper } from '@/components/ui/input';

interface FilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    sortBy: TransactionSortBy;
    onSortChange: (sort: TransactionSortBy) => void;
}

export function FilterBar({ searchValue, onSearchChange, sortBy, onSortChange }: FilterBarProps) {
    const { t } = useTranslation();

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
            {/* Search Input */}
            <InputWrapper variant="sm" className="flex-1">
                <Search className="h-4 w-4" />
                <Input
                    type="text"
                    placeholder={t('transactions.searchPlaceholder')}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="border-0 shadow-none"
                />
            </InputWrapper>

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
