import { moduleRegistry } from "../modules/module-registry"
import { logger } from "../services/logger"

/**
 * Initialize all modules
 */
export async function initModules(): Promise<void> {
  try {
    logger.info("Initializing modules...")

    // Initialize the module registry
    await moduleRegistry.init()

    // Get all modules
    const modules = moduleRegistry.getModules()

    logger.info(`Initialized ${modules.length} modules`)
  } catch (error) {
    logger.error(`Failed to initialize modules: ${error.message}`)
    throw error
  }
}
