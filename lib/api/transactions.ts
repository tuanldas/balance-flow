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
import { apiClient, extractData } from './client';

export const transactionsApi = {
    /**
     * Get all transactions with optional filters and pagination
     * @param filters - Optional filters for listing transactions
     */
    getAll: async (filters?: TransactionApiFilters): Promise<TransactionsResponse> => {
        const response = await apiClient.get<TransactionsResponse>('/api/transactions', {
            params: filters, // Axios automatically serializes params to query string
        });
        return extractData(response);
    },

    /**
     * Get transaction by ID
     * @param id - Transaction UUID
     */
    getById: async (id: string): Promise<TransactionDetailResponse> => {
        const response = await apiClient.get<TransactionDetailResponse>(`/api/transactions/${id}`);
        return extractData(response);
    },

    /**
     * Get transaction summary (total income, expense, balance)
     * @param filters - Optional date range filters
     */
    getSummary: async (filters?: TransactionSummaryFilters): Promise<TransactionSummaryResponse> => {
        const response = await apiClient.get<TransactionSummaryResponse>('/api/transactions/summary', {
            params: filters,
        });
        return extractData(response);
    },

    /**
     * Create a new transaction
     * @param data - Transaction data to create
     */
    create: async (data: CreateTransactionData): Promise<TransactionDetailResponse> => {
        const response = await apiClient.post<TransactionDetailResponse>('/api/transactions', data);
        return extractData(response);
    },

    /**
     * Update a transaction
     * @param id - Transaction UUID
     * @param data - Transaction data to update
     */
    update: async (id: string, data: UpdateTransactionData): Promise<TransactionDetailResponse> => {
        const response = await apiClient.put<TransactionDetailResponse>(`/api/transactions/${id}`, data);
        return extractData(response);
    },

    /**
     * Delete a transaction
     * @param id - Transaction UUID
     */
    delete: async (id: string): Promise<DeleteTransactionResponse> => {
        const response = await apiClient.delete<DeleteTransactionResponse>(`/api/transactions/${id}`);
        return extractData(response);
    },
};
