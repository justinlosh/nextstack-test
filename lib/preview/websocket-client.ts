"use client"

import { io, type Socket } from "socket.io-client"
import { PreviewEventType, type PreviewContentUpdate } from "../services/websocket-service"
import { generateSessionId } from "../utils/session-utils"

// WebSocket client for real-time preview
export class WebSocketClient {
  private socket: Socket | null = null
  private sessionId: string
  private isEditor: boolean
  private contentSubscriptions: Set<string> = new Set()
  private eventHandlers: Map<string, Set<Function>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  /**
   * Create a new WebSocket client
   * @param isEditor Whether this client is an editor
   * @param sessionId Optional session ID (will generate one if not provided)
   */
  constructor(isEditor = false, sessionId?: string) {
    this.isEditor = isEditor
    this.sessionId = sessionId || generateSessionId()
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.socket) {
      console.warn("WebSocket client already connected")
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    this.socket = io(socketUrl, {
      path: "/api/preview/socket",
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    })

    this.setupEventHandlers()
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log(`WebSocket connected: ${this.socket?.id}`)
      this.reconnectAttempts = 0

      // Register as editor or preview client
      if (this.isEditor) {
        this.socket?.emit(PreviewEventType.EDITOR_CONNECT, this.sessionId)
      } else {
        this.socket?.emit(PreviewEventType.PREVIEW_CONNECT, this.sessionId)
      }

      // Resubscribe to content
      this.contentSubscriptions.forEach((contentKey) => {
        const [contentType, contentId] = contentKey.split(":")
        this.subscribeToContent(contentType, contentId)
      })

      // Trigger connect event handlers
      this.triggerEventHandlers("connect", { sessionId: this.sessionId })
    })

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected")
      this.triggerEventHandlers("disconnect", { sessionId: this.sessionId })
    })

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      this.reconnectAttempts++
      this.triggerEventHandlers("error", { error, sessionId: this.sessionId })
    })

    // Handle content update events
    this.socket.on(PreviewEventType.CONTENT_UPDATE, (update: PreviewContentUpdate) => {
      this.triggerEventHandlers(PreviewEventType.CONTENT_UPDATE, update)
    })

    // Handle content save events
    this.socket.on(
      PreviewEventType.CONTENT_SAVE,
      (data: { sessionId: string; contentType: string; contentId: string }) => {
        this.triggerEventHandlers(PreviewEventType.CONTENT_SAVE, data)
      },
    )

    // Handle content publish events
    this.socket.on(
      PreviewEventType.CONTENT_PUBLISH,
      (data: { sessionId: string; contentType: string; contentId: string }) => {
        this.triggerEventHandlers(PreviewEventType.CONTENT_PUBLISH, data)
      },
    )

    // Handle error events
    this.socket.on(PreviewEventType.ERROR, (data: { message: string }) => {
      console.error("WebSocket error:", data.message)
      this.triggerEventHandlers(PreviewEventType.ERROR, data)
    })
  }

  /**
   * Subscribe to content updates
   * @param contentType Content type
   * @param contentId Content ID
   */
  subscribeToContent(contentType: string, contentId: string): void {
    if (!this.socket) {
      console.warn("WebSocket not connected")
      return
    }

    const contentKey = `${contentType}:${contentId}`
    this.contentSubscriptions.add(contentKey)

    this.socket.emit("content:subscribe", {
      sessionId: this.sessionId,
      contentType,
      contentId,
    })

    console.log(`Subscribed to content: ${contentKey}`)
  }

  /**
   * Unsubscribe from content updates
   * @param contentType Content type
   * @param contentId Content ID
   */
  unsubscribeFromContent(contentType: string, contentId: string): void {
    if (!this.socket) {
      console.warn("WebSocket not connected")
      return
    }

    const contentKey = `${contentType}:${contentId}`
    this.contentSubscriptions.delete(contentKey)

    this.socket.emit("content:unsubscribe", {
      sessionId: this.sessionId,
      contentType,
      contentId,
    })

    console.log(`Unsubscribed from content: ${contentKey}`)
  }

  /**
   * Send a content update
   * @param contentType Content type
   * @param contentId Content ID
   * @param data Content data
   * @param metadata Optional metadata
   */
  sendContentUpdate(
    contentType: string,
    contentId: string,
    data: Record<string, any>,
    metadata?: Record<string, any>,
  ): void {
    if (!this.socket) {
      console.warn("WebSocket not connected")
      return
    }

    if (!this.isEditor) {
      console.warn("Only editor clients can send content updates")
      return
    }

    const update: PreviewContentUpdate = {
      contentType,
      contentId,
      data,
      metadata,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    }

    this.socket.emit(PreviewEventType.CONTENT_UPDATE, update)
  }

  /**
   * Send a content save event
   * @param contentType Content type
   * @param contentId Content ID
   */
  sendContentSave(contentType: string, contentId: string): void {
    if (!this.socket) {
      console.warn("WebSocket not connected")
      return
    }

    if (!this.isEditor) {
      console.warn("Only editor clients can send content save events")
      return
    }

    this.socket.emit(PreviewEventType.CONTENT_SAVE, {
      sessionId: this.sessionId,
      contentType,
      contentId,
    })
  }

  /**
   * Send a content publish event
   * @param contentType Content type
   * @param contentId Content ID
   */
  sendContentPublish(contentType: string, contentId: string): void {
    if (!this.socket) {
      console.warn("WebSocket not connected")
      return
    }

    if (!this.isEditor) {
      console.warn("Only editor clients can send content publish events")
      return
    }

    this.socket.emit(PreviewEventType.CONTENT_PUBLISH, {
      sessionId: this.sessionId,
      contentType,
      contentId,
    })
  }

  /**
   * Register an event handler
   * @param event Event name
   * @param handler Event handler function
   * @returns Function to unregister the handler
   */
  on(event: string, handler: Function): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }

    this.eventHandlers.get(event)!.add(handler)

    return () => {
      const handlers = this.eventHandlers.get(event)
      if (handlers) {
        handlers.delete(handler)
        if (handlers.size === 0) {
          this.eventHandlers.delete(event)
        }
      }
    }
  }

  /**
   * Trigger event handlers for an event
   * @param event Event name
   * @param data Event data
   */
  private triggerEventHandlers(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (!this.socket) {
      console.warn("WebSocket not connected")
      return
    }

    this.socket.disconnect()
    this.socket = null
    this.contentSubscriptions.clear()
    console.log("WebSocket disconnected")
  }

  /**
   * Get the session ID
   * @returns Session ID
   */
  getSessionId(): string {
    return this.sessionId
  }

  /**
   * Check if the client is connected
   * @returns Whether the client is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

// Create a singleton instance for the editor client
let editorClientInstance: WebSocketClient | null = null

/**
 * Get the editor WebSocket client instance
 * @returns Editor WebSocket client
 */
export function getEditorWebSocketClient(): WebSocketClient {
  if (!editorClientInstance) {
    editorClientInstance = new WebSocketClient(true)
  }
  return editorClientInstance
}

// Create a singleton instance for the preview client
let previewClientInstance: WebSocketClient | null = null

/**
 * Get the preview WebSocket client instance
 * @returns Preview WebSocket client
 */
export function getPreviewWebSocketClient(): WebSocketClient {
  if (!previewClientInstance) {
    previewClientInstance = new WebSocketClient(false)
  }
  return previewClientInstance
}
