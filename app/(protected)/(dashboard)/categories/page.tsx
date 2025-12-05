'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Category } from '@/lib/types/category';
import { useCategories, useDeleteCategory } from '@/hooks/use-categories';
// import { useTranslation } from 'react-i18next'; // TODO: Add i18n support later

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardHeading,
    CardTitle,
    CardToolbar,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/components/layouts/protected/components/toolbar';
import { CategoryFormDialog } from './category-form-dialog';
import { CategoryItem } from './category-item';

export default function CategoriesPage() {
    // const { t } = useTranslation(); // TODO: Add i18n support later
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'create-subcategory'>('create');

    // Fetch categories
    const { data: categoriesData, isLoading, error } = useCategories();
    const deleteCategoryMutation = useDeleteCategory();

    // Separate income and expense categories
    const incomeCategories = categoriesData?.data.filter((cat) => cat.category_type === 'income') || [];
    const expenseCategories = categoriesData?.data.filter((cat) => cat.category_type === 'expense') || [];

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleDelete = async (category: Category) => {
        if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
            try {
                await deleteCategoryMutation.mutateAsync(category.id);
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Không thể xóa danh mục. Vui lòng thử lại.');
            }
        }
    };

    const handleAddSubcategory = (parentCategory: Category) => {
        setSelectedCategory(parentCategory);
        setFormMode('create-subcategory');
        setIsFormOpen(true);
    };

    const handleAddCategory = () => {
        setSelectedCategory(null);
        setFormMode('create');
        setIsFormOpen(true);
    };

    if (error) {
        return (
            <div className="container-fluid">
                <Toolbar>
                    <ToolbarHeading>
                        <ToolbarPageTitle>Quản lý danh mục</ToolbarPageTitle>
                    </ToolbarHeading>
                </Toolbar>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-destructive">
                            <p>Có lỗi xảy ra khi tải danh mục</p>
                            <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarPageTitle>Quản lý danh mục</ToolbarPageTitle>
                </ToolbarHeading>
            </Toolbar>

            <Card>
                <CardHeader>
                    <CardHeading>
                        <CardTitle>Danh mục thu chi</CardTitle>
                        <CardDescription>Quản lý danh mục thu nhập và chi tiêu của bạn</CardDescription>
                    </CardHeading>
                    <CardToolbar>
                        <Button onClick={handleAddCategory}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm danh mục
                        </Button>
                    </CardToolbar>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <Tabs defaultValue="income" className="w-full">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="income" className="gap-2">
                                    📈 Thu nhập ({incomeCategories.length})
                                </TabsTrigger>
                                <TabsTrigger value="expense" className="gap-2">
                                    📉 Chi tiêu ({expenseCategories.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="income" className="mt-6 space-y-2">
                                {incomeCategories.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Chưa có danh mục thu nhập nào
                                    </div>
                                ) : (
                                    incomeCategories.map((category) => (
                                        <CategoryItem
                                            key={category.id}
                                            category={category}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAddSubcategory={handleAddSubcategory}
                                        />
                                    ))
                                )}
                            </TabsContent>

                            <TabsContent value="expense" className="mt-6 space-y-2">
                                {expenseCategories.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Chưa có danh mục chi tiêu nào
                                    </div>
                                ) : (
                                    expenseCategories.map((category) => (
                                        <CategoryItem
                                            key={category.id}
                                            category={category}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAddSubcategory={handleAddSubcategory}
                                        />
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            {/* Category Form Dialog */}
            <CategoryFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                mode={formMode}
                category={selectedCategory}
                parentCategory={formMode === 'create-subcategory' ? selectedCategory : undefined}
            />
        </div>
    );
}
