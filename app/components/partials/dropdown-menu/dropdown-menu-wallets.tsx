'use client';

import { ReactNode } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function WalletsDropdownMenu({ trigger }: { trigger: ReactNode }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent className="w-[175px]" side="bottom" align="end" />
        </DropdownMenu>
    );
}


