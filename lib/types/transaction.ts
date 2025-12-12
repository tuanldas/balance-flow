// Transaction types for the Transaction Management Dashboard

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'completed' | 'pending' | 'cancelled' | 'to_review';

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

export interface TransactionFilters {
    search?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    categoryId?: string;
    accountId?: string;
    dateFrom?: string;
    dateTo?: string;
    tags?: string[];
    minAmount?: number;
    maxAmount?: number;
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
