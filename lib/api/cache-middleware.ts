import { type NextRequest, NextResponse } from "next/server"
import { cacheService } from "../services/cache-service"
import { logger } from "../services/logger"

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  ttl: number // Time to live in seconds
  varyByQuery?: boolean // Whether to vary cache by query parameters
  varyByHeaders?: string[] // Headers to vary cache by
  namespace?: string // Cache namespace
}

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 60, // 1 minute
  varyByQuery: true,
  varyByHeaders: [],
  namespace: "api",
}

/**
 * Cache middleware for API routes
 * @param handler API route handler
 * @param config Cache configuration
 * @returns Cached response or handler response
 */
export function withCache(
  handler: (request: NextRequest, context: any) => Promise<Response>,
  config?: Partial<CacheConfig>,
): (request: NextRequest, context: any) => Promise<Response> {
  const cacheConfig: CacheConfig = { ...DEFAULT_CACHE_CONFIG, ...config }

  return async (request: NextRequest, context: any) => {
    // Skip cache for non-GET requests
    if (request.method !== "GET") {
      return handler(request, context)
    }

    // Generate cache key
    const cacheKey = generateCacheKey(request, cacheConfig)

    // Try to get from cache
    const cachedResponse = await cacheService.get<Response>(cacheKey, {
      namespace: cacheConfig.namespace,
    })

    if (cachedResponse) {
      // Clone the cached response to add cache headers
      const response = new NextResponse(cachedResponse.body, cachedResponse)
      response.headers.set("X-Cache", "HIT")
      return response
    }

    // Call the handler
    const response = await handler(request, context)

    // Only cache successful responses
    if (response.ok) {
      // Clone the response before caching
      const clonedResponse = response.clone()

      // Store in cache
      await cacheService.set(cacheKey, clonedResponse, {
        ttl: cacheConfig.ttl,
        namespace: cacheConfig.namespace,
      })

      // Add cache header
      response.headers.set("X-Cache", "MISS")
    }

    return response
  }
}

/**
 * Generate a cache key for a request
 * @param request Request object
 * @param config Cache configuration
 * @returns Cache key
 */
function generateCacheKey(request: NextRequest, config: CacheConfig): string {
  const url = new URL(request.url)
  const path = url.pathname

  let key = path

  // Add query parameters to key if configured
  if (config.varyByQuery && url.search) {
    key += url.search
  }

  // Add headers to key if configured
  if (config.varyByHeaders && config.varyByHeaders.length > 0) {
    const headerValues = config.varyByHeaders
      .map((header) => `${header}=${request.headers.get(header) || ""}`)
      .join("&")

    if (headerValues) {
      key += `|${headerValues}`
    }
  }

  return key
}

/**
 * Invalidate cache for a specific path or pattern
 * @param path Path to invalidate
 * @param namespace Cache namespace
 */
export async function invalidateCache(path: string, namespace = "api"): Promise<void> {
  try {
    if (path === "*") {
      // Invalidate entire namespace
      await cacheService.removeNamespace(namespace)
      logger.info(`Invalidated entire cache namespace: ${namespace}`)
    } else {
      // Invalidate specific path
      await cacheService.remove(path, { namespace })
      logger.info(`Invalidated cache for path: ${path}`)
    }
  } catch (error) {
    logger.error(`Error invalidating cache for path: ${path}`, error as Error)
  }
}

/**
 * Invalidate cache for a specific content type
 * @param contentType Content type to invalidate
 */
export async function invalidateContentTypeCache(contentType: string): Promise<void> {
  await invalidateCache(`/api/${contentType}/*`, "api")
}
