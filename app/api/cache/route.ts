import { type NextRequest, NextResponse } from "next/server"
import { cacheService } from "../../../lib/services/cache-service"
import { handleApiError } from "../../../lib/utils/error-handler"
import { logger } from "../../../lib/services/logger"

export async function GET(request: NextRequest) {
  try {
    // Get cache statistics
    const stats = await cacheService.getStats()

    return NextResponse.json({
      data: {
        stats,
        enabled: true,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Invalid JSON in request body" } },
        { status: 400 },
      )
    }

    // Handle different actions
    const action = body.action

    if (action === "clear") {
      // Clear all cache
      await cacheService.clear()
      logger.info("Cache cleared via API")

      return NextResponse.json({
        data: {
          message: "Cache cleared successfully",
        },
      })
    } else if (action === "invalidate") {
      // Invalidate specific path
      const path = body.path
      const namespace = body.namespace || "api"

      if (!path) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Path parameter is required" } },
          { status: 400 },
        )
      }

      if (path === "*") {
        // Invalidate entire namespace
        await cacheService.removeNamespace(namespace)
        logger.info(`Cache namespace ${namespace} invalidated via API`)
      } else {
        // Invalidate specific path
        await cacheService.remove(path, { namespace })
        logger.info(`Cache path ${path} invalidated via API`)
      }

      return NextResponse.json({
        data: {
          message: `Cache invalidated for path: ${path}`,
        },
      })
    } else if (action === "enable") {
      // Enable or disable cache
      const enabled = body.enabled

      if (enabled === undefined) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "Enabled parameter is required" } },
          { status: 400 },
        )
      }

      cacheService.setEnabled(enabled)
      logger.info(`Cache ${enabled ? "enabled" : "disabled"} via API`)

      return NextResponse.json({
        data: {
          message: `Cache ${enabled ? "enabled" : "disabled"}`,
        },
      })
    } else {
      return NextResponse.json(
        { error: { code: "INVALID_ACTION", message: `Action '${action}' is not supported` } },
        { status: 400 },
      )
    }
  } catch (error) {
    return handleApiError(error)
  }
}
