import type { Route } from '@vaadin/router';

export const profileViews: Route[] = [
    {
        path: '/profile',
        component: 'profile-page',
        action: async () => {
            await import('../pages/profile.page');
        }
    }
];
