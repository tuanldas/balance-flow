import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/categories';
import type { CategoryFilters, CategoryType, CreateCategoryData, UpdateCategoryData } from '@/lib/types/category';

// Query keys
export const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (filters?: CategoryFilters) => [...categoryKeys.lists(), filters] as const,
    infiniteLists: () => [...categoryKeys.all, 'infinite'] as const,
    infiniteList: (type: CategoryType) => [...categoryKeys.infiniteLists(), type] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (id: string) => [...categoryKeys.details(), id] as const,
    subcategories: (id: string) => [...categoryKeys.all, 'subcategories', id] as const,
};

/**
 * Hook to fetch all categories with optional filters
 */
export function useCategories(filters?: CategoryFilters) {
    return useQuery({
        queryKey: categoryKeys.list(filters),
        queryFn: () => categoriesApi.getAll(filters),
    });
}

/**
 * Hook to fetch categories with infinite scroll pagination
 */
export function useInfiniteCategories(type: CategoryType, perPage = 10) {
    return useInfiniteQuery({
        queryKey: categoryKeys.infiniteList(type),
        queryFn: ({ pageParam = 1 }) =>
            categoriesApi.getAll({
                type,
                page: pageParam,
                per_page: perPage,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { current_page, last_page } = lastPage.pagination;
            return current_page < last_page ? current_page + 1 : undefined;
        },
    });
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategory(id: string, enabled = true) {
    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: () => categoriesApi.getById(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook to fetch subcategories of a category
 */
export function useSubcategories(id: string, enabled = true) {
    return useQuery({
        queryKey: categoryKeys.subcategories(id),
        queryFn: () => categoriesApi.getSubcategories(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook to create a new category
 */
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCategoryData) => categoriesApi.create(data),
        onSuccess: () => {
            // Invalidate and refetch categories list (both regular and infinite)
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.infiniteLists() });
        },
    });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) => categoriesApi.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidate the specific category detail
            queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
            // Invalidate the categories list (both regular and infinite)
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.infiniteLists() });
        },
    });
}

/**
 * Hook to partially update a category
 */
export function usePatchCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<UpdateCategoryData> }) => categoriesApi.patch(id, data),
        onSuccess: (_, variables) => {
            // Invalidate the specific category detail
            queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
            // Invalidate the categories list (both regular and infinite)
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.infiniteLists() });
        },
    });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            // Invalidate and refetch categories list (both regular and infinite)
            queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: categoryKeys.infiniteLists() });
        },
    });
}
