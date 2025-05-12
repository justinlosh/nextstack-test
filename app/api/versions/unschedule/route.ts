import { type NextRequest, NextResponse } from "next/server"
import { schedulingService } from "../../../../lib/services/scheduling-service"
import { handleApiError } from "../../../../lib/utils/error-handler"
import { applyMiddleware } from "../../../../lib/api/middleware"
import { authMiddleware } from "../../../../lib/api/auth-middleware"

// Apply middleware
export const POST = applyMiddleware([authMiddleware], async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { versionId, authorId } = body

    if (!versionId || !authorId) {
      return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 })
    }

    const version = await schedulingService.unscheduleContent(versionId, authorId)

    return NextResponse.json({ data: version })
  } catch (error) {
    return handleApiError(error)
  }
})
