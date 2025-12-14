import { NotificationType, type Notification } from '../models/models';

export function notificationMapper(notifications: unknown[]): Notification[] {
  if (!Array.isArray(notifications)) return [];

  return notifications
    .filter((n): n is Notification => typeof n === 'object' && n !== null)
    .map((n) => {
      const { id, fromTag, isRead, toTag, type } = n as unknown as any;
      return {
        id,
        fromTag,
        isRead,
        toTag,
        type: type === 0 ? NotificationType.INVITATION : type,
      };
    });
}
