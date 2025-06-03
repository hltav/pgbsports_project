import { Notification } from './interface/notification.interface';

export class NotificationsService {
  private notifications: Notification[] = [];

  sendNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>,
  ): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date(),
      read: false,
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  getNotifications(recipient: string): Notification[] {
    return this.notifications.filter((n) => n.recipient === recipient);
  }

  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(
      (n) => n.id === notificationId,
    );
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
