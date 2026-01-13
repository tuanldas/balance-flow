/**
 * Account Types React Query Hooks
 *
 * Custom hooks for account types data fetching and caching.
 */

import { useQuery } from '@tanstack/react-query';
import { accountTypesApi } from '@/lib/api/account-types';

/**
 * Query keys for account types
 */
export const accountTypeKeys = {
    all: ['account-types'] as const,
};

/**
 * Hook to fetch all account types
 */
export function useAccountTypes() {
    return useQuery({
        queryKey: accountTypeKeys.all,
        queryFn: () => accountTypesApi.getAll(),
        staleTime: 1000 * 60 * 30, // 30 minutes - account types rarely change
    });
}
