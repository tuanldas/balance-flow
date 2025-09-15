import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { useLayout } from './context';
import { SidebarMenu } from './sidebar-menu';

export function HeaderLogo() {
    const pathname = usePathname();
    const { isMobile } = useLayout();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Close sheet when route changes
    useEffect(() => {
        setIsSheetOpen(false);
    }, [pathname]);

    return (
        <div className="flex items-center gap-2">
            {isMobile && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" mode="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="p-0 gap-0 w-(--sidebar-width)" side="left" close={false}>
                        <SheetHeader className="p-0 space-y-0" />
                        <SheetBody className="flex flex-col grow p-0">
                            <SidebarMenu />
                        </SheetBody>
                    </SheetContent>
                </Sheet>
            )}
            <Link href={ROUTES.home}>
                <img src={toAbsoluteUrl('/media/app/default-logo.svg')} className="dark:hidden h-6" alt="logo" />
                <img
                    src={toAbsoluteUrl('/media/app/default-logo-dark.svg')}
                    className="hidden dark:inline-block h-6"
                    alt="logo"
                />
            </Link>
        </div>
    );
}
