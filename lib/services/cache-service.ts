import fs from "fs/promises"
import path from "path"
import { logger } from "./logger"

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T
  expiry: number | null // null means no expiration
}

/**
 * Cache options interface
 */
export interface CacheOptions {
  ttl?: number // Time to live in seconds, undefined means no expiration
  namespace?: string // Cache namespace for grouping related items
}

/**
 * Cache service for storing and retrieving data
 */
export class CacheService {
  private static instance: CacheService
  private memoryCache: Map<string, CacheEntry<any>> = new Map()
  private cacheDir: string = path.join(process.cwd(), ".cache")
  private maxMemoryCacheSize = 100 // Maximum number of items in memory cache
  private enabled = true

  private constructor() {
    // Ensure cache directory exists
    this.ensureCacheDirectory().catch((error) => {
      logger.error("Failed to create cache directory", error)
    })
  }

  /**
   * Get the cache service instance
   */
  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  /**
   * Enable or disable the cache
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    logger.info(`Cache ${enabled ? "enabled" : "disabled"}`)
  }

  /**
   * Set the maximum memory cache size
   */
  public setMaxMemoryCacheSize(size: number): void {
    this.maxMemoryCacheSize = size
    logger.info(`Max memory cache size set to ${size}`)
  }

  /**
   * Set the cache directory
   */
  public setCacheDirectory(dir: string): void {
    this.cacheDir = dir
    this.ensureCacheDirectory().catch((error) => {
      logger.error(`Failed to create cache directory: ${dir}`, error)
    })
  }

  /**
   * Get data from cache
   * @param key Cache key
   * @param options Cache options
   * @returns Cached data or null if not found
   */
  public async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.enabled) {
      return null
    }

    const cacheKey = this.getCacheKey(key, options.namespace)

    // Try memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey)
    if (memoryEntry) {
      // Check if expired
      if (memoryEntry.expiry === null || memoryEntry.expiry > Date.now()) {
        logger.debug(`Cache hit (memory): ${cacheKey}`)
        return memoryEntry.data as T
      } else {
        // Remove expired entry
        this.memoryCache.delete(cacheKey)
      }
    }

    // Try file cache
    try {
      const filePath = this.getCacheFilePath(cacheKey)
      const fileExists = await this.fileExists(filePath)
      if (fileExists) {
        const fileContent = await fs.readFile(filePath, "utf-8")
        const cacheEntry: CacheEntry<T> = JSON.parse(fileContent)

        // Check if expired
        if (cacheEntry.expiry === null || cacheEntry.expiry > Date.now()) {
          // Store in memory cache for faster access next time
          this.memoryCache.set(cacheKey, cacheEntry)
          this.pruneMemoryCache()

          logger.debug(`Cache hit (file): ${cacheKey}`)
          return cacheEntry.data
        } else {
          // Remove expired entry
          await this.removeFile(filePath)
        }
      }
    } catch (error) {
      logger.error(`Error reading cache file for key: ${cacheKey}`, error as Error)
    }

    logger.debug(`Cache miss: ${cacheKey}`)
    return null
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param options Cache options
   */
  public async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    if (!this.enabled) {
      return
    }

    const cacheKey = this.getCacheKey(key, options.namespace)
    const expiry = options.ttl ? Date.now() + options.ttl * 1000 : null

    const cacheEntry: CacheEntry<T> = {
      data,
      expiry,
    }

    // Store in memory cache
    this.memoryCache.set(cacheKey, cacheEntry)
    this.pruneMemoryCache()

    // Store in file cache
    try {
      const filePath = this.getCacheFilePath(cacheKey)
      await this.ensureCacheDirectory()
      await fs.writeFile(filePath, JSON.stringify(cacheEntry), "utf-8")
      logger.debug(`Cache set: ${cacheKey}`)
    } catch (error) {
      logger.error(`Error writing cache file for key: ${cacheKey}`, error as Error)
    }
  }

  /**
   * Remove data from cache
   * @param key Cache key
   * @param options Cache options
   */
  public async remove(key: string, options: CacheOptions = {}): Promise<void> {
    const cacheKey = this.getCacheKey(key, options.namespace)

    // Remove from memory cache
    this.memoryCache.delete(cacheKey)

    // Remove from file cache
    try {
      const filePath = this.getCacheFilePath(cacheKey)
      const fileExists = await this.fileExists(filePath)
      if (fileExists) {
        await fs.unlink(filePath)
      }
      logger.debug(`Cache removed: ${cacheKey}`)
    } catch (error) {
      logger.error(`Error removing cache file for key: ${cacheKey}`, error as Error)
    }
  }

  /**
   * Remove all data from a namespace
   * @param namespace Cache namespace
   */
  public async removeNamespace(namespace: string): Promise<void> {
    // Remove from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`${namespace}:`)) {
        this.memoryCache.delete(key)
      }
    }

    // Remove from file cache
    try {
      const namespacePath = path.join(this.cacheDir, namespace)
      const exists = await this.fileExists(namespacePath)
      if (exists) {
        await this.removeDirectory(namespacePath)
      }
      logger.debug(`Cache namespace removed: ${namespace}`)
    } catch (error) {
      logger.error(`Error removing cache namespace: ${namespace}`, error as Error)
    }
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear()

    // Clear file cache
    try {
      await this.removeDirectory(this.cacheDir)
      await this.ensureCacheDirectory()
      logger.info("Cache cleared")
    } catch (error) {
      logger.error("Error clearing cache", error as Error)
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<{
    memoryCacheSize: number
    fileCacheSize: number
    fileCacheCount: number
  }> {
    const memoryCacheSize = this.memoryCache.size

    let fileCacheSize = 0
    let fileCacheCount = 0

    try {
      fileCacheCount = await this.countCacheFiles(this.cacheDir)
      fileCacheSize = await this.calculateCacheSize(this.cacheDir)
    } catch (error) {
      logger.error("Error calculating cache stats", error as Error)
    }

    return {
      memoryCacheSize,
      fileCacheSize,
      fileCacheCount,
    }
  }

  /**
   * Get cache key with namespace
   */
  private getCacheKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key
  }

  /**
   * Get cache file path
   */
  private getCacheFilePath(key: string): string {
    // Split by namespace
    const parts = key.split(":")
    if (parts.length > 1) {
      const namespace = parts[0]
      const actualKey = parts.slice(1).join(":")
      return path.join(this.cacheDir, namespace, this.sanitizeFileName(actualKey) + ".json")
    }

    return path.join(this.cacheDir, this.sanitizeFileName(key) + ".json")
  }

  /**
   * Sanitize file name
   */
  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-z0-9]/gi, "_").toLowerCase()
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true })
    } catch (error) {
      logger.error(`Error creating cache directory: ${this.cacheDir}`, error as Error)
      throw error
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Remove file
   */
  private async removeFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
    } catch (error) {
      logger.error(`Error removing file: ${filePath}`, error as Error)
    }
  }

  /**
   * Remove directory recursively
   */
  private async removeDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true })
    } catch (error) {
      logger.error(`Error removing directory: ${dirPath}`, error as Error)
      throw error
    }
  }

  /**
   * Count cache files
   */
  private async countCacheFiles(dirPath: string): Promise<number> {
    let count = 0

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        if (entry.isDirectory()) {
          count += await this.countCacheFiles(fullPath)
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
          count++
        }
      }
    } catch (error) {
      logger.error(`Error counting cache files in: ${dirPath}`, error as Error)
    }

    return count
  }

  /**
   * Calculate cache size in bytes
   */
  private async calculateCacheSize(dirPath: string): Promise<number> {
    let size = 0

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)

        if (entry.isDirectory()) {
          size += await this.calculateCacheSize(fullPath)
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
          const stats = await fs.stat(fullPath)
          size += stats.size
        }
      }
    } catch (error) {
      logger.error(`Error calculating cache size in: ${dirPath}`, error as Error)
    }

    return size
  }

  /**
   * Prune memory cache if it exceeds the maximum size
   */
  private pruneMemoryCache(): void {
    if (this.memoryCache.size <= this.maxMemoryCacheSize) {
      return
    }

    // Remove oldest entries (based on insertion order in Map)
    const entriesToRemove = this.memoryCache.size - this.maxMemoryCacheSize
    let count = 0

    for (const key of this.memoryCache.keys()) {
      this.memoryCache.delete(key)
      count++

      if (count >= entriesToRemove) {
        break
      }
    }

    logger.debug(`Pruned ${count} entries from memory cache`)
  }
}

// Export a singleton instance
export const cacheService = CacheService.getInstance()
