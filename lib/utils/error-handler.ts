import { NextResponse } from "next/server"
import { CmsError } from "../errors/cms-errors"
import { logger } from "../services/logger"

/**
 * Error response structure
 */
interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
  userMessage: string
}

/**
 * Handle errors in API routes
 */
export function handleApiError(error: unknown): NextResponse {
  // Default error response
  let errorResponse: ErrorResponse = {
    error: {
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
    },
    userMessage: "An unexpected error occurred. Please try again later.",
  }

  // Status code defaults to 500
  let statusCode = 500

  // Handle CMS errors
  if (error instanceof CmsError) {
    errorResponse = {
      error: {
        code: error.code,
        message: error.message,
      },
      userMessage: error.getUserMessage(),
    }

    // Set appropriate status code based on error type
    switch (error.code) {
      case "VALIDATION_ERROR":
        statusCode = 400
        break
      case "NOT_FOUND_ERROR":
        statusCode = 404
        break
      case "PERMISSION_ERROR":
        statusCode = 403
        break
      case "DUPLICATE_ERROR":
        statusCode = 409
        break
      case "CONTENT_TYPE_ERROR":
      case "CONFIGURATION_ERROR":
        statusCode = 400
        break
      default:
        statusCode = 500
    }

    // Add details for validation errors
    if (error.code === "VALIDATION_ERROR" && "details" in error) {
      errorResponse.error.details = error.details
    }
  } else if (error instanceof Error) {
    // Handle standard errors
    errorResponse = {
      error: {
        code: "UNKNOWN_ERROR",
        message: error.message,
      },
      userMessage: "An unexpected error occurred. Please try again later.",
    }

    // Log the error
    logger.error("Unhandled error in API route", error)
  } else {
    // Handle non-Error objects
    logger.error("Unknown error type in API route", { error })
  }

  // Return the error response
  return NextResponse.json(errorResponse, { status: statusCode })
}
