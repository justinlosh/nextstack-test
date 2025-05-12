import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { dataService } from "../../../lib/data-service/data-service"
import { contentTypeRegistry } from "../../../lib/content-types/config"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const contentType = searchParams.get("contentType")
  const contentId = searchParams.get("contentId")
  const secret = searchParams.get("secret")

  // Validate parameters
  if (!contentType || !contentId) {
    return NextResponse.json({ error: "Missing contentType or contentId parameters" }, { status: 400 })
  }

  // Validate preview secret
  const previewSecret = process.env.PREVIEW_SECRET
  if (!previewSecret || secret !== previewSecret) {
    return NextResponse.json({ error: "Invalid preview secret" }, { status: 401 })
  }

  // Check if content type exists
  if (!contentTypeRegistry.exists(contentType)) {
    return NextResponse.json({ error: `Content type '${contentType}' is not registered` }, { status: 400 })
  }

  try {
    // Check if content exists
    await dataService.get(contentType, contentId)

    // Set preview cookies
    cookies().set("preview-mode", "true", {
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    cookies().set("preview-content-type", contentType, {
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    cookies().set("preview-content-id", contentId, {
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    // Redirect to the content page
    const redirectUrl = `/admin/content/${contentType}/${contentId}`
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    return NextResponse.json({ error: `Content not found: ${contentType}/${contentId}` }, { status: 404 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentType, contentId, data, secret } = body

    // Validate parameters
    if (!contentType || !contentId || !data) {
      return NextResponse.json({ error: "Missing contentType, contentId, or data parameters" }, { status: 400 })
    }

    // Validate preview secret
    const previewSecret = process.env.PREVIEW_SECRET
    if (!previewSecret || secret !== previewSecret) {
      return NextResponse.json({ error: "Invalid preview secret" }, { status: 401 })
    }

    // Check if content type exists
    if (!contentTypeRegistry.exists(contentType)) {
      return NextResponse.json({ error: `Content type '${contentType}' is not registered` }, { status: 400 })
    }

    // Store preview data in a temporary storage
    // In a real app, you would use a database or cache
    // For simplicity, we'll just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process preview data" }, { status: 500 })
  }
}
