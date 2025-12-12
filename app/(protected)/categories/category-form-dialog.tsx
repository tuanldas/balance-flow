'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CATEGORY_COLORS } from '@/lib/constants/category-options';
import type { Category, CategoryType } from '@/lib/types/category';
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategorySchema, type CategorySchemaType } from './category-schema';

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit' | 'create-subcategory';
    category?: Category | null;
    parentCategory?: Category | null;
    defaultType?: CategoryType;
    onSuccess?: () => void;
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    mode,
    category,
    parentCategory,
    defaultType = 'expense',
    onSuccess,
}: CategoryFormDialogProps) {
    const { t } = useTranslation();
    const [selectedIcon, setSelectedIcon] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();

    const form = useForm<CategorySchemaType>({
        resolver: zodResolver(getCategorySchema()),
        defaultValues: {
            name: '',
            category_type: 'expense' as CategoryType,
            parent_id: null,
            icon: '',
            color: '',
        },
    });

    // Reset form when dialog opens/closes or mode changes
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && category) {
                form.reset({
                    name: category.name,
                    category_type: category.category_type,
                    parent_id: category.parent_id,
                    icon: category.icon,
                    color: category.color,
                });
                setSelectedIcon(category.icon);
                setSelectedColor(category.color);
            } else if (mode === 'create-subcategory' && parentCategory) {
                form.reset({
                    name: '',
                    category_type: parentCategory.category_type,
                    parent_id: parentCategory.id,
                    icon: '',
                    color: parentCategory.color,
                });
                setSelectedIcon('');
                setSelectedColor(parentCategory.color);
            } else {
                form.reset({
                    name: '',
                    category_type: defaultType,
                    parent_id: null,
                    icon: '',
                    color: '',
                });
                setSelectedIcon('');
                setSelectedColor('');
            }
        }
    }, [open, mode, category, parentCategory, defaultType, form]);

    const onSubmit = async (data: CategorySchemaType) => {
        try {
            if (mode === 'edit' && category) {
                await updateMutation.mutateAsync({
                    id: category.id,
                    data: {
                        name: data.name,
                        category_type: data.category_type,
                        parent_id: data.parent_id,
                        icon: data.icon,
                        color: data.color,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    name: data.name,
                    category_type: data.category_type,
                    parent_id: data.parent_id || null,
                    icon: data.icon,
                    color: data.color,
                });
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const getDialogTitle = () => {
        if (mode === 'edit') return t('categories.editCategory');
        if (mode === 'create-subcategory') return t('categories.addSubcategory');
        return t('categories.addCategory');
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    {mode === 'create-subcategory' && parentCategory && (
                        <DialogDescription>
                            Danh mục con của: <strong>{parentCategory.name}</strong>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('categories.form.name')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('categories.form.namePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category Type - only editable when creating root category */}
                        {mode === 'create' && (
                            <FormField
                                control={form.control}
                                name="category_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('categories.form.type')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="income">
                                                    {t('categories.form.typeIncome')}
                                                </SelectItem>
                                                <SelectItem value="expense">
                                                    {t('categories.form.typeExpense')}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Icon Selection */}
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('categories.form.icon')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('categories.form.iconPlaceholder')}
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                setSelectedIcon(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Nhập URL icon SVG (ví dụ:
                                        http://localhost:8081/storage/category-icons/salary.svg)
                                    </p>
                                    {selectedIcon && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Xem trước:</span>
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-lg border"
                                                style={{ backgroundColor: selectedColor + '20' }}
                                            >
                                                {selectedIcon.startsWith('http') ? (
                                                    <img
                                                        src={selectedIcon}
                                                        alt="Icon preview"
                                                        className="h-6 w-6 object-contain"
                                                    />
                                                ) : (
                                                    <span
                                                        className="material-symbols-outlined"
                                                        style={{ fontSize: '20px' }}
                                                    >
                                                        {selectedIcon}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Color Selection */}
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('categories.form.color')}</FormLabel>
                                    <div className="grid grid-cols-10 gap-2 p-4 border rounded-lg">
                                        {CATEGORY_COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => {
                                                    field.onChange(color.value);
                                                    setSelectedColor(color.value);
                                                }}
                                                className={`h-10 w-10 rounded-md border-2 transition-all hover:scale-110 ${
                                                    selectedColor === color.value
                                                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                                                        : 'border-border'
                                                }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.label}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                {t('categories.form.cancelButton')}
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? t('common.messages.loading')
                                    : mode === 'edit'
                                      ? t('categories.form.updateButton')
                                      : t('categories.form.createButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
