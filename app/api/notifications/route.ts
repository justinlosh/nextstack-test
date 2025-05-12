import { type NextRequest, NextResponse } from "next/server"
import { inAppNotificationHandler } from "../../../lib/services/notification-handlers/in-app-handler"
import { handleApiError } from "../../../lib/utils/error-handler"
import { applyMiddleware } from "../../../lib/api/middleware"
import { authMiddleware } from "../../../lib/api/auth-middleware"

// Apply middleware
export const GET = applyMiddleware([authMiddleware], async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: { message: "Missing userId parameter" } }, { status: 400 })
    }

    // Get notifications for user
    const notifications = inAppNotificationHandler.getNotificationsForRecipient(userId)

    return NextResponse.json({ notifications })
  } catch (error) {
    return handleApiError(error)
  }
})
