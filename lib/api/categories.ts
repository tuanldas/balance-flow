import type {
    CategoriesResponse,
    CategoryDetailResponse,
    CategoryFilters,
    CreateCategoryData,
    DeleteCategoryResponse,
    UpdateCategoryData,
} from '@/lib/types/category';
import { apiClient, extractData } from './client';

// Convert CreateCategoryData/UpdateCategoryData to FormData
const toFormData = (data: CreateCategoryData | UpdateCategoryData, method?: 'PUT'): FormData => {
    const formData = new FormData();

    // Laravel method spoofing for PUT with file uploads
    if (method) {
        formData.append('_method', method);
    }

    if (data.name !== undefined) {
        formData.append('name', data.name);
    }

    if ('category_type' in data && data.category_type !== undefined) {
        formData.append('category_type', data.category_type);
    }

    if (data.parent_id !== undefined && data.parent_id !== null) {
        formData.append('parent_id', data.parent_id);
    }

    if (data.color !== undefined) {
        formData.append('color', data.color);
    }

    // icon_file takes priority over icon
    if (data.icon_file) {
        formData.append('icon_file', data.icon_file);
    } else if (data.icon !== undefined) {
        formData.append('icon', data.icon);
    }

    return formData;
};

export const categoriesApi = {
    /**
     * Get all categories with optional filters
     */
    getAll: async (filters?: CategoryFilters): Promise<CategoriesResponse> => {
        const response = await apiClient.get<CategoriesResponse>('/api/categories', {
            params: filters,
        });
        return extractData(response);
    },

    /**
     * Get category by ID
     */
    getById: async (id: string): Promise<CategoryDetailResponse> => {
        const response = await apiClient.get<CategoryDetailResponse>(`/api/categories/${id}`);
        return extractData(response);
    },

    /**
     * Get subcategories of a category
     */
    getSubcategories: async (id: string): Promise<CategoriesResponse> => {
        const response = await apiClient.get<CategoriesResponse>(`/api/categories/${id}/subcategories`);
        return extractData(response);
    },

    /**
     * Create a new category
     * Uses FormData to support file uploads
     */
    create: async (data: CreateCategoryData): Promise<CategoryDetailResponse> => {
        const formData = toFormData(data);
        const response = await apiClient.post<CategoryDetailResponse>('/api/categories', formData);
        // Axios automatically sets Content-Type: multipart/form-data with boundary
        return extractData(response);
    },

    /**
     * Update a category (PUT)
     * Uses POST with _method=PUT to support file uploads (Laravel method spoofing)
     */
    update: async (id: string, data: UpdateCategoryData): Promise<CategoryDetailResponse> => {
        const formData = toFormData(data, 'PUT');
        const response = await apiClient.post<CategoryDetailResponse>(`/api/categories/${id}`, formData);
        return extractData(response);
    },

    /**
     * Partial update a category (PATCH)
     */
    patch: async (id: string, data: Partial<UpdateCategoryData>): Promise<CategoryDetailResponse> => {
        const response = await apiClient.patch<CategoryDetailResponse>(`/api/categories/${id}`, data);
        return extractData(response);
    },

    /**
     * Delete a category
     */
    delete: async (id: string): Promise<DeleteCategoryResponse> => {
        const response = await apiClient.delete<DeleteCategoryResponse>(`/api/categories/${id}`);
        return extractData(response);
    },
};
