import { readFile, writeFile, fileExists, deleteFile } from "../cms"
import { type FileAdapter, FileAdapterFactory } from "./file-adapter"
import { FileSystemError, DataFormatError, NotFoundError, PermissionError } from "../errors/cms-errors"
import { logger } from "../services/logger"

/**
 * Adapter for JSON files
 */
export class JsonAdapter<T> implements FileAdapter<T> {
  /**
   * Read content from a JSON file
   * @param filePath Path to the file (without extension)
   * @returns Parsed JSON content
   */
  async read(filePath: string): Promise<T> {
    const fullPath = `${filePath}${this.getFileExtension()}`

    try {
      // Check if file exists
      if (!(await this.exists(filePath))) {
        throw new NotFoundError(
          `JSON file not found: ${fullPath}`,
          "unknown", // Content type is unknown at this level
          filePath.split("/").pop() || "",
        )
      }

      // Read file content
      const content = await readFile(fullPath)

      // Parse JSON
      try {
        return JSON.parse(content) as T
      } catch (error) {
        logger.error(`Failed to parse JSON file: ${fullPath}`, error as Error)
        throw new DataFormatError(`Invalid JSON format in file: ${fullPath}`, fullPath, "JSON", error as Error)
      }
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof NotFoundError || error instanceof DataFormatError) {
        throw error
      }

      // Handle permission errors
      if ((error as NodeJS.ErrnoException).code === "EACCES") {
        logger.error(`Permission denied when reading file: ${fullPath}`, error as Error)
        throw new PermissionError(`Permission denied when reading file: ${fullPath}`, fullPath, "read")
      }

      // Handle other file system errors
      logger.error(`Error reading JSON file: ${fullPath}`, error as Error)
      throw new FileSystemError(`Failed to read JSON file: ${fullPath}`, fullPath, "read", error as Error)
    }
  }

  /**
   * Write content to a JSON file
   * @param filePath Path to the file (without extension)
   * @param data Content to write
   */
  async write(filePath: string, data: T): Promise<void> {
    const fullPath = `${filePath}${this.getFileExtension()}`

    try {
      // Convert data to JSON
      let content: string
      try {
        content = JSON.stringify(data, null, 2)
      } catch (error) {
        logger.error(`Failed to stringify data to JSON: ${fullPath}`, error as Error)
        throw new DataFormatError(
          `Failed to convert data to JSON format: ${fullPath}`,
          fullPath,
          "JSON",
          error as Error,
        )
      }

      // Write to file
      await writeFile(fullPath, content)
      logger.debug(`Successfully wrote JSON file: ${fullPath}`)
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof DataFormatError) {
        throw error
      }

      // Handle permission errors
      if ((error as NodeJS.ErrnoException).code === "EACCES") {
        logger.error(`Permission denied when writing file: ${fullPath}`, error as Error)
        throw new PermissionError(`Permission denied when writing file: ${fullPath}`, fullPath, "write")
      }

      // Handle directory not found errors
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        logger.error(`Directory not found when writing file: ${fullPath}`, error as Error)
        throw new FileSystemError(
          `Directory not found when writing file: ${fullPath}. Please ensure the directory exists.`,
          fullPath.substring(0, fullPath.lastIndexOf("/")),
          "create",
          error as Error,
        )
      }

      // Handle other file system errors
      logger.error(`Error writing JSON file: ${fullPath}`, error as Error)
      throw new FileSystemError(`Failed to write JSON file: ${fullPath}`, fullPath, "write", error as Error)
    }
  }

  /**
   * Check if a JSON file exists
   * @param filePath Path to the file (without extension)
   * @returns True if the file exists
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = `${filePath}${this.getFileExtension()}`
    try {
      return await fileExists(fullPath)
    } catch (error) {
      logger.error(`Error checking if JSON file exists: ${fullPath}`, error as Error)
      throw new FileSystemError(`Failed to check if JSON file exists: ${fullPath}`, fullPath, "read", error as Error)
    }
  }

  /**
   * Delete a JSON file
   * @param filePath Path to the file (without extension)
   */
  async delete(filePath: string): Promise<void> {
    const fullPath = `${filePath}${this.getFileExtension()}`

    try {
      // Check if file exists
      if (!(await this.exists(filePath))) {
        throw new NotFoundError(
          `JSON file not found: ${fullPath}`,
          "unknown", // Content type is unknown at this level
          filePath.split("/").pop() || "",
        )
      }

      // Delete file
      await deleteFile(fullPath)
      logger.debug(`Successfully deleted JSON file: ${fullPath}`)
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof NotFoundError) {
        throw error
      }

      // Handle permission errors
      if ((error as NodeJS.ErrnoException).code === "EACCES") {
        logger.error(`Permission denied when deleting file: ${fullPath}`, error as Error)
        throw new PermissionError(`Permission denied when deleting file: ${fullPath}`, fullPath, "delete")
      }

      // Handle other file system errors
      logger.error(`Error deleting JSON file: ${fullPath}`, error as Error)
      throw new FileSystemError(`Failed to delete JSON file: ${fullPath}`, fullPath, "delete", error as Error)
    }
  }

  /**
   * Get the file extension for JSON files
   * @returns ".json"
   */
  getFileExtension(): string {
    return ".json"
  }
}

// Register the JSON adapter
FileAdapterFactory.register("json", JsonAdapter)
