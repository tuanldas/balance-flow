'use client';

import { ReactNode, useState } from 'react';
import { RiErrorWarningFill } from '@remixicon/react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

/**
 * Xác định loại lỗi dựa trên error object
 */
const getErrorType = (error: Error): string => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
        return 'network';
    }
    if (message.includes('timeout')) {
        return 'timeout';
    }
    if (message.includes('401') || message.includes('unauthorized')) {
        return 'unauthorized';
    }
    if (message.includes('404') || message.includes('not found')) {
        return 'notFound';
    }
    if (message.includes('500') || message.includes('server')) {
        return 'server';
    }

    return 'default';
};

const QueryProvider = ({ children }: { children: ReactNode }) => {
    const { t } = useTranslation();

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Thời gian cache data trước khi được coi là stale
                        staleTime: 5 * 60 * 1000, // 5 phút
                        // Thời gian giữ cache trong memory
                        gcTime: 10 * 60 * 1000, // 10 phút (trước đây là cacheTime)
                        // Retry failed requests
                        retry: 1,
                        // Không refetch khi window focus
                        refetchOnWindowFocus: false,
                        // Không refetch khi reconnect
                        refetchOnReconnect: false,
                    },
                    mutations: {
                        // Retry failed mutations
                        retry: 0,
                    },
                },
                queryCache: new QueryCache({
                    onError: (error) => {
                        const errorType = getErrorType(error);
                        const message = t(`common.errors.query.${errorType}`);

                        toast.custom(
                            () => (
                                <Alert variant="mono" icon="destructive" close={false}>
                                    <AlertIcon>
                                        <RiErrorWarningFill />
                                    </AlertIcon>
                                    <AlertTitle>{message}</AlertTitle>
                                </Alert>
                            ),
                            {
                                position: 'top-center',
                                duration: 5000,
                            },
                        );
                    },
                }),
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        </QueryClientProvider>
    );
};

export { QueryProvider };
