import type { Route } from '@vaadin/router';

export const aboutViews: Route[] = [
  {
    path: '/about',
    component: 'about-page',
    action: async () => {
      await import('../pages/about.page');
    },
  },
];
