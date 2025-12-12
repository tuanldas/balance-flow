'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { DEFAULT_PER_PAGE } from '@/lib/constants/pagination';
import type { Category, CategoryType } from '@/lib/types/category';
import { useDeleteCategory, useInfiniteCategories } from '@/hooks/use-categories';
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

// Component to display category list with infinite scroll
function CategoryList({
    type,
    onEdit,
    onDelete,
    onAddSubcategory,
}: {
    type: CategoryType;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onAddSubcategory: (category: Category) => void;
}) {
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useInfiniteCategories(
        type,
        DEFAULT_PER_PAGE,
    );

    // Flatten all pages into a single array
    const categories = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page.data);
    }, [data?.pages]);

    // Get total count from the first page's pagination
    const totalCount = data?.pages[0]?.pagination?.total ?? 0;

    // Infinite scroll using IntersectionObserver
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage],
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px',
            threshold: 0,
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [handleObserver]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-destructive">
                <p>Có lỗi xảy ra khi tải danh mục</p>
                <p className="text-sm text-muted-foreground mt-2">{(error as Error).message}</p>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                {type === 'income' ? 'Chưa có danh mục thu nhập nào' : 'Chưa có danh mục chi tiêu nào'}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {categories.map((category) => (
                <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddSubcategory={onAddSubcategory}
                />
            ))}

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-1" />

            {/* Loading more indicator */}
            {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Đang tải thêm...</span>
                </div>
            )}

            {/* End of list indicator */}
            {!hasNextPage && categories.length > 0 && totalCount > DEFAULT_PER_PAGE && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                    Đã hiển thị tất cả {totalCount} danh mục
                </div>
            )}
        </div>
    );
}

export default function CategoriesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get tab from URL, default to 'income'
    const tabFromUrl = searchParams.get('type') as CategoryType | null;
    const activeTab: CategoryType = tabFromUrl === 'expense' ? 'expense' : 'income';

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'create-subcategory'>('create');

    const deleteCategoryMutation = useDeleteCategory();

    // Fetch categories count for tabs
    const incomeQuery = useInfiniteCategories('income', DEFAULT_PER_PAGE);
    const expenseQuery = useInfiniteCategories('expense', DEFAULT_PER_PAGE);

    const incomeCount = incomeQuery.data?.pages[0]?.pagination?.total ?? 0;
    const expenseCount = expenseQuery.data?.pages[0]?.pagination?.total ?? 0;

    // Update URL when tab changes
    const handleTabChange = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('type', value);
            router.push(`?${params.toString()}`, { scroll: false });
        },
        [router, searchParams],
    );

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
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="income" className="gap-2">
                                Thu nhập ({incomeQuery.isLoading ? '...' : incomeCount})
                            </TabsTrigger>
                            <TabsTrigger value="expense" className="gap-2">
                                Chi tiêu ({expenseQuery.isLoading ? '...' : expenseCount})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="income" className="mt-6">
                            <CategoryList
                                type="income"
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAddSubcategory={handleAddSubcategory}
                            />
                        </TabsContent>

                        <TabsContent value="expense" className="mt-6">
                            <CategoryList
                                type="expense"
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAddSubcategory={handleAddSubcategory}
                            />
                        </TabsContent>
                    </Tabs>
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
