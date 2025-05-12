"use client"

import { createContext, useContext, type ReactNode } from "react"
import { apiClient } from "../api/api-client"
import type { RetryOptions } from "../utils/retry-utils"

/**
 * Configuration options for CMS hooks
 */
export interface CmsConfig {
  /**
   * Base URL for API requests
   * @default "/api"
   */
  baseUrl?: string

  /**
   * Default cache control header for API requests
   * @default null (use API client default)
   */
  defaultCacheControl?: string | null

  /**
   * Default retry options for API requests
   */
  defaultRetryOptions?: RetryOptions

  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean
}

/**
 * Default CMS configuration
 */
const DEFAULT_CMS_CONFIG: CmsConfig = {
  baseUrl: "/api",
  defaultCacheControl: null,
  defaultRetryOptions: {
    maxRetries: 3,
    baseDelay: 1000,
    exponentialBackoff: true,
    isRetryable: (error) => {
      // Don't retry 404 errors
      if (error && "status" in error && error.status === 404) {
        return false
      }
      return true
    },
  },
  debug: false,
}

// Create context
const CmsContext = createContext<CmsConfig>(DEFAULT_CMS_CONFIG)

/**
 * Props for CmsProvider component
 */
export interface CmsProviderProps {
  /**
   * CMS configuration options
   */
  config?: CmsConfig

  /**
   * Child components
   */
  children: ReactNode
}

/**
 * Provider component for CMS configuration
 */
export function CmsProvider({ config = {}, children }: CmsProviderProps) {
  const mergedConfig = { ...DEFAULT_CMS_CONFIG, ...config }

  // Configure API client
  if (mergedConfig.baseUrl) {
    apiClient.baseUrl = mergedConfig.baseUrl
  }

  if (mergedConfig.defaultCacheControl !== undefined) {
    apiClient.setDefaultCacheControl(mergedConfig.defaultCacheControl)
  }

  return <CmsContext.Provider value={mergedConfig}>{children}</CmsContext.Provider>
}

/**
 * Hook to access CMS configuration
 * @returns CMS configuration
 */
export function useCmsConfig(): CmsConfig {
  return useContext(CmsContext)
}
