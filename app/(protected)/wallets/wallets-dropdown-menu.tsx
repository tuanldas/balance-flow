'use client';

import { ReactNode, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function WalletsDropdownMenu({ trigger, children }: { trigger: ReactNode; children?: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className="inline-flex">
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                <DropdownMenuContent className="w-[175px]" side="bottom" align="end">
                    {children}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
