import { z } from "zod"
import { readDirectory, createDirectory } from "../cms"
import { contentTypeRegistry, type ContentTypeConfig, type BaseContent } from "../content-types/config"
import { FileAdapterFactory } from "../adapters"
import {
  ValidationError,
  ContentTypeError,
  NotFoundError,
  DuplicateError,
  FileSystemError,
  UnexpectedError,
} from "../errors/cms-errors"
import { logger } from "../services/logger"

export class DataService {
  /**
   * Create a new content entry
   */
  async create<T extends BaseContent>(contentType: string, data: Omit<T, "id">): Promise<T> {
    try {
      // Get content type configuration
      const config = this.getContentTypeConfig(contentType)

      // Generate ID if not provided
      const id = data.slug || this.generateId()

      // Prepare data with ID and timestamps
      const fullData = {
        id,
        ...config.defaultValues,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Validate data against schema
      try {
        config.schema.parse(fullData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Convert Zod errors to a more user-friendly format
          const details: Record<string, string[]> = {}
          error.errors.forEach((err) => {
            const path = err.path.join(".")
            if (!details[path]) {
              details[path] = []
            }
            details[path].push(err.message)
          })

          logger.warn(`Validation failed when creating ${contentType}`, { details })
          throw new ValidationError(`Validation failed when creating ${contentType}`, details)
        }
        throw error
      }

      // Get the appropriate file adapter
      const adapter = this.getFileAdapter<T>(config)

      // Determine file path
      const filePath = this.getFilePath(config.directory, id)

      // Ensure directory exists
      await this.ensureDirectoryExists(config.directory)

      // Check if file already exists
      if (await adapter.exists(filePath)) {
        logger.warn(`Content with ID ${id} already exists in ${contentType}`)
        throw new DuplicateError(`Content with ID ${id} already exists in ${contentType}`, contentType, id)
      }

      // Write data to file
      await adapter.write(filePath, fullData as T)
      logger.info(`Created ${contentType} with ID ${id}`)

      return fullData as T
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof CmsError) {
        throw error
      }

      // Handle unexpected errors
      logger.error(`Unexpected error when creating ${contentType}`, error as Error)
      throw new UnexpectedError(`An unexpected error occurred when creating ${contentType}`, error as Error)
    }
  }

  /**
   * Get a content entry by ID
   */
  async get<T extends BaseContent>(contentType: string, id: string): Promise<T> {
    try {
      // Get content type configuration
      const config = this.getContentTypeConfig(contentType)

      // Get the appropriate file adapter
      const adapter = this.getFileAdapter<T>(config)

      // Determine file path
      const filePath = this.getFilePath(config.directory, id)

      // Check if file exists
      if (!(await adapter.exists(filePath))) {
        logger.warn(`Content with ID ${id} not found in ${contentType}`)
        throw new NotFoundError(`Content with ID ${id} not found in ${contentType}`, contentType, id)
      }

      // Read and parse file
      const data = await adapter.read(filePath)

      // Validate data against schema
      try {
        config.schema.parse(data)
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Convert Zod errors to a more user-friendly format
          const details: Record<string, string[]> = {}
          error.errors.forEach((err) => {
            const path = err.path.join(".")
            if (!details[path]) {
              details[path] = []
            }
            details[path].push(err.message)
          })

          logger.warn(`Validation failed when reading ${contentType} with ID ${id}`, { details })
          throw new ValidationError(`Validation failed when reading ${contentType} with ID ${id}`, details)
        }
        throw error
      }

      logger.debug(`Retrieved ${contentType} with ID ${id}`)
      return data as T
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof CmsError) {
        throw error
      }

