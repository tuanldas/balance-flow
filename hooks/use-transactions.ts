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
        // Optimistic update
        onMutate: async () => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: transactionKeys.infiniteLists() });

            // Snapshot previous value
            const previousData = queryClient.getQueryData(transactionKeys.infiniteLists());

            // Optimistically add to cache (we don't have the full transaction yet, so we'll wait for server response)
            // For create, we can't really optimistically add because we don't have the ID yet
            // So we'll just show loading state and rely on refetch

            return { previousData };
        },
        // If mutation fails, rollback
        onError: (_err, _newTransaction, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(transactionKeys.infiniteLists(), context.previousData);
            }
        },
        // Always refetch after success or error
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.infiniteLists() });
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
        // Optimistic update
        onMutate: async ({ id, data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: transactionKeys.detail(id) });
            await queryClient.cancelQueries({ queryKey: transactionKeys.infiniteLists() });

            // Snapshot previous values
            const previousTransaction = queryClient.getQueryData(transactionKeys.detail(id));
            const previousInfiniteData = queryClient.getQueryData(transactionKeys.infiniteLists());

            // Optimistically update the transaction detail
            queryClient.setQueryData(transactionKeys.detail(id), (old: unknown) => {
                if (!old || typeof old !== 'object') return old;
                const oldData = old as { data: Record<string, unknown> };
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        ...data,
                    },
                };
            });

            // Optimistically update in infinite list
            queryClient.setQueriesData({ queryKey: transactionKeys.infiniteLists() }, (old: unknown) => {
                if (!old || typeof old !== 'object') return old;
                const oldData = old as { pages: Array<{ data: Array<{ id: string }> }> };
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        data: page.data.map((transaction) =>
                            transaction.id === id ? { ...transaction, ...data } : transaction,
                        ),
                    })),
                };
            });

            return { previousTransaction, previousInfiniteData };
        },
        // If mutation fails, rollback
        onError: (_err, { id }, context) => {
            if (context?.previousTransaction) {
                queryClient.setQueryData(transactionKeys.detail(id), context.previousTransaction);
            }
            if (context?.previousInfiniteData) {
                queryClient.setQueriesData({ queryKey: transactionKeys.infiniteLists() }, context.previousInfiniteData);
            }
        },
        // Always refetch after success or error to ensure sync
        onSettled: (_, __, variables) => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.infiniteLists() });
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
        // Optimistic update
        onMutate: async (deletedId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: transactionKeys.infiniteLists() });
            await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

            // Snapshot previous value
            const previousInfiniteData = queryClient.getQueryData(transactionKeys.infiniteLists());
            const previousListData = queryClient.getQueryData(transactionKeys.lists());

            // Optimistically remove from infinite list
            queryClient.setQueriesData({ queryKey: transactionKeys.infiniteLists() }, (old: unknown) => {
                if (!old || typeof old !== 'object') return old;
                const oldData = old as {
                    pages: Array<{ data: Array<{ id: string }>; pagination: { total: number } }>;
                };
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        data: page.data.filter((transaction) => transaction.id !== deletedId),
                        pagination: {
                            ...page.pagination,
                            total: page.pagination.total - 1,
                        },
                    })),
                };
            });

            return { previousInfiniteData, previousListData };
        },
        // If mutation fails, rollback
        onError: (_err, _deletedId, context) => {
            if (context?.previousInfiniteData) {
                queryClient.setQueriesData({ queryKey: transactionKeys.infiniteLists() }, context.previousInfiniteData);
            }
            if (context?.previousListData) {
                queryClient.setQueriesData({ queryKey: transactionKeys.lists() }, context.previousListData);
            }
        },
        // Always refetch after success or error to ensure sync
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.infiniteLists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
        },
    });
}

/**
 * Hook to delete multiple transactions at once (bulk delete)
 */
export function useBulkDeleteTransactions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ids: string[]) => {
            // Delete all transactions in parallel
            await Promise.all(ids.map((id) => transactionsApi.delete(id)));
        },
        // Optimistic update
        onMutate: async (deletedIds) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: transactionKeys.infiniteLists() });
            await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

            // Snapshot previous values
            const previousInfiniteData = queryClient.getQueryData(transactionKeys.infiniteLists());
            const previousListData = queryClient.getQueryData(transactionKeys.lists());

            // Optimistically remove from infinite list
            queryClient.setQueriesData({ queryKey: transactionKeys.infiniteLists() }, (old: unknown) => {
                if (!old || typeof old !== 'object') return old;
                const oldData = old as {
                    pages: Array<{ data: Array<{ id: string }>; pagination: { total: number } }>;
                };
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        data: page.data.filter((transaction) => !deletedIds.includes(transaction.id)),
                        pagination: {
                            ...page.pagination,
                            total: page.pagination.total - deletedIds.length,
                        },
                    })),
                };
            });

            return { previousInfiniteData, previousListData };
        },
        // If mutation fails, rollback
        onError: (_err, _deletedIds, context) => {
            if (context?.previousInfiniteData) {
                queryClient.setQueriesData({ queryKey: transactionKeys.infiniteLists() }, context.previousInfiniteData);
            }
            if (context?.previousListData) {
                queryClient.setQueriesData({ queryKey: transactionKeys.lists() }, context.previousListData);
            }
        },
        // Always refetch after success or error to ensure sync
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.infiniteLists() });
            queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
        },
    });
}
