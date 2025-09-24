import ApiCaller from '@/api/apiCaller';
import { type IPaginatedResponse } from '@/api/types/pagination';
import {
    type IWalletDetail,
    type IWalletFormData,
    type IWalletTransactionItem,
    type IWalletUpdateFormData,
    type WalletTransactionType,
} from '@/api/types/wallet';
import { appendDefinedParams } from '@/utils/http';
import type { AxiosResponse } from 'axios';

export const callApiGetWallets = async ({ pageParam }: { pageParam: number }) => {
    const { data } = (await new ApiCaller().setUrl(`/wallets?page=${pageParam}`).get()) as AxiosResponse<unknown>;
    return data;
};

export const callApiGetWalletOptions = async (params?: { search?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    appendDefinedParams(searchParams, { search: params?.search, limit: params?.limit });
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const { data } = (await new ApiCaller().setUrl(`/wallets-options${qs}`).get()) as AxiosResponse<unknown>;
    return data;
};

export const callApiGetSidebarWallets = async () => {
    const { data } = (await new ApiCaller().setUrl('/wallets-sidebar').get()) as AxiosResponse<unknown>;
    return data;
};

export const callApiGetWalletById = async (walletId: string) => {
    const response = (await new ApiCaller().setUrl(`/wallets/${walletId}`).get()) as AxiosResponse<unknown>;
    const apiData = response.data as { data?: unknown } | null;
    return (apiData?.data ?? null) as IWalletDetail | null;
};

export const callApiGetWalletTransactions = async (
    walletId: string,
    params?: {
        type?: WalletTransactionType;
        start?: string;
        end?: string;
        per_page?: number;
        page?: number;
        sort?: 'transaction_date' | '-transaction_date' | 'amount' | '-amount';
    },
): Promise<IPaginatedResponse<IWalletTransactionItem>> => {
    const searchParams = new URLSearchParams();

    appendDefinedParams(searchParams, {
        'filter[type]': params?.type,
        'filter[date_between][start]': params?.start,
        'filter[date_between][end]': params?.end,
        sort: params?.sort,
        per_page: params?.per_page,
        page: params?.page,
    });

    const query = searchParams.toString();
    const qs = query ? `?${query}` : '';
    const response = (await new ApiCaller()
        .setUrl(`/wallets/${walletId}/transactions${qs}`)
        .get()) as AxiosResponse<unknown>;
    const apiData = response.data as
        | { data?: IPaginatedResponse<IWalletTransactionItem> }
        | IPaginatedResponse<IWalletTransactionItem>;
    const payload = (apiData as { data?: IPaginatedResponse<IWalletTransactionItem> })?.data ?? apiData;
    return payload as IPaginatedResponse<IWalletTransactionItem>;
};

export const callApiCreateWallet = async (formData: IWalletFormData) => {
    const { data } = (await new ApiCaller().setUrl('/wallets').post({ data: formData })) as AxiosResponse<unknown>;
    return data;
};

export const callApiUpdateWallet = async (walletId: string, formData: IWalletUpdateFormData) => {
    const { data } = (await new ApiCaller()
        .setUrl(`/wallets/${walletId}`)
        .put({ data: formData })) as AxiosResponse<unknown>;
    return data;
};

export const callApiDeleteWallet = async (walletId: string) => {
    const { data } = (await new ApiCaller().setUrl(`/wallets/${walletId}`).delete()) as AxiosResponse<unknown>;
    return data;
};

export interface CreateWalletTransactionPayload {
    category_id: string;
    amount: number | string;
    transaction_date: string; // YYYY-MM-DD or ISO
    transaction_type: WalletTransactionType;
    description?: string;
}

export const callApiCreateWalletTransaction = async (walletId: string, payload: CreateWalletTransactionPayload) => {
    const { data } = (await new ApiCaller()
        .setUrl(`/wallets/${walletId}/transactions`)
        .post({ data: payload })) as AxiosResponse<unknown>;
    return data;
};
