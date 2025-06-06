// Ensure components are imported so they register.
import type { Route } from '@vaadin/router';

export const profileViews: Route[] = [
    {
        path: '/profile',
        component: 'profile-page',
        action: async () => {
            await import('../pages/profile.page');
        },
        children: [
            {
                path: '/user', // Note: no leading slash for child paths
                component: 'profile-user-page',
                action: async () => {
                    await import('../pages/profile-user.page');
                },
            }
        ]
    }
];
