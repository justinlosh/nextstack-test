# Data Service Layer Documentation

The Data Service Layer provides a consistent API for managing content in the flat-file CMS. It abstracts the underlying file system operations and provides CRUD operations for various content types.

## Content Types

Content types are defined using Zod schemas and registered with the content type registry. Each content type has:

- A name
- A plural name
- A directory where content is stored
- A schema that defines the structure of the content
- Optional default values

### Example Content Type Definition

\`\`\`typescript
import { z } from "zod"
import { BaseContentSchema, registerContentType } from "./config"

// Define the schema for pages
export const PageSchema = BaseContentSchema.extend({
  content: z.string(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
})

export type Page = z.infer<typeof PageSchema>

// Register the page content type
registerContentType({
  name: "page",
  pluralName: "pages",
  directory: "content/pages",
  schema: PageSchema,
  defaultValues: {
    status: "draft",
  },
})
\`\`\`

## Data Service API

The Data Service provides the following methods:

### create(contentType, data)

Creates a new content entry.

\`\`\`typescript
const page = await dataService.create<Page>("page", {
  title: "About Us",
  slug: "about-us",
  content: "# About Us\n\nWelcome to our website!",
  status: "published",
})
\`\`\`

### get(contentType, id)

Gets a content entry by ID.

\`\`\`typescript
const page = await dataService.get<Page>("page", "about-us")
\`\`\`

### update(contentType, id, data)

Updates a content entry.

\`\`\`typescript
const updatedPage = await dataService.update<Page>("page", "about-us", {
  content: "# About Us\n\nWelcome to our awesome website!",
})
\`\`\`

### delete(contentType, id)

Deletes a content entry.

\`\`\`typescript
await dataService.delete("page", "about-us")
\`\`\`

### list(contentType)

Lists all content entries of a specific type.

\`\`\`typescript
const pages = await dataService.list<Page>("page")
\`\`\`

### query(contentType, filter, sort)

Queries content entries with filtering and sorting.

\`\`\`typescript
const publishedPages = await dataService.query<Page>(
  "page",
  (page) => page.status === "published",
  (a, b) => a.title.localeCompare(b.title)
)
\`\`\`

## Error Handling

The Data Service throws the following errors:

- `ValidationError`: When content fails schema validation
- `ContentTypeError`: When a content type is not registered
- `Error`: For other errors like file not found

## Extending the Data Service

To add a new content type:

1. Create a new file in `lib/content-types/`
2. Define the schema using Zod
3. Register the content type using `registerContentType`
4. Import the content type in `lib/content-types/index.ts`
5. Update `lib/content-types/init.ts` to include the new content type

## Best Practices

- Always use typed interfaces with the Data Service methods
- Handle errors appropriately in your application
- Use the query method for filtering and sorting instead of doing it client-side
- Initialize content types before using the Data Service
\`\`\`

Let's update the README.md to include information about the data service:
