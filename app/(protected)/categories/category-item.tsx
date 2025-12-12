'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '@/lib/types/category';
import { useSettings } from '@/providers/settings-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CategoryItemProps {
    category: Category;
    level?: number;
    onEdit?: (category: Category) => void;
    onDelete?: (category: Category) => void;
    onAddSubcategory?: (parentCategory: Category) => void;
}

export function CategoryItem({ category, level = 0, onEdit, onDelete, onAddSubcategory }: CategoryItemProps) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const { getOption } = useSettings();
    const categoryIconBgColor = getOption<string>('categoryIconBgColor');
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className={level > 0 ? 'ml-6' : ''}>
            <div
                className={`group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent ${
                    level === 0 ? 'bg-muted/50' : ''
                }`}
            >
                {/* Expand/Collapse button */}
                {hasChildren ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent-foreground/10"
                        aria-label={isExpanded ? t('categories.actions.collapse') : t('categories.actions.expand')}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                {/* Icon */}
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: categoryIconBgColor }}
                >
                    {category.icon.startsWith('http') ? (
                        <img src={category.icon} alt={category.name} className="h-6 w-6 object-contain" />
                    ) : (
                        <span className="material-symbols-outlined text-foreground" style={{ fontSize: '24px' }}>
                            {category.icon}
                        </span>
                    )}
                </div>

                {/* Name */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`${level === 0 ? 'font-semibold' : 'font-medium'}`}>{category.name}</span>
                        {hasChildren && (
                            <Badge variant="secondary" className="text-xs">
                                {category.children!.length}
                            </Badge>
                        )}
                        {category.is_system && (
                            <Badge variant="outline" className="text-xs">
                                {t('categories.systemBadge')}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('categories.actions.edit')}
                        </DropdownMenuItem>
                        {level === 0 && (
                            <DropdownMenuItem onClick={() => onAddSubcategory?.(category)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('categories.addSubcategory')}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(category)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('categories.actions.delete')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">
                    {category.children!.map((child) => (
                        <CategoryItem
                            key={child.id}
                            category={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSubcategory={onAddSubcategory}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
