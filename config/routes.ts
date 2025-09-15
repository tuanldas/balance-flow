export const ROUTES = {
    home: '/',
    signin: '/signin',
    wallets: '/wallets',
} as const;

export type RouteKey = keyof typeof ROUTES;
