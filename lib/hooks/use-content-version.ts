"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "../api/api-client"
import { useCmsConfig } from "./cms-context"
import { withRetry } from "../utils/retry-utils"
import type { RetryOptions } from "../utils/retry-utils"

/**
 * Options for useContentVersion hook
 */
export interface UseContentVersionOptions {
  /**
   * Whether to enable automatic fetching
   * @default true
   */
  autoFetch?: boolean

  /**
   * Cache control directive for the API request
   */
  cacheControl?: string

  /**
   * Whether to enable retry logic
   * @default true
   */
  retry?: boolean

  /**
   * Custom retry options
   */
  retryOptions?: RetryOptions

  /**
   * Callback function when content is successfully loaded
   */
  onSuccess?: (data: any) => void

  /**
   * Callback function when an error occurs
   */
  onError?: (error: Error) => void
}

/**
 * Result of useContentVersion hook
 */
export interface UseContentVersionResult<T> {
  /**
   * Version data
   */
  version: T | null

  /**
   * Whether data is being loaded
   */
  isLoading: boolean

  /**
   * Error object if an error occurred
   */
  error: Error | null

  /**
   * Function to manually fetch version
   */
  fetchVersion: () => Promise<void>

  /**
   * Function to create a new draft
   */
  createDraft: (data: Record<string, any>, authorId: string, changeDescription?: string) => Promise<void>

  /**
   * Function to publish a version
   */
  publishVersion: (authorId: string) => Promise<void>

  /**
   * Function to archive a version
   */
  archiveVersion: (authorId: string) => Promise<void>

  /**
   * Function to rollback to a version
   */
  rollbackToVersion: (versionId: string, authorId: string, changeDescription?: string) => Promise<void>

  /**
   * Function to get version history
   */
  getVersionHistory: () => Promise<any[]>

  /**
   * Version history
   */
  versionHistory: any[]

  /**
   * Whether version history is loading
   */
  isHistoryLoading: boolean
}

/**
 * Hook for working with content versions
 * @param contentType Content type
 * @param contentId Content ID
 * @param options Hook options
 * @returns Hook result
 */
export function useContentVersion<T = any>(
  contentType: string,
  contentId: string,
  options: UseContentVersionOptions = {},
): UseContentVersionResult<T> {
  const { autoFetch = true, cacheControl, retry = true, retryOptions, onSuccess, onError } = options

  const cmsConfig = useCmsConfig()
  const [version, setVersion] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(autoFetch)
  const [error, setError] = useState<Error | null>(null)
  const [versionHistory, setVersionHistory] = useState<any[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)

  // Function to fetch the latest version
  const fetchVersion = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Define fetch function
      const fetchFn = async () => {
        const response = await apiClient.get(
          `versions/latest`,
          {
            contentType,
            contentId,
            includeDrafts: "true",
          },
          {
            cacheControl,
          },
        )
        return response.data
      }

      // Execute fetch with or without retry
      const versionData = retry
        ? await withRetry(fetchFn, {
            ...cmsConfig.defaultRetryOptions,
            ...retryOptions,
          })
        : await fetchFn()

      setVersion(versionData)

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(versionData)
      }

      if (cmsConfig.debug) {
        console.log(`[CMS] Fetched latest version for ${contentType}/${contentId}:`, versionData)
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)

      // Call onError callback if provided
      if (onError) {
        onError(errorObj)
      }

      if (cmsConfig.debug) {
        console.error(`[CMS] Error fetching latest version for ${contentType}/${contentId}:`, errorObj)
      }
    } finally {
      setIsLoading(false)
    }
  }, [contentType, contentId, cacheControl, retry, retryOptions, cmsConfig, onSuccess, onError])

  // Function to create a new draft
  const createDraft = useCallback(
    async (data: Record<string, any>, authorId: string, changeDescription?: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.post("versions/create", {
          contentType,
          contentId,
          data,
          authorId,
          changeDescription,
        })

        setVersion(response.data)
        await getVersionHistory()

        if (cmsConfig.debug) {
          console.log(`[CMS] Created draft for ${contentType}/${contentId}:`, response.data)
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)

        if (cmsConfig.debug) {
          console.error(`[CMS] Error creating draft for ${contentType}/${contentId}:`, errorObj)
        }

        throw errorObj
      } finally {
        setIsLoading(false)
      }
    },
    [contentType, contentId, cmsConfig],
  )

  // Function to publish a version
  const publishVersion = useCallback(
    async (authorId: string) => {
      if (!version) {
        throw new Error("No version to publish")
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.post("versions/publish", {
          versionId: version.id,
          authorId,
        })

        setVersion(response.data)
        await getVersionHistory()

        if (cmsConfig.debug) {
          console.log(`[CMS] Published version for ${contentType}/${contentId}:`, response.data)
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)

        if (cmsConfig.debug) {
          console.error(`[CMS] Error publishing version for ${contentType}/${contentId}:`, errorObj)
        }

        throw errorObj
      } finally {
        setIsLoading(false)
      }
    },
    [version, contentType, contentId, cmsConfig],
  )

  // Function to archive a version
  const archiveVersion = useCallback(
    async (authorId: string) => {
      if (!version) {
        throw new Error("No version to archive")
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.post("versions/archive", {
          versionId: version.id,
          authorId,
        })

        setVersion(response.data)
        await getVersionHistory()

        if (cmsConfig.debug) {
          console.log(`[CMS] Archived version for ${contentType}/${contentId}:`, response.data)
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)

        if (cmsConfig.debug) {
          console.error(`[CMS] Error archiving version for ${contentType}/${contentId}:`, errorObj)
        }

        throw errorObj
      } finally {
        setIsLoading(false)
      }
    },
    [version, contentType, contentId, cmsConfig],
  )

  // Function to rollback to a version
  const rollbackToVersion = useCallback(
    async (versionId: string, authorId: string, changeDescription?: string) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await apiClient.post("versions/rollback", {
          versionId,
          authorId,
          changeDescription,
        })

        setVersion(response.data)
        await getVersionHistory()

        if (cmsConfig.debug) {
          console.log(`[CMS] Rolled back to version for ${contentType}/${contentId}:`, response.data)
        }
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)

        if (cmsConfig.debug) {
          console.error(`[CMS] Error rolling back to version for ${contentType}/${contentId}:`, errorObj)
        }

        throw errorObj
      } finally {
        setIsLoading(false)
      }
    },
    [contentType, contentId, cmsConfig],
  )

  // Function to get version history
  const getVersionHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true)

      const response = await apiClient.get("versions/list", {
        contentType,
        contentId,
      })

      const history = response.data || []
      setVersionHistory(history)

      if (cmsConfig.debug) {
        console.log(`[CMS] Fetched version history for ${contentType}/${contentId}:`, history)
      }

      return history
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))

      if (cmsConfig.debug) {
        console.error(`[CMS] Error fetching version history for ${contentType}/${contentId}:`, errorObj)
      }

      return []
    } finally {
      setIsHistoryLoading(false)
    }
  }, [contentType, contentId, cmsConfig])

  // Fetch version on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchVersion()
      getVersionHistory()
    }
  }, [autoFetch, fetchVersion, getVersionHistory])

  return {
    version,
    isLoading,
    error,
    fetchVersion,
    createDraft,
    publishVersion,
    archiveVersion,
    rollbackToVersion,
    getVersionHistory,
    versionHistory,
    isHistoryLoading,
  }
}
