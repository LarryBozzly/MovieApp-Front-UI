import type { Route } from '@vaadin/router';
import '../pages/profile.page';

export const profileViews: Route[] = [
  {
    path: '/profile',
    component: 'profile-page',
  },
];
