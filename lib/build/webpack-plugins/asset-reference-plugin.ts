import path from "path"
import fs from "fs"
import type { Compiler } from "webpack"
import { logger } from "../../services/logger"

interface AssetReferencePluginOptions {
  manifestPath: string
}

/**
 * Webpack plugin to replace asset references with their processed paths
 */
export class AssetReferencePlugin {
  private options: AssetReferencePluginOptions
  private manifest: Record<string, string> = {}

  constructor(options: Partial<AssetReferencePluginOptions> = {}) {
    this.options = {
      manifestPath: path.join(process.cwd(), ".next", "static", "asset-manifest.json"),
      ...options,
    }
  }

  apply(compiler: Compiler): void {
    const pluginName = this.constructor.name

    compiler.hooks.beforeCompile.tapAsync(pluginName, (params, callback) => {
      this.loadManifest()
      callback()
    })

    compiler.hooks.normalModuleFactory.tap(pluginName, (factory) => {
      factory.hooks.parser.for("javascript/auto").tap(pluginName, (parser) => {
        // Handle import statements
        parser.hooks.import.tap(pluginName, (statement, source) => {
          this.processImport(parser, source)
        })

        // Handle require statements
        parser.hooks.call.for("require").tap(pluginName, (expression) => {
          if (expression.arguments.length > 0 && expression.arguments[0].type === "Literal") {
            const source = expression.arguments[0].value
            if (typeof source === "string") {
              this.processImport(parser, source)
            }
          }
        })
      })
    })
  }

  private loadManifest(): void {
    try {
      if (fs.existsSync(this.options.manifestPath)) {
        this.manifest = JSON.parse(fs.readFileSync(this.options.manifestPath, "utf8"))
        logger.debug(`Loaded asset manifest with ${Object.keys(this.manifest).length} entries`)
      } else {
        logger.warn(`Asset manifest not found at ${this.options.manifestPath}`)
      }
    } catch (error) {
      logger.error(`Failed to load asset manifest: ${error.message}`)
    }
  }

  private processImport(parser: any, source: string): void {
    // Check if the source is in the manifest
    if (this.manifest[source]) {
      // Replace the source with the processed path
      parser.state.current.addDependency({
        request: this.manifest[source],
        userRequest: source,
      })
    }
  }
}
