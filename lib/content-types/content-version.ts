import { z } from "zod"

// Define content status enum
export enum ContentStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// Define version status enum
export enum VersionStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// Define version metadata schema
export const VersionMetadataSchema = z.object({
  id: z.string(),
  versionNumber: z.number(),
  status: z.nativeEnum(VersionStatus),
  createdAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional(),
  archivedAt: z.string().datetime().optional(),
  authorId: z.string(),
  changeDescription: z.string().optional(),
})

// Define content version schema
export const ContentVersionSchema = VersionMetadataSchema.extend({
  contentId: z.string(),
  contentType: z.string(),
  data: z.record(z.any()),
  updatedAt: z.string().datetime(),
})

// Define version comparison result type
export interface VersionComparisonResult {
  previousVersion: ContentVersion
  currentVersion: ContentVersion
  changes: {
    added: string[]
    removed: string[]
    modified: string[]
  }
}

// Export types
export type VersionMetadata = z.infer<typeof VersionMetadataSchema>
export type ContentVersion = z.infer<typeof ContentVersionSchema>

// Register content version type
import { registerContentType } from "./config"

registerContentType({
  name: "contentVersion",
  pluralName: "contentVersions",
  directory: "content/versions",
  schema: ContentVersionSchema,
  defaultValues: {
    status: VersionStatus.DRAFT,
  },
})
