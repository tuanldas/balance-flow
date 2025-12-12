import { useQuery } from '@tanstack/react-query';
import { categoryIconsApi } from '@/lib/api/category-icons';

// Query keys
export const categoryIconKeys = {
    all: ['category-icons'] as const,
    list: () => [...categoryIconKeys.all, 'list'] as const,
};

/**
 * Hook to fetch all default category icons
 */
export function useCategoryIcons(enabled = true) {
    return useQuery({
        queryKey: categoryIconKeys.list(),
        queryFn: () => categoryIconsApi.getAll(),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes - icons rarely change
    });
}
