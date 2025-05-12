"use client"

import { useState, useEffect, useCallback } from "react"
import { useContent, type UseContentOptions, type UseContentResult } from "./use-content"
import { usePreview } from "../preview/preview-context"
import { debounce } from "../utils/debounce"

/**
 * Options for useContentPreview hook
 */
export interface UseContentPreviewOptions extends UseContentOptions {
  /**
   * Whether to enable preview mode
   * @default true
   */
  enablePreview?: boolean

  /**
   * Debounce time for preview updates in milliseconds
   * @default 500
   */
  debounceTime?: number
}

/**
 * Result of useContentPreview hook
 */
export interface UseContentPreviewResult<T> extends UseContentResult<T> {
  /**
   * Whether preview mode is active
   */
  isPreviewMode: boolean

  /**
   * Preview data
   */
  previewData: T | null

  /**
   * Update preview content
   */
  updatePreview: (data: Partial<T>) => void

  /**
   * Save preview content as a draft
   */
  saveAsDraft: () => Promise<void>

  /**
   * Publish preview content
   */
  publish: () => Promise<void>

  /**
   * Reset preview to original content
   */
  resetPreview: () => void
}

/**
 * Hook for fetching content with preview support
 * @param contentType Content type to fetch
 * @param contentId Content ID to fetch
 * @param options Hook options
 * @returns Hook result
 */
export function useContentPreview<T = any>(
  contentType: string,
  contentId: string,
  options: UseContentPreviewOptions = {},
): UseContentPreviewResult<T> {
  const { enablePreview = true, debounceTime = 500, ...contentOptions } = options

  // Get content from the CMS
  const contentResult = useContent<T>(contentType, contentId, contentOptions)

  // Get preview context
  const {
    isPreviewMode,
    previewData: allPreviewData,
    updatePreviewContent,
    subscribeToContent,
    unsubscribeFromContent,
    saveContent,
    publishContent,
  } = usePreview()

  // Local state for preview data
  const [previewData, setPreviewData] = useState<T | null>(null)

  // Get preview data for this content
  useEffect(() => {
    if (isPreviewMode && enablePreview) {
      const contentKey = `${contentType}:${contentId}`
      const data = allPreviewData[contentKey] as T | undefined
      setPreviewData(data || contentResult.data)
    } else {
      setPreviewData(null)
    }
  }, [isPreviewMode, enablePreview, contentType, contentId, allPreviewData, contentResult.data])

  // Subscribe to content updates
  useEffect(() => {
    if (isPreviewMode && enablePreview) {
      subscribeToContent(contentType, contentId)
      return () => {
        unsubscribeFromContent(contentType, contentId)
      }
    }
  }, [isPreviewMode, enablePreview, contentType, contentId, subscribeToContent, unsubscribeFromContent])

  // Create debounced update function
  const debouncedUpdate = useCallback(
    debounce((data: Record<string, any>) => {
      updatePreviewContent(contentType, contentId, data)
    }, debounceTime),
    [contentType, contentId, updatePreviewContent, debounceTime],
  )

  // Update preview content
  const updatePreview = useCallback(
    (data: Partial<T>) => {
      if (!isPreviewMode || !enablePreview) return

      // Update local state immediately for responsive UI
      setPreviewData(
        (prev) =>
          ({
            ...(prev || contentResult.data || {}),
            ...data,
          }) as T,
      )

      // Send debounced update to preview system
      debouncedUpdate({
        ...(contentResult.data || {}),
        ...previewData,
        ...data,
      })
    },
    [isPreviewMode, enablePreview, contentResult.data, previewData, debouncedUpdate],
  )

  // Save preview content as a draft
  const saveAsDraft = useCallback(async () => {
    if (!isPreviewMode || !enablePreview || !previewData) return

    try {
      // Save content using the versioning service
      // This would typically call an API endpoint
      saveContent(contentType, contentId)

      // Refresh content after saving
      await contentResult.refreshContent()
    } catch (error) {
      console.error("Error saving draft:", error)
      throw error
    }
  }, [isPreviewMode, enablePreview, previewData, contentType, contentId, saveContent, contentResult])

  // Publish preview content
  const publish = useCallback(async () => {
    if (!isPreviewMode || !enablePreview || !previewData) return

    try {
      // Publish content using the versioning service
      // This would typically call an API endpoint
      publishContent(contentType, contentId)

      // Refresh content after publishing
      await contentResult.refreshContent()
    } catch (error) {
      console.error("Error publishing content:", error)
      throw error
    }
  }, [isPreviewMode, enablePreview, previewData, contentType, contentId, publishContent, contentResult])

  // Reset preview to original content
  const resetPreview = useCallback(() => {
    if (!isPreviewMode || !enablePreview) return
    setPreviewData(contentResult.data)
    updatePreviewContent(contentType, contentId, contentResult.data || {})
  }, [isPreviewMode, enablePreview, contentResult.data, contentType, contentId, updatePreviewContent])

  return {
    ...contentResult,
    isPreviewMode: isPreviewMode && enablePreview,
    previewData,
    updatePreview,
    saveAsDraft,
    publish,
    resetPreview,
  }
}
