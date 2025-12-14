'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export interface FilterItem {
    id: string;
    name: string;
    color?: string;
    icon?: string;
}

interface FilterSubmenuProps {
    items: FilterItem[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    searchPlaceholder: string;
}

export function FilterSubmenu({ items, selectedIds, onToggle, searchPlaceholder }: FilterSubmenuProps) {
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredItems = useMemo(() => {
        if (!search) return items;
        const searchLower = search.toLowerCase();
        return items.filter((item) => item.name.toLowerCase().includes(searchLower));
    }, [items, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-w-[200px]">
            <div className="p-2 pb-1">
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 text-sm"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            </div>
            <div className="max-h-[250px] overflow-y-auto p-1">
                {filteredItems.map((item) => {
                    const isIconUrl = item.icon?.startsWith('http');
                    return (
                        <DropdownMenuCheckboxItem
                            key={item.id}
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={() => onToggle(item.id)}
                            onSelect={(e) => e.preventDefault()}
                            className="gap-2"
                        >
                            {item.color && !item.icon && (
                                <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                            )}
                            {item.icon &&
                                (isIconUrl ? (
                                    <img src={item.icon} alt={item.name} className="h-4 w-4 object-contain shrink-0" />
                                ) : (
                                    <span
                                        className="material-symbols-outlined shrink-0"
                                        style={{ fontSize: '16px', color: item.color }}
                                    >
                                        {item.icon}
                                    </span>
                                ))}
                            <span className="truncate">{item.name}</span>
                        </DropdownMenuCheckboxItem>
                    );
                })}
                {filteredItems.length === 0 && (
                    <div className="py-4 text-center text-sm text-muted-foreground">No results</div>
                )}
            </div>
        </div>
    );
}
