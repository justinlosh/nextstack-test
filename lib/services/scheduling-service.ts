import { dataService } from "../data-service/data-service"
import { versioningService } from "./versioning-service"
import { VersionStatus, type ContentVersion } from "../content-types/content-version"
import { logger } from "./logger"
import { cacheService } from "./cache-service"

export class SchedulingService {
  private isRunning = false
  private checkInterval = 60000 // 1 minute
  private intervalId: NodeJS.Timeout | null = null

  /**
   * Schedule content for future publication
   * @param versionId Version ID to schedule
   * @param scheduledAt Date and time to publish
   * @param authorId Author ID
   * @returns Scheduled content version
   */
  async scheduleContent(versionId: string, scheduledAt: Date, authorId: string): Promise<ContentVersion> {
    try {
      // Get the version
      const version = await dataService.get<ContentVersion>("contentVersion", versionId)

      // Validate scheduled time is in the future
      const now = new Date()
      if (scheduledAt <= now) {
        throw new Error("Scheduled time must be in the future")
      }

      // Update the version status and scheduled time
      const updatedVersion = await dataService.update<ContentVersion>("contentVersion", versionId, {
        status: VersionStatus.SCHEDULED,
        scheduledAt: scheduledAt.toISOString(),
        updatedAt: now.toISOString(),
      })

      logger.info(
        `Scheduled version ${version.versionNumber} for ${version.contentType}/${version.contentId} at ${scheduledAt.toISOString()}`,
        {
          contentType: version.contentType,
          contentId: version.contentId,
          versionNumber: version.versionNumber,
          authorId,
          scheduledAt: scheduledAt.toISOString(),
        },
      )

      // Invalidate cache for scheduled content
      await this.invalidateScheduledContentCache()

      return updatedVersion
    } catch (error) {
      logger.error(`Error scheduling version ${versionId}`, error as Error)
      throw error
    }
  }

  /**
   * Unschedule content (revert to draft)
   * @param versionId Version ID to unschedule
   * @param authorId Author ID
   * @returns Updated content version
   */
  async unscheduleContent(versionId: string, authorId: string): Promise<ContentVersion> {
    try {
      // Get the version
      const version = await dataService.get<ContentVersion>("contentVersion", versionId)

      // Check if version is scheduled
      if (version.status !== VersionStatus.SCHEDULED) {
        throw new Error(`Version ${versionId} is not scheduled`)
      }

      // Update the version status and remove scheduled time
      const updatedVersion = await dataService.update<ContentVersion>("contentVersion", versionId, {
        status: VersionStatus.DRAFT,
        scheduledAt: undefined,
        updatedAt: new Date().toISOString(),
      })

      logger.info(`Unscheduled version ${version.versionNumber} for ${version.contentType}/${version.contentId}`, {
        contentType: version.contentType,
        contentId: version.contentId,
        versionNumber: version.versionNumber,
        authorId,
      })

      // Invalidate cache for scheduled content
      await this.invalidateScheduledContentCache()

      return updatedVersion
    } catch (error) {
      logger.error(`Error unscheduling version ${versionId}`, error as Error)
      throw error
    }
  }

  /**
   * Get all scheduled content
   * @returns Array of scheduled content versions
   */
  async getScheduledContent(): Promise<ContentVersion[]> {
    try {
      // Try to get from cache first
      const cacheKey = "scheduled-content"
      const cachedContent = await cacheService.get<ContentVersion[]>(cacheKey, { namespace: "scheduling" })

      if (cachedContent) {
        return cachedContent
      }

      // Query versions with scheduled status
      const scheduledVersions = await dataService.query<ContentVersion>(
        "contentVersion",
        (item) => item.status === VersionStatus.SCHEDULED,
      )

      // Cache the result
      await cacheService.set(cacheKey, scheduledVersions, {
        namespace: "scheduling",
        ttl: 300, // 5 minutes
      })

      return scheduledVersions
    } catch (error) {
      logger.error("Error getting scheduled content", error as Error)
      throw error
    }
  }

  /**
   * Process scheduled content that is due for publication
   */
  async processScheduledContent(): Promise<void> {
    if (this.isRunning) {
      return
    }

    try {
      this.isRunning = true
      logger.info("Processing scheduled content")

      // Get all scheduled content
      const scheduledContent = await this.getScheduledContent()
      const now = new Date()

      // Find content that is due for publication
      const dueContent = scheduledContent.filter((version) => {
        if (!version.scheduledAt) return false
        const scheduledAt = new Date(version.scheduledAt)
        return scheduledAt <= now
      })

      logger.info(`Found ${dueContent.length} content items due for publication`)

      // Publish each due content
      for (const version of dueContent) {
        try {
          await versioningService.publishVersion(version.id, "system")
          logger.info(
            `Published scheduled content ${version.contentType}/${version.contentId} (version ${version.versionNumber})`,
            {
              contentType: version.contentType,
              contentId: version.contentId,
              versionNumber: version.versionNumber,
            },
          )
        } catch (error) {
          logger.error(
            `Error publishing scheduled content ${version.contentType}/${version.contentId} (version ${version.versionNumber})`,
            error as Error,
          )
        }
      }

      // Invalidate cache if any content was published
      if (dueContent.length > 0) {
        await this.invalidateScheduledContentCache()
      }
    } catch (error) {
      logger.error("Error processing scheduled content", error as Error)
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Start the scheduling service
   */
  startScheduler(): void {
    if (this.intervalId) {
      return
    }

    logger.info(`Starting scheduling service with check interval of ${this.checkInterval}ms`)

    // Process immediately on start
    this.processScheduledContent().catch((error) => {
      logger.error("Error in initial scheduled content processing", error)
    })

    // Set up interval for regular checks
    this.intervalId = setInterval(() => {
      this.processScheduledContent().catch((error) => {
        logger.error("Error in scheduled content processing", error)
      })
    }, this.checkInterval)
  }

  /**
   * Stop the scheduling service
   */
  stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      logger.info("Stopped scheduling service")
    }
  }

  /**
   * Set the check interval
   * @param interval Interval in milliseconds
   */
  setCheckInterval(interval: number): void {
    this.checkInterval = interval
    logger.info(`Set scheduling service check interval to ${interval}ms`)

    // Restart scheduler if it's running
    if (this.intervalId) {
      this.stopScheduler()
      this.startScheduler()
    }
  }

  /**
   * Invalidate scheduled content cache
   */
  private async invalidateScheduledContentCache(): Promise<void> {
    await cacheService.remove("scheduled-content", { namespace: "scheduling" })
  }
}

// Export a singleton instance
export const schedulingService = new SchedulingService()
