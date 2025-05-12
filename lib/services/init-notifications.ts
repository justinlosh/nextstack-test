import { notificationService } from "./notification-service"
import { inAppNotificationHandler } from "./notification-handlers/in-app-handler"
import { emailNotificationHandler } from "./notification-handlers/email-handler"
import { logger } from "./logger"

export function initializeNotifications() {
  // Register in-app notification handler
  notificationService.registerHandler("in-app", inAppNotificationHandler)

  // Register email notification handler if configured
  const emailConfig =
    process.env.EMAIL_ENABLED === "true"
      ? {
          from: process.env.EMAIL_FROM || "noreply@example.com",
          transportConfig: {
            // This would be your email transport configuration
            // For example, SMTP settings for nodemailer
          },
        }
      : null

  if (emailConfig) {
    emailNotificationHandler.initialize(emailConfig)
    notificationService.registerHandler("email", emailNotificationHandler)
    logger.info("Email notifications enabled")
  } else {
    logger.info("Email notifications disabled")
  }

  logger.info("Notification system initialized")
}
