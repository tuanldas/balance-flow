export interface IWalletFormData {
    name: string;
    balance: string;
    currency: string;
}

export interface IWalletUpdateFormData {
    name: string;
    currency: string;
}

export interface IWalletDetail {
    id: string;
    name: string;
    description?: string;
    currency: string;
    balance: string | number;
}

export type WalletTransactionType = 'income' | 'expense' | 'transfer';

export interface IWalletTransactionCategory {
    name: string;
    type: WalletTransactionType;
    image?: string;
}

export interface IWalletTransactionItem {
    id: string;
    wallet_id: string;
    category_id?: string;
    created_by?: number;
    amount: string;
    transaction_date: string;
    transaction_type: WalletTransactionType;
    description?: string;
    category?: IWalletTransactionCategory;
}
