import { notificationRepository } from '../../infrastructure/notification.repository';

export async function listNotificationsQuery(userId: string, limit = 30) {
  return notificationRepository.findByUserId(userId, limit);
}
