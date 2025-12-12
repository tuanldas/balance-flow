import { ArrowLeftRight, FolderTree, LayoutDashboard } from 'lucide-react';
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
            {
                titleKey: 'transactions',
                path: '/transactions',
                icon: ArrowLeftRight,
            },
            {
                titleKey: 'categories',
                path: '/categories',
                icon: FolderTree,
            },
        ],
    },
];
