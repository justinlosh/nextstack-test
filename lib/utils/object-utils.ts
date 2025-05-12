/**
 * Deep equality check for objects
 * @param obj1 First object
 * @param obj2 Second object
 * @returns Whether objects are deeply equal
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  // Handle primitive types
  if (obj1 === obj2) return true

  // Handle null/undefined
  if (obj1 == null || obj2 == null) return false

  // Handle different types
  if (typeof obj1 !== typeof obj2) return false

  // Handle dates
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime()
  }

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false

    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false
    }

    return true
  }

  // Handle objects
  if (typeof obj1 === "object" && typeof obj2 === "object") {
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    for (const key of keys1) {
      if (!keys2.includes(key)) return false
      if (!deepEqual(obj1[key], obj2[key])) return false
    }

    return true
  }

  return false
}

/**
 * Get a diff between two objects
 * @param obj1 First object
 * @param obj2 Second object
 * @returns Object with added, removed, and modified keys
 */
export function objectDiff(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): {
  added: Record<string, any>
  removed: Record<string, any>
  modified: Record<string, any>
} {
  const added: Record<string, any> = {}
  const removed: Record<string, any> = {}
  const modified: Record<string, any> = {}

  // Find added and modified
  for (const key in obj2) {
    if (!(key in obj1)) {
      added[key] = obj2[key]
    } else if (!deepEqual(obj1[key], obj2[key])) {
      modified[key] = {
        from: obj1[key],
        to: obj2[key],
      }
    }
  }

  // Find removed
  for (const key in obj1) {
    if (!(key in obj2)) {
      removed[key] = obj1[key]
    }
  }

  return { added, removed, modified }
}
