/**
 * Cache configuration for different content types and actions
 */
export const cacheConfig = {
  // Default configuration for all content types
  default: {
    list: {
      ttl: 60, // 1 minute
      varyByQuery: true,
    },
    get: {
      ttl: 300, // 5 minutes
      varyByQuery: true,
    },
  },

  // Content type specific configurations
  contentTypes: {
    // Pages have longer cache times since they change less frequently
    page: {
      list: {
        ttl: 300, // 5 minutes
        varyByQuery: true,
      },
      get: {
        ttl: 600, // 10 minutes
        varyByQuery: true,
      },
    },
    // Posts might change more frequently
    post: {
      list: {
        ttl: 120, // 2 minutes
        varyByQuery: true,
      },
      get: {
        ttl: 300, // 5 minutes
        varyByQuery: true,
      },
    },
    // Products might need to be more up-to-date
    product: {
      list: {
        ttl: 60, // 1 minute
        varyByQuery: true,
      },
      get: {
        ttl: 120, // 2 minutes
        varyByQuery: true,
      },
    },
  },
}

/**
 * Get cache configuration for a specific content type and action
 * @param contentType Content type
 * @param action Action
 * @returns Cache configuration
 */
export function getCacheConfig(contentType: string, action: string): any {
  // Check if there's a specific configuration for this content type and action
  const contentTypeConfig = (cacheConfig.contentTypes as any)[contentType]
  if (contentTypeConfig && contentTypeConfig[action]) {
    return contentTypeConfig[action]
  }

  // Fall back to default configuration for the action
  if (cacheConfig.default[action]) {
    return cacheConfig.default[action]
  }

  // No cache configuration found
  return null
}
