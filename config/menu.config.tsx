import { SquareActivity } from 'lucide-react';
import { type MenuConfig } from './types';
import { ROUTES } from './routes';

export const MENU_SIDEBAR: MenuConfig = [
    {
        titleKey: 'navigation.main',
        children: [
            {
                titleKey: 'navigation.dashboard',
                path: ROUTES.home,
                icon: SquareActivity,
            },
        ],
    },
];
