import type { Server as HTTPServer } from "http"
import { websocketService } from "../services/websocket-service"
import { logger } from "../services/logger"

/**
 * Initialize WebSocket server
 * @param server HTTP server instance
 */
export function initWebSocketServer(server: HTTPServer): void {
  try {
    websocketService.initialize(server)
    logger.info("WebSocket server initialized")
  } catch (error) {
    logger.error("Failed to initialize WebSocket server:", error)
  }
}
