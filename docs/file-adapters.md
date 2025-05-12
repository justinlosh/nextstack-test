# File System Adapters

The Flat File CMS supports multiple file formats for storing content. This document describes the file system adapters that enable reading and writing content in different formats.

## Supported Formats

The CMS currently supports the following file formats:

- **JSON** (.json): Stores content as JSON files
- **Markdown** (.md): Stores content as Markdown files with YAML frontmatter

## Adapter Interface

All file adapters implement the `FileAdapter` interface:

\`\`\`typescript
interface FileAdapter<T> {
  read(filePath: string): Promise<T>
  write(filePath: string, data: T): Promise<void>
  exists(filePath: string): Promise<boolean>
  delete(filePath: string): Promise<void>
  getFileExtension(): string
}
\`\`\`

## JSON Adapter

The JSON adapter stores content as JSON files. It:

- Reads JSON files and parses them into JavaScript objects
- Writes JavaScript objects as formatted JSON files
- Handles file existence checks and deletion

Example JSON file:

\`\`\`json
{
  "id": "about-us",
  "title": "About Us",
  "content": "# About Us\n\nWelcome to our website!",
  "status": "published",
  "createdAt": "2023-05-15T10:30:00.000Z",
  "updatedAt": "2023-05-15T10:30:00.000Z"
}
\`\`\`

## Markdown Adapter

The Markdown adapter stores content as Markdown files with YAML frontmatter. It:

- Reads Markdown files and parses the frontmatter and content
- Writes content with frontmatter to Markdown files
- Handles file existence checks and deletion

Example Markdown file:

\`\`\`markdown
---
id: about-us
title: About Us
status: published
createdAt: 2023-05-15T10:30:00.000Z
updatedAt: 2023-05-15T10:30:00.000Z
---

# About Us

Welcome to our website!
\`\`\`

## Configuring Content Types

When registering a content type, you can specify which file format to use:

\`\`\`typescript
registerContentType({
  name: "page",
  pluralName: "pages",
  directory: "content/pages",
  schema: PageSchema,
  defaultValues: {
    status: "draft",
  },
  fileFormat: "markdown" // Use Markdown format for pages
})
\`\`\`

The `fileFormat` property can be:
- `"json"` (default if not specified)
- `"markdown"`

## Extending with New Formats

To add support for a new file format:

1. Create a new adapter class that implements the `FileAdapter` interface
2. Register the adapter with the `FileAdapterFactory`
3. Update content type configurations to use the new format

Example of registering a new adapter:

\`\`\`typescript
// Create a new adapter
class XmlAdapter<T> implements FileAdapter<T> {
  // Implement the interface methods
}

// Register the adapter
FileAdapterFactory.register("xml", XmlAdapter)
\`\`\`

Then, you can use the new format in content type configurations:

\`\`\`typescript
registerContentType({
  // ...
  fileFormat: "xml"
})
\`\`\`

## Best Practices

- Use Markdown format for content-heavy types like pages and posts
- Use JSON format for structured data like products and settings
- Consider the needs of content editors when choosing a format
- Use the appropriate adapter for each content type
\`\`\`

Let's update the docs/index.md to include the file adapters documentation:
