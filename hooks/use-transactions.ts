import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api/transactions';
import type {
    CreateTransactionData,
    TransactionApiFilters,
    TransactionSummaryFilters,
    UpdateTransactionData,
} from '@/lib/types/transaction';

// Query keys
export const transactionKeys = {
    all: ['transactions'] as const,
    lists: () => [...transactionKeys.all, 'list'] as const,
    list: (filters?: TransactionApiFilters) => [...transactionKeys.lists(), filters] as const,
    infiniteLists: () => [...transactionKeys.all, 'infinite'] as const,
    infiniteList: (filters?: Omit<TransactionApiFilters, 'page'>) =>
        [...transactionKeys.infiniteLists(), filters] as const,
    details: () => [...transactionKeys.all, 'detail'] as const,
    detail: (id: string) => [...transactionKeys.details(), id] as const,
    summaries: () => [...transactionKeys.all, 'summary'] as const,
    summary: (filters?: TransactionSummaryFilters) => [...transactionKeys.summaries(), filters] as const,
};

/**
 * Hook to fetch all transactions with optional filters
 */
export function useTransactions(filters?: TransactionApiFilters) {
    return useQuery({
        queryKey: transactionKeys.list(filters),
        queryFn: () => transactionsApi.getAll(filters),
    });
}

/**
 * Hook to fetch transactions with infinite scroll pagination
 */
export function useInfiniteTransactions(filters?: Omit<TransactionApiFilters, 'page'>, perPage = 15) {
    return useInfiniteQuery({
        queryKey: transactionKeys.infiniteList(filters),
        queryFn: ({ pageParam = 1 }) =>
            transactionsApi.getAll({
                ...filters,
                page: pageParam,
                per_page: perPage,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { current_page, last_page } = lastPage.pagination;
            return current_page < last_page ? current_page + 1 : undefined;
        },
    });
}

/**
 * Hook to fetch a single transaction by ID
 */
export function useTransaction(id: string, enabled = true) {
    return useQuery({
        queryKey: transactionKeys.detail(id),
        queryFn: () => transactionsApi.getById(id),
        enabled: enabled && !!id,
    });
}

/**
 * Hook to fetch transaction summary
 */
export function useTransactionSummary(filters?: TransactionSummaryFilters) {
    return useQuery({
        queryKey: transactionKeys.summary(filters),
        queryFn: () => transactionsApi.getSummary(filters),
    });
}

/**
 * Hook to create a new transaction
 */
export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTransactionData) => transactionsApi.create(data),
        onSuccess: () => {
            // Invalidate and refetch transactions list (both regular and infinite)
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.infiniteLists() });
            // Also invalidate summary as totals may have changed
            queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
        },
    });
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTransactionData }) => transactionsApi.update(id, data),
        onSuccess: (_, variables) => {
            // Invalidate the specific transaction detail
            queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
            // Invalidate the transactions list (both regular and infinite)
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.infiniteLists() });
            // Also invalidate summary as totals may have changed
            queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
        },
    });
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => transactionsApi.delete(id),
        onSuccess: () => {
            // Invalidate and refetch transactions list (both regular and infinite)
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.infiniteLists() });
            // Also invalidate summary as totals may have changed
            queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
        },
    });
}
