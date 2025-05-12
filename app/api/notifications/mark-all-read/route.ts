import { type NextRequest, NextResponse } from "next/server"
import { inAppNotificationHandler } from "../../../../lib/services/notification-handlers/in-app-handler"
import { handleApiError } from "../../../../lib/utils/error-handler"
import { applyMiddleware } from "../../../../lib/api/middleware"
import { authMiddleware } from "../../../../lib/api/auth-middleware"

// Apply middleware
export const POST = applyMiddleware([authMiddleware], async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: { message: "Missing userId field" } }, { status: 400 })
    }

    // Mark all notifications as read
    inAppNotificationHandler.markAllAsRead(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
})
