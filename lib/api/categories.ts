import type {
    CategoriesResponse,
    CategoryDetailResponse,
    CategoryFilters,
    CreateCategoryData,
    DeleteCategoryResponse,
    UpdateCategoryData,
} from '@/lib/types/category';

// Get base URL from environment
const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
};

// Get locale from i18n
const getLocale = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('i18nextLng') || 'vi';
    }
    return 'vi';
};

// Get access token
const getAccessToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
    return null;
};

// API call helper
const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const headers: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': getLocale(),
    };

    const token = getAccessToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const categoriesApi = {
    /**
     * Get all categories with optional filters
     */
    getAll: async (filters?: CategoryFilters): Promise<CategoriesResponse> => {
        const params = new URLSearchParams();

        if (filters?.type) {
            params.append('type', filters.type);
        }
        if (filters?.per_page) {
            params.append('per_page', filters.per_page.toString());
        }
        if (filters?.page) {
            params.append('page', filters.page.toString());
        }

        const queryString = params.toString();
        const endpoint = `/api/categories${queryString ? `?${queryString}` : ''}`;

        return apiCall<CategoriesResponse>(endpoint);
    },

    /**
     * Get category by ID
     */
    getById: async (id: string): Promise<CategoryDetailResponse> => {
        return apiCall<CategoryDetailResponse>(`/api/categories/${id}`);
    },

    /**
     * Get subcategories of a category
     */
    getSubcategories: async (id: string): Promise<CategoriesResponse> => {
        return apiCall<CategoriesResponse>(`/api/categories/${id}/subcategories`);
    },

    /**
     * Create a new category
     */
    create: async (data: CreateCategoryData): Promise<CategoryDetailResponse> => {
        return apiCall<CategoryDetailResponse>('/api/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a category (PUT)
     */
    update: async (id: string, data: UpdateCategoryData): Promise<CategoryDetailResponse> => {
        return apiCall<CategoryDetailResponse>(`/api/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Partial update a category (PATCH)
     */
    patch: async (id: string, data: Partial<UpdateCategoryData>): Promise<CategoryDetailResponse> => {
        return apiCall<CategoryDetailResponse>(`/api/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a category
     */
    delete: async (id: string): Promise<DeleteCategoryResponse> => {
        return apiCall<DeleteCategoryResponse>(`/api/categories/${id}`, {
            method: 'DELETE',
        });
    },
};
