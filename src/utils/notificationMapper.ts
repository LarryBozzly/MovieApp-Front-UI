import { NotificationType, type Notification } from '@models/models';

export function notificationMapper(notifications: unknown[]): Notification[] {
  if (!Array.isArray(notifications)) return [];

  return notifications
    .filter((n): n is Notification => typeof n === 'object' && n !== null)
    .map((n) => {
      const { id, type, message } = n as unknown as any;
      return {
        id,
        type: type === 0 ? NotificationType.INVITATION : type,
        message,
      };
    });
}
