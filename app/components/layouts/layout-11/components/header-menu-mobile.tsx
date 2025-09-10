import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { MENU_HEADER } from '@/config/layout-11.config';
import { useMenu } from '@/hooks/use-menu';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HeaderMenuMobile() {
    const pathname = usePathname();
    const { isActive } = useMenu(pathname);

    return (
        <div className="p-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                        <Menu /> Main Menu
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                    {MENU_HEADER.map((item, index) => {
                        const active = isActive(item.path);

                        return (
                            <DropdownMenuItem key={index} asChild {...(active && { 'data-here': 'true' })}>
                                <Link href={item.path || '#'}>{item.title}</Link>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
