import { type NextRequest, NextResponse } from "next/server"
import { getVercelEnvironment } from "../config/vercel-env"
import { logger } from "../services/logger"

type ApiHandler = (req: NextRequest, context: any) => Promise<NextResponse>

interface ApiHandlerOptions {
  cors?: boolean
  cacheControl?: string
  rateLimit?: {
    limit: number
    windowMs: number
  }
}

/**
 * Wraps an API handler with Vercel-specific optimizations
 */
export function withVercelOptimizations(handler: ApiHandler, options: ApiHandlerOptions = {}) {
  return async function optimizedHandler(req: NextRequest, context: any): Promise<NextResponse> {
    const startTime = Date.now()
    const environment = getVercelEnvironment()

    try {
      // Add CORS headers if enabled
      const response = await handler(req, context)

      if (options.cors) {
        response.headers.set("Access-Control-Allow-Origin", "*")
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      }

      // Add cache control headers if specified
      if (options.cacheControl) {
        response.headers.set("Cache-Control", options.cacheControl)
      }

      // Add server timing header for performance monitoring
      const duration = Date.now() - startTime
      response.headers.set("Server-Timing", `handler;dur=${duration}`)

      return response
    } catch (error) {
      logger.error("API handler error", {
        path: req.nextUrl.pathname,
        method: req.method,
        error: error.message,
        environment,
      })

      return NextResponse.json(
        {
          error: {
            message: environment === "production" ? "An unexpected error occurred" : error.message,
          },
        },
        { status: 500 },
      )
    }
  }
}
