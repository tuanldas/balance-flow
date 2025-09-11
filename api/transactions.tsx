import ApiCaller from '@/api/apiCaller.tsx';
import { type IPaginatedResponse } from '@/api/types/pagination';
import { type IUserTransactionItem } from '@/api/types/transactions';
import { type WalletTransactionType } from '@/api/types/wallet';
import { appendDefinedParams } from '@/utils/http';

export const callApiGetUserTransactions = async (params?: {
    type?: WalletTransactionType;
    start?: string;
    end?: string;
    wallet_id?: string;
    category_id?: string;
    search?: string;
    sort?: 'transaction_date' | '-transaction_date' | 'amount' | '-amount';
    per_page?: number;
    page?: number;
}): Promise<IPaginatedResponse<IUserTransactionItem>> => {
    const searchParams = new URLSearchParams();

    appendDefinedParams(searchParams, {
        'filter[type]': params?.type,
        'filter[date_between][start]': params?.start,
        'filter[date_between][end]': params?.end,
        'filter[wallet_id]': params?.wallet_id,
        'filter[category_id]': params?.category_id,
        'filter[search]': params?.search,
        sort: params?.sort,
        per_page: params?.per_page,
        page: params?.page,
    });

    const query = searchParams.toString();
    const qs = query ? `?${query}` : '';
    const { data } = await new ApiCaller().setUrl(`/user/transactions${qs}`).get();
    const payload = (data as { data?: unknown })?.data ?? data;
    return payload as IPaginatedResponse<IUserTransactionItem>;
};
