import type { Route } from '@vaadin/router';
import '../pages/notifications.page';

export const notificationViews: Route[] = [
  {
    path: '/notifications',
    component: 'notifications-page',
  },
];
