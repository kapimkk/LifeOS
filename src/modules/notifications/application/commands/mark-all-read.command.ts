import { notificationRepository } from '../../infrastructure/notification.repository';

export async function markAllReadCommand(userId: string): Promise<void> {
  await notificationRepository.markAllRead(userId);
}
