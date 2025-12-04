import { LayoutDashboard } from 'lucide-react';
import { MenuConfig } from '@/config/types';

export const MENU_SIDEBAR: MenuConfig = [
    {
        titleKey: 'main',
        children: [
            {
                titleKey: 'dashboard',
                path: '/',
                icon: LayoutDashboard,
            },
        ],
    },
];
