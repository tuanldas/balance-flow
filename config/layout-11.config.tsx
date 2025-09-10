import { SquareActivity } from 'lucide-react';
import { MenuConfig } from '@/config/types';

export const MENU_SIDEBAR: MenuConfig = [
    {
        title: 'Main',
        children: [
            {
                title: 'Dashboard',
                path: '/layout-11',
                icon: SquareActivity,
            },
        ],
    },
];
