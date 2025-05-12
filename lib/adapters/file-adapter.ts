/**
 * Interface for file system adapters
 */
export interface FileAdapter<T> {
  /**
   * Read content from a file
   * @param filePath Path to the file
   * @returns Parsed content
   */
  read(filePath: string): Promise<T>

  /**
   * Write content to a file
   * @param filePath Path to the file
   * @param data Content to write
   */
  write(filePath: string, data: T): Promise<void>

  /**
   * Check if a file exists
   * @param filePath Path to the file
   * @returns True if the file exists
   */
  exists(filePath: string): Promise<boolean>

  /**
   * Delete a file
   * @param filePath Path to the file
   */
  delete(filePath: string): Promise<void>

  /**
   * Get the file extension for this adapter
   * @returns File extension (e.g., ".json", ".md")
   */
  getFileExtension(): string
}

/**
 * Factory for creating file adapters
 */
export class FileAdapterFactory {
  private static adapters: Map<string, new () => FileAdapter<any>> = new Map()

  /**
   * Register a file adapter
   * @param format Format identifier (e.g., "json", "markdown")
   * @param adapterClass Adapter class
   */
  static register<T>(format: string, adapterClass: new () => FileAdapter<T>): void {
    this.adapters.set(format, adapterClass)
  }

  /**
   * Create a file adapter for the specified format
   * @param format Format identifier (e.g., "json", "markdown")
   * @returns File adapter instance
   */
  static create<T>(format: string): FileAdapter<T> {
    const AdapterClass = this.adapters.get(format)
    if (!AdapterClass) {
      throw new Error(`No adapter registered for format: ${format}`)
    }
    return new AdapterClass()
  }

  /**
   * Check if an adapter is registered for the specified format
   * @param format Format identifier (e.g., "json", "markdown")
   * @returns True if an adapter is registered
   */
  static has(format: string): boolean {
    return this.adapters.has(format)
  }

  /**
   * Get all registered formats
   * @returns Array of format identifiers
   */
  static getFormats(): string[] {
    return Array.from(this.adapters.keys())
  }
}
