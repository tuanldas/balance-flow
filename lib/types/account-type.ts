/**
 * Account Type Type Definitions
 *
 * Defines TypeScript interfaces for Account Type entities and API responses.
 */

/**
 * Account Type entity
 */
export interface AccountType {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * API response for list of account types
 */
export interface AccountTypesResponse {
    success: boolean;
    data: AccountType[];
    message?: string;
}

/**
 * API response for single account type
 */
export interface AccountTypeResponse {
    success: boolean;
    data: AccountType;
    message?: string;
}
