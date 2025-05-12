import { createDirectory } from "../cms"
import { contentTypeRegistry } from "./config"

// Import all content type definitions to ensure they're registered
import "./page"
import "./post"
import "./product"

/**
 * Initialize all content types by creating their directories
 */
export async function initContentTypes(): Promise<void> {
  const contentTypes = contentTypeRegistry.getAll()

  for (const contentType of contentTypes) {
    try {
      await createDirectory(contentType.directory)
      console.log(`Initialized content type: ${contentType.name}`)
    } catch (error) {
      console.error(`Error initializing content type ${contentType.name}:`, error)
    }
  }
}
