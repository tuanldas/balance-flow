import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// ============================================
// Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Get locale from i18n (client-side only)
const getLocale = (): string => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('i18nextLng') || 'vi';
    }
    return 'vi';
};

// Get access token (client-side only)
const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
    return null;
};

// ============================================
// Axios Instance
// ============================================

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// ============================================
// Request Interceptor
// ============================================

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add locale header
        config.headers['Accept-Language'] = getLocale();

        // Add auth token if available
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // For FormData, remove Content-Type to let browser set it with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// ============================================
// Response Interceptor
// ============================================

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Success response - return data directly
        return response;
    },
    async (error: AxiosError) => {
        // Error response handling
        const originalRequest = error.config;

        // Handle 401 Unauthorized (token invalid/expired)
        if (error.response?.status === 401) {
            // Clear token
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
            }

            // Show error toast
            const errorMessage =
                (error.response?.data as { message?: string })?.message || 'Unauthorized. Please login again.';
            toast.error(errorMessage);

            // Redirect to login (only in browser)
            if (typeof window !== 'undefined') {
                window.location.href = '/signin';
            }

            return Promise.reject(error);
        }

        // Handle network errors or 5xx server errors - RETRY LOGIC
        const shouldRetry =
            !error.response || // Network error
            (error.response.status >= 500 && error.response.status < 600); // Server error

        if (shouldRetry && originalRequest && !(originalRequest as { _retry?: boolean })._retry) {
            (originalRequest as { _retry?: boolean; _retryCount?: number })._retry = true;
            (originalRequest as { _retryCount?: number })._retryCount =
                ((originalRequest as { _retryCount?: number })._retryCount || 0) + 1;

            // Retry up to 3 times with exponential backoff
            if ((originalRequest as { _retryCount?: number })._retryCount! <= 3) {
                const delay = Math.pow(2, (originalRequest as { _retryCount: number })._retryCount - 1) * 1000; // 1s, 2s, 4s
                await new Promise((resolve) => setTimeout(resolve, delay));
                return apiClient(originalRequest);
            }
        }

        // Extract error message
        const errorMessage =
            (error.response?.data as { message?: string })?.message || error.message || 'An error occurred';

        // Show error toast (centralized)
        toast.error(errorMessage);

        return Promise.reject(error);
    },
);

// ============================================
// Helper Functions
// ============================================

/**
 * Extract data from standard API response format
 * Backend returns: { success: boolean, message: string, data?: T }
 */
export const extractData = <T>(response: AxiosResponse): T => {
    return response.data;
};

/**
 * Create axios instance without interceptors (for special cases)
 * Use this for silent error handling (e.g., fetchCurrentUser)
 */
export const createRawClient = (): AxiosInstance => {
    return axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
};

export default apiClient;
