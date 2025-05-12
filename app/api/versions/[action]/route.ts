import { type NextRequest, NextResponse } from "next/server"
import { versioningService } from "../../../../lib/services/versioning-service"
import { handleApiError } from "../../../../lib/utils/error-handler"
import { applyMiddleware } from "../../../../lib/api/middleware"
import { authMiddleware } from "../../../../lib/api/auth-middleware"
import { cacheMiddleware } from "../../../../lib/api/cache-middleware"

// Apply middleware
export const GET = applyMiddleware(
  [authMiddleware, cacheMiddleware],
  async (req: NextRequest, { params }: { params: { action: string } }) => {
    try {
      const { action } = params
      const searchParams = req.nextUrl.searchParams

      switch (action) {
        case "list": {
          const contentType = searchParams.get("contentType")
          const contentId = searchParams.get("contentId")

          if (!contentType || !contentId) {
            return NextResponse.json(
              { error: { message: "Missing contentType or contentId parameter" } },
              { status: 400 },
            )
          }

          const versions = await versioningService.getContentVersions(contentType, contentId)
          return NextResponse.json({ data: versions })
        }

        case "get": {
          const versionId = searchParams.get("id")

          if (!versionId) {
            return NextResponse.json({ error: { message: "Missing id parameter" } }, { status: 400 })
          }

          const version = await versioningService.getVersion(versionId)
          return NextResponse.json({ data: version })
        }

        case "latest": {
          const contentType = searchParams.get("contentType")
          const contentId = searchParams.get("contentId")
          const includeDrafts = searchParams.get("includeDrafts") === "true"

          if (!contentType || !contentId) {
            return NextResponse.json(
              { error: { message: "Missing contentType or contentId parameter" } },
              { status: 400 },
            )
          }

          const version = await versioningService.getLatestVersion(contentType, contentId, includeDrafts)
          return NextResponse.json({ data: version })
        }

        case "published": {
          const contentType = searchParams.get("contentType")
          const contentId = searchParams.get("contentId")

          if (!contentType || !contentId) {
            return NextResponse.json(
              { error: { message: "Missing contentType or contentId parameter" } },
              { status: 400 },
            )
          }

          const version = await versioningService.getPublishedVersion(contentType, contentId)
          return NextResponse.json({ data: version })
        }

        case "compare": {
          const versionId1 = searchParams.get("versionId1")
          const versionId2 = searchParams.get("versionId2")

          if (!versionId1 || !versionId2) {
            return NextResponse.json(
              { error: { message: "Missing versionId1 or versionId2 parameter" } },
              { status: 400 },
            )
          }

          const comparison = await versioningService.compareVersions(versionId1, versionId2)
          return NextResponse.json({ data: comparison })
        }

        default:
          return NextResponse.json({ error: { message: `Unknown action: ${action}` } }, { status: 400 })
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
)

// Apply middleware
export const POST = applyMiddleware(
  [authMiddleware],
  async (req: NextRequest, { params }: { params: { action: string } }) => {
    try {
      const { action } = params
      const body = await req.json()

      switch (action) {
        case "create": {
          const { contentType, contentId, data, authorId, changeDescription } = body

          if (!contentType || !contentId || !data || !authorId) {
            return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 })
          }

          const version = await versioningService.createDraft(contentType, contentId, data, authorId, changeDescription)
          return NextResponse.json({ data: version })
        }

        case "publish": {
          const { versionId, authorId } = body

          if (!versionId || !authorId) {
            return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 })
          }

          const version = await versioningService.publishVersion(versionId, authorId)
          return NextResponse.json({ data: version })
        }

        case "archive": {
          const { versionId, authorId } = body

          if (!versionId || !authorId) {
            return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 })
          }

          const version = await versioningService.archiveVersion(versionId, authorId)
          return NextResponse.json({ data: version })
        }

        case "rollback": {
          const { versionId, authorId, changeDescription } = body

          if (!versionId || !authorId) {
            return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 })
          }

          const version = await versioningService.rollbackToVersion(versionId, authorId, changeDescription)
          return NextResponse.json({ data: version })
        }

        default:
          return NextResponse.json({ error: { message: `Unknown action: ${action}` } }, { status: 400 })
      }
    } catch (error) {
      return handleApiError(error)
    }
  },
)
