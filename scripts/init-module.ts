#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { program } from "commander"
import { logger } from "../lib/services/logger"

// Define the module template
const moduleTemplate = {
  config: `name: {name}
version: 1.0.0
dependencies:
  - core

assets:
  images:
    - assets/images/**/*.{jpg,jpeg,png,gif,svg,webp}
  styles:
    - assets/styles/**/*.css
  scripts:
    - assets/scripts/**/*.js
  fonts:
    - assets/fonts/**/*.{woff,woff2,ttf,otf}

build:
  order: 200
  env:
    {name}_API_URL: /api/{name}

runtime:
  features:
    feature1: true
    feature2: false
  ui:
    theme: light
`,
  directories: ["assets/images", "assets/styles", "assets/scripts", "assets/fonts", "components", "hooks", "utils"],
  files: {
    "index.ts": `// Export module components and utilities
export * from './components';
export * from './hooks';
export * from './utils';
`,
    "components/index.ts": `// Export module components
`,
    "hooks/index.ts": `// Export module hooks
`,
    "utils/index.ts": `// Export module utilities
`,
  },
}

// Configure the command line interface
program
  .name("init-module")
  .description("Initialize a new module for the Next.js application")
  .argument("<name>", "Name of the module")
  .option("-d, --directory <path>", "Path to the modules directory", "modules")
  .option("-f, --force", "Overwrite existing module")
  .parse(process.argv)

// Get the module name and options
const moduleName = program.args[0]
const options = program.opts()

// Validate the module name
if (!moduleName) {
  logger.error("Module name is required")
  process.exit(1)
}

if (!/^[a-z0-9-]+$/.test(moduleName)) {
  logger.error("Module name must contain only lowercase letters, numbers, and hyphens")
  process.exit(1)
}

// Initialize the module
async function initModule() {
  try {
    const modulesDir = options.directory
    const moduleDir = path.join(modulesDir, moduleName)

    // Check if the module already exists
    if (fs.existsSync(moduleDir) && !options.force) {
      logger.error(`Module ${moduleName} already exists. Use --force to overwrite.`)
      process.exit(1)
    }

    // Create the module directory
    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir, { recursive: true })
    }

    // Create the module configuration file
    const configContent = moduleTemplate.config.replace(/{name}/g, moduleName)
    fs.writeFileSync(path.join(moduleDir, "module.config.yml"), configContent)

    // Create the module directories
    for (const dir of moduleTemplate.directories) {
      const dirPath = path.join(moduleDir, dir)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
    }

    // Create the module files
    for (const [filePath, content] of Object.entries(moduleTemplate.files)) {
      const fullPath = path.join(moduleDir, filePath)
      fs.writeFileSync(fullPath, content)
    }

    logger.info(`Module ${moduleName} initialized successfully`)
  } catch (error) {
    logger.error(`Failed to initialize module: ${error.message}`)
    process.exit(1)
  }
}

initModule()
