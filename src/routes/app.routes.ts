import type { Route } from '@vaadin/router';
import { profileViews } from './profile.routes';
import { notificationViews } from '@routes/notification.routes';
import { homeViews } from '@routes/home.routes';
import { aboutViews } from '@routes/about.routes';
import { authGuard } from '@guards/auth-guard';
import { publicGuard } from '@guards/public-guard';
import { PUBLIC_ROUTES } from '@routes/paths';
import '@pages/login.page';
import '@pages/signup.page';
import '@pages/verify.page';
import '@pages/forgot-password.page';
import '@pages/landing.page';
// import '@pages/terms.page';

const children: Route[] = [...homeViews, ...profileViews, ...notificationViews, ...aboutViews];

export const routes: Route[] = [
  {
    path: '',
    children,
    action: authGuard,
  },
  {
    path: PUBLIC_ROUTES.HOME,
    component: 'landing-page',
    action: publicGuard,
  },
  {
    path: PUBLIC_ROUTES.LOGIN,
    component: 'login-page',
    action: publicGuard,
  },
  {
    path: PUBLIC_ROUTES.SIGNUP,
    component: 'signup-page',
    action: publicGuard,
  },
  {
    path: PUBLIC_ROUTES.VERIFY,
    component: 'verify-page',
    action: publicGuard,
  },
  {
    path: PUBLIC_ROUTES.FORGOT_PASSWORD,
    component: 'forgot-password-page',
    action: publicGuard,
  },
  // {
  //   path: PUBLIC_ROUTES.TERMS,
  //   component: 'terms-page',
  //   action: publicGuard,
  // },
  {
    path: '(.*)',
    redirect: '/',
  },
];
