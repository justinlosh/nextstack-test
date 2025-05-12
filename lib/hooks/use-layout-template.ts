"use client"

import { useState, useEffect } from "react"
import { apiClient } from "../api/api-client"
import type { LayoutTemplate } from "../layouts/types"

interface UseLayoutTemplateOptions {
  id: string
  cacheControl?: string
  retryOptions?: {
    maxRetries: number
    baseDelay: number
  }
}

interface UseLayoutTemplateResult {
  template: LayoutTemplate | null
  isLoading: boolean
  error: Error | null
  refreshTemplate: () => Promise<void>
}

export function useLayoutTemplate({
  id,
  cacheControl = "max-age=3600",
  retryOptions = { maxRetries: 3, baseDelay: 1000 },
}: UseLayoutTemplateOptions): UseLayoutTemplateResult {
  const [template, setTemplate] = useState<LayoutTemplate | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTemplate = async () => {
    setIsLoading(true)
    setError(null)

    let retries = 0
    let lastError: Error | null = null

    while (retries <= retryOptions.maxRetries) {
      try {
        const response = await apiClient.get("layoutTemplate", id, {
          cacheControl,
        })

        if (!response.data) {
          throw new Error(`Template with ID ${id} not found`)
        }

        setTemplate(response.data)
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
    fetchTemplate()
  }, [id])

  const refreshTemplate = async () => {
    await fetchTemplate()
  }

  return { template, isLoading, error, refreshTemplate }
}
