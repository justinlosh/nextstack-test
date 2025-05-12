import fs from "fs"
import path from "path"
import { spawn } from "child_process"
import { configManager, type BuildConfig, type ModuleConfig } from "./config-manager"
import { assetProcessor, type ProcessedAsset } from "./asset-processor"
import { logger } from "../services/logger"
import { getVercelEnvironment } from "../config/vercel-env"

export interface BuildOptions {
  configPath?: string
  modulesDir?: string
  outputDir?: string
  clean?: boolean
  verbose?: boolean
  parallel?: boolean
  maxParallel?: number
  skipTests?: boolean
  testOnly?: boolean
  coverage?: boolean
  updateSnapshots?: boolean
  testMatch?: string
  vercelEnv?: string
  optimizeForVercel?: boolean
}

export interface BuildResult {
  success: boolean
  duration: number
  modules: {
    name: string
    success: boolean
    duration: number
    assets: ProcessedAsset[]
    error?: string
  }[]
  assets: {
    total: number
    byType: Record<string, number>
    totalSize: {
      original: number
      processed: number
    }
  }
  tests?: {
    total: number
    passed: number
    failed: number
    skipped: number
    coverage?: {
      statements: number
      branches: number
      functions: number
      lines: number
    }
  }
  vercel?: {
    environment: string
    optimized: boolean
    deploymentId?: string
  }
  error?: string
}

class BuildOrchestrator {
  private options: BuildOptions
  private buildConfig: BuildConfig | null = null
  private startTime = 0
  private buildResult: BuildResult = {
    success: false,
    duration: 0,
    modules: [],
    assets: {
      total: 0,
      byType: {},
      totalSize: {
        original: 0,
        processed: 0,
      },
    },
  }
  private isVercel: boolean
  private vercelEnv: string

  constructor(options: BuildOptions = {}) {
    this.options = {
      configPath: "build.config.yml",
      modulesDir: "modules",
      outputDir: ".next",
      clean: true,
      verbose: false,
      parallel: true,
      maxParallel: 4,
      skipTests: false,
      testOnly: false,
      coverage: true,
      updateSnapshots: false,
      testMatch: undefined,
      vercelEnv: process.env.VERCEL_ENV,
      optimizeForVercel: true,
      ...options,
    }

    // Determine if we're running on Vercel
    this.isVercel = process.env.VERCEL === "1"
    this.vercelEnv = this.options.vercelEnv || getVercelEnvironment()

    // Add Vercel info to build result
    if (this.isVercel || this.options.optimizeForVercel) {
      this.buildResult.vercel = {
        environment: this.vercelEnv,
        optimized: this.options.optimizeForVercel,
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
      }
    }
  }

  /**
   * Run the build process
   */
  async build(): Promise<BuildResult> {
    this.startTime = Date.now()

    try {
      logger.info(
        `Starting enhanced build process for ${this.isVercel ? `Vercel (${this.vercelEnv})` : "local development"}...`,
      )

      // Run tests if not skipped
      if (!this.options.skipTests) {
        await this.runTests()

        // If test-only mode, return early
        if (this.options.testOnly) {
          this.buildResult.success = true
          this.buildResult.duration = Date.now() - this.startTime
          return this.buildResult
        }
      }

      // Initialize configuration manager
      this.buildConfig = await configManager.init()

      // Clean output directory if needed
      if (this.options.clean) {
        await this.cleanOutput()
      }

      // Process module assets
      await this.processModuleAssets()

      // Generate environment variables
      await this.generateEnvironmentVariables()

      // Apply Vercel-specific optimizations
      if (this.isVercel || this.options.optimizeForVercel) {
        await this.applyVercelOptimizations()
      }

      // Run Next.js build
      await this.runNextBuild()

      // Generate asset manifest
      assetProcessor.writeManifest()

      // Finalize build
      this.finalizeBuild()

      return this.buildResult
    } catch (error) {
      this.buildResult.success = false
      this.buildResult.error = error.message
      this.buildResult.duration = Date.now() - this.startTime

      logger.error(`Build failed: ${error.message}`)
      return this.buildResult
    }
  }

