#!/usr/bin/env node

import { program } from "commander"
import { BuildOrchestrator, type BuildOptions } from "../../lib/build/build-orchestrator"
import { logger, LogLevel } from "../../lib/services/logger"

// Configure the command line interface
program
  .name("build")
  .description("Enhanced build process for Next.js applications")
  .option("-c, --config <path>", "Path to the build configuration file", "build.config.yml")
  .option("-m, --modules <path>", "Path to the modules directory", "modules")
  .option("-o, --output <path>", "Path to the output directory", ".next")
  .option("--no-clean", "Skip cleaning the output directory")
  .option("-v, --verbose", "Enable verbose logging")
  .option("--no-parallel", "Disable parallel processing")
  .option("-p, --max-parallel <number>", "Maximum number of parallel processes", "4")
  .option("--skip-tests", "Skip running tests")
  .option("--test-only", "Only run tests, skip the build")
  .option("--no-coverage", "Skip generating coverage reports")
  .option("-u, --update-snapshots", "Update test snapshots")
  .option("-t, --test-match <pattern>", "Only run tests matching the pattern")
  .option("--vercel-env <environment>", "Vercel environment (production, preview, development)")
  .option("--no-optimize-for-vercel", "Skip Vercel-specific optimizations")
  .parse(process.argv)

// Get the options
const options = program.opts()

// Configure the build options
const buildOptions: BuildOptions = {
  configPath: options.config,
  modulesDir: options.modules,
  outputDir: options.output,
  clean: options.clean !== false,
  verbose: options.verbose === true,
  parallel: options.parallel !== false,
  maxParallel: Number.parseInt(options.maxParallel, 10),
  skipTests: options.skipTests === true,
  testOnly: options.testOnly === true,
  coverage: options.coverage !== false,
  updateSnapshots: options.updateSnapshots === true,
  testMatch: options.testMatch,
  vercelEnv: options.vercelEnv,
  optimizeForVercel: options.optimizeForVercel !== false,
}

// Set up logging
if (options.verbose) {
  logger.configure({ minLevel: LogLevel.DEBUG })
} else {
  logger.configure({ minLevel: LogLevel.INFO })
}

// Run the build
async function runBuild() {
  try {
    const orchestrator = new BuildOrchestrator(buildOptions)
    const result = await orchestrator.build()

    if (result.success) {
      logger.info("Build completed successfully")
      process.exit(0)
    } else {
      logger.error(`Build failed: ${result.error}`)
      process.exit(1)
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Build failed: ${error.message}`, error)
    } else {
      logger.error(`Build failed: ${String(error)}`)
    }
    process.exit(1)
  }
}

runBuild()
