export const PUBLIC_ROUTES = {
  HOME: '/home',
  TERMS: '/terms',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY: '/verify',
  FORGOT_PASSWORD: '/forgot-password',
} as const;
export type PUBLIC_ROUTES = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES];
export const PUBLIC_ROUTES_SET = new Set<string>(Object.values(PUBLIC_ROUTES));
