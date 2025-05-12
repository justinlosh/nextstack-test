# Project Documentation

Welcome to the documentation for the Flat File CMS project.

## Available Documentation

- [Build Process](./BUILD.md) - Detailed information about the build process, commands, and configurations
- [Data Service](./data-service.md) - Documentation for the data service layer
- [File Adapters](./file-adapters.md) - Documentation for the file system adapters
- [Error Handling](./error-handling.md) - Documentation for the error handling system
- [API Routes](./api-routes.md) - Documentation for the API routes

## Project Overview

This project implements a simple flat file CMS built with Next.js. It provides a data service layer for managing content and a build pipeline for frontend assets.

## Quick Links

- [Getting Started](#getting-started)
- [Directory Structure](#directory-structure)
- [Features](#features)

## Getting Started

To get started with this project:

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`

## Directory Structure

\`\`\`
flat-file-cms/
├── app/                   # Next.js app directory
├── docs/                  # Documentation files
├── lib/                   # Library code
│   ├── adapters/          # File system adapters
│   ├── api-client/        # API client code
│   ├── content-types/     # Content type definitions
│   ├── data-service/      # Data service layer
│   ├── errors/            # Error classes
│   ├── services/          # Services (e.g., logger)
│   └── utils/             # Utility functions
└── public/                # Static files
\`\`\`

## Features

- File-based content management
- Support for multiple content types
- Schema validation using Zod
- CRUD operations
- Query and filtering capabilities
- Multiple file formats (JSON, Markdown)
- Comprehensive error handling
- Logging system
- Build pipeline for frontend assets
