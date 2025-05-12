import { contentTypeRegistry } from "../content-types/config"
import { z } from "zod"

/**
 * Validation result interface
 */
export interface ValidationResult {
  success: boolean
  errors?: Record<string, string[]>
}

/**
 * Validate request data against content type schema
 * @param contentType Content type name
 * @param data Data to validate
 * @returns Validation result
 */
export async function validateRequest(contentType: string, data: any): Promise<ValidationResult> {
  // Get content type configuration
  const config = contentTypeRegistry.get(contentType)
  if (!config) {
    return {
      success: false,
      errors: {
        contentType: [`Content type '${contentType}' is not registered`],
      },
    }
  }

  // Validate data against schema
  try {
    // For updates, we need to make all fields optional
    const schema = config.schema
    schema.parse(data)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a more user-friendly format
      const details: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join(".")
        if (!details[path]) {
          details[path] = []
        }
        details[path].push(err.message)
      })

      return {
        success: false,
        errors: details,
      }
    }

    // Handle other errors
    return {
      success: false,
      errors: {
        _general: ["An unexpected error occurred during validation"],
      },
    }
  }
}
