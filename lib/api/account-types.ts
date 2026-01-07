/**
 * Account Types API
 *
 * API functions for account types (read-only).
 */

import type { AccountTypesResponse } from '@/lib/types/account-type';
import { apiClient } from './client';

/**
 * Get all account types
 */
export async function getAccountTypes(): Promise<AccountTypesResponse> {
    const response = await apiClient.get<AccountTypesResponse>('/api/account-types');
    return response.data;
}

// Export as named object for consistent usage
export const accountTypesApi = {
    getAll: getAccountTypes,
};