  /**
   * Apply Vercel-specific optimizations
   */
  private async applyVercelOptimizations(): Promise<void> {
    logger.info("Applying Vercel-specific optimizations...")

    // Create a .vercel directory if it doesn't exist
    const vercelDir = path.join(process.cwd(), ".vercel")
    if (!fs.existsSync(vercelDir)) {
      fs.mkdirSync(vercelDir, { recursive: true })
    }

    // Create a build output directory
    const outputDir = path.join(vercelDir, "output")
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Create a config.json file for Vercel
    const configJson = {
      version: 3,
      routes: [
        // Cache static assets
        {
          src: "^/static/(.*)$",
          headers: { "cache-control": "public,max-age=31536000,immutable" },
          continue: true,
        },
        // Cache _next/data prefetches
        {
          src: "^/_next/data/(.*)$",
          headers: { "cache-control": "public,max-age=3600,stale-while-revalidate=86400" },
          continue: true,
        },
        // Handle API routes
        {
          src: "^/api/(.*)$",
          headers: { "cache-control": "no-cache, no-store, must-revalidate" },
          continue: true,
        },
      ],
    }

    fs.writeFileSync(path.join(outputDir, "config.json"), JSON.stringify(configJson, null, 2))

    // Create a project.json file
    const projectJson = {
      projectId: process.env.VERCEL_PROJECT_ID || "unknown",
      orgId: process.env.VERCEL_ORG_ID || "unknown",
      settings: {
        framework: "nextjs",
      },
    }

    fs.writeFileSync(path.join(vercelDir, "project.json"), JSON.stringify(projectJson, null, 2))

    logger.info("Vercel-specific optimizations applied")
  }

  /**
   * Run tests
   */
  private async runTests(): Promise<void> {
    // Skip tests in production Vercel environment if not explicitly required
    if (this.isVercel && this.vercelEnv === "production" && !this.options.testOnly) {
      logger.info("Skipping tests in production Vercel environment")
      return
    }

    logger.info("Running tests...")

    const jestArgs = ["jest", "--colors"]

    // Add coverage if enabled
    if (this.options.coverage) {
      jestArgs.push("--coverage")
    }

    // Update snapshots if needed
    if (this.options.updateSnapshots) {
      jestArgs.push("--updateSnapshot")
    }

    // Add test pattern if specified
    if (this.options.testMatch) {
      jestArgs.push(this.options.testMatch)
    }

    return new Promise((resolve, reject) => {
      const testProcess = spawn("npx", jestArgs, {
        stdio: this.options.verbose ? "inherit" : "pipe",
        shell: true,
      })

      let output = ""

      if (!this.options.verbose && testProcess.stdout) {
        testProcess.stdout.on("data", (data) => {
          output += data.toString()
        })
      }

      if (!this.options.verbose && testProcess.stderr) {
        testProcess.stderr.on("data", (data) => {
          output += data.toString()
        })
      }

      testProcess.on("close", (code) => {
        if (code === 0) {
          logger.info("Tests completed successfully")

          // Parse test results
          this.parseTestResults(output)

          resolve()
        } else {
          logger.error(`Tests failed with code ${code}`)

          // Parse test results even if tests failed
          this.parseTestResults(output)

          if (this.options.testOnly) {
            reject(new Error(`Tests failed with code ${code}`))
          } else {
            // Continue with build even if tests fail
            logger.warn("Continuing build despite test failures")
            resolve()
          }
        }
      })
    })
  }

  /**
   * Parse test results from Jest output
   */
  private parseTestResults(output: string): void {
    // Initialize test results
    this.buildResult.tests = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    }

    // Extract test counts
    const testCountMatch = output.match(/Tests:\s+(\d+) failed,\s+(\d+) passed,\s+(\d+) total/)
    if (testCountMatch) {
      this.buildResult.tests.failed = Number.parseInt(testCountMatch[1], 10)
      this.buildResult.tests.passed = Number.parseInt(testCountMatch[2], 10)
      this.buildResult.tests.total = Number.parseInt(testCountMatch[3], 10)
    }

    // Extract skipped tests
    const skippedMatch = output.match(/Tests:\s+(\d+) skipped,/)
    if (skippedMatch) {
      this.buildResult.tests.skipped = Number.parseInt(skippedMatch[1], 10)
    }

