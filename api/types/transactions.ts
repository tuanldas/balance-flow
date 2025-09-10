import { type IWalletTransactionItem, type WalletTransactionType } from '@/api/types/wallet';

export interface IUserTransactionCategory {
    id: string;
    name: string;
    type: WalletTransactionType;
    image?: string;
}

export interface IUserTransactionWalletInfo {
    id: string;
    name: string;
    balance: string | number;
    currency?: string;
}

export interface IUserTransactionItem extends Omit<IWalletTransactionItem, 'category'> {
    category: IUserTransactionCategory;
    wallet: IUserTransactionWalletInfo;
}
