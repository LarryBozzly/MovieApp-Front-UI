import type { Route } from '@vaadin/router';

export const notificationViews: Route[] = [
  {
    path: '/notifications',
    component: 'notifications-page',
    action: async () => {
      await import('../pages/notifications.page');
    },
  },
];
