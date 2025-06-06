import type { Route } from '@vaadin/router';
import { profileViews } from './profile.routes';
import { homeViews } from './home.routes';

const children: Route[] = [
    ...homeViews,
    ...profileViews,
];

export const routes: Route[] = [
    {
        path: '',
        children,
    },
];