import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage, AvatarIndicator, AvatarStatus } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HeaderToolbar() {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <nav className="flex items-center gap-2.5">
            <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                    <Avatar className="size-7">
                        <AvatarImage src={toAbsoluteUrl('/media/avatars/300-2.png')} alt="@reui" />
                        <AvatarFallback>CH</AvatarFallback>
                        <AvatarIndicator className="-end-2 -top-2">
                            <AvatarStatus variant="online" className="size-2.5" />
                        </AvatarIndicator>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" side="bottom" align="end" sideOffset={11}>
                    {/* User Information Section */}
                    <div className="flex items-center gap-3 p-3">
                        <Avatar>
                            <AvatarImage src={toAbsoluteUrl('/media/avatars/300-2.png')} alt="@reui" />
                            <AvatarFallback>S</AvatarFallback>
                            <AvatarIndicator className="-end-1.5 -top-1.5">
                                <AvatarStatus variant="online" className="size-2.5" />
                            </AvatarIndicator>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">Sean</span>
                            <span className="text-xs text-muted-foreground">{t('common.status.online')}</span>
                        </div>
                    </div>

                    <DropdownMenuSeparator />

                    {/* Theme Toggle */}
                    <DropdownMenuItem onClick={toggleTheme}>
                        {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
                        <span>{theme === 'light' ? t('common.theme.dark') : t('common.theme.light')}</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Action Items */}
                    <DropdownMenuItem>
                        <LogOut />
                        <span>{t('common.buttons.logout')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    );
}
