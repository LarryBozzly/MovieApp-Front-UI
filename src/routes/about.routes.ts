import type { Route } from '@vaadin/router';
import '../pages/about.page';

export const aboutViews: Route[] = [
  {
    path: '/about',
    component: 'about-page',
  },
];
