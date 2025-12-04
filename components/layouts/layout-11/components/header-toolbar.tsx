'use client';

import { useState } from 'react';
import { I18N_LANGUAGES, Language } from '@/i18n/config';
import { Globe, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/i18n-provider';
import { Avatar, AvatarFallback, AvatarImage, AvatarIndicator, AvatarStatus } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HeaderToolbar() {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { language, changeLanguage } = useLanguage();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLanguage = (lang: Language) => {
        changeLanguage(lang.code);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return user.name.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="flex items-center gap-2.5">
            <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer">
                    <Avatar className="size-7">
                        <AvatarImage src={toAbsoluteUrl('/media/avatars/300-2.png')} alt={user?.name || 'User'} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        <AvatarIndicator className="-end-2 -top-2">
                            <AvatarStatus variant="online" className="size-2.5" />
                        </AvatarIndicator>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" side="bottom" align="end" sideOffset={11}>
                    {/* User Information Section */}
                    <div className="flex items-center gap-3 p-3">
                        <Avatar>
                            <AvatarImage src={toAbsoluteUrl('/media/avatars/300-2.png')} alt={user?.name || 'User'} />
                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                            <AvatarIndicator className="-end-1.5 -top-1.5">
                                <AvatarStatus variant="online" className="size-2.5" />
                            </AvatarIndicator>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">{user?.name || 'User'}</span>
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
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="flex items-center gap-2 [&_[data-slot=dropdown-menu-sub-trigger-indicator]]:hidden hover:[&_[data-slot=badge]]:border-input data-[state=open]:[&_[data-slot=badge]]:border-input">
                            <Globe />
                            <span className="flex items-center justify-between gap-2 grow relative">
                                {t('common.language.title')}
                                <Badge variant={'outline'} className="absolute end-0 top-1/2 -translate-y-1/2">
                                    {language.name}
                                    <img src={language.flag} className="w-3.5 h-3.5 rounded-full" alt={language.name} />
                                </Badge>
                            </span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-48">
                            <DropdownMenuRadioGroup
                                value={language.code}
                                onValueChange={(value) => {
                                    const selectedLang = I18N_LANGUAGES.find((lang) => lang.code === value);
                                    if (selectedLang) handleLanguage(selectedLang);
                                }}
                            >
                                {I18N_LANGUAGES.map((item) => (
                                    <DropdownMenuRadioItem
                                        key={item.code}
                                        value={item.code}
                                        className="flex items-center gap-2"
                                    >
                                        <img src={item.flag} className="w-4 h-4 rounded-full" alt={item.name} />
                                        <span>{item.name}</span>
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />

                    {/* Action Items */}
                    <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                        <LogOut className={isLoggingOut ? 'animate-spin' : ''} />
                        <span>{isLoggingOut ? 'Đang đăng xuất...' : t('common.buttons.logout')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </nav>
    );
}
