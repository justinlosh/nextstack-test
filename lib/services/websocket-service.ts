import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { logger } from "./logger"

// Event types for the WebSocket service
export enum PreviewEventType {
  CONTENT_UPDATE = "content:update",
  CONTENT_SAVE = "content:save",
  CONTENT_PUBLISH = "content:publish",
  PREVIEW_CONNECT = "preview:connect",
  PREVIEW_DISCONNECT = "preview:disconnect",
  EDITOR_CONNECT = "editor:connect",
  EDITOR_DISCONNECT = "editor:disconnect",
  ERROR = "error",
}

// Preview content update payload
export interface PreviewContentUpdate {
  contentType: string
  contentId: string
  data: Record<string, any>
  metadata?: Record<string, any>
  timestamp: number
  sessionId: string
}

// WebSocket service for real-time preview
export class WebSocketService {
  private io: SocketIOServer | null = null
  private previewSessions: Map<string, string[]> = new Map() // sessionId -> socketIds
  private editorSessions: Map<string, string[]> = new Map() // sessionId -> socketIds
  private contentSubscriptions: Map<string, string[]> = new Map() // contentKey -> sessionIds

  /**
   * Initialize the WebSocket service
   * @param server HTTP server instance
   */
  initialize(server: HTTPServer): void {
    if (this.io) {
      logger.warn("WebSocket service already initialized")
      return
    }

    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: "/api/preview/socket",
    })

    this.setupEventHandlers()
    logger.info("WebSocket service initialized")
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return

    this.io.on("connection", (socket) => {
      logger.debug(`Socket connected: ${socket.id}`)

      // Handle preview client connection
      socket.on(PreviewEventType.PREVIEW_CONNECT, (sessionId: string) => {
        this.handlePreviewConnect(socket.id, sessionId)
      })

      // Handle editor client connection
      socket.on(PreviewEventType.EDITOR_CONNECT, (sessionId: string) => {
        this.handleEditorConnect(socket.id, sessionId)
      })

      // Handle content update from editor
      socket.on(PreviewEventType.CONTENT_UPDATE, (update: PreviewContentUpdate) => {
        this.handleContentUpdate(update)
      })

      // Handle content save
      socket.on(
        PreviewEventType.CONTENT_SAVE,
        (data: { sessionId: string; contentType: string; contentId: string }) => {
          this.handleContentSave(data)
        },
      )

      // Handle content publish
      socket.on(
        PreviewEventType.CONTENT_PUBLISH,
        (data: { sessionId: string; contentType: string; contentId: string }) => {
          this.handleContentPublish(data)
        },
      )

      // Handle subscription to content
      socket.on("content:subscribe", (data: { sessionId: string; contentType: string; contentId: string }) => {
        this.subscribeToContent(socket.id, data)
      })

      // Handle unsubscription from content
      socket.on("content:unsubscribe", (data: { sessionId: string; contentType: string; contentId: string }) => {
        this.unsubscribeFromContent(socket.id, data)
      })

      // Handle disconnection
      socket.on("disconnect", () => {
        this.handleDisconnect(socket.id)
      })
    })
  }

  /**
   * Handle preview client connection
   * @param socketId Socket ID
   * @param sessionId Session ID
   */
  private handlePreviewConnect(socketId: string, sessionId: string): void {
    if (!this.previewSessions.has(sessionId)) {
      this.previewSessions.set(sessionId, [])
    }

    this.previewSessions.get(sessionId)?.push(socketId)
    logger.debug(`Preview client connected: ${socketId} (Session: ${sessionId})`)
  }

  /**
   * Handle editor client connection
   * @param socketId Socket ID
   * @param sessionId Session ID
   */
  private handleEditorConnect(socketId: string, sessionId: string): void {
    if (!this.editorSessions.has(sessionId)) {
      this.editorSessions.set(sessionId, [])
    }

    this.editorSessions.get(sessionId)?.push(socketId)
    logger.debug(`Editor client connected: ${socketId} (Session: ${sessionId})`)
  }

  /**
   * Handle content update from editor
   * @param update Content update data
   */
  private handleContentUpdate(update: PreviewContentUpdate): void {
    const { contentType, contentId, sessionId } = update
    const contentKey = `${contentType}:${contentId}`

    // Get all sessions subscribed to this content
    const subscribedSessions = this.contentSubscriptions.get(contentKey) || []

    // Broadcast to all preview clients for the subscribed sessions
    for (const subSessionId of subscribedSessions) {
      const previewSocketIds = this.previewSessions.get(subSessionId) || []
      for (const socketId of previewSocketIds) {
        this.io?.to(socketId).emit(PreviewEventType.CONTENT_UPDATE, update)
      }
    }

    logger.debug(`Content update broadcast for ${contentType}/${contentId} to ${subscribedSessions.length} sessions`)
  }

  /**
   * Handle content save event
   * @param data Save event data
   */
  private handleContentSave(data: { sessionId: string; contentType: string; contentId: string }): void {
    const { contentType, contentId, sessionId } = data
    const contentKey = `${contentType}:${contentId}`

    // Get all sessions subscribed to this content
    const subscribedSessions = this.contentSubscriptions.get(contentKey) || []

    // Broadcast to all preview clients for the subscribed sessions
    for (const subSessionId of subscribedSessions) {
      const previewSocketIds = this.previewSessions.get(subSessionId) || []
      for (const socketId of previewSocketIds) {
        this.io?.to(socketId).emit(PreviewEventType.CONTENT_SAVE, data)
      }
    }

    logger.debug(`Content save broadcast for ${contentType}/${contentId}`)
  }

  /**
   * Handle content publish event
   * @param data Publish event data
   */
  private handleContentPublish(data: { sessionId: string; contentType: string; contentId: string }): void {
    const { contentType, contentId, sessionId } = data
    const contentKey = `${contentType}:${contentId}`

    // Get all sessions subscribed to this content
    const subscribedSessions = this.contentSubscriptions.get(contentKey) || []

    // Broadcast to all preview clients for the subscribed sessions
    for (const subSessionId of subscribedSessions) {
      const previewSocketIds = this.previewSessions.get(subSessionId) || []
      for (const socketId of previewSocketIds) {
        this.io?.to(socketId).emit(PreviewEventType.CONTENT_PUBLISH, data)
      }
    }

    logger.debug(`Content publish broadcast for ${contentType}/${contentId}`)
  }

  /**
   * Subscribe a client to content updates
   * @param socketId Socket ID
   * @param data Subscription data
   */
  private subscribeToContent(
    socketId: string,
    data: { sessionId: string; contentType: string; contentId: string },
  ): void {
    const { contentType, contentId, sessionId } = data
    const contentKey = `${contentType}:${contentId}`

    if (!this.contentSubscriptions.has(contentKey)) {
      this.contentSubscriptions.set(contentKey, [])
    }

    const sessions = this.contentSubscriptions.get(contentKey)!
    if (!sessions.includes(sessionId)) {
      sessions.push(sessionId)
    }

    logger.debug(`Client ${socketId} subscribed to ${contentKey} (Session: ${sessionId})`)
  }

  /**
   * Unsubscribe a client from content updates
   * @param socketId Socket ID
   * @param data Unsubscription data
   */
  private unsubscribeFromContent(
    socketId: string,
    data: { sessionId: string; contentType: string; contentId: string },
  ): void {
    const { contentType, contentId, sessionId } = data
    const contentKey = `${contentType}:${contentId}`

    const sessions = this.contentSubscriptions.get(contentKey) || []
    const index = sessions.indexOf(sessionId)
    if (index !== -1) {
      sessions.splice(index, 1)
    }

    if (sessions.length === 0) {
      this.contentSubscriptions.delete(contentKey)
    }

    logger.debug(`Client ${socketId} unsubscribed from ${contentKey} (Session: ${sessionId})`)
  }

  /**
   * Handle client disconnection
   * @param socketId Socket ID
   */
  private handleDisconnect(socketId: string): void {
    // Remove from preview sessions
    for (const [sessionId, socketIds] of this.previewSessions.entries()) {
      const index = socketIds.indexOf(socketId)
      if (index !== -1) {
        socketIds.splice(index, 1)
        if (socketIds.length === 0) {
          this.previewSessions.delete(sessionId)
        }
        logger.debug(`Preview client disconnected: ${socketId} (Session: ${sessionId})`)
        break
      }
    }

    // Remove from editor sessions
    for (const [sessionId, socketIds] of this.editorSessions.entries()) {
      const index = socketIds.indexOf(socketId)
      if (index !== -1) {
        socketIds.splice(index, 1)
        if (socketIds.length === 0) {
          this.editorSessions.delete(sessionId)
        }
        logger.debug(`Editor client disconnected: ${socketId} (Session: ${sessionId})`)
        break
      }
    }
  }

  /**
   * Send an error message to a specific client
   * @param socketId Socket ID
   * @param error Error message
   */
  sendError(socketId: string, error: string): void {
    this.io?.to(socketId).emit(PreviewEventType.ERROR, { message: error })
  }

  /**
   * Get the Socket.IO server instance
   * @returns Socket.IO server instance
   */
  getIO(): SocketIOServer | null {
    return this.io
  }

  /**
   * Check if the WebSocket service is initialized
   * @returns Whether the service is initialized
   */
  isInitialized(): boolean {
    return this.io !== null
  }
}

// Export a singleton instance
export const websocketService = new WebSocketService()
