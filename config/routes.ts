export const ROUTES = {
    home: '/',
    signin: '/signin',
    wallets: '/wallets',
    transactions: '/transactions',
} as const;

export type RouteKey = keyof typeof ROUTES;
