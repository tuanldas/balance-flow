export const ROUTES = {
  home: '/',
  signin: '/signin',
} as const;

export type RouteKey = keyof typeof ROUTES;
