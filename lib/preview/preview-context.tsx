"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { getEditorWebSocketClient, getPreviewWebSocketClient } from "./websocket-client"
import { PreviewEventType, type PreviewContentUpdate } from "../services/websocket-service"
import { getOrCreateSessionId } from "../utils/session-utils"

// Preview mode types
export enum PreviewMode {
  DISABLED = "disabled",
  SPLIT = "split",
  FULLSCREEN = "fullscreen",
}

// Preview context interface
interface PreviewContextType {
  // State
  isPreviewMode: boolean
  previewMode: PreviewMode
  previewData: Record<string, any>
  isConnected: boolean
  sessionId: string
  isLoading: boolean
  error: Error | null

  // Actions
  setPreviewMode: (mode: PreviewMode) => void
  updatePreviewContent: (contentType: string, contentId: string, data: Record<string, any>) => void
  subscribeToContent: (contentType: string, contentId: string) => void
  unsubscribeFromContent: (contentType: string, contentId: string) => void
  saveContent: (contentType: string, contentId: string) => void
  publishContent: (contentType: string, contentId: string) => void
  resetPreview: () => void
}

// Create the context
const PreviewContext = createContext<PreviewContextType | undefined>(undefined)

// Preview provider props
interface PreviewProviderProps {
  children: React.ReactNode
  initialMode?: PreviewMode
  initialData?: Record<string, any>
}

// Preview provider component
export function PreviewProvider({
  children,
  initialMode = PreviewMode.DISABLED,
  initialData = {},
}: PreviewProviderProps) {
  // State
  const [previewMode, setPreviewMode] = useState<PreviewMode>(initialMode)
  const [previewData, setPreviewData] = useState<Record<string, any>>(initialData)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [sessionId] = useState<string>(() => getOrCreateSessionId())

  // Determine if preview mode is active
  const isPreviewMode = previewMode !== PreviewMode.DISABLED

  // Get the appropriate WebSocket client
  const wsClient = useMemo(() => {
    return isPreviewMode ? getPreviewWebSocketClient() : getEditorWebSocketClient()
  }, [isPreviewMode])

  // Connect to WebSocket server when preview mode changes
  useEffect(() => {
    if (isPreviewMode && !wsClient.isConnected()) {
      wsClient.connect()
    }

    return () => {
      // Don't disconnect on unmount to maintain the connection for the session
    }
  }, [isPreviewMode, wsClient])

  // Set up event handlers
  useEffect(() => {
    if (!isPreviewMode) return

    // Handle connection events
    const connectHandler = () => {
      setIsConnected(true)
      setError(null)
    }

    const disconnectHandler = () => {
      setIsConnected(false)
    }

    const errorHandler = (data: { error: Error }) => {
      setError(data.error)
    }

    // Handle content update events
    const contentUpdateHandler = (update: PreviewContentUpdate) => {
      setPreviewData((prev) => ({
        ...prev,
        [`${update.contentType}:${update.contentId}`]: update.data,
      }))
    }

    // Register event handlers
    const unsubscribeConnect = wsClient.on("connect", connectHandler)
    const unsubscribeDisconnect = wsClient.on("disconnect", disconnectHandler)
    const unsubscribeError = wsClient.on(PreviewEventType.ERROR, errorHandler)
    const unsubscribeContentUpdate = wsClient.on(PreviewEventType.CONTENT_UPDATE, contentUpdateHandler)

    return () => {
      // Unregister event handlers
      unsubscribeConnect()
      unsubscribeDisconnect()
      unsubscribeError()
      unsubscribeContentUpdate()
    }
  }, [isPreviewMode, wsClient])

  // Update preview content
  const updatePreviewContent = useCallback(
    (contentType: string, contentId: string, data: Record<string, any>) => {
      if (!isPreviewMode) {
        wsClient.sendContentUpdate(contentType, contentId, data)
      } else {
        setPreviewData((prev) => ({
          ...prev,
          [`${contentType}:${contentId}`]: data,
        }))
      }
    },
    [isPreviewMode, wsClient],
  )

  // Subscribe to content updates
  const subscribeToContent = useCallback(
    (contentType: string, contentId: string) => {
      if (isPreviewMode) {
        wsClient.subscribeToContent(contentType, contentId)
      }
    },
    [isPreviewMode, wsClient],
  )

  // Unsubscribe from content updates
  const unsubscribeFromContent = useCallback(
    (contentType: string, contentId: string) => {
      if (isPreviewMode) {
        wsClient.unsubscribeFromContent(contentType, contentId)
      }
    },
    [isPreviewMode, wsClient],
  )

  // Save content
  const saveContent = useCallback(
    (contentType: string, contentId: string) => {
      if (!isPreviewMode) {
        wsClient.sendContentSave(contentType, contentId)
      }
    },
    [isPreviewMode, wsClient],
  )

  // Publish content
  const publishContent = useCallback(
    (contentType: string, contentId: string) => {
      if (!isPreviewMode) {
        wsClient.sendContentPublish(contentType, contentId)
      }
    },
    [isPreviewMode, wsClient],
  )

  // Reset preview
  const resetPreview = useCallback(() => {
    setPreviewData({})
  }, [])

  // Context value
  const contextValue: PreviewContextType = {
    isPreviewMode,
    previewMode,
    previewData,
    isConnected,
    sessionId,
    isLoading,
    error,
    setPreviewMode,
    updatePreviewContent,
    subscribeToContent,
    unsubscribeFromContent,
    saveContent,
    publishContent,
    resetPreview,
  }

  return <PreviewContext.Provider value={contextValue}>{children}</PreviewContext.Provider>
}

// Hook to use the preview context
export function usePreview() {
  const context = useContext(PreviewContext)
  if (context === undefined) {
    throw new Error("usePreview must be used within a PreviewProvider")
  }
  return context
}
