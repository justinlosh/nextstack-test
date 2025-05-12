import { type NextRequest, NextResponse } from "next/server"
import { logger } from "../../../../lib/services/logger"
import { versioningService } from "../../../../lib/services/versioning-service"
import { schedulingService } from "../../../../lib/services/scheduling-service"
import { notificationService } from "../../../../lib/services/notification-service"

/**
 * Vercel Cron Job to publish scheduled content
 * This endpoint is called by Vercel Cron Jobs every hour
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("Authorization")

    // In production, we should validate the cron job secret
    // This is a simple check for demonstration purposes
    if (process.env.VERCEL_ENV === "production" && (!authHeader || !authHeader.startsWith("Bearer "))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    logger.info("Running scheduled content publishing cron job")

    // Get all scheduled content that should be published now
    const scheduledItems = await schedulingService.getItemsDueForPublishing()

    if (scheduledItems.length === 0) {
      logger.info("No scheduled content to publish")
      return NextResponse.json({ success: true, published: 0 })
    }

    logger.info(`Publishing ${scheduledItems.length} scheduled items`)

    // Publish each scheduled item
    const results = await Promise.all(
      scheduledItems.map(async (item) => {
        try {
          // Publish the version
          const publishedVersion = await versioningService.publishVersion(
            item.contentType,
            item.contentId,
            item.versionId,
          )

          // Send notification
          await notificationService.sendNotification({
            type: "content_published",
            title: "Scheduled content published",
            message: `${item.contentType} "${item.title}" has been published automatically.`,
            data: {
              contentType: item.contentType,
              contentId: item.contentId,
              versionId: item.versionId,
            },
            recipients: ["admin"],
          })

          return {
            success: true,
            contentId: item.contentId,
            versionId: item.versionId,
          }
        } catch (error) {
          logger.error(`Failed to publish scheduled content: ${error.message}`, {
            contentType: item.contentType,
            contentId: item.contentId,
            versionId: item.versionId,
          })

          return {
            success: false,
            contentId: item.contentId,
            versionId: item.versionId,
            error: error.message,
          }
        }
      }),
    )

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      success: true,
      published: successCount,
      total: scheduledItems.length,
      results,
    })
  } catch (error) {
    logger.error(`Error in scheduled publishing cron job: ${error.message}`)

    return NextResponse.json({ error: "Failed to process scheduled publishing" }, { status: 500 })
  }
}
