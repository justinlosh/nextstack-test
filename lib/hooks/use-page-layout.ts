"use client"

import { useState, useEffect } from "react"
import { apiClient } from "../api/api-client"
import type { PageLayoutConfig } from "../layouts/types"

interface UsePageLayoutOptions {
  id: string
  cacheControl?: string
  retryOptions?: {
    maxRetries: number
    baseDelay: number
  }
}

interface UsePageLayoutResult {
  pageLayout: PageLayoutConfig | null
  isLoading: boolean
  error: Error | null
  refreshPageLayout: () => Promise<void>
}

export function usePageLayout({
  id,
  cacheControl = "max-age=3600",
  retryOptions = { maxRetries: 3, baseDelay: 1000 },
}: UsePageLayoutOptions): UsePageLayoutResult {
  const [pageLayout, setPageLayout] = useState<PageLayoutConfig | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPageLayout = async () => {
    setIsLoading(true)
    setError(null)

    let retries = 0
    let lastError: Error | null = null

    while (retries <= retryOptions.maxRetries) {
      try {
        const response = await apiClient.get("pageLayout", id, {
          cacheControl,
        })

        if (!response.data) {
          throw new Error(`Page layout with ID ${id} not found`)
        }

        setPageLayout(response.data)
        setIsLoading(false)
        return
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        retries++

        if (retries <= retryOptions.maxRetries) {
          // Exponential backoff
          const delay = retryOptions.baseDelay * Math.pow(2, retries - 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    setError(lastError)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPageLayout()
  }, [id])

  const refreshPageLayout = async () => {
    await fetchPageLayout()
  }

  return { pageLayout, isLoading, error, refreshPageLayout }
}
