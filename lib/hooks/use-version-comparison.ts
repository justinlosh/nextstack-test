"use client"

import { useState, useCallback } from "react"
import { apiClient } from "../api/api-client"
import { useCmsConfig } from "./cms-context"

/**
 * Result of useVersionComparison hook
 */
export interface UseVersionComparisonResult {
  /**
   * Comparison data
   */
  comparison: any | null

  /**
   * Whether data is being loaded
   */
  isLoading: boolean

  /**
   * Error object if an error occurred
   */
  error: Error | null

  /**
   * Function to compare versions
   */
  compareVersions: (versionId1: string, versionId2: string) => Promise<void>
}

/**
 * Hook for comparing content versions
 * @returns Hook result
 */
export function useVersionComparison(): UseVersionComparisonResult {
  const cmsConfig = useCmsConfig()
  const [comparison, setComparison] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Function to compare versions
  const compareVersions = useCallback(
    async (versionId1: string, versionId2: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.get("versions/compare", {
          versionId1,
          versionId2,
        })

        setComparison(response.data)

        if (cmsConfig.debug) {
          console.log(`[CMS] Compared versions ${versionId1} and ${versionId2}:`, response.data)
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)

        if (cmsConfig.debug) {
          console.error(`[CMS] Error comparing versions ${versionId1} and ${versionId2}:`, errorObj)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [cmsConfig],
  )

  return {
    comparison,
    isLoading,
    error,
    compareVersions,
  }
}
