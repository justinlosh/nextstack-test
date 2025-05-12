import { dataService } from "../data-service/data-service"
import { contentTypeRegistry } from "../content-types/config"
import {
  VersionStatus,
  type ContentVersion,
  type VersionMetadata,
  type VersionComparisonResult,
} from "../content-types/content-version"
import { ValidationError } from "../errors/cms-errors"
import { logger } from "./logger"
import { deepEqual } from "../utils/object-utils"
import { notificationService } from "./notification-service"

export class VersioningService {
  /**
   * Create a new draft version of content
   * @param contentType Content type
   * @param contentId Content ID
   * @param data Content data
   * @param authorId Author ID
   * @param changeDescription Description of changes
   * @returns Created content version
   */
  async createDraft(
    contentType: string,
    contentId: string,
    data: Record<string, any>,
    authorId: string,
    changeDescription?: string,
  ): Promise<ContentVersion> {
    try {
      // Validate content type
      if (!contentTypeRegistry.exists(contentType)) {
        throw new ValidationError(`Content type '${contentType}' is not registered`, {
          contentType: [`Content type '${contentType}' is not registered`],
        })
      }

      // Get the latest version number
      const latestVersion = await this.getLatestVersionNumber(contentType, contentId)
      const newVersionNumber = latestVersion + 1

      // Create the new version
      const newVersion: Omit<ContentVersion, "id"> = {
        contentId,
        contentType,
        versionNumber: newVersionNumber,
        status: VersionStatus.DRAFT,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId,
        changeDescription,
      }

      // Save the version
      const savedVersion = await dataService.create<ContentVersion>("contentVersion", newVersion)

      logger.info(`Created draft version ${newVersionNumber} for ${contentType}/${contentId}`, {
        contentType,
        contentId,
        versionNumber: newVersionNumber,
        authorId,
      })

      // Send notification
      await notificationService.sendNotification({
        type: "content.draft.created",
        title: "Draft Created",
        message: `A new draft (v${newVersionNumber}) was created for ${contentType}/${contentId}`,
        data: {
          contentType,
          contentId,
          versionId: savedVersion.id,
          versionNumber: newVersionNumber,
          authorId,
        },
        recipients: ["editors", "admins"],
      })

      return savedVersion
    } catch (error) {
      logger.error(`Error creating draft for ${contentType}/${contentId}`, error as Error)
      throw error
    }
  }

  /**
   * Publish a draft version
   * @param versionId Version ID to publish
   * @param authorId Author ID
   * @returns Published content version
   */
  async publishVersion(versionId: string, authorId: string): Promise<ContentVersion> {
    try {
      // Get the version
      const version = await dataService.get<ContentVersion>("contentVersion", versionId)

      // Check if version is already published
      if (version.status === VersionStatus.PUBLISHED) {
        throw new ValidationError(`Version ${versionId} is already published`, {
          status: [`Version is already published`],
        })
      }

      // Update the version status
      const updatedVersion = await dataService.update<ContentVersion>("contentVersion", versionId, {
        status: VersionStatus.PUBLISHED,
        publishedAt: new Date().toISOString(),
        scheduledAt: undefined, // Clear scheduled date if it was scheduled
        updatedAt: new Date().toISOString(),
      })

      // Archive any previously published versions
      await this.archivePreviouslyPublishedVersions(version.contentType, version.contentId, versionId, authorId)

      logger.info(`Published version ${version.versionNumber} for ${version.contentType}/${version.contentId}`, {
        contentType: version.contentType,
        contentId: version.contentId,
        versionNumber: version.versionNumber,
        authorId,
      })

      // Send notification
      await notificationService.sendNotification({
        type: "content.published",
        title: "Content Published",
        message: `Version ${version.versionNumber} of ${version.contentType}/${version.contentId} has been published`,
        data: {
          contentType: version.contentType,
          contentId: version.contentId,
          versionId: version.id,
          versionNumber: version.versionNumber,
          authorId,
        },
        recipients: ["editors", "admins", "subscribers"],
      })

      return updatedVersion
    } catch (error) {
      logger.error(`Error publishing version ${versionId}`, error as Error)
      throw error
    }
  }