    // Extract coverage
    const coverageMatch = output.match(
      /All files[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\n\s+([0-9.]+)[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/,
    )
    if (coverageMatch) {
      // Try to extract detailed coverage
      const statementsMatch = output.match(/Statements\s+:\s+([0-9.]+)%/)
      const branchesMatch = output.match(/Branches\s+:\s+([0-9.]+)%/)
      const functionsMatch = output.match(/Functions\s+:\s+([0-9.]+)%/)
      const linesMatch = output.match(/Lines\s+:\s+([0-9.]+)%/)

      if (statementsMatch && branchesMatch && functionsMatch && linesMatch) {
        this.buildResult.tests.coverage = {
          statements: Number.parseFloat(statementsMatch[1]),
          branches: Number.parseFloat(branchesMatch[1]),
          functions: Number.parseFloat(functionsMatch[1]),
          lines: Number.parseFloat(linesMatch[1]),
        }
      }
    }
  }

  /**
   * Clean the output directory
   */
  private async cleanOutput(): Promise<void> {
    const staticDir = path.join(process.cwd(), this.options.outputDir, "static")

    if (fs.existsSync(staticDir)) {
      logger.info("Cleaning static output directory...")

      // Only remove the static/assets directory, not the entire .next
      const assetsDir = path.join(staticDir, "assets")
      if (fs.existsSync(assetsDir)) {
        fs.rmSync(assetsDir, { recursive: true, force: true })
      }
    }
  }

  /**
   * Process assets for all modules
   */
  private async processModuleAssets(): Promise<void> {
    if (!this.buildConfig) {
      throw new Error("Build configuration not initialized")
    }

    const modules = configManager.getSortedModules()
    logger.info(`Processing assets for ${modules.length} modules...`)

    if (this.options.parallel) {
      // Process modules in parallel with a limit
      const chunks = this.chunkArray(modules, this.options.maxParallel)

      for (const chunk of chunks) {
        await Promise.all(chunk.map((module) => this.processModuleAssetsWithResult(module)))
      }
    } else {
      // Process modules sequentially
      for (const module of modules) {
        await this.processModuleAssetsWithResult(module)
      }
    }
  }

  /**
   * Process assets for a single module and track the result
   */
  private async processModuleAssetsWithResult(module: ModuleConfig): Promise<void> {
    const moduleStartTime = Date.now()
    const moduleName = module.name
    const moduleDir = path.join(process.cwd(), this.options.modulesDir, moduleName)

    try {
      logger.info(`Processing assets for module: ${moduleName}`)
      const assets = await assetProcessor.processModuleAssets(module, moduleDir)

      this.buildResult.modules.push({
        name: moduleName,
        success: true,
        duration: Date.now() - moduleStartTime,
        assets,
      })

      // Update asset statistics
      this.updateAssetStats(assets)
    } catch (error) {
      logger.error(`Failed to process assets for module ${moduleName}: ${error.message}`)

      this.buildResult.modules.push({
        name: moduleName,
        success: false,
        duration: Date.now() - moduleStartTime,
        assets: [],
        error: error.message,
      })
    }
  }

  /**
   * Update asset statistics in the build result
   */
  private updateAssetStats(assets: ProcessedAsset[]): void {
    for (const asset of assets) {
      this.buildResult.assets.total++

      // Count by type
      this.buildResult.assets.byType[asset.type] = (this.buildResult.assets.byType[asset.type] || 0) + 1

      // Sum sizes
      this.buildResult.assets.totalSize.original += asset.size.original
      this.buildResult.assets.totalSize.processed += asset.size.processed
    }
  }

  /**
   * Generate environment variables for the build
   */
  private async generateEnvironmentVariables(): Promise<void> {
    if (!this.buildConfig) {
      throw new Error("Build configuration not initialized")
    }

    logger.info("Generating environment variables...")

    // Get global environment variables
    const globalEnv = configManager.getGlobalEnv()

    // Create .env.local file with global variables
    let envContent = "# Generated by build orchestrator\n"

    for (const [key, value] of Object.entries(globalEnv)) {
      envContent += `${key}=${value}\n`
    }

    // Add module runtime configurations as a JSON string
    const moduleRuntimeConfigs: Record<string, any> = {}

    for (const [moduleName, moduleConfig] of Object.entries(this.buildConfig.modules)) {
      if (moduleConfig.runtime) {
        moduleRuntimeConfigs[moduleName] = moduleConfig.runtime
      }
    }

    envContent += `NEXT_PUBLIC_MODULE_CONFIG=${JSON.stringify(moduleRuntimeConfigs)}\n`

    // Add Vercel-specific environment variables
    if (this.isVercel || this.options.optimizeForVercel) {
      envContent += `NEXT_PUBLIC_VERCEL_ENV=${this.vercelEnv}\n`
      envContent += `NEXT_PUBLIC_VERCEL_URL=${process.env.VERCEL_URL || ""}\n`
      envContent += `NEXT_PUBLIC_VERCEL_DEPLOYMENT_ID=${process.env.VERCEL_DEPLOYMENT_ID || ""}\n`
    }

    // Write to .env.local
    fs.writeFileSync(path.join(process.cwd(), ".env.local"), envContent)
    logger.info("Environment variables generated")
  }

  /**
   * Run the Next.js build command
   */
  private async runNextBuild(): Promise<void> {
    logger.info("Running Next.js build...")

    // Determine build command based on environment
    const buildCmd = this.isVercel && this.vercelEnv === "production" ? "next build" : "next build"

    return new Promise((resolve, reject) => {
      const buildProcess = spawn("npx", [buildCmd], {
        stdio: this.options.verbose ? "inherit" : "pipe",
        shell: true,
        env: {
          ...process.env,
          NEXT_TELEMETRY_DISABLED: "1", // Disable telemetry for faster builds
        },
      })

      let output = ""

      if (!this.options.verbose && buildProcess.stdout) {
        buildProcess.stdout.on("data", (data) => {
          output += data.toString()
        })
      }

      if (!this.options.verbose && buildProcess.stderr) {
        buildProcess.stderr.on("data", (data) => {
          output += data.toString()
        })
      }

      buildProcess.on("close", (code) => {
        if (code === 0) {
          logger.info("Next.js build completed successfully")
          resolve()
        } else {
          logger.error(`Next.js build failed with code ${code}`)
          logger.error(output)
          reject(new Error(`Next.js build failed with code ${code}`))
        }
      })
    })
  }

  /**
   * Finalize the build process
   */
  private finalizeBuild(): void {
    this.buildResult.success = true
    this.buildResult.duration = Date.now() - this.startTime

    // Log build summary
    logger.info("Build completed successfully")
    logger.info(`Total build time: ${this.buildResult.duration}ms`)
    logger.info(`Processed ${this.buildResult.assets.total} assets`)

    const compressionRatio = this.buildResult.assets.totalSize.processed / this.buildResult.assets.totalSize.original

    logger.info(
      `Asset size: ${this.formatBytes(this.buildResult.assets.totalSize.original)} -> ${this.formatBytes(this.buildResult.assets.totalSize.processed)} (${Math.round(compressionRatio * 100)}%)`,
    )

    // Log test summary if tests were run
    if (this.buildResult.tests) {
      logger.info(
        `Tests: ${this.buildResult.tests.passed} passed, ${this.buildResult.tests.failed} failed, ${this.buildResult.tests.skipped} skipped, ${this.buildResult.tests.total} total`,
      )

      if (this.buildResult.tests.coverage) {
        logger.info(
          `Coverage: Statements ${this.buildResult.tests.coverage.statements}%, Branches ${this.buildResult.tests.coverage.branches}%, Functions ${this.buildResult.tests.coverage.functions}%, Lines ${this.buildResult.tests.coverage.lines}%`,
        )
      }
    }

    // Log Vercel-specific information
    if (this.buildResult.vercel) {
      logger.info(`Vercel environment: ${this.buildResult.vercel.environment}`)
      if (this.buildResult.vercel.deploymentId) {
        logger.info(`Vercel deployment ID: ${this.buildResult.vercel.deploymentId}`)
      }
    }
  }

  /**
   * Format bytes to a human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  /**
   * Split an array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
}

// Export the class
export { BuildOrchestrator }
