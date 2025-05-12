"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "../api/api-client"
import { useCmsConfig } from "./cms-context"
import { withRetry } from "../utils/retry-utils"
import type { RetryOptions } from "../utils/retry-utils"

/**
 * Options for useContentList hook
 */
export interface UseContentListOptions {
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
   * Page number for pagination
   * @default 1
   */
  page?: number

  /**
   * Number of items per page
   * @default 10
   */
  pageSize?: number

  /**
   * Field to sort by
   * @default "updatedAt"
   */
  sortBy?: string

  /**
   * Sort order
   * @default "desc"
   */
  sortOrder?: "asc" | "desc"

  /**
   * Filter criteria
   */
  filters?: Record<string, string>

  /**
   * Callback function when content is successfully loaded
   */
  onSuccess?: (data: any[], pagination: PaginationInfo) => void

  /**
   * Callback function when an error occurs
   */
  onError?: (error: Error) => void
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  /**
   * Current page number
   */
  page: number

  /**
   * Number of items per page
   */
  pageSize: number

  /**
   * Total number of items
   */
  totalItems: number

  /**
   * Total number of pages
   */
  totalPages: number

  /**
   * Whether there is a next page
   */
  hasNextPage: boolean

  /**
   * Whether there is a previous page
   */
  hasPreviousPage: boolean
}

/**
 * Result of useContentList hook
 */
export interface UseContentListResult<T> {
  /**
   * Content data array
   */
  data: T[]

  /**
   * Whether data is being loaded
   */
  isLoading: boolean

  /**
   * Error object if an error occurred
   */
  error: Error | null

  /**
   * Pagination information
   */
  pagination: PaginationInfo

  /**
   * Function to manually fetch content
   */
  fetchContent: () => Promise<void>

  /**
   * Function to manually refresh content
   */
  refreshContent: () => Promise<void>

  /**
   * Function to change the current page
   */
  setPage: (page: number) => void
}

/**
 * Hook for fetching a list of content from the CMS API
 * @param contentType Content type to fetch
 * @param options Hook options
 * @returns Hook result
 */
export function useContentList<T = any>(
  contentType: string,
  options: UseContentListOptions = {},
): UseContentListResult<T> {
  const {
    autoFetch = true,
    cacheControl,
    retry = true,
    retryOptions,
    page: initialPage = 1,
    pageSize = 10,
    sortBy = "updatedAt",
    sortOrder = "desc",
    filters = {},
    onSuccess,
    onError,
  } = options

  const cmsConfig = useCmsConfig()
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(autoFetch)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(initialPage)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialPage,
    pageSize,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  // Function to fetch content list
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Prepare query parameters
      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
        ...filters,
      }

      // Define fetch function
      const fetchFn = async () => {
        const response = await apiClient.list(contentType, params, {
          cacheControl,
        })
        return response
      }

      // Execute fetch with or without retry
      const response = retry
        ? await withRetry(fetchFn, {
            ...cmsConfig.defaultRetryOptions,
            ...retryOptions,
          })
        : await fetchFn()

      // Extract data and pagination
      const contentData = response.data || []
      const paginationData = response.pagination || {
        page,
        pageSize,
        totalItems: contentData.length,
        totalPages: Math.ceil(contentData.length / pageSize),
        hasNextPage: false,
        hasPreviousPage: page > 1,
      }

      setData(contentData)
      setPagination(paginationData)

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(contentData, paginationData)
      }

      if (cmsConfig.debug) {
        console.log(`[CMS] Fetched ${contentType} list:`, {
          data: contentData,
          pagination: paginationData,
        })
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)

      // Call onError callback if provided
      if (onError) {
        onError(errorObj)
      }

      if (cmsConfig.debug) {
        console.error(`[CMS] Error fetching ${contentType} list:`, errorObj)
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    contentType,
    page,
    pageSize,
    sortBy,
    sortOrder,
    filters,
    cacheControl,
    retry,
    retryOptions,
    cmsConfig,
    onSuccess,
    onError,
  ])

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

  // Update page state when initialPage changes
  useEffect(() => {
    setPage(initialPage)
  }, [initialPage])

  return {
    data,
    isLoading,
    error,
    pagination,
    fetchContent,
    refreshContent,
    setPage,
  }
}
