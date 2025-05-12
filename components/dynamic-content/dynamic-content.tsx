"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiClient } from "../../nextstack/lib/api/api-client"
import ContentRenderer from "./content-renderer"
import ContentSkeleton from "./content-skeleton"
import ErrorDisplay from "./error-display"

export interface DynamicContentProps {
  /**
   * Content type to fetch (e.g., 'page', 'post', 'product')
   */
  contentType: string

  /**
   * Content ID to fetch
   */
  contentId: string

  /**
   * Cache control directive for the API request
   * Set to 'no-cache' to bypass cache, or a specific max-age value
   */
  cacheControl?: string

  /**
   * Whether to show a skeleton loader while fetching
   * @default true
   */
  showSkeleton?: boolean

  /**
   * Custom error component to display when fetching fails
   */
  errorComponent?: React.ReactNode

  /**
   * Custom loading component to display while fetching
   */
  loadingComponent?: React.ReactNode

  /**
   * Custom renderer for specific content fields
   */
  customRenderers?: Record<string, (content: any) => React.ReactNode>

  /**
   * Callback function when content is successfully loaded
   */
  onContentLoaded?: (content: any) => void

  /**
   * Callback function when an error occurs
   */
  onError?: (error: Error) => void

  /**
   * Additional CSS class names
   */
  className?: string
}

/**
 * DynamicContent component fetches and renders content from the CMS API
 */
export default function DynamicContent({
  contentType,
  contentId,
  cacheControl,
  showSkeleton = true,
  errorComponent,
  loadingComponent,
  customRenderers,
  onContentLoaded,
  onError,
  className = "",
}: DynamicContentProps) {
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true)
        setError(null)

        // Fetch content from API
        const response = await apiClient.get(contentType, contentId, {
          cacheControl,
        })

        const contentData = response.data

        // Validate content data
        if (!contentData) {
          throw new Error(`No content found for ${contentType}/${contentId}`)
        }

        setContent(contentData)

        // Call onContentLoaded callback if provided
        if (onContentLoaded) {
          onContentLoaded(contentData)
        }
      } catch (err) {
        console.error(`Error fetching ${contentType}/${contentId}:`, err)
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)

        // Call onError callback if provided
        if (onError) {
          onError(error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [contentType, contentId, cacheControl, onContentLoaded, onError])

  // Show loading state
  if (loading) {
    if (loadingComponent) {
      return <div className={className}>{loadingComponent}</div>
    }

    if (showSkeleton) {
      return <ContentSkeleton contentType={contentType} className={className} />
    }

    return <div className={className}>Loading...</div>
  }

  // Show error state
  if (error) {
    if (errorComponent) {
      return <div className={className}>{errorComponent}</div>
    }

    return <ErrorDisplay error={error} contentType={contentType} contentId={contentId} className={className} />
  }

  // Render content
  return (
    <div className={className}>
      <ContentRenderer content={content} contentType={contentType} customRenderers={customRenderers} />
    </div>
  )
}
