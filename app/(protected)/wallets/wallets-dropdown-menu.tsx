'use client';

import type { ReactNode } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function WalletsDropdownMenu({ trigger, children }: { trigger: ReactNode; children?: ReactNode }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent className="w-[175px]" side="bottom" align="end">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
