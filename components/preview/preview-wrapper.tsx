"use client"

import type React from "react"

import { useEffect } from "react"
import { usePreview } from "../../lib/preview/preview-context"
import { getPreviewWebSocketClient } from "../../lib/preview/websocket-client"

interface PreviewWrapperProps {
  contentType: string
  contentId: string
  children: React.ReactNode
}

export default function PreviewWrapper({ contentType, contentId, children }: PreviewWrapperProps) {
  const { isPreviewMode, subscribeToContent, unsubscribeFromContent } = usePreview()

  // Subscribe to content updates when in preview mode
  useEffect(() => {
    if (isPreviewMode) {
      // Initialize WebSocket connection if needed
      const wsClient = getPreviewWebSocketClient()
      if (!wsClient.isConnected()) {
        wsClient.connect()
      }

      // Subscribe to content updates
      subscribeToContent(contentType, contentId)

      // Cleanup on unmount
      return () => {
        unsubscribeFromContent(contentType, contentId)
      }
    }
  }, [isPreviewMode, contentType, contentId, subscribeToContent, unsubscribeFromContent])

  return <>{children}</>
}
