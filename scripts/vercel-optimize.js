#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Get Vercel environment
const vercelEnv = process.env.VERCEL_ENV || "development"
const isProduction = vercelEnv === "production"

console.log(`🔧 Running Vercel optimizations for ${vercelEnv} environment...`)

// Path to Next.js build output
const nextDir = path.join(process.cwd(), ".next")

// Ensure .next directory exists
if (!fs.existsSync(nextDir)) {
  console.error("❌ .next directory not found. Build may have failed.")
  process.exit(1)
}

// Create a deployment manifest
const createDeploymentManifest = () => {
  console.log("📝 Creating deployment manifest...")

  const manifest = {
    version: process.env.npm_package_version || "0.0.0",
    buildTime: new Date().toISOString(),
    environment: vercelEnv,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || "local",
    gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || "none",
    gitCommitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || "none",
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF || "none",
  }

  // Write manifest to .next/BUILD_MANIFEST.json
  fs.writeFileSync(path.join(nextDir, "BUILD_MANIFEST.json"), JSON.stringify(manifest, null, 2))

  console.log("✅ Deployment manifest created")
}

// Optimize static assets
const optimizeStaticAssets = () => {
  console.log("🗜️ Optimizing static assets...")

  // Only run in production to save time in development/preview
  if (!isProduction) {
    console.log("⏩ Skipping asset optimization in non-production environment")
    return
  }

  try {
    // Compress static assets with Brotli for Vercel CDN
    const staticDir = path.join(nextDir, "static")
    if (fs.existsSync(staticDir)) {
      console.log("🗜️ Compressing static assets with Brotli...")
      execSync(`find ${staticDir} -type f -not -name "*.br" -not -name "*.gz" | xargs -I{} brotli -q 11 "{}"`, {
        stdio: "inherit",
      })
    }

    console.log("✅ Static assets optimized")
  } catch (error) {
    console.warn("⚠️ Asset optimization failed:", error.message)
    console.warn("⚠️ Continuing build process...")
  }
}

// Generate size report
const generateSizeReport = () => {
  console.log("📊 Generating build size report...")

  try {
    // Run Next.js build analyzer
    execSync("npx -y next-bundle-analyzer", { stdio: "inherit" })
    console.log("✅ Size report generated")
  } catch (error) {
    console.warn("⚠️ Size report generation failed:", error.message)
    console.warn("⚠️ Continuing build process...")
  }
}

// Run optimizations
createDeploymentManifest()
optimizeStaticAssets()
generateSizeReport()

console.log("✨ Vercel optimizations completed successfully!")
