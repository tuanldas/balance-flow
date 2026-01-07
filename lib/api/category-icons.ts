import type { CategoryIconsResponse } from '@/lib/types/category-icon';
import { apiClient, extractData } from './client';

export const categoryIconsApi = {
    /**
     * Get all default category icons
     */
    getAll: async (): Promise<CategoryIconsResponse> => {
        const response = await apiClient.get<CategoryIconsResponse>('/api/category-icons');
        return extractData(response);
    },
};
