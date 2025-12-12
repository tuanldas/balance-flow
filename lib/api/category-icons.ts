import type { CategoryIconsResponse } from '@/lib/types/category-icon';

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

export const categoryIconsApi = {
    /**
     * Get all default category icons
     */
    getAll: async (): Promise<CategoryIconsResponse> => {
        return apiCall<CategoryIconsResponse>('/api/category-icons');
    },
};
