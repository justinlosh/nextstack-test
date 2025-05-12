# Enhanced Build System for Next.js

This document describes the enhanced build system for Next.js applications, which provides modular asset handling and configuration management.

## Overview

The build system extends the standard Next.js build process to handle module-specific assets and configurations. It provides the following features:

- Modular asset handling
- Configuration management
- Build process integration
- Customization and extensibility
- Performance optimizations
- Error handling and reporting

## Getting Started

### Installation

The build system is included in the project dependencies. To use it, you need to run the custom build script:

\`\`\`bash
npm run build
\`\`\`

This will run the enhanced build process, which includes:

1. Processing module assets
2. Generating environment variables
3. Running the Next.js build
4. Generating an asset manifest

### Configuration

The build system uses configuration files to define how modules and their assets should be processed. There are two types of configuration files:

1. Global configuration: `build.config.yml`
2. Module configuration: `modules/<module-name>/module.config.yml`

#### Global Configuration

The global configuration file (`build.config.yml`) defines global settings for the build process:

\`\`\`yaml
global:
  env:
    NODE_ENV: production
    API_BASE_URL: /api
  options:
    optimize: true
    sourceMaps: false
    minify: true

modules:
  # Module-specific overrides
  core:
    build:
      order: 100
      env:
        CORE_DEBUG: false
    runtime:
      features:
        enableCache: true
        logLevel: info
\`\`\`

#### Module Configuration

Each module can have its own configuration file (`module.config.yml`) that defines module-specific settings:

\`\`\`yaml
name: content
version: 1.0.0
dependencies:
  - core
  - ui

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
    CONTENT_API_URL: /api/content

runtime:
  features:
    enableDrafts: true
    enableScheduling: true
    enableVersioning: true
\`\`\`

## Module Structure

A module is a directory in the `modules` directory. Each module can have the following structure:

\`\`\`
modules/
  module-name/
    module.config.yml
    assets/
      images/
      styles/
      scripts/
      fonts/
    components/
    hooks/
    utils/
    ...
\`\`\`

## Asset Processing

The build system processes assets based on their type:

- **Images**: Optimized using Sharp
- **Styles**: Minified using Clean CSS
- **Scripts**: Minified using Terser
- **Fonts**: Copied as-is

Processed assets are stored in the `.next/static/assets` directory and referenced via the asset manifest.

## Using Assets in Components

To use processed assets in your components, you can use the `useAssetUrl` hook or the `AssetImage` component:

\`\`\`tsx
import { useAssetUrl, AssetImage } from '../lib/utils/asset-utils';

function MyComponent() {
  const logoUrl = useAssetUrl('modules/ui/assets/images/logo.png');
  
  return (
    <div>
      <img src={logoUrl || "/placeholder.svg"} alt="Logo" />
      
      {/* Or use the AssetImage component */}
      <AssetImage src="modules/ui/assets/images/logo.png" alt="Logo" />
    </div>
  );
}
\`\`\`

## Configuration in Components

To use module configuration in your components, you can use the `useModuleConfig` hook:

\`\`\`tsx
import { useModuleConfig } from '../components/module-config/module-config-provider';

function MyComponent() {
  const config = useModuleConfig('content');
  const enableDrafts = useModuleConfig<boolean>('content', 'features.enableDrafts');
  
  return (
    <div>
      {enableDrafts && (
        <button>Create Draft</button>
      )}
    </div>
  );
}
\`\`\`

## Command Line Options

The build script supports the following command line options:

- `-c, --config <path>`: Path to the build configuration file (default: `build.config.yml`)
- `-m, --modules <path>`: Path to the modules directory (default: `modules`)
- `-o, --output <path>`: Path to the output directory (default: `.next`)
- `--no-clean`: Skip cleaning the output directory
- `-v, --verbose`: Enable verbose logging
- `--no-parallel`: Disable parallel processing
- `-p, --max-parallel <number>`: Maximum number of parallel processes (default: `4`)

Example:

\`\`\`bash
npm run build -- --verbose --max-parallel 2
\`\`\`

## Extending the Build System

The build system is designed to be extensible. You can add custom asset processors, configuration handlers, and build steps by modifying the relevant files in the `lib/build` directory.

## Troubleshooting

If you encounter issues with the build process, you can enable verbose logging to get more information:

\`\`\`bash
npm run build -- --verbose
\`\`\`

Common issues:

- **Missing dependencies**: Make sure all required dependencies are installed
- **Invalid configuration**: Check your configuration files for syntax errors
- **Asset processing errors**: Check that your assets are valid and can be processed
- **Build errors**: Check the Next.js build output for errors

## Performance Considerations

The build system includes several performance optimizations:

- **Caching**: Processed assets are cached to avoid re-processing unchanged files
- **Parallel processing**: Modules can be processed in parallel to speed up the build
- **Incremental builds**: Only changed assets are re-processed

To further optimize the build process, consider:

- Limiting the number of assets in each module
- Using appropriate asset formats (e.g., WebP for images)
- Optimizing assets before adding them to the project
\`\`\`

Let's create a module initialization script:
