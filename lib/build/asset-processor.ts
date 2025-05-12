import fs from "fs"
import path from "path"
import glob from "glob"
import sharp from "sharp"
import { minify } from "terser"
import CleanCSS from "clean-css"
import { logger } from "../services/logger"
import type { ModuleConfig } from "./config-manager"

export interface AssetProcessingOptions {
  outputDir: string
  publicDir: string
  optimize: boolean
  cache: boolean
}

export interface ProcessedAsset {
  originalPath: string
  processedPath: string
  publicPath: string
  type: string
  size: {
    original: number
    processed: number
  }
}

class AssetProcessor {
  private options: AssetProcessingOptions
  private cacheDir: string
  private processedAssets: Map<string, ProcessedAsset> = new Map()

  constructor(options: Partial<AssetProcessingOptions> = {}) {
    this.options = {
      outputDir: path.join(process.cwd(), ".next", "static", "assets"),
      publicDir: "/static/assets",
      optimize: process.env.NODE_ENV === "production",
      cache: true,
      ...options,
    }

    this.cacheDir = path.join(process.cwd(), ".next", "cache", "assets")

    // Ensure directories exist
    this.ensureDirectories()
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    ;[this.options.outputDir, this.cacheDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * Process all assets for a module
   */
  async processModuleAssets(moduleConfig: ModuleConfig, moduleDir: string): Promise<ProcessedAsset[]> {
    const assets = moduleConfig.assets || {}
    const processedAssets: ProcessedAsset[] = []

    // Process each asset type
    for (const [type, patterns] of Object.entries(assets)) {
      if (Array.isArray(patterns)) {
        for (const pattern of patterns) {
          const assetPaths = glob.sync(pattern, { cwd: moduleDir, absolute: true })

          for (const assetPath of assetPaths) {
            try {
              const processed = await this.processAsset(assetPath, type, moduleConfig.name)
              if (processed) {
                processedAssets.push(processed)
                this.processedAssets.set(assetPath, processed)
              }
            } catch (error) {
              logger.error(`Error processing asset ${assetPath}: ${error.message}`)
            }
          }
        }
      }
    }

    logger.info(`Processed ${processedAssets.length} assets for module ${moduleConfig.name}`)
    return processedAssets
  }

  /**
   * Process a single asset
   */
  private async processAsset(assetPath: string, type: string, moduleName: string): Promise<ProcessedAsset | null> {
    try {
      const stats = fs.statSync(assetPath)
      const originalSize = stats.size

      // Generate output path
      const relativePath = path.relative(process.cwd(), assetPath)
      const assetHash = this.generateAssetHash(assetPath, stats.mtime.getTime().toString())
      const fileName = path.basename(assetPath)
      const fileExt = path.extname(assetPath)
      const outputFileName = `${path.basename(fileName, fileExt)}.${assetHash}${fileExt}`
      const outputPath = path.join(this.options.outputDir, moduleName, outputFileName)
      const publicPath = path.join(this.options.publicDir, moduleName, outputFileName).replace(/\\/g, "/")

      // Check cache
      if (this.options.cache && this.isCached(assetPath, outputPath)) {
        const processedSize = fs.statSync(outputPath).size
        logger.debug(`Using cached asset for ${assetPath}`)

        return {
          originalPath: assetPath,
          processedPath: outputPath,
          publicPath,
          type,
          size: {
            original: originalSize,
            processed: processedSize,
          },
        }
      }

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Process based on asset type
      let processedSize = originalSize

      if (this.options.optimize) {
        switch (type) {
          case "images":
            await this.processImage(assetPath, outputPath)
            break
          case "styles":
            await this.processStylesheet(assetPath, outputPath)
            break
          case "scripts":
            await this.processScript(assetPath, outputPath)
            break
          case "fonts":
            await this.copyAsset(assetPath, outputPath)
            break
          default:
            await this.copyAsset(assetPath, outputPath)
        }
      } else {
        await this.copyAsset(assetPath, outputPath)
      }

      // Update cache
      this.updateCache(assetPath, outputPath)

      // Get processed size
      processedSize = fs.statSync(outputPath).size

      return {
        originalPath: assetPath,
        processedPath: outputPath,
        publicPath,
        type,
        size: {
          original: originalSize,
          processed: processedSize,
        },
      }
    } catch (error) {
      logger.error(`Failed to process asset ${assetPath}: ${error.message}`)
      return null
    }
  }

  /**
   * Process an image asset
   */
  private async processImage(inputPath: string, outputPath: string): Promise<void> {
    const ext = path.extname(inputPath).toLowerCase()

    if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(ext)) {
      let sharpInstance = sharp(inputPath)

      // Apply optimizations based on image type
      switch (ext) {
        case ".jpg":
        case ".jpeg":
          sharpInstance = sharpInstance.jpeg({ quality: 85 })
          break
        case ".png":
          sharpInstance = sharpInstance.png({ compressionLevel: 9 })
          break
        case ".webp":
          sharpInstance = sharpInstance.webp({ quality: 85 })
          break
        case ".avif":
          sharpInstance = sharpInstance.avif({ quality: 80 })
          break
      }

      await sharpInstance.toFile(outputPath)
      logger.debug(`Optimized image: ${inputPath}`)
    } else {
      // For other image types, just copy
      await this.copyAsset(inputPath, outputPath)
    }
  }

  /**
   * Process a stylesheet asset
   */
  private async processStylesheet(inputPath: string, outputPath: string): Promise<void> {
    const content = fs.readFileSync(inputPath, "utf8")
    const result = new CleanCSS({
      level: 2,
      returnPromise: false,
    }).minify(content)

    fs.writeFileSync(outputPath, result.styles)
    logger.debug(
      `Minified CSS: ${inputPath} (${Math.round((result.stats.minifiedSize / result.stats.originalSize) * 100)}% of original)`,
    )
  }

  /**
   * Process a JavaScript asset
   */
  private async processScript(inputPath: string, outputPath: string): Promise<void> {
    const content = fs.readFileSync(inputPath, "utf8")
    const result = await minify(content, {
      compress: true,
      mangle: true,
    })

    if (result.code) {
      fs.writeFileSync(outputPath, result.code)
      logger.debug(`Minified JS: ${inputPath}`)
    } else {
      // Fallback to copying if minification fails
      await this.copyAsset(inputPath, outputPath)
    }
  }

  /**
   * Copy an asset without processing
   */
  private async copyAsset(inputPath: string, outputPath: string): Promise<void> {
    fs.copyFileSync(inputPath, outputPath)
    logger.debug(`Copied asset: ${inputPath}`)
  }

  /**
   * Generate a hash for an asset
   */
  private generateAssetHash(filePath: string, additionalData = ""): string {
    const crypto = require("crypto")
    const fileContent = fs.readFileSync(filePath)
    const hash = crypto.createHash("md5")
    hash.update(fileContent)
    hash.update(additionalData)
    return hash.digest("hex").substring(0, 8)
  }

  /**
   * Check if an asset is cached and up to date
   */
  private isCached(originalPath: string, processedPath: string): boolean {
    if (!fs.existsSync(processedPath)) {
      return false
    }

    const cacheFilePath = this.getCacheFilePath(originalPath)
    if (!fs.existsSync(cacheFilePath)) {
      return false
    }

    try {
      const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"))
      const stats = fs.statSync(originalPath)

      return cacheData.mtime === stats.mtime.getTime()
    } catch (error) {
      return false
    }
  }

  /**
   * Update the cache for an asset
   */
  private updateCache(originalPath: string, processedPath: string): void {
    try {
      const stats = fs.statSync(originalPath)
      const cacheData = {
        originalPath,
        processedPath,
        mtime: stats.mtime.getTime(),
      }

      const cacheFilePath = this.getCacheFilePath(originalPath)
      const cacheDir = path.dirname(cacheFilePath)

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true })
      }

      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData))
    } catch (error) {
      logger.error(`Failed to update cache for ${originalPath}: ${error.message}`)
    }
  }

  /**
   * Get the cache file path for an asset
   */
  private getCacheFilePath(assetPath: string): string {
    const relativePath = path.relative(process.cwd(), assetPath)
    const hash = this.generateAssetHash(assetPath)
    return path.join(this.cacheDir, `${hash}.json`)
  }

  /**
   * Get all processed assets
   */
  getProcessedAssets(): ProcessedAsset[] {
    return Array.from(this.processedAssets.values())
  }

  /**
   * Generate a manifest of all processed assets
   */
  generateManifest(): Record<string, string> {
    const manifest: Record<string, string> = {}

    for (const [originalPath, asset] of this.processedAssets.entries()) {
      const relativePath = path.relative(process.cwd(), originalPath)
      manifest[relativePath] = asset.publicPath
    }

    return manifest
  }

  /**
   * Write the asset manifest to a file
   */
  writeManifest(outputPath: string = path.join(process.cwd(), ".next", "static", "asset-manifest.json")): void {
    const manifest = this.generateManifest()
    const outputDir = path.dirname(outputPath)

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2))
    logger.info(`Asset manifest written to ${outputPath}`)
  }
}

// Export a singleton instance
export const assetProcessor = new AssetProcessor()
