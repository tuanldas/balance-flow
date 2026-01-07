/**
 * Account Type Definitions
 *
 * Defines TypeScript interfaces for Account entities and API responses.
 */

import type { AccountType } from './account-type';

/**
 * Account entity
 */
export interface Account {
    id: string;
    user_id: string;
    account_type_id: string;
    name: string;
    balance: string;
    currency: string;
    icon: string;
    color: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    // Relationship
    account_type?: AccountType;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

/**
 * API response for paginated list of accounts
 */
export interface AccountsResponse {
    success: boolean;
    data: Account[];
    pagination: PaginationMeta;
    message?: string;
}

/**
 * API response for single account
 */
export interface AccountResponse {
    success: boolean;
    data: Account;
    message?: string;
}

/**
 * API response for total balance
 */
export interface TotalBalanceResponse {
    success: boolean;
    data: {
        total_balance: string;
        currency?: string;
        accounts_count: number;
    };
    message?: string;
}

/**
 * Query parameters for listing accounts
 */
export interface AccountsQueryParams {
    per_page?: number;
    page?: number;
    account_type_id?: string;
    is_active?: 0 | 1;
}

/**
 * Data for creating an account
 */
export interface CreateAccountData {
    account_type_id: string;
    name: string;
    balance: number;
    currency: string;
    icon?: string;
    color?: string;
    description?: string;
    is_active?: boolean;
}

/**
 * Data for updating an account
 */
export interface UpdateAccountData {
    name?: string;
    icon?: string;
    color?: string;
    description?: string;
    is_active?: boolean;
}
