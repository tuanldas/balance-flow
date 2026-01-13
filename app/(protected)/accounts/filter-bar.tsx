'use client';

import { useEffect, useRef, useState } from 'react';
import { Filter, Plus, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    accountTypeFilter: string;
    onAccountTypeFilterChange: (typeId: string) => void;
    accountTypes: Array<{ id: string; name: string }>;
    onCreateClick?: () => void;
}

export function FilterBar({
    searchValue,
    onSearchChange,
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

    const accountTypeOptions = [
        { value: 'all', label: t('accounts.status.all') },
        ...accountTypes.map((type) => ({ value: type.id, label: type.name })),
    ];

    const hasActiveFilters = searchValue.trim().length > 0 || accountTypeFilter !== 'all';

    const clearAllFilters = () => {
        onSearchChange('');
        onAccountTypeFilterChange('all');
    };

    const getFilterBadges = () => {
        const badges: { key: string; label: string; color?: string; onRemove: () => void }[] = [];

        if (accountTypeFilter !== 'all') {
            const typeOption = accountTypeOptions.find((opt) => opt.value === accountTypeFilter);
            badges.push({
                key: 'accountType',
                label: typeOption?.label || accountTypeFilter,
                color: '#3b82f6',
                onRemove: () => onAccountTypeFilterChange('all'),
            });
        }

        if (searchValue.trim()) {
            badges.push({
                key: 'search',
                label: searchValue,
                onRemove: () => onSearchChange(''),
            });
        }

        return badges;
    };

    const filterBadges = getFilterBadges();

    return (
        <div className="border-b border-border">
            <div className="flex items-center justify-between gap-2 p-4">
                {/* Left side - Create button */}
                <div className="flex items-center gap-2">
                    {onCreateClick && (
                        <Button onClick={onCreateClick} size="sm" className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('common.buttons.add')}</span>
                        </Button>
                    )}
                </div>

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
                                placeholder={t('accounts.searchPlaceholder')}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-9"
                            />
                        </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <Filter className="h-4 w-4" />
                                <span className="hidden sm:inline">{t('accounts.filterButton')}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            {/* Account Type Filter */}
                            <DropdownMenuLabel>{t('accounts.filters.accountType')}</DropdownMenuLabel>
                            {accountTypeOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => onAccountTypeFilterChange(option.value)}
                                    className="gap-2"
                                >
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    {option.label}
                                    {accountTypeFilter === option.value && (
                                        <span className="ml-auto text-xs text-primary">✓</span>
                                    )}
                                </DropdownMenuItem>
                            ))}

                            {accountTypeFilter !== 'all' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={clearAllFilters} className="text-destructive">
                                        <X className="h-4 w-4 mr-2" />
                                        {t('accounts.filters.clearAll')}
                                    </DropdownMenuItem>
                                </>
                            )}
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
