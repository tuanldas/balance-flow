import { ArrowLeftRight, FolderTree, LayoutDashboard, Wallet } from 'lucide-react';
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
                titleKey: 'accounts',
                path: '/accounts',
                icon: Wallet,
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
