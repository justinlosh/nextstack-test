"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "../api/api-client"
import { useCmsConfig } from "./cms-context"
import { withRetry } from "../utils/retry-utils"
import type { RetryOptions } from "../utils/retry-utils"

/**
 * Options for useContent hook
 */
export interface UseContentOptions {
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
 * Result of useContent hook
 */
export interface UseContentResult<T> {
  /**
   * Content data
   */
  data: T | null

  /**
   * Whether data is being loaded
   */
  isLoading: boolean

  /**
   * Error object if an error occurred
   */
  error: Error | null

  /**
   * Function to manually fetch content
   */
  fetchContent: () => Promise<void>

  /**
   * Function to manually refresh content
   */
  refreshContent: () => Promise<void>
}

/**
 * Hook for fetching content from the CMS API
 * @param contentType Content type to fetch
 * @param contentId Content ID to fetch
 * @param options Hook options
 * @returns Hook result
 */
export function useContent<T = any>(
  contentType: string,
  contentId: string,
  options: UseContentOptions = {},
): UseContentResult<T> {
  const { autoFetch = true, cacheControl, retry = true, retryOptions, onSuccess, onError } = options

  const cmsConfig = useCmsConfig()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(autoFetch)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch content
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Define fetch function
      const fetchFn = async () => {
        const response = await apiClient.get(contentType, contentId, {
          cacheControl,
        })
        return response.data
      }

      // Execute fetch with or without retry
      const contentData = retry
        ? await withRetry(fetchFn, {
            ...cmsConfig.defaultRetryOptions,
            ...retryOptions,
          })
        : await fetchFn()

      // Validate content data
      if (!contentData) {
        throw new Error(`No content found for ${contentType}/${contentId}`)
      }

      setData(contentData)

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(contentData)
      }

      if (cmsConfig.debug) {
        console.log(`[CMS] Fetched ${contentType}/${contentId}:`, contentData)
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)

      // Call onError callback if provided
      if (onError) {
        onError(errorObj)
      }

      if (cmsConfig.debug) {
        console.error(`[CMS] Error fetching ${contentType}/${contentId}:`, errorObj)
      }
    } finally {
      setIsLoading(false)
    }
  }, [contentType, contentId, cacheControl, retry, retryOptions, cmsConfig, onSuccess, onError])

  // Function to refresh content
  const refreshContent = useCallback(() => {
    return fetchContent()
  }, [fetchContent])

  // Fetch content on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchContent()
    }
  }, [autoFetch, fetchContent])

  return {
    data,
    isLoading,
    error,
    fetchContent,
    refreshContent,
  }
}
