import { ListOrdered, SquareActivity, Wallet } from 'lucide-react';
import { ROUTES } from './routes';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig = [
    {
        titleKey: 'navigation.main',
        children: [
            {
                titleKey: 'navigation.dashboard',
                path: ROUTES.home,
                icon: SquareActivity,
            },
            {
                titleKey: 'navigation.wallets',
                path: ROUTES.wallets,
                icon: Wallet,
            },
            {
                titleKey: 'navigation.transactions',
                path: ROUTES.transactions,
                icon: ListOrdered,
            },
        ],
    },
];
