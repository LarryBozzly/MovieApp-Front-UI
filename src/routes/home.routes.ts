// Ensure components are imported so they register.
import type { Route } from '@vaadin/router';
import '../pages/home.page';

export const homeViews: Route[] = [
    { path: '/', component: 'home-page' },
];
