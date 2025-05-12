import { type NextRequest, NextResponse } from "next/server"
import { schedulingService } from "../../../../lib/services/scheduling-service"
import { handleApiError } from "../../../../lib/utils/error-handler"
import { applyMiddleware } from "../../../../lib/api/middleware"
import { authMiddleware } from "../../../../lib/api/auth-middleware"

// Apply middleware
export const POST = applyMiddleware([authMiddleware], async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { versionId, scheduledAt, authorId } = body

    if (!versionId || !scheduledAt || !authorId) {
      return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 })
    }

    const scheduledDate = new Date(scheduledAt)
    const version = await schedulingService.scheduleContent(versionId, scheduledDate, authorId)

    return NextResponse.json({ data: version })
  } catch (error) {
    return handleApiError(error)
  }
})
