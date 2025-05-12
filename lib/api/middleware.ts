import type { NextRequest, NextResponse } from "next/server"

/**
 * Middleware function type
 */
export type Middleware = (
  req: NextRequest,
  context: any,
  next: (req: NextRequest, context: any) => Promise<NextResponse>,
) => Promise<NextResponse>

/**
 * Apply middleware to a route handler
 * @param middlewares Array of middleware functions
 * @param handler Route handler function
 * @returns Route handler with middleware applied
 */
export function applyMiddleware(
  middlewares: Middleware[],
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: any) => {
    // Create a function to execute the middleware chain
    const executeMiddleware = async (index: number): Promise<NextResponse> => {
      // If we've gone through all middleware, execute the handler
      if (index >= middlewares.length) {
        return handler(req, context)
      }

      // Execute the current middleware, passing the next middleware in the chain
      const middleware = middlewares[index]
      return middleware(req, context, (req, context) => executeMiddleware(index + 1))
    }

    // Start executing the middleware chain
    return executeMiddleware(0)
  }
}
