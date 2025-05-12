import { type NextRequest, NextResponse } from "next/server"
import { getVercelEnvironment } from "./lib/config/vercel-env"

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set("X-DNS-Prefetch-Control", "on")
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")

  // Add environment indicator for non-production environments
  const environment = getVercelEnvironment()
  if (environment !== "production") {
    response.headers.set("X-Environment", environment)
  }

  // Add server region for debugging
  if (process.env.VERCEL_REGION) {
    response.headers.set("X-Served-By", process.env.VERCEL_REGION)
  }

  return response
}
