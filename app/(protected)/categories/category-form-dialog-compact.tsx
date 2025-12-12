'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CATEGORY_COLORS } from '@/lib/constants/category-options';
import type { Category, CategoryType } from '@/lib/types/category';
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories';
import { useCategoryIcons } from '@/hooks/use-category-icons';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategorySchema, type CategorySchemaType } from './category-schema';
import { IconPicker } from './icon-picker';

interface CategoryFormDialogCompactProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit' | 'create-subcategory';
    category?: Category | null;
    parentCategory?: Category | null;
    defaultType?: CategoryType;
    onSuccess?: () => void;
}

export function CategoryFormDialogCompact({
    open,
    onOpenChange,
    mode,
    category,
    parentCategory,
    defaultType = 'expense',
    onSuccess,
}: CategoryFormDialogCompactProps) {
    const { t } = useTranslation();
    const [selectedColor, setSelectedColor] = useState<string>('#6366f1');
    const [uploadedIconFile, setUploadedIconFile] = useState<File | null>(null);

    const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const { data: iconsData } = useCategoryIcons();

    // Helper to get a random icon URL
    const getRandomIconUrl = () => {
        const icons = iconsData?.data || [];
        if (icons.length === 0) return '';
        const randomIndex = Math.floor(Math.random() * icons.length);
        return icons[randomIndex].url;
    };

    // Helper to get a random color
    const getRandomColor = () => {
        const randomIndex = Math.floor(Math.random() * CATEGORY_COLORS.length);
        return CATEGORY_COLORS[randomIndex].value;
    };

    const form = useForm<CategorySchemaType>({
        resolver: zodResolver(getCategorySchema()),
        defaultValues: {
            name: '',
            category_type: 'expense' as CategoryType,
            parent_id: null,
            icon: '',
            color: '#6366f1',
        },
    });

    const watchedName = form.watch('name');
    const watchedIcon = form.watch('icon');

    // Reset form when dialog opens/closes or mode changes
    useEffect(() => {
        if (open) {
            setUploadedIconFile(null);
            if (mode === 'edit' && category) {
                form.reset({
                    name: category.name,
                    category_type: category.category_type,
                    parent_id: category.parent_id,
                    icon: category.icon,
                    color: category.color,
                });
                setSelectedColor(category.color);
            } else if (mode === 'create-subcategory' && parentCategory) {
                const randomIcon = getRandomIconUrl();
                const randomColor = getRandomColor();
                form.reset({
                    name: '',
                    category_type: parentCategory.category_type,
                    parent_id: parentCategory.id,
                    icon: randomIcon,
                    color: randomColor,
                });
                setSelectedColor(randomColor);
            } else {
                const randomIcon = getRandomIconUrl();
                const randomColor = getRandomColor();
                form.reset({
                    name: '',
                    category_type: defaultType,
                    parent_id: null,
                    icon: randomIcon,
                    color: randomColor,
                });
                setSelectedColor(randomColor);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, mode, category, parentCategory, defaultType, form, iconsData]);

    const onSubmit = async (data: CategorySchemaType) => {
        try {
            const submitData = {
                name: data.name,
                category_type: data.category_type,
                parent_id: data.parent_id,
                color: data.color,
                icon: uploadedIconFile ? undefined : data.icon,
                icon_file: uploadedIconFile || undefined,
            };

            if (mode === 'edit' && category) {
                await updateMutation.mutateAsync({
                    id: category.id,
                    data: submitData,
                });
            } else {
                await createMutation.mutateAsync({
                    ...submitData,
                    parent_id: submitData.parent_id || null,
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

    // Get preview icon URL
    const previewIconUrl = uploadedIconFile ? URL.createObjectURL(uploadedIconFile) : watchedIcon || null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header with Preview */}
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        {/* Icon Preview with Popover */}
                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <Popover open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                            style={{ backgroundColor: selectedColor }}
                                            title={t('categories.iconPicker.selectIcon')}
                                            disabled={isLoading}
                                        >
                                            {previewIconUrl ? (
                                                <img
                                                    src={previewIconUrl}
                                                    alt="Icon preview"
                                                    className="w-8 h-8 object-contain"
                                                />
                                            ) : (
                                                <span className="text-2xl font-bold text-white/70">
                                                    {watchedName ? watchedName.charAt(0).toUpperCase() : '?'}
                                                </span>
                                            )}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-3" align="start" sideOffset={8}>
                                        <IconPicker
                                            value={field.value}
                                            uploadedFile={uploadedIconFile}
                                            onSelectIcon={(iconUrl) => {
                                                field.onChange(iconUrl || '');
                                                setUploadedIconFile(null);
                                            }}
                                            onUploadIcon={(file) => {
                                                setUploadedIconFile(file);
                                                if (file) {
                                                    field.onChange('');
                                                }
                                            }}
                                            selectedColor={selectedColor}
                                            disabled={isLoading}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        <div className="flex-1 min-w-0">
                            <DialogTitle>{getDialogTitle()}</DialogTitle>
                            {mode === 'create-subcategory' && parentCategory ? (
                                <DialogDescription>
                                    Danh mục con của: <strong>{parentCategory.name}</strong>
                                </DialogDescription>
                            ) : (
                                <DialogDescription className="truncate">
                                    {watchedName || 'Nhập thông tin danh mục'}
                                </DialogDescription>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name - Always visible */}
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

                        {/* Category Type - Always visible when creating */}
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

                        {/* Color Section */}
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('categories.form.color')}</FormLabel>
                                    <div className="grid grid-cols-10 gap-2">
                                        {CATEGORY_COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                type="button"
                                                onClick={() => {
                                                    field.onChange(color.value);
                                                    setSelectedColor(color.value);
                                                }}
                                                className={`h-8 w-8 rounded-md border-2 transition-all hover:scale-110 ${
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
