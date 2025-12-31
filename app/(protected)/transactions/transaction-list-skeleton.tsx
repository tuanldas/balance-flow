import { Skeleton } from '@/components/ui/skeleton';

export function TransactionListSkeleton() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
                {/* Group 1 - Today */}
                <div>
                    <Skeleton className="h-4 w-24 mb-2 px-1" /> {/* Date label */}
                    <div className="space-y-1">
                        {[1, 2, 3].map((i) => (
                            <div key={`group1-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" /> {/* Icon */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    <Skeleton className="h-4 w-32" /> {/* Category name */}
                                    <Skeleton className="h-3 w-24" /> {/* Date/time */}
                                </div>
                                <Skeleton className="h-5 w-20 ml-auto" /> {/* Amount */}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Group 2 - Yesterday */}
                <div>
                    <Skeleton className="h-4 w-32 mb-2 px-1" /> {/* Date label */}
                    <div className="space-y-1">
                        {[1, 2].map((i) => (
                            <div key={`group2-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                <div className="flex-1 min-w-0 space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-5 w-24 ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Group 3 - Earlier */}
                <div>
                    <Skeleton className="h-4 w-36 mb-2 px-1" /> {/* Date label */}
                    <div className="space-y-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={`group3-${i}`} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                                <div className="flex-1 min-w-0 space-y-2">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                                <Skeleton className="h-5 w-20 ml-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
