// Transaction types for the Transaction Management Dashboard

import type { Category, CategoryType } from './category';

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'to_review';

// Legacy Transaction interface (used by mock data and UI components)
export interface Transaction {
    id: string;
    date: string; // ISO date string
    merchant: string;
    merchantLogo?: string;
    amount: number;
    currency: string;
    type: TransactionType;
    category: {
        id: string;
        name: string;
        icon: string;
        color: string;
    };
    account: {
        id: string;
        name: string;
        bankName: string;
        lastFourDigits: string;
    };
    status: TransactionStatus;
    notes?: string;
    tags?: string[];
    goal?: string;
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    createdAt: string;
    updatedAt: string;
}

// ============================================
// API Types - Based on backend API structure
// ============================================

export type ApiTransactionStatus = 'pending' | 'completed' | 'cancelled';

// Transaction from API response
export interface ApiTransaction {
    id: string;
    user_id: string;
    category_id: string;
    category: Category;
    amount: number; // Always positive, sign determined by category type
    merchant_name: string | null;
    transaction_date: string; // ISO 8601 datetime
    notes: string | null;
    status: ApiTransactionStatus;
    // Mock data (deferred features)
    account: {
        name: string;
        last_4: string;
    };
    tags: string[];
    created_at: string;
    updated_at: string;
}

// Pagination response structure
export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

// API Response types
export interface TransactionsResponse {
    success: boolean;
    data: ApiTransaction[];
    pagination: Pagination;
}

export interface TransactionDetailResponse {
    success: boolean;
    data: ApiTransaction;
}

export interface TransactionSummaryResponse {
    success: boolean;
    data: {
        total_income: number;
        total_expense: number;
        balance: number;
    };
}

export interface DeleteTransactionResponse {
    success: boolean;
    message: string;
}

// Create/Update transaction data
export interface CreateTransactionData {
    category_id: string;
    amount: number; // Positive number
    transaction_date: string; // ISO 8601 datetime
    merchant_name?: string;
    notes?: string;
    status?: ApiTransactionStatus;
}

export interface UpdateTransactionData {
    category_id?: string;
    amount?: number;
    transaction_date?: string;
    merchant_name?: string;
    notes?: string;
    status?: ApiTransactionStatus;
}

// Query filters for listing transactions
export interface TransactionApiFilters {
    per_page?: number;
    page?: number;
    sort_by?: 'transaction_date' | 'amount' | 'created_at' | 'updated_at';
    sort_direction?: 'asc' | 'desc';
    // Future filters
    start_date?: string;
    end_date?: string;
    category_id?: string;
    status?: ApiTransactionStatus;
    type?: CategoryType;
}

// Summary filters
export interface TransactionSummaryFilters {
    start_date?: string;
    end_date?: string;
}

// Helper function to convert ApiTransaction to legacy Transaction format
export function apiTransactionToLegacy(apiTxn: ApiTransaction): Transaction {
    return {
        id: apiTxn.id,
        date: apiTxn.transaction_date,
        merchant: apiTxn.merchant_name || '',
        // API returns negative amount for expenses, but UI adds +/- sign based on type
        // So we need to use absolute value here
        amount: Math.abs(apiTxn.amount),
        currency: 'VND', // Default currency
        type: apiTxn.category.category_type,
        category: {
            id: apiTxn.category.id,
            name: apiTxn.category.name,
            icon: apiTxn.category.icon,
            color: apiTxn.category.color,
        },
        account: {
            id: 'default',
            name: apiTxn.account.name,
            bankName: 'Default Bank',
            lastFourDigits: apiTxn.account.last_4,
        },
        status: apiTxn.status === 'pending' ? 'pending' : apiTxn.status === 'cancelled' ? 'cancelled' : 'completed',
        notes: apiTxn.notes || undefined,
        tags: apiTxn.tags,
        createdAt: apiTxn.created_at,
        updatedAt: apiTxn.updated_at,
    };
}

export interface TransactionFilters {
    search?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    categoryId?: string;
    categoryIds?: string[];
    accountId?: string;
    accountIds?: string[];
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
    minAmount?: number;
    maxAmount?: number;
    isRecurring?: boolean;
}

export type TransactionSortBy = 'date' | 'amount_asc' | 'amount_desc';

export interface TransactionGroup {
    label: string;
    date: string;
    transactions: Transaction[];
}

export interface SimilarTransaction {
    id: string;
    date: string;
    amount: number;
    currency: string;
}
