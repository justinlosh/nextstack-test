import type { Notification, NotificationHandler } from "../notification-service"
import { logger } from "../logger"

export class InAppNotificationHandler implements NotificationHandler {
  private notifications: Map<string, Notification[]> = new Map()
  private maxNotificationsPerUser = 50

  /**
   * Handle a notification
   * @param notification Notification to handle
   */
  async handleNotification(notification: Notification): Promise<void> {
    try {
      // Store notification for each recipient
      for (const recipient of notification.recipients) {
        this.storeNotificationForRecipient(recipient, notification)
      }

      logger.debug(`Stored in-app notification for ${notification.recipients.length} recipients`, {
        type: notification.type,
        title: notification.title,
      })
    } catch (error) {
      logger.error("Error handling in-app notification", error as Error)
    }
  }

  /**
   * Get notifications for a recipient
   * @param recipient Recipient to get notifications for
   * @returns Array of notifications
   */
  getNotificationsForRecipient(recipient: string): Notification[] {
    return this.notifications.get(recipient) || []
  }

  /**
   * Mark a notification as read for a recipient
   * @param recipient Recipient
   * @param notificationId Notification ID
   */
  markAsRead(recipient: string, notificationId: string): void {
    const notifications = this.notifications.get(recipient)
    if (notifications) {
      const notification = notifications.find((n) => n.id === notificationId)
      if (notification) {
        notification.read = true
        notification.readBy = [...(notification.readBy || []), recipient]
      }
    }
  }

  /**
   * Mark all notifications as read for a recipient
   * @param recipient Recipient
   */
  markAllAsRead(recipient: string): void {
    const notifications = this.notifications.get(recipient)
    if (notifications) {
      for (const notification of notifications) {
        notification.read = true
        notification.readBy = [...(notification.readBy || []), recipient]
      }
    }
  }

  /**
   * Clear notifications for a recipient
   * @param recipient Recipient
   */
  clearNotifications(recipient: string): void {
    this.notifications.delete(recipient)
  }

  /**
   * Store a notification for a recipient
   * @param recipient Recipient
   * @param notification Notification
   */
  private storeNotificationForRecipient(recipient: string, notification: Notification): void {
    // Get or create notifications array for recipient
    const notifications = this.notifications.get(recipient) || []

    // Add notification to the beginning of the array
    notifications.unshift({
      ...notification,
      read: false,
      readBy: [],
    })

    // Trim notifications if exceeding max
    if (notifications.length > this.maxNotificationsPerUser) {
      notifications.splice(this.maxNotificationsPerUser)
    }

    // Update notifications for recipient
    this.notifications.set(recipient, notifications)
  }
}

// Export a singleton instance
export const inAppNotificationHandler = new InAppNotificationHandler()
