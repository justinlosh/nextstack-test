import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getVercelEnvironment } from "../../../../lib/config/vercel-env"

/**
 * API route to get deployment information
 */
export async function GET() {
  try {
    // Get environment information
    const environment = getVercelEnvironment()

    // Basic deployment info
    const deploymentInfo = {
      environment,
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || undefined,
      url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      branch: process.env.VERCEL_GIT_COMMIT_REF || undefined,
      commit: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
      region: process.env.VERCEL_REGION || undefined,
    }

    // Try to read the build manifest for additional information
    try {
      const manifestPath = path.join(process.cwd(), ".next", "BUILD_MANIFEST.json")

      if (fs.existsSync(manifestPath)) {
        const manifestContent = fs.readFileSync(manifestPath, "utf8")
        const manifest = JSON.parse(manifestContent)

        // Add build time from manifest
        if (manifest.buildTime) {
          deploymentInfo.buildTime = manifest.buildTime
        }
      }
    } catch (error) {
      // Ignore errors reading the manifest
      console.error("Error reading build manifest:", error)
    }

    return NextResponse.json(deploymentInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get deployment information" }, { status: 500 })
  }
}
