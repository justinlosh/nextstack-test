"use client"

import React, { createContext, useContext, type ReactNode } from "react"

// Define the context type
interface ModuleConfigContextType {
  getConfig: <T = any>(moduleName: string, key?: string) => T
  getAllConfigs: () => Record<string, any>
}

// Create the context
const ModuleConfigContext = createContext<ModuleConfigContextType | null>(null)

// Props for the provider
interface ModuleConfigProviderProps {
  children: ReactNode
  initialConfig?: Record<string, any>
}

/**
 * Provider component for module configuration
 */
export function ModuleConfigProvider({ children, initialConfig = {} }: ModuleConfigProviderProps): JSX.Element {
  // Get the configuration from environment variable or use the provided initial config
  const config = React.useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        // Try to parse the configuration from the environment variable
        const envConfig = process.env.NEXT_PUBLIC_MODULE_CONFIG
        if (envConfig) {
          return JSON.parse(envConfig)
        }
      } catch (error) {
        console.error("Failed to parse module configuration:", error)
      }
    }

    return initialConfig
  }, [initialConfig])

  // Create the context value
  const contextValue = React.useMemo<ModuleConfigContextType>(
    () => ({
      getConfig: <T = any>(moduleName: string, key?: string): T => {
        const moduleConfig = config[moduleName] || {}

        if (key) {
          return moduleConfig[key] as T
        }

        return moduleConfig as T
      },
      getAllConfigs: () => config,
    }),
    [config],
  )

  return <ModuleConfigContext.Provider value={contextValue}>{children}</ModuleConfigContext.Provider>
}

/**
 * Hook to use module configuration
 */
export function useModuleConfig<T = any>(moduleName: string, key?: string): T {
  const context = useContext(ModuleConfigContext)

  if (!context) {
    throw new Error("useModuleConfig must be used within a ModuleConfigProvider")
  }

  return context.getConfig<T>(moduleName, key)
}

/**
 * Hook to get all module configurations
 */
export function useAllModuleConfigs(): Record<string, any> {
  const context = useContext(ModuleConfigContext)

  if (!context) {
    throw new Error("useAllModuleConfigs must be used within a ModuleConfigProvider")
  }

  return context.getAllConfigs()
}
