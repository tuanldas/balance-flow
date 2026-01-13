/**
 * Accounts React Query Hooks
 *
 * Custom hooks for accounts data fetching, mutations, and caching with optimistic updates.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/lib/api/accounts';
import type { AccountsQueryParams, CreateAccountData, UpdateAccountData } from '@/lib/types/account';

/**
 * Query keys for accounts
 */
export const accountKeys = {
    all: ['accounts'] as const,
    lists: () => [...accountKeys.all, 'list'] as const,
    list: (params?: AccountsQueryParams) => [...accountKeys.lists(), params] as const,
    details: () => [...accountKeys.all, 'detail'] as const,
    detail: (id: string) => [...accountKeys.details(), id] as const,
    totalBalance: () => [...accountKeys.all, 'total-balance'] as const,
};

/**
 * Hook to fetch paginated accounts
 */
export function useAccounts(params?: AccountsQueryParams) {
    return useQuery({
        queryKey: accountKeys.list(params),
        queryFn: () => accountsApi.getAll(params),
    });
}

/**
 * Hook to fetch a single account by ID
 */
export function useAccount(id: string) {
    return useQuery({
        queryKey: accountKeys.detail(id),
        queryFn: () => accountsApi.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook to fetch total balance
 */
export function useTotalBalance(currency?: string) {
    return useQuery({
        queryKey: [...accountKeys.totalBalance(), currency],
        queryFn: () => accountsApi.getTotalBalance(currency),
    });
}

/**
 * Hook to create a new account with optimistic update
 */
export function useCreateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAccountData) => accountsApi.create(data),

        onMutate: async () => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: accountKeys.lists() });
        },

        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
            queryClient.invalidateQueries({ queryKey: accountKeys.totalBalance() });
        },
    });
}

/**
 * Hook to update an account with optimistic update
 */
export function useUpdateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAccountData }) => accountsApi.update(id, data),

        onMutate: async ({ id, data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: accountKeys.detail(id) });
            await queryClient.cancelQueries({ queryKey: accountKeys.lists() });

            // Snapshot previous values
            const previousAccount = queryClient.getQueryData(accountKeys.detail(id));
            const previousLists = queryClient.getQueryData(accountKeys.lists());

            // Optimistically update cache
            queryClient.setQueryData(accountKeys.detail(id), (old: unknown) => {
                if (!old || typeof old !== 'object') return old;
                const oldData = old as { success: boolean; data: { id: string } };
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        ...data,
                    },
                };
            });

            return { previousAccount, previousLists };
        },

        onError: (_err, { id }, context) => {
            // Rollback on error
            if (context?.previousAccount) {
                queryClient.setQueryData(accountKeys.detail(id), context.previousAccount);
            }
            if (context?.previousLists) {
                queryClient.setQueryData(accountKeys.lists(), context.previousLists);
            }
        },

        onSettled: (_, __, { id }) => {
            // Always refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: accountKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
            queryClient.invalidateQueries({ queryKey: accountKeys.totalBalance() });
        },
    });
}

/**
 * Hook to delete an account with optimistic update
 */
export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => accountsApi.delete(id),

        onMutate: async (deletedId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: accountKeys.lists() });

            // Snapshot previous values
            const previousLists = queryClient.getQueryData(accountKeys.lists());

            // Optimistically remove from cache
            queryClient.setQueriesData({ queryKey: accountKeys.lists() }, (old: unknown) => {
                if (!old || typeof old !== 'object') return old;
                const oldData = old as {
                    success: boolean;
                    data: Array<{ id: string }>;
                    pagination: { total: number };
                };
                return {
                    ...oldData,
                    data: oldData.data.filter((account) => account.id !== deletedId),
                    pagination: {
                        ...oldData.pagination,
                        total: oldData.pagination.total - 1,
                    },
                };
            });

            return { previousLists };
        },

        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousLists) {
                queryClient.setQueryData(accountKeys.lists(), context.previousLists);
            }
        },

        onSettled: () => {
            // Always refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
            queryClient.invalidateQueries({ queryKey: accountKeys.totalBalance() });
        },
    });
}

/**
 * Hook to toggle account active status with optimistic update
 */
export function useToggleAccountActive() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => accountsApi.toggleActive(id),

        onMutate: async (id) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: accountKeys.detail(id) });
            await queryClient.cancelQueries({ queryKey: accountKeys.lists() });

            // Snapshot previous values
            const previousAccount = queryClient.getQueryData(accountKeys.detail(id));
            const previousLists = queryClient.getQueryData(accountKeys.lists());

            // Optimistically toggle is_active
            queryClient.setQueryData(accountKeys.detail(id), (old: unknown) => {
                if (!old || typeof old !== 'object') return old;
                const oldData = old as { success: boolean; data: { id: string; is_active: boolean } };
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        is_active: !oldData.data.is_active,
                    },
                };
            });

            return { previousAccount, previousLists };
        },

        onError: (_err, id, context) => {
            // Rollback on error
            if (context?.previousAccount) {
                queryClient.setQueryData(accountKeys.detail(id), context.previousAccount);
            }
            if (context?.previousLists) {
                queryClient.setQueryData(accountKeys.lists(), context.previousLists);
            }
        },

        onSettled: (_, __, id) => {
            // Always refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: accountKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
            queryClient.invalidateQueries({ queryKey: accountKeys.totalBalance() });
        },
    });
}

/**
 * Hook to bulk delete accounts
 */
export function useBulkDeleteAccounts() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ids: string[]) => {
            // Delete all in parallel
            await Promise.all(ids.map((id) => accountsApi.delete(id)));
        },

        onMutate: async (deletedIds) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: accountKeys.lists() });

            // Snapshot previous values
            const previousLists = queryClient.getQueryData(accountKeys.lists());

            // Optimistically remove all from cache
            queryClient.setQueriesData({ queryKey: accountKeys.lists() }, (old: unknown) => {
                if (!old || typeof old !== 'object') return old;
                const oldData = old as {
                    success: boolean;
                    data: Array<{ id: string }>;
                    pagination: { total: number };
                };
                return {
                    ...oldData,
                    data: oldData.data.filter((account) => !deletedIds.includes(account.id)),
                    pagination: {
                        ...oldData.pagination,
                        total: oldData.pagination.total - deletedIds.length,
                    },
                };
            });

            return { previousLists };
        },

        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousLists) {
                queryClient.setQueryData(accountKeys.lists(), context.previousLists);
            }
        },

        onSettled: () => {
            // Always refetch to ensure sync
            queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
            queryClient.invalidateQueries({ queryKey: accountKeys.totalBalance() });
        },
    });
}
