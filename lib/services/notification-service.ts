import { logger } from "./logger"

// Define notification types
export type NotificationType =
  | "content.draft.created"
  | "content.scheduled"
  | "content.published"
  | "content.archived"
  | "system.error"
  | "system.warning"
  | "system.info"

// Define notification recipient types
export type NotificationRecipient = "editors" | "admins" | "authors" | "subscribers" | string

// Define notification interface
export interface Notification {
  id?: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  createdAt?: string
  recipients: NotificationRecipient[]
  read?: boolean
  readBy?: string[]
}

// Define notification handler interface
export interface NotificationHandler {
  handleNotification(notification: Notification): Promise<void>
}

export class NotificationService {
  private handlers: Map<string, NotificationHandler> = new Map()
  private notifications: Notification[] = []
  private maxNotifications = 100

  /**
   * Register a notification handler
   * @param name Handler name
   * @param handler Notification handler
   */
  registerHandler(name: string, handler: NotificationHandler): void {
    this.handlers.set(name, handler)
    logger.info(`Registered notification handler: ${name}`)
  }

  /**
   * Unregister a notification handler
   * @param name Handler name
   */
  unregisterHandler(name: string): void {
    this.handlers.delete(name)
    logger.info(`Unregistered notification handler: ${name}`)
  }

  /**
   * Send a notification
   * @param notification Notification to send
   */
  async sendNotification(notification: Notification): Promise<void> {
    try {
      // Add metadata to notification
      const fullNotification: Notification = {
        ...notification,
        id: notification.id || this.generateId(),
        createdAt: notification.createdAt || new Date().toISOString(),
        read: false,
        readBy: [],
      }

      // Store notification
      this.storeNotification(fullNotification)

      // Process notification with all handlers
      const handlerPromises = Array.from(this.handlers.entries()).map(async ([name, handler]) => {
        try {
          await handler.handleNotification(fullNotification)
        } catch (error) {
          logger.error(`Error in notification handler ${name}`, error as Error)
        }
      })

      await Promise.all(handlerPromises)

      logger.info(`Sent notification: ${fullNotification.title}`, {
        type: fullNotification.type,
        recipients: fullNotification.recipients,
      })
    } catch (error) {
      logger.error("Error sending notification", error as Error)
    }
  }

  /**
   * Get all notifications
   * @returns Array of notifications
   */
  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  /**
   * Get notifications for a specific recipient
   * @param recipient Recipient to get notifications for
   * @returns Array of notifications
   */
  getNotificationsForRecipient(recipient: string): Notification[] {
    return this.notifications.filter((notification) => {
      return notification.recipients.includes(recipient) || notification.recipients.includes("all")
    })
  }

  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @param userId User ID
   */
  markAsRead(notificationId: string, userId: string): void {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.readBy = [...(notification.readBy || []), userId]
      notification.read = true
      logger.debug(`Marked notification ${notificationId} as read by ${userId}`)
    }
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notifications = []
    logger.info("Cleared all notifications")
  }

  /**
   * Store a notification
   * @param notification Notification to store
   */
  private storeNotification(notification: Notification): void {
    this.notifications.unshift(notification)

    // Trim notifications if exceeding max
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications)
    }
  }

  /**
   * Generate a unique ID
   * @returns Unique ID
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export a singleton instance
export const notificationService = new NotificationService()
