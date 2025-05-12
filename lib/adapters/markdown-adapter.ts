import { readFile, writeFile, fileExists, deleteFile } from "../cms"
import { type FileAdapter, FileAdapterFactory } from "./file-adapter"
import { parseFrontmatter, generateFrontmatter } from "./frontmatter"
import { FileSystemError, DataFormatError, NotFoundError, PermissionError } from "../errors/cms-errors"
import { logger } from "../services/logger"

/**
 * Adapter for Markdown files
 */
export class MarkdownAdapter<T extends { content?: string }> implements FileAdapter<T> {
  /**
   * Read content from a Markdown file
   * @param filePath Path to the file (without extension)
   * @returns Parsed Markdown content with frontmatter
   */
  async read(filePath: string): Promise<T> {
    const fullPath = `${filePath}${this.getFileExtension()}`

    try {
      // Check if file exists
      if (!(await this.exists(filePath))) {
        throw new NotFoundError(
          `Markdown file not found: ${fullPath}`,
          "unknown", // Content type is unknown at this level
          filePath.split("/").pop() || "",
        )
      }

      // Read file content
      const rawContent = await readFile(fullPath)

      // Parse frontmatter and content
      try {
        const { frontmatter, content } = parseFrontmatter<T>(rawContent)

        // Combine frontmatter and content
        return {
          ...frontmatter,
          content,
        }
      } catch (error) {
        logger.error(`Failed to parse frontmatter in Markdown file: ${fullPath}`, error as Error)
        throw new DataFormatError(
          `Invalid frontmatter format in file: ${fullPath}`,
          fullPath,
          "Markdown",
          error as Error,
        )
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
      logger.error(`Error reading Markdown file: ${fullPath}`, error as Error)
      throw new FileSystemError(`Failed to read Markdown file: ${fullPath}`, fullPath, "read", error as Error)
    }
  }

  /**
   * Write content to a Markdown file
   * @param filePath Path to the file (without extension)
   * @param data Content to write
   */
  async write(filePath: string, data: T): Promise<void> {
    const fullPath = `${filePath}${this.getFileExtension()}`

    try {
      // Extract content field
      const { content, ...frontmatterData } = data

      // Generate frontmatter
      let markdownContent: string
      try {
        const frontmatter = generateFrontmatter(frontmatterData as Record<string, any>)
        markdownContent = `${frontmatter}${content || ""}`
      } catch (error) {
        logger.error(`Failed to generate frontmatter for Markdown file: ${fullPath}`, error as Error)
        throw new DataFormatError(
          `Failed to convert data to Markdown format: ${fullPath}`,
          fullPath,
          "Markdown",
          error as Error,
        )
      }

      // Write to file
      await writeFile(fullPath, markdownContent)
      logger.debug(`Successfully wrote Markdown file: ${fullPath}`)
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
      logger.error(`Error writing Markdown file: ${fullPath}`, error as Error)
      throw new FileSystemError(`Failed to write Markdown file: ${fullPath}`, fullPath, "write", error as Error)
    }
  }

  /**
   * Check if a Markdown file exists
   * @param filePath Path to the file (without extension)
   * @returns True if the file exists
   */
  async exists(filePath: string): Promise<boolean> {
    const fullPath = `${filePath}${this.getFileExtension()}`
    try {
      return await fileExists(fullPath)
    } catch (error) {
      logger.error(`Error checking if Markdown file exists: ${fullPath}`, error as Error)
      throw new FileSystemError(
        `Failed to check if Markdown file exists: ${fullPath}`,
        fullPath,
        "read",
        error as Error,
      )
    }
  }

  /**
   * Delete a Markdown file
   * @param filePath Path to the file (without extension)
   */
  async delete(filePath: string): Promise<void> {
    const fullPath = `${filePath}${this.getFileExtension()}`

    try {
      // Check if file exists
      if (!(await this.exists(filePath))) {
        throw new NotFoundError(
          `Markdown file not found: ${fullPath}`,
          "unknown", // Content type is unknown at this level
          filePath.split("/").pop() || "",
        )
      }

      // Delete file
      await deleteFile(fullPath)
      logger.debug(`Successfully deleted Markdown file: ${fullPath}`)
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
      logger.error(`Error deleting Markdown file: ${fullPath}`, error as Error)
      throw new FileSystemError(`Failed to delete Markdown file: ${fullPath}`, fullPath, "delete", error as Error)
    }
  }

  /**
   * Get the file extension for Markdown files
   * @returns ".md"
   */
  getFileExtension(): string {
    return ".md"
  }
}

// Register the Markdown adapter
FileAdapterFactory.register("markdown", MarkdownAdapter)
