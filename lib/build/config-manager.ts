import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import { deepMerge } from "../utils/object-utils"
import { logger } from "../services/logger"

export interface ModuleConfig {
  name: string
  version?: string
  dependencies?: string[]
  assets?: {
    images?: string[]
    styles?: string[]
    fonts?: string[]
    scripts?: string[]
    [key: string]: any
  }
  build?: {
    order?: number
    env?: Record<string, string>
    options?: Record<string, any>
    [key: string]: any
  }
  runtime?: Record<string, any>
  [key: string]: any
}

export interface BuildConfig {
  modules: Record<string, ModuleConfig>
  global: {
    env: Record<string, string>
    options: Record<string, any>
    [key: string]: any
  }
  [key: string]: any
}

class ConfigManager {
  private config: BuildConfig = {
    modules: {},
    global: {
      env: {},
      options: {},
    },
  }

  private configPath: string
  private modulesDir: string

  constructor(configPath = "build.config.yml", modulesDir = "modules") {
    this.configPath = configPath
    this.modulesDir = modulesDir
  }

  /**
   * Initialize the configuration manager
   */
  async init(): Promise<BuildConfig> {
    // Load global configuration
    await this.loadGlobalConfig()

    // Discover and load module configurations
    await this.discoverModules()

    // Process module dependencies
    this.processModuleDependencies()

    return this.config
  }

  /**
   * Load the global configuration file
   */
  private async loadGlobalConfig(): Promise<void> {
    try {
      if (fs.existsSync(this.configPath)) {
        const configContent = fs.readFileSync(this.configPath, "utf8")
        const globalConfig = yaml.load(configContent) as BuildConfig

        this.config = deepMerge(this.config, globalConfig)
        logger.info(`Loaded global configuration from ${this.configPath}`)
      } else {
        logger.warn(`Global configuration file not found at ${this.configPath}, using defaults`)
      }
    } catch (error) {
      logger.error(`Error loading global configuration: ${error.message}`)
      throw new Error(`Failed to load global configuration: ${error.message}`)
    }
  }

  /**
   * Discover modules and load their configurations
   */
  private async discoverModules(): Promise<void> {
    try {
      if (!fs.existsSync(this.modulesDir)) {
        logger.warn(`Modules directory not found at ${this.modulesDir}`)
        return
      }

      const moduleDirectories = fs
        .readdirSync(this.modulesDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

      for (const moduleName of moduleDirectories) {
        await this.loadModuleConfig(moduleName)
      }

      logger.info(`Discovered and loaded configurations for ${Object.keys(this.config.modules).length} modules`)
    } catch (error) {
      logger.error(`Error discovering modules: ${error.message}`)
      throw new Error(`Failed to discover modules: ${error.message}`)
    }
  }

  /**
   * Load configuration for a specific module
   */
  private async loadModuleConfig(moduleName: string): Promise<void> {
    const moduleDir = path.join(this.modulesDir, moduleName)
    const configFile = path.join(moduleDir, "module.config.yml")

    try {
      if (fs.existsSync(configFile)) {
        const configContent = fs.readFileSync(configFile, "utf8")
        const moduleConfig = yaml.load(configContent) as ModuleConfig

        // Ensure the module name is set
        moduleConfig.name = moduleConfig.name || moduleName

        this.config.modules[moduleName] = moduleConfig
        logger.info(`Loaded configuration for module: ${moduleName}`)
      } else {
        // Create a minimal config for modules without a config file
        this.config.modules[moduleName] = {
          name: moduleName,
        }
        logger.warn(`No configuration file found for module: ${moduleName}, using defaults`)
      }
    } catch (error) {
      logger.error(`Error loading configuration for module ${moduleName}: ${error.message}`)
      throw new Error(`Failed to load configuration for module ${moduleName}: ${error.message}`)
    }
  }

  /**
   * Process module dependencies to determine build order
   */
  private processModuleDependencies(): void {
    const modules = this.config.modules
    const moduleNames = Object.keys(modules)

    // Assign default build order if not specified
    moduleNames.forEach((name) => {
      if (!modules[name].build) {
        modules[name].build = {}
      }

      if (modules[name].build.order === undefined) {
        modules[name].build.order = 100 // Default order
      }
    })

    // Adjust build order based on dependencies
    moduleNames.forEach((name) => {
      const dependencies = modules[name].dependencies || []

      dependencies.forEach((depName) => {
        if (modules[depName]) {
          // Ensure dependency builds before dependent module
          if ((modules[depName].build?.order || 0) >= (modules[name].build?.order || 0)) {
            modules[name].build.order = (modules[depName].build?.order || 0) + 10
          }
        } else {
          logger.warn(`Module ${name} depends on ${depName}, but the dependency was not found`)
        }
      })
    })
  }

  /**
   * Get the complete build configuration
   */
  getConfig(): BuildConfig {
    return this.config
  }

  /**
   * Get configuration for a specific module
   */
  getModuleConfig(moduleName: string): ModuleConfig | null {
    return this.config.modules[moduleName] || null
  }

  /**
   * Get all module configurations sorted by build order
   */
  getSortedModules(): ModuleConfig[] {
    return Object.values(this.config.modules).sort((a, b) => (a.build?.order || 100) - (b.build?.order || 100))
  }

  /**
   * Get global environment variables
   */
  getGlobalEnv(): Record<string, string> {
    return this.config.global.env || {}
  }

  /**
   * Get combined environment variables for a module
   */
  getModuleEnv(moduleName: string): Record<string, string> {
    const globalEnv = this.getGlobalEnv()
    const moduleEnv = this.config.modules[moduleName]?.build?.env || {}

    return { ...globalEnv, ...moduleEnv }
  }
}

// Export a singleton instance
export const configManager = new ConfigManager()
