'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    statusFilter: 'all' | 'active' | 'inactive';
    onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void;
    accountTypeFilter: string;
    onAccountTypeFilterChange: (typeId: string) => void;
    accountTypes: Array<{ id: string; name: string }>;
    onCreateClick?: () => void;
}

export function FilterBar({
    searchValue,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    accountTypeFilter,
    onAccountTypeFilterChange,
    accountTypes,
    onCreateClick,
}: FilterBarProps) {
    const { t } = useTranslation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearchOpen) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isSearchOpen]);

    const statusOptions = [
        { value: 'all', label: t('accounts.status.all') },
        { value: 'active', label: t('accounts.status.active') },
        { value: 'inactive', label: t('accounts.status.inactive') },
    ] as const;

    const accountTypeOptions = [
        { value: 'all', label: t('accounts.status.all') },
        ...accountTypes.map((type) => ({ value: type.id, label: type.name })),
    ];

    return (
        <div className="border-b border-border">
            {/* Status Filter - Top row */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                <span className="text-sm font-medium text-muted-foreground">{t('accounts.filters.status')}:</span>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Account Type Filter - Middle row */}
            <div className="flex items-center gap-2 px-4 pb-2">
                <span className="text-sm font-medium text-muted-foreground">{t('accounts.filters.accountType')}:</span>
                <Select value={accountTypeFilter} onValueChange={onAccountTypeFilterChange}>
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {accountTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Action buttons - Bottom row */}
            <div className="flex items-center justify-between gap-2 p-4 pt-2">
                {/* Left side - Create button */}
                <div className="flex items-center gap-2">
                    {onCreateClick && (
                        <Button onClick={onCreateClick} size="sm" className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('common.buttons.add')}</span>
                        </Button>
                    )}
                </div>

                {/* Right side - Search */}
                <div className="flex items-center gap-2">
                    <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="px-2.5">
                                <Search className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-64 p-2">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder={t('accounts.searchPlaceholder')}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-9"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
