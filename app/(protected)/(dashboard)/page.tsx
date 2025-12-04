'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/components/layouts/protected/components/toolbar';

export default function Page() {
    return (
        <div className="container-fluid">
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarPageTitle>Dashboard</ToolbarPageTitle>
                </ToolbarHeading>
            </Toolbar>
            <Skeleton className="rounded-lg grow h-screen"></Skeleton>
        </div>
    );
}
