/**
 * API client for interacting with the CMS API
 */
export class ApiClient {
  private baseUrl: string
  private defaultCacheControl: string | null = null

  /**
   * Create a new API client
   * @param baseUrl Base URL for API requests (default: "/api")
   */
  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl
  }

  /**
   * Set default cache control header for all requests
   * @param cacheControl Cache control header value or null to disable
   */
  setDefaultCacheControl(cacheControl: string | null): void {
    this.defaultCacheControl = cacheControl
  }

  /**
   * List content entries
   * @param module Content type
   * @param params Query parameters
   * @param options Request options
   * @returns List response with pagination
   */
  async list(
    module: string,
    params: Record<string, string> = {},
    options: { cacheControl?: string } = {},
  ): Promise<any> {
    const queryString = new URLSearchParams(params).toString()
    const url = `${this.baseUrl}/${module}/list${queryString ? `?${queryString}` : ""}`

    const headers: Record<string, string> = {}
    this.addCacheControlHeader(headers, options.cacheControl)

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Get a content entry by ID
   * @param module Content type
   * @param id Content ID
   * @param options Request options
   * @returns Content entry
   */
  async get(module: string, id: string, options: { cacheControl?: string } = {}): Promise<any> {
    const url = `${this.baseUrl}/${module}/get?id=${encodeURIComponent(id)}`

    const headers: Record<string, string> = {}
    this.addCacheControlHeader(headers, options.cacheControl)

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Create a new content entry
   * @param module Content type
   * @param data Content data
   * @returns Created content entry
   */
  async create(module: string, data: any): Promise<any> {
    const url = `${this.baseUrl}/${module}/create`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Update a content entry
   * @param module Content type
   * @param id Content ID
   * @param data Content data
   * @returns Updated content entry
   */
  async update(module: string, id: string, data: any): Promise<any> {
    const url = `${this.baseUrl}/${module}/update`

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...data }),
    })

    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Delete a content entry
   * @param module Content type
   * @param id Content ID
   * @returns Success response
   */
  async delete(module: string, id: string): Promise<any> {
    const url = `${this.baseUrl}/${module}/delete?id=${encodeURIComponent(id)}`

    const response = await fetch(url, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Perform an advanced query
   * @param module Content type
   * @param criteria Query criteria
   * @returns Query response with pagination
   */
  async query(
    module: string,
    criteria: {
      filters?: Record<string, any>
      sort?: { field: string; order: "asc" | "desc" }
      pagination?: { page: number; pageSize: number }
    },
  ): Promise<any> {
    const url = `${this.baseUrl}/${module}/query`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(criteria),
    })

    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Clear the cache
   * @returns Success response
   */
  async clearCache(): Promise<any> {
    const url = `${this.baseUrl}/cache`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "clear" }),
    })

    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Invalidate cache for a specific path
   * @param path Path to invalidate
   * @param namespace Cache namespace
   * @returns Success response
   */
  async invalidateCache(path: string, namespace = "api"): Promise<any> {
    const url = `${this.baseUrl}/cache`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "invalidate", path, namespace }),
    })

    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  async getCacheStats(): Promise<any> {
    const url = `${this.baseUrl}/cache`

    const response = await fetch(url)
    if (!response.ok) {
      throw await this.handleErrorResponse(response)
    }

    return response.json()
  }

  /**
   * Handle error responses
   * @param response Fetch response
   * @returns Error object
   */
  private async handleErrorResponse(response: Response): Promise<Error> {
    try {
      const errorData = await response.json()
      const error = new Error(errorData.error?.message || "API request failed")

      // Add error details to the error object
      Object.assign(error, {
        status: response.status,
        statusText: response.statusText,
        code: errorData.error?.code,
        details: errorData.error?.details,
      })

      return error
    } catch (e) {
      // If we can't parse the error response, return a generic error
      return new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
  }

  /**
   * Add cache control header to request headers
   * @param headers Headers object
   * @param cacheControl Cache control value
   */
  private addCacheControlHeader(headers: Record<string, string>, cacheControl?: string): void {
    // Use provided cache control, fall back to default if not provided
    const effectiveCacheControl = cacheControl !== undefined ? cacheControl : this.defaultCacheControl

    if (effectiveCacheControl !== null) {
      headers["Cache-Control"] = effectiveCacheControl
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()
