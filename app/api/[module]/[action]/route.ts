import { type NextRequest, NextResponse } from "next/server"
import { dataService } from "../../../../lib/data-service"
import { handleApiError } from "../../../../lib/utils/error-handler"
import { validateRequest } from "../../../../lib/api/validation"
import { applyPagination, applyFilters, applySorting } from "../../../../lib/api/query-helpers"
import { contentTypeRegistry } from "../../../../lib/content-types/config"
import { logger } from "../../../../lib/services/logger"
import { withCache, invalidateContentTypeCache } from "../../../../lib/api/cache-middleware"
import { getCacheConfig } from "../../../../lib/config/cache-config"

async function handleGET(request: NextRequest, { params }: { params: { module: string; action: string } }) {
  try {
    const { module, action } = params
    const { searchParams } = new URL(request.url)

    logger.info(`GET request to /api/${module}/${action}`, { params })

    // Validate that the content type exists
    if (!contentTypeRegistry.exists(module)) {
      return NextResponse.json(
        { error: { code: "CONTENT_TYPE_ERROR", message: `Content type '${module}' is not registered` } },
        { status: 400 },
      )
    }

    // Handle different actions
    if (action === "list") {
      // Get all items with pagination and filtering
      const items = await dataService.list(module)

      // Apply filters based on query parameters
      const filteredItems = applyFilters(items, searchParams)

      // Apply sorting
      const sortedItems = applySorting(filteredItems, searchParams)

      // Apply pagination
      const { data, pagination } = applyPagination(sortedItems, searchParams)

      // Add cache control headers for CDN/browser caching
      const response = NextResponse.json({ data, pagination })
      const cacheConfig = getCacheConfig(module, action)
      if (cacheConfig) {
        response.headers.set("Cache-Control", `public, max-age=${cacheConfig.ttl}`)
      }

      return response
    } else if (action === "get") {
      const id = searchParams.get("id")
      if (!id) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "ID parameter is required" } },
          { status: 400 },
        )
      }

      const item = await dataService.get(module, id)

      // Add cache control headers for CDN/browser caching
      const response = NextResponse.json({ data: item })
      const cacheConfig = getCacheConfig(module, action)
      if (cacheConfig) {
        response.headers.set("Cache-Control", `public, max-age=${cacheConfig.ttl}`)
      }

      return response
    } else {
      return NextResponse.json(
        { error: { code: "INVALID_ACTION", message: `Action '${action}' is not supported for GET requests` } },
        { status: 400 },
      )
    }
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = withCache(handleGET, {
  varyByQuery: true,
  varyByHeaders: ["Accept-Language"],
})

export async function POST(request: NextRequest, { params }: { params: { module: string; action: string } }) {
  try {
    const { module, action } = params

    logger.info(`POST request to /api/${module}/${action}`, { params })

    // Validate that the content type exists
    if (!contentTypeRegistry.exists(module)) {
      return NextResponse.json(
        { error: { code: "CONTENT_TYPE_ERROR", message: `Content type '${module}' is not registered` } },
        { status: 400 },
      )
    }

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

    // Validate request body against content type schema
    const validationResult = await validateRequest(module, body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: validationResult.errors,
          },
        },
        { status: 400 },
      )
    }

    // Handle different actions
    if (action === "create") {
      const item = await dataService.create(module, body)

      // Invalidate cache for this content type
      await invalidateContentTypeCache(module)

      return NextResponse.json({ data: item }, { status: 201 })
    } else if (action === "update") {
      const id = body.id
      if (!id) {
        return NextResponse.json(
          { error: { code: "VALIDATION_ERROR", message: "ID is required for updates" } },
          { status: 400 },
        )
      }

      const item = await dataService.update(module, id, body)

      // Invalidate cache for this content type
      await invalidateContentTypeCache(module)

      return NextResponse.json({ data: item })
    } else if (action === "query") {
      // Custom query endpoint that accepts filter criteria in the body
      const items = await dataService.list(module)

      // Apply custom filters from request body
      const filteredItems = applyFilters(items, null, body.filters)

      // Apply custom sorting
      const sortedItems = applySorting(filteredItems, null, body.sort)

      // Apply pagination
      const { data, pagination } = applyPagination(sortedItems, null, body.pagination)

      return NextResponse.json({ data, pagination })
    } else {
      return NextResponse.json(
        { error: { code: "INVALID_ACTION", message: `Action '${action}' is not supported for POST requests` } },
        { status: 400 },
      )
    }
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { module: string; action: string } }) {
  try {
    const { module, action } = params

    logger.info(`PUT request to /api/${module}/${action}`, { params })

    // Validate that the content type exists
    if (!contentTypeRegistry.exists(module)) {
      return NextResponse.json(
        { error: { code: "CONTENT_TYPE_ERROR", message: `Content type '${module}' is not registered` } },
        { status: 400 },
      )
    }

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

    // For PUT requests, we only support the update action
    if (action !== "update") {
      return NextResponse.json(
        { error: { code: "INVALID_ACTION", message: `Action '${action}' is not supported for PUT requests` } },
        { status: 400 },
      )
    }

    const id = body.id
    if (!id) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "ID is required for updates" } },
        { status: 400 },
      )
    }

    // Validate request body against content type schema
    const validationResult = await validateRequest(module, body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: validationResult.errors,
          },
        },
        { status: 400 },
      )
    }

    const item = await dataService.update(module, id, body)

    // Invalidate cache for this content type
    await invalidateContentTypeCache(module)

    return NextResponse.json({ data: item })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { module: string; action: string } }) {
  try {
    const { module, action } = params
    const { searchParams } = new URL(request.url)

    logger.info(`DELETE request to /api/${module}/${action}`, { params })

    // Validate that the content type exists
    if (!contentTypeRegistry.exists(module)) {
      return NextResponse.json(
        { error: { code: "CONTENT_TYPE_ERROR", message: `Content type '${module}' is not registered` } },
        { status: 400 },
      )
    }

    // For DELETE requests, we only support the delete action
    if (action !== "delete") {
      return NextResponse.json(
        { error: { code: "INVALID_ACTION", message: `Action '${action}' is not supported for DELETE requests` } },
        { status: 400 },
      )
    }

    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "ID parameter is required" } },
        { status: 400 },
      )
    }

    await dataService.delete(module, id)

    // Invalidate cache for this content type
    await invalidateContentTypeCache(module)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return handleApiError(error)
  }
}
