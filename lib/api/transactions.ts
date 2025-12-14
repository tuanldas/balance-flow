import type {
    CreateTransactionData,
    DeleteTransactionResponse,
    TransactionApiFilters,
    TransactionDetailResponse,
    TransactionsResponse,
    TransactionSummaryFilters,
    TransactionSummaryResponse,
    UpdateTransactionData,
} from '@/lib/types/transaction';

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

// API call helper for JSON requests
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

export const transactionsApi = {
    /**
     * Get all transactions with optional filters and pagination
     * @param filters - Optional filters for listing transactions
     */
    getAll: async (filters?: TransactionApiFilters): Promise<TransactionsResponse> => {
        const params = new URLSearchParams();

        if (filters?.per_page) {
            params.append('per_page', filters.per_page.toString());
        }
        if (filters?.page) {
            params.append('page', filters.page.toString());
        }
        if (filters?.sort_by) {
            params.append('sort_by', filters.sort_by);
        }
        if (filters?.sort_direction) {
            params.append('sort_direction', filters.sort_direction);
        }
        if (filters?.start_date) {
            params.append('start_date', filters.start_date);
        }
        if (filters?.end_date) {
            params.append('end_date', filters.end_date);
        }
        if (filters?.category_id) {
            params.append('category_id', filters.category_id);
        }
        if (filters?.status) {
            params.append('status', filters.status);
        }
        if (filters?.type) {
            params.append('type', filters.type);
        }

        const queryString = params.toString();
        const endpoint = `/api/transactions${queryString ? `?${queryString}` : ''}`;

        return apiCall<TransactionsResponse>(endpoint);
    },

    /**
     * Get transaction by ID
     * @param id - Transaction UUID
     */
    getById: async (id: string): Promise<TransactionDetailResponse> => {
        return apiCall<TransactionDetailResponse>(`/api/transactions/${id}`);
    },

    /**
     * Get transaction summary (total income, expense, balance)
     * @param filters - Optional date range filters
     */
    getSummary: async (filters?: TransactionSummaryFilters): Promise<TransactionSummaryResponse> => {
        const params = new URLSearchParams();

        if (filters?.start_date) {
            params.append('start_date', filters.start_date);
        }
        if (filters?.end_date) {
            params.append('end_date', filters.end_date);
        }

        const queryString = params.toString();
        const endpoint = `/api/transactions/summary${queryString ? `?${queryString}` : ''}`;

        return apiCall<TransactionSummaryResponse>(endpoint);
    },

    /**
     * Create a new transaction
     * @param data - Transaction data to create
     */
    create: async (data: CreateTransactionData): Promise<TransactionDetailResponse> => {
        return apiCall<TransactionDetailResponse>('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update a transaction
     * @param id - Transaction UUID
     * @param data - Transaction data to update
     */
    update: async (id: string, data: UpdateTransactionData): Promise<TransactionDetailResponse> => {
        return apiCall<TransactionDetailResponse>(`/api/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a transaction
     * @param id - Transaction UUID
     */
    delete: async (id: string): Promise<DeleteTransactionResponse> => {
        return apiCall<DeleteTransactionResponse>(`/api/transactions/${id}`, {
            method: 'DELETE',
        });
    },
};