  /**
   * Archive a version
   * @param versionId Version ID to archive
   * @param authorId Author ID
   * @returns Archived content version
   */
  async archiveVersion(versionId: string, authorId: string): Promise<ContentVersion> {
    try {
      // Get the version
      const version = await dataService.get<ContentVersion>("contentVersion", versionId)

      // Update the version status
      const updatedVersion = await dataService.update<ContentVersion>("contentVersion", versionId, {
        status: VersionStatus.ARCHIVED,
        archivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      logger.info(`Archived version ${version.versionNumber} for ${version.contentType}/${version.contentId}`, {
        contentType: version.contentType,
        contentId: version.contentId,
        versionNumber: version.versionNumber,
        authorId,
      })

      // Send notification
      await notificationService.sendNotification({
        type: "content.archived",
        title: "Content Archived",
        message: `Version ${version.versionNumber} of ${version.contentType}/${version.contentId} has been archived`,
        data: {
          contentType: version.contentType,
          contentId: version.contentId,
          versionId: version.id,
          versionNumber: version.versionNumber,
          authorId,
        },
        recipients: ["editors", "admins"],
      })

      return updatedVersion
    } catch (error) {
      logger.error(`Error archiving version ${versionId}`, error as Error)
      throw error
    }
  }

  /**
   * Get the latest version of content
   * @param contentType Content type
   * @param contentId Content ID
   * @param includesDrafts Whether to include drafts
   * @param includeScheduled Whether to include scheduled content
   * @returns Latest content version
   */
  async getLatestVersion(
    contentType: string,
    contentId: string,
    includesDrafts = true,
    includeScheduled = true,
  ): Promise<ContentVersion | null> {
    try {
      // Get all versions for the content
      const versions = await this.getContentVersions(contentType, contentId)

      if (versions.length === 0) {
        return null
      }

      // Filter versions based on parameters
      const filteredVersions = versions.filter((v) => {
        if (v.status === VersionStatus.PUBLISHED) return true
        if (includesDrafts && v.status === VersionStatus.DRAFT) return true
        if (includeScheduled && v.status === VersionStatus.SCHEDULED) return true
        return false
      })

      if (filteredVersions.length === 0) {
        return null
      }

      // Sort by version number in descending order
      filteredVersions.sort((a, b) => b.versionNumber - a.versionNumber)

      // Get the full version data
      return await dataService.get<ContentVersion>("contentVersion", filteredVersions[0].id)
    } catch (error) {
      logger.error(`Error getting latest version for ${contentType}/${contentId}`, error as Error)
      throw error
    }
  }

  /**
   * Get the published version of content
   * @param contentType Content type
   * @param contentId Content ID
   * @returns Published content version
   */
  async getPublishedVersion(contentType: string, contentId: string): Promise<ContentVersion | null> {
    try {
      // Get all versions for the content
      const versions = await this.getContentVersions(contentType, contentId)

      // Find the published version
      const publishedVersion = versions.find((v) => v.status === VersionStatus.PUBLISHED)

      if (!publishedVersion) {
        return null
      }

      // Get the full version data
      return await dataService.get<ContentVersion>("contentVersion", publishedVersion.id)
    } catch (error) {
      logger.error(`Error getting published version for ${contentType}/${contentId}`, error as Error)
      throw error
    }
  }

  /**
   * Get all versions of content
   * @param contentType Content type
   * @param contentId Content ID
   * @returns Array of version metadata
   */
  async getContentVersions(contentType: string, contentId: string): Promise<VersionMetadata[]> {
    try {
      // Query versions for the content
      const versions = await dataService.query<ContentVersion>(
        "contentVersion",
        (item) => item.contentType === contentType && item.contentId === contentId,
      )

      // Map to version metadata
      return versions.map((version) => ({
        id: version.id,
        versionNumber: version.versionNumber,
        status: version.status,
        createdAt: version.createdAt,
        publishedAt: version.publishedAt,
        scheduledAt: version.scheduledAt,
        archivedAt: version.archivedAt,
        authorId: version.authorId,
        changeDescription: version.changeDescription,
      }))
    } catch (error) {
      logger.error(`Error getting versions for ${contentType}/${contentId}`, error as Error)
      throw error
    }
  }

  /**
   * Get a specific version of content
   * @param versionId Version ID
   * @returns Content version
   */
  async getVersion(versionId: string): Promise<ContentVersion> {
    try {
      return await dataService.get<ContentVersion>("contentVersion", versionId)
    } catch (error) {
      logger.error(`Error getting version ${versionId}`, error as Error)
      throw error
    }
  }

  /**
   * Compare two versions of content
   * @param versionId1 First version ID
   * @param versionId2 Second version ID
   * @returns Version comparison result
   */
  async compareVersions(versionId1: string, versionId2: string): Promise<VersionComparisonResult> {
    try {
      // Get both versions
      const version1 = await this.getVersion(versionId1)
      const version2 = await this.getVersion(versionId2)

      // Ensure versions are for the same content
      if (version1.contentId !== version2.contentId || version1.contentType !== version2.contentType) {
        throw new ValidationError(`Cannot compare versions from different content items`, {
          versions: [`Versions must be from the same content item`],
        })
      }

      // Determine which is previous and which is current
      const [previousVersion, currentVersion] =
        version1.versionNumber < version2.versionNumber ? [version1, version2] : [version2, version1]

      // Compare the data
      const changes = this.compareData(previousVersion.data, currentVersion.data)

      return {
        previousVersion,
        currentVersion,
        changes,
      }
    } catch (error) {
      logger.error(`Error comparing versions ${versionId1} and ${versionId2}`, error as Error)
      throw error
    }
  }

  /**
   * Rollback to a previous version
   * @param versionId Version ID to rollback to
   * @param authorId Author ID
   * @param changeDescription Description of rollback
   * @returns New content version
   */
  async rollbackToVersion(
    versionId: string,
    authorId: string,
    changeDescription = "Rollback to previous version",
  ): Promise<ContentVersion> {
    try {
      // Get the version to rollback to
      const version = await this.getVersion(versionId)

      // Create a new draft with the data from the rollback version
      return await this.createDraft(
        version.contentType,
        version.contentId,
        version.data,
        authorId,
        changeDescription || `Rollback to version ${version.versionNumber}`,
      )
    } catch (error) {
      logger.error(`Error rolling back to version ${versionId}`, error as Error)
      throw error
    }
  }

  /**
   * Get the latest version number for content
   * @param contentType Content type
   * @param contentId Content ID
   * @returns Latest version number
   */
  private async getLatestVersionNumber(contentType: string, contentId: string): Promise<number> {
    try {
      // Get all versions for the content
      const versions = await this.getContentVersions(contentType, contentId)

      if (versions.length === 0) {
        return 0
      }

      // Find the highest version number
      return Math.max(...versions.map((v) => v.versionNumber))
    } catch (error) {
      logger.error(`Error getting latest version number for ${contentType}/${contentId}`, error as Error)
      throw error
    }
  }

  /**
   * Archive previously published versions
   * @param contentType Content type
   * @param contentId Content ID
   * @param excludeVersionId Version ID to exclude
   * @param authorId Author ID
   */
  private async archivePreviouslyPublishedVersions(
    contentType: string,
    contentId: string,
    excludeVersionId: string,
    authorId: string,
  ): Promise<void> {
    try {
      // Get all versions for the content
      const versions = await this.getContentVersions(contentType, contentId)

      // Find published versions excluding the specified one
      const publishedVersions = versions.filter(
        (v) => v.status === VersionStatus.PUBLISHED && v.id !== excludeVersionId,
      )

      // Archive each published version
      for (const version of publishedVersions) {
        await this.archiveVersion(version.id, authorId)
      }
    } catch (error) {
      logger.error(`Error archiving previously published versions for ${contentType}/${contentId}`, error as Error)
      throw error
    }
  }

  /**
   * Compare data between two versions
   * @param prevData Previous version data
   * @param currData Current version data
   * @returns Changes between versions
   */
  private compareData(
    prevData: Record<string, any>,
    currData: Record<string, any>,
  ): { added: string[]; removed: string[]; modified: string[] } {
    const added: string[] = []
    const removed: string[] = []
    const modified: string[] = []

    // Find added and modified fields
    for (const key in currData) {
      if (!(key in prevData)) {
        added.push(key)
      } else if (!deepEqual(prevData[key], currData[key])) {
        modified.push(key)
      }
    }

    // Find removed fields
    for (const key in prevData) {
      if (!(key in currData)) {
        removed.push(key)
      }
    }

    return { added, removed, modified }
  }
}

// Export a singleton instance
export const versioningService = new VersioningService()
