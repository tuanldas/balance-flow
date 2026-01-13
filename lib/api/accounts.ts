/**
 * Accounts API
 *
 * API functions for accounts management.
 */

import type {
    AccountResponse,
    AccountsQueryParams,
    AccountsResponse,
    CreateAccountData,
    TotalBalanceResponse,
    UpdateAccountData,
} from '@/lib/types/account';
import { apiClient } from './client';

/**
 * Get paginated list of accounts
 */
export async function getAccounts(params?: AccountsQueryParams): Promise<AccountsResponse> {
    const response = await apiClient.get<AccountsResponse>('/api/accounts', { params });
    return response.data;
}

/**
 * Get account by ID
 */
export async function getAccountById(id: string): Promise<AccountResponse> {
    const response = await apiClient.get<AccountResponse>(`/api/accounts/${id}`);
    return response.data;
}

/**
 * Create new account
 */
export async function createAccount(data: CreateAccountData): Promise<AccountResponse> {
    const response = await apiClient.post<AccountResponse>('/api/accounts', data);
    return response.data;
}

/**
 * Update account
 */
export async function updateAccount(id: string, data: UpdateAccountData): Promise<AccountResponse> {
    const response = await apiClient.put<AccountResponse>(`/api/accounts/${id}`, data);
    return response.data;
}

/**
 * Delete account
 */
export async function deleteAccount(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/api/accounts/${id}`);
    return response.data;
}

/**
 * Get total balance across all active accounts
 */
export async function getTotalBalance(currency?: string): Promise<TotalBalanceResponse> {
    const params = currency ? { currency } : undefined;
    const response = await apiClient.get<TotalBalanceResponse>('/api/accounts/balance/total', { params });
    return response.data;
}

/**
 * Toggle account active status
 */
export async function toggleAccountActive(id: string): Promise<AccountResponse> {
    const response = await apiClient.post<AccountResponse>(`/api/accounts/${id}/toggle-active`);
    return response.data;
}

// Export as named object for consistent usage
export const accountsApi = {
    getAll: getAccounts,
    getById: getAccountById,
    create: createAccount,
    update: updateAccount,
    delete: deleteAccount,
    getTotalBalance,
    toggleActive: toggleAccountActive,
};
