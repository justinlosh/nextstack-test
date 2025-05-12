"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "../api/api-client"
import { useCmsConfig } from "./cms-context"
import { withRetry } from "../utils/retry-utils"
import type { RetryOptions } from "../utils/retry-utils"
import type { PaginationInfo } from "./use-content-list"

/**
 * Advanced query criteria
 */
export interface QueryCriteria {
  /**
   * Filter criteria
   */
  filters?: Record<string, any>

  /**
   * Sort configuration
   */
  sort?: {
    field: string
    order: "asc" | "desc"
  }

  /**
   * Pagination configuration
   */
  pagination?: {
    page: number
    pageSize: number
  }
}

/**
 * Options for useContentQuery hook
 */
export interface UseContentQueryOptions {
  /**
   * Whether to enable automatic fetching
   * @default true
   */
  autoFetch?: boolean

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
  onSuccess?: (data: any[], pagination: PaginationInfo) => void

  /**
   * Callback function when an error occurs
   */
  onError?: (error: Error) => void
}

/**
 * Result of useContentQuery hook
 */
export interface UseContentQueryResult<T> {
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
   * Function to update query criteria
   */
  updateQuery: (criteria: QueryCriteria) => void
}

/**
 * Hook for performing advanced queries on the CMS API
 * @param contentType Content type to query
 * @param initialCriteria Initial query criteria
 * @param options Hook options
 * @returns Hook result
 */
export function useContentQuery<T = any>(
  contentType: string,
  initialCriteria: QueryCriteria = {},
  options: UseContentQueryOptions = {},
): UseContentQueryResult<T> {
  const { autoFetch = true, retry = true, retryOptions, onSuccess, onError } = options

  const cmsConfig = useCmsConfig()
  const [criteria, setCriteria] = useState<QueryCriteria>(initialCriteria)
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(autoFetch)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialCriteria.pagination?.page || 1,
    pageSize: initialCriteria.pagination?.pageSize || 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  // Function to fetch content with query
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Define fetch function
      const fetchFn = async () => {
        const response = await apiClient.query(contentType, criteria)
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
        page: criteria.pagination?.page || 1,
        pageSize: criteria.pagination?.pageSize || 10,
        totalItems: contentData.length,
        totalPages: Math.ceil(contentData.length / (criteria.pagination?.pageSize || 10)),
        hasNextPage: false,
        hasPreviousPage: (criteria.pagination?.page || 1) > 1,
      }

      setData(contentData)
      setPagination(paginationData)

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(contentData, paginationData)
      }

      if (cmsConfig.debug) {
        console.log(`[CMS] Queried ${contentType}:`, {
          criteria,
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
        console.error(`[CMS] Error querying ${contentType}:`, errorObj)
      }
    } finally {
      setIsLoading(false)
    }
  }, [contentType, criteria, retry, retryOptions, cmsConfig, onSuccess, onError])

  // Function to refresh content
  const refreshContent = useCallback(() => {
    return fetchContent()
  }, [fetchContent])

  // Function to update query criteria
  const updateQuery = useCallback((newCriteria: QueryCriteria) => {
    setCriteria((prevCriteria) => ({
      ...prevCriteria,
      ...newCriteria,
      // Merge nested objects
      filters: {
        ...(prevCriteria.filters || {}),
        ...(newCriteria.filters || {}),
      },
      pagination: {
        ...(prevCriteria.pagination || {}),
        ...(newCriteria.pagination || {}),
      },
    }))
  }, [])

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
    pagination,
    fetchContent,
    refreshContent,
    updateQuery,
  }
}
