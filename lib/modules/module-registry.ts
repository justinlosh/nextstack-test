import fs from "fs"
import path from "path"
import { logger } from "../services/logger"

export interface ModuleInfo {
  name: string
  path: string
  config: any
}

class ModuleRegistry {
  private modules: Map<string, ModuleInfo> = new Map()
  private modulesDir: string
  private initialized = false

  constructor(modulesDir = "modules") {
    this.modulesDir = modulesDir
  }

  /**
   * Initialize the module registry
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      if (!fs.existsSync(this.modulesDir)) {
        logger.warn(`Modules directory not found at ${this.modulesDir}`)
        this.initialized = true
        return
      }

      const moduleDirectories = fs
        .readdirSync(this.modulesDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

      for (const moduleName of moduleDirectories) {
        await this.registerModule(moduleName)
      }

      this.initialized = true
      logger.info(`Registered ${this.modules.size} modules`)
    } catch (error) {
      logger.error(`Error initializing module registry: ${error.message}`)
      throw new Error(`Failed to initialize module registry: ${error.message}`)
    }
  }

  /**
   * Register a module
   */
  private async registerModule(moduleName: string): Promise<void> {
    const moduleDir = path.join(this.modulesDir, moduleName)
    const configFile = path.join(moduleDir, "module.config.yml")

    try {
      let config = {}

      if (fs.existsSync(configFile)) {
        const yaml = require("js-yaml")
        const configContent = fs.readFileSync(configFile, "utf8")
        config = yaml.load(configContent)
      }

      this.modules.set(moduleName, {
        name: moduleName,
        path: moduleDir,
        config,
      })

      logger.info(`Registered module: ${moduleName}`)
    } catch (error) {
      logger.error(`Error registering module ${moduleName}: ${error.message}`)
      throw new Error(`Failed to register module ${moduleName}: ${error.message}`)
    }
  }

  /**
   * Get all registered modules
   */
  getModules(): ModuleInfo[] {
    return Array.from(this.modules.values())
  }

  /**
   * Get a specific module
   */
  getModule(moduleName: string): ModuleInfo | undefined {
    return this.modules.get(moduleName)
  }

  /**
   * Check if a module is registered
   */
  hasModule(moduleName: string): boolean {
    return this.modules.has(moduleName)
  }
}

// Export a singleton instance
export const moduleRegistry = new ModuleRegistry()
