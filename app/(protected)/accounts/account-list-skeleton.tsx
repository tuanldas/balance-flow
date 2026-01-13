import { Skeleton } from '@/components/ui/skeleton';

export function AccountListSkeleton() {
    return (
        <div className="p-4 space-y-6">
            {/* 3 sections */}
            {Array.from({ length: 3 }).map((_, sectionIdx) => (
                <div key={sectionIdx}>
                    {/* Section header */}
                    <Skeleton className="h-4 w-24 mb-2" />
                    {/* Account rows */}
                    <div className="space-y-1">
                        {Array.from({ length: 3 }).map((_, rowIdx) => (
                            <div key={rowIdx} className="flex items-center gap-3 p-3">
                                {/* Checkbox skeleton */}
                                <Skeleton className="h-4 w-4 rounded" />
                                {/* Icon */}
                                <Skeleton className="h-10 w-10 rounded-full" />
                                {/* Account info */}
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                {/* Balance */}
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24 ml-auto" />
                                    <Skeleton className="h-5 w-16 ml-auto" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
