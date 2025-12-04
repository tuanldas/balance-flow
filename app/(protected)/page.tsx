'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Toolbar,
    ToolbarActions,
    ToolbarDescription,
    ToolbarHeading,
    ToolbarPageTitle,
} from '@/components/layouts/protected/components/toolbar';

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
