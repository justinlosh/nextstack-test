/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Apply pagination to a list of items
 * @param items Items to paginate
 * @param searchParams URL search params (for page and pageSize)
 * @param options Optional pagination options
 * @returns Paginated items and pagination metadata
 */
export function applyPagination<T>(
  items: T[],
  searchParams: URLSearchParams | null,
  options?: { page?: number; pageSize?: number },
): PaginationResult<T> {
  // Get pagination parameters
  const page = options?.page || Number.parseInt(searchParams?.get("page") || "1", 10)
  const pageSize = options?.pageSize || Number.parseInt(searchParams?.get("pageSize") || "10", 10)

  // Calculate pagination
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedItems = items.slice(startIndex, endIndex)

  return {
    data: paginatedItems,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}

/**
 * Apply filters to a list of items
 * @param items Items to filter
 * @param searchParams URL search params for filtering
 * @param customFilters Custom filter criteria
 * @returns Filtered items
 */
export function applyFilters<T extends Record<string, any>>(
  items: T[],
  searchParams: URLSearchParams | null,
  customFilters?: Record<string, any>,
): T[] {
  let filteredItems = [...items]

  // Apply filters from search params
  if (searchParams) {
    searchParams.forEach((value, key) => {
      // Skip pagination and sorting parameters
      if (["page", "pageSize", "sortBy", "sortOrder"].includes(key)) {
        return
      }

      // Handle special operators in keys (e.g., "price_gt" for price > value)
      if (key.includes("_")) {
        const [field, operator] = key.split("_")

        filteredItems = filteredItems.filter((item) => {
          const itemValue = item[field]

          // Skip if the field doesn't exist
          if (itemValue === undefined) return true

          switch (operator) {
            case "gt":
              return itemValue > Number.parseFloat(value)
            case "gte":
              return itemValue >= Number.parseFloat(value)
            case "lt":
              return itemValue < Number.parseFloat(value)
            case "lte":
              return itemValue <= Number.parseFloat(value)
            case "ne":
              return itemValue !== value
            case "contains":
              return String(itemValue).toLowerCase().includes(value.toLowerCase())
            case "startsWith":
              return String(itemValue).toLowerCase().startsWith(value.toLowerCase())
            case "endsWith":
              return String(itemValue).toLowerCase().endsWith(value.toLowerCase())
            default:
              return true
          }
        })
      } else {
        // Simple equality filter
        filteredItems = filteredItems.filter((item) => {
          const itemValue = item[key]

          // Handle array values (e.g., tags)
          if (Array.isArray(itemValue)) {
            return itemValue.includes(value)
          }

          // Handle string values
          return String(itemValue).toLowerCase() === value.toLowerCase()
        })
      }
    })
  }

  // Apply custom filters
  if (customFilters) {
    Object.entries(customFilters).forEach(([key, value]) => {
      // Handle special operators in keys
      if (key.includes("_")) {
        const [field, operator] = key.split("_")

        filteredItems = filteredItems.filter((item) => {
          const itemValue = item[field]

          // Skip if the field doesn't exist
          if (itemValue === undefined) return true

          switch (operator) {
            case "gt":
              return itemValue > value
            case "gte":
              return itemValue >= value
            case "lt":
              return itemValue < value
            case "lte":
              return itemValue <= value
            case "ne":
              return itemValue !== value
            case "contains":
              return String(itemValue).toLowerCase().includes(String(value).toLowerCase())
            case "startsWith":
              return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase())
            case "endsWith":
              return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase())
            case "in":
              return Array.isArray(value) && value.includes(itemValue)
            case "nin":
              return Array.isArray(value) && !value.includes(itemValue)
            default:
              return true
          }
        })
      } else {
        // Simple equality filter
        filteredItems = filteredItems.filter((item) => {
          const itemValue = item[key]

          // Handle array values for both item and filter
          if (Array.isArray(itemValue) && Array.isArray(value)) {
            return value.some((v) => itemValue.includes(v))
          } else if (Array.isArray(itemValue)) {
            return itemValue.includes(value)
          } else if (Array.isArray(value)) {
            return value.includes(itemValue)
          }

          // Handle string values
          return itemValue === value
        })
      }
    })
  }

  return filteredItems
}

/**
 * Apply sorting to a list of items
 * @param items Items to sort
 * @param searchParams URL search params for sorting
 * @param customSort Custom sort criteria
 * @returns Sorted items
 */
export function applySorting<T extends Record<string, any>>(
  items: T[],
  searchParams: URLSearchParams | null,
  customSort?: { field: string; order: "asc" | "desc" },
): T[] {
  // Get sorting parameters
  const sortBy = customSort?.field || searchParams?.get("sortBy") || "updatedAt"
  const sortOrder = customSort?.order || searchParams?.get("sortOrder") || "desc"

  // Create a copy of the items array to avoid mutating the original
  const sortedItems = [...items]

  // Sort the items
  return sortedItems.sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortOrder === "asc" ? 1 : -1
    if (bValue === undefined) return sortOrder === "asc" ? -1 : 1

    // Handle different value types
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
    }

    // Convert to strings for comparison if types don't match
    const aString = String(aValue)
    const bString = String(bValue)

    return sortOrder === "asc" ? aString.localeCompare(bString) : bString.localeCompare(aString)
  })
}
