'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Category } from '@/lib/types/category';
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
    const [isExpanded, setIsExpanded] = useState(true);
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
                        aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
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
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                    style={{ backgroundColor: category.color + '20' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: category.color }}>
                        {category.icon}
                    </span>
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
                                Hệ thống
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        {level === 0 && (
                            <DropdownMenuItem onClick={() => onAddSubcategory?.(category)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm danh mục con
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(category)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
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