      // Handle unexpected errors
      logger.error(`Unexpected error when getting ${contentType} with ID ${id}`, error as Error)
      throw new UnexpectedError(
        `An unexpected error occurred when getting ${contentType} with ID ${id}`,
        error as Error,
      )
    }
  }

  /**
   * Update a content entry
   */
  async update<T extends BaseContent>(contentType: string, id: string, data: Partial<T>): Promise<T> {
    try {
      // Get content type configuration
      const config = this.getContentTypeConfig(contentType)

      // Get the appropriate file adapter
      const adapter = this.getFileAdapter<T>(config)

      // Determine file path
      const filePath = this.getFilePath(config.directory, id)

      // Check if file exists
      if (!(await adapter.exists(filePath))) {
        logger.warn(`Content with ID ${id} not found in ${contentType} for update`)
        throw new NotFoundError(`Content with ID ${id} not found in ${contentType}`, contentType, id)
      }

      // Read and parse existing data
      const existingData = await adapter.read(filePath)

      // Merge existing data with updates
      const updatedData = {
        ...existingData,
        ...data,
        id, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      }

      // Validate updated data against schema
      try {
        config.schema.parse(updatedData)
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Convert Zod errors to a more user-friendly format
          const details: Record<string, string[]> = {}
          error.errors.forEach((err) => {
            const path = err.path.join(".")
            if (!details[path]) {
              details[path] = []
            }
            details[path].push(err.message)
          })

          logger.warn(`Validation failed when updating ${contentType} with ID ${id}`, { details })
          throw new ValidationError(`Validation failed when updating ${contentType} with ID ${id}`, details)
        }
        throw error
      }

      // Write updated data to file
      await adapter.write(filePath, updatedData as T)
      logger.info(`Updated ${contentType} with ID ${id}`)

      return updatedData as T
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof CmsError) {
        throw error
      }

      // Handle unexpected errors
      logger.error(`Unexpected error when updating ${contentType} with ID ${id}`, error as Error)
      throw new UnexpectedError(
        `An unexpected error occurred when updating ${contentType} with ID ${id}`,
        error as Error,
      )
    }
  }

  /**
   * Delete a content entry
   */
  async delete(contentType: string, id: string): Promise<void> {
    try {
      // Get content type configuration
      const config = this.getContentTypeConfig(contentType)

      // Get the appropriate file adapter
      const adapter = this.getFileAdapter(config)

      // Determine file path
      const filePath = this.getFilePath(config.directory, id)

      // Check if file exists
      if (!(await adapter.exists(filePath))) {
        logger.warn(`Content with ID ${id} not found in ${contentType} for deletion`)
        throw new NotFoundError(`Content with ID ${id} not found in ${contentType}`, contentType, id)
      }

      // Delete file
      await adapter.delete(filePath)
      logger.info(`Deleted ${contentType} with ID ${id}`)
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof CmsError) {
        throw error
      }

      // Handle unexpected errors
      logger.error(`Unexpected error when deleting ${contentType} with ID ${id}`, error as Error)
      throw new UnexpectedError(
        `An unexpected error occurred when deleting ${contentType} with ID ${id}`,
        error as Error,
      )
    }
  }

  /**
   * List all content entries of a specific type
   */
  async list<T extends BaseContent>(contentType: string): Promise<T[]> {
    try {
      // Get content type configuration
      const config = this.getContentTypeConfig(contentType)

      // Get the appropriate file adapter
      const adapter = this.getFileAdapter<T>(config)

      // Ensure directory exists
      await this.ensureDirectoryExists(config.directory)

      // Read directory
      const files = await readDirectory(config.directory)

      // Filter files by extension
      const extension = adapter.getFileExtension()
      const matchingFiles = files.filter((file) => file.endsWith(extension))

      // Read and parse each file
      const contentPromises = matchingFiles.map(async (file) => {
        const id = file.replace(extension, "")
        try {
          return await this.get<T>(contentType, id)
        } catch (error) {
          // Log the error but continue with other files
          logger.warn(`Error reading ${contentType} with ID ${id}`, { error })
          return null
        }
      })

      const results = await Promise.all(contentPromises)

      // Filter out null results (files that couldn't be read)
      const validResults = results.filter((result): result is T => result !== null)

      logger.debug(`Listed ${validResults.length} items of type ${contentType}`)
      return validResults
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof CmsError) {
        throw error
      }

      // Handle unexpected errors
      logger.error(`Unexpected error when listing ${contentType}`, error as Error)
      throw new UnexpectedError(`An unexpected error occurred when listing ${contentType}`, error as Error)
    }
  }

  /**
   * Query content entries with filtering
   */
  async query<T extends BaseContent>(
    contentType: string,
    filter?: (item: T) => boolean,
    sort?: (a: T, b: T) => number,
  ): Promise<T[]> {
    try {
      // Get all items
      const items = await this.list<T>(contentType)

      // Apply filter if provided
      let filteredItems = filter ? items.filter(filter) : items

      // Apply sort if provided
      if (sort) {
        filteredItems = filteredItems.sort(sort)
      }

      logger.debug(`Queried ${filteredItems.length} items of type ${contentType}`)
      return filteredItems
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof CmsError) {
        throw error
      }

      // Handle unexpected errors
      logger.error(`Unexpected error when querying ${contentType}`, error as Error)
      throw new UnexpectedError(`An unexpected error occurred when querying ${contentType}`, error as Error)
    }
  }

  /**
   * Helper method to get content type configuration
   */
  private getContentTypeConfig(contentType: string): ContentTypeConfig {
    const config = contentTypeRegistry.get(contentType)
    if (!config) {
      logger.warn(`Content type '${contentType}' is not registered`)
      throw new ContentTypeError(`Content type '${contentType}' is not registered`)
    }
    return config
  }

  /**
   * Helper method to get the appropriate file adapter for a content type
   */
  private getFileAdapter<T>(config: ContentTypeConfig) {
    try {
      return FileAdapterFactory.create<T>(config.fileFormat || "json")
    } catch (error) {
      logger.error(`Failed to create file adapter for format: ${config.fileFormat}`, error as Error)
      throw new ConfigurationError(`No adapter registered for format: ${config.fileFormat || "json"}`)
    }
  }

  /**
   * Helper method to generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString()
  }

  /**
   * Helper method to get file path (without extension)
   */
  private getFilePath(directory: string, id: string): string {
    return `${directory}/${id}`
  }

  /**
   * Helper method to ensure a directory exists
   */
  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await createDirectory(directory)
    } catch (error) {
      logger.error(`Failed to create directory: ${directory}`, error as Error)
      throw new FileSystemError(`Failed to create directory: ${directory}`, directory, "create", error as Error)
    }
  }
}

// Import CmsError for instanceof checks
import { CmsError, ConfigurationError } from "../errors/cms-errors"

// Create and export a singleton instance
export const dataService = new DataService()
