'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { TransactionSortBy, TransactionType } from '@/lib/types/transaction';
import type { DateRangeValue } from '@/app/(protected)/transactions/date-range-filter';

interface UseUrlFiltersOptions {
    defaultSort?: TransactionSortBy;
}

interface UseUrlFiltersReturn {
    searchValue: string;
    setSearchValue: (value: string) => void;
    sortBy: TransactionSortBy;
    setSortBy: (value: TransactionSortBy) => void;
    categoryIds: string[];
    setCategoryIds: (value: string[]) => void;
    dateRange: DateRangeValue;
    setDateRange: (value: DateRangeValue) => void;
    type: TransactionType | 'all';
    setType: (value: TransactionType | 'all') => void;
}

// Helper: Format date as YYYY-MM-DD
function formatDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Helper: Parse YYYY-MM-DD to Date
function parseDateString(dateString: string): Date | undefined {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return undefined;
        date.setHours(0, 0, 0, 0);
        return date;
    } catch {
        return undefined;
    }
}

export function useUrlFilters(options?: UseUrlFiltersOptions): UseUrlFiltersReturn {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultSort = options?.defaultSort || 'date';

    // Initialize state from URL
    const [searchValue, setSearchValue] = useState(() => searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState<TransactionSortBy>(() => {
        const sort = searchParams.get('sort') as TransactionSortBy;
        return sort || defaultSort;
    });
    const [categoryIds, setCategoryIds] = useState<string[]>(() => {
        const cats = searchParams.get('categories');
        return cats ? cats.split(',').filter(Boolean) : [];
    });
    const [dateRange, setDateRange] = useState<DateRangeValue>(() => {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        return {
            from: from ? parseDateString(from) : undefined,
            to: to ? parseDateString(to) : undefined,
        };
    });
    const [type, setType] = useState<TransactionType | 'all'>(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'income' || typeParam === 'expense') {
            return typeParam;
        }
        return 'all';
    });

    // Sync filters to URL whenever they change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        // Search
        if (searchValue.trim()) {
            params.set('search', searchValue.trim());
        } else {
            params.delete('search');
        }

        // Sort (only if not default)
        if (sortBy !== defaultSort) {
            params.set('sort', sortBy);
        } else {
            params.delete('sort');
        }

        // Categories
        if (categoryIds.length > 0) {
            params.set('categories', categoryIds.join(','));
        } else {
            params.delete('categories');
        }

        // Date range
        if (dateRange.from) {
            params.set('from', formatDateOnly(dateRange.from));
        } else {
            params.delete('from');
        }

        if (dateRange.to) {
            params.set('to', formatDateOnly(dateRange.to));
        } else {
            params.delete('to');
        }

        // Type
        if (type !== 'all') {
            params.set('type', type);
        } else {
            params.delete('type');
        }

        // Only update if params actually changed
        const newUrl = params.toString();
        const currentUrl = searchParams.toString();
        if (newUrl !== currentUrl) {
            router.replace(`?${newUrl}`, { scroll: false });
        }
    }, [searchValue, sortBy, categoryIds, dateRange, type, searchParams, router, defaultSort]);

    return {
        searchValue,
        setSearchValue,
        sortBy,
        setSortBy,
        categoryIds,
        setCategoryIds,
        dateRange,
        setDateRange,
        type,
        setType,
    };
}
