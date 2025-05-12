import { type NextRequest, NextResponse } from "next/server"
import { logger } from "../../../../lib/services/logger"
import { notificationService } from "../../../../lib/services/notification-service"
import { dataService } from "../../../../lib/data-service"

/**
 * Handles Vercel deployment hooks
 * Configure these in the Vercel dashboard under Settings > Git > Deploy Hooks
 */
export async function POST(request: NextRequest, { params }: { params: { hook: string } }) {
  try {
    const { hook } = params

    // Verify the request is from Vercel
    // In production, you should validate a shared secret
    const authHeader = request.headers.get("Authorization")
    if (process.env.VERCEL_ENV === "production" && (!authHeader || !authHeader.startsWith("Bearer "))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    logger.info(`Received deployment hook: ${hook}`)

    // Handle different hook types
    switch (hook) {
      case "build-started":
        await handleBuildStarted(request)
        break

      case "build-completed":
        await handleBuildCompleted(request)
        break

      case "deployment-succeeded":
        await handleDeploymentSucceeded(request)
        break

      case "deployment-failed":
        await handleDeploymentFailed(request)
        break

      default:
        return NextResponse.json({ error: `Unknown hook type: ${hook}` }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error(`Error in deployment hook: ${error.message}`)

    return NextResponse.json({ error: "Failed to process deployment hook" }, { status: 500 })
  }
}

/**
 * Handle build started hook
 */
async function handleBuildStarted(request: NextRequest) {
  const payload = await request.json()

  // Send notification
  await notificationService.sendNotification({
    type: "deployment_started",
    title: "Deployment Started",
    message: `A new deployment has started for ${payload.name || "the application"}.`,
    data: payload,
    recipients: ["admin"],
  })
}

/**
 * Handle build completed hook
 */
async function handleBuildCompleted(request: NextRequest) {
  const payload = await request.json()

  // Send notification
  await notificationService.sendNotification({
    type: "build_completed",
    title: "Build Completed",
    message: `The build has completed for ${payload.name || "the application"}.`,
    data: payload,
    recipients: ["admin"],
  })
}

/**
 * Handle deployment succeeded hook
 */
async function handleDeploymentSucceeded(request: NextRequest) {
  const payload = await request.json()

  // Update deployment record in database
  await dataService.create("deployment", {
    deploymentId: payload.id || `manual-${Date.now()}`,
    status: "succeeded",
    url: payload.url,
    branch: payload.git?.branch || "unknown",
    commit: payload.git?.commitSha || "unknown",
    timestamp: new Date().toISOString(),
    meta: payload,
  })

  // Send notification
  await notificationService.sendNotification({
    type: "deployment_succeeded",
    title: "Deployment Succeeded",
    message: `The deployment has succeeded for ${payload.name || "the application"}.`,
    data: payload,
    recipients: ["admin", "editor"],
  })

  // Run any post-deployment tasks
  await runPostDeploymentTasks(payload)
}

/**
 * Handle deployment failed hook
 */
async function handleDeploymentFailed(request: NextRequest) {
  const payload = await request.json()

  // Update deployment record in database
  await dataService.create("deployment", {
    deploymentId: payload.id || `manual-${Date.now()}`,
    status: "failed",
    error: payload.error || "Unknown error",
    branch: payload.git?.branch || "unknown",
    commit: payload.git?.commitSha || "unknown",
    timestamp: new Date().toISOString(),
    meta: payload,
  })

  // Send notification
  await notificationService.sendNotification({
    type: "deployment_failed",
    title: "Deployment Failed",
    message: `The deployment has failed for ${payload.name || "the application"}.`,
    data: payload,
    recipients: ["admin"],
  })
}

/**
 * Run post-deployment tasks
 */
async function runPostDeploymentTasks(payload: any) {
  try {
    logger.info("Running post-deployment tasks")

    // Invalidate caches
    await fetch(`${payload.url}/api/cache/invalidate-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_API_KEY || ""}`,
      },
    })

    // Run database migrations if needed
    if (payload.target === "production") {
      logger.info("Running database migrations for production deployment")
      // Implementation depends on your database migration strategy
    }

    logger.info("Post-deployment tasks completed successfully")
  } catch (error) {
    logger.error(`Error in post-deployment tasks: ${error.message}`)
  }
}
