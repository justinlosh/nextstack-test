import { z } from "zod"

// Define the base schema for all content types
export const BaseContentSchema = z.object({
  id: z.string(),
  slug: z.string().optional(),
  title: z.string(),
  createdAt: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  updatedAt: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
})

export type BaseContent = z.infer<typeof BaseContentSchema>

// Interface for content type configuration
export interface ContentTypeConfig {
  name: string
  pluralName: string
  directory: string
  schema: z.ZodType<any>
  defaultValues?: Record<string, any>
  fileFormat?: "json" | "markdown" // Default is "json"
}

// Registry to store all content type configurations
class ContentTypeRegistry {
  private contentTypes: Map<string, ContentTypeConfig> = new Map()

  register(config: ContentTypeConfig): void {
    // Set default file format if not specified
    const configWithDefaults = {
      ...config,
      fileFormat: config.fileFormat || "json",
    }
    this.contentTypes.set(config.name, configWithDefaults)
  }

  get(name: string): ContentTypeConfig | undefined {
    return this.contentTypes.get(name)
  }

  getAll(): ContentTypeConfig[] {
    return Array.from(this.contentTypes.values())
  }

  exists(name: string): boolean {
    return this.contentTypes.has(name)
  }
}

// Create and export a singleton instance
export const contentTypeRegistry = new ContentTypeRegistry()

// Helper function to register a content type
export function registerContentType(config: ContentTypeConfig): void {
  contentTypeRegistry.register(config)
}
