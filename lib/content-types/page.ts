import { z } from "zod"
import { BaseContentSchema, registerContentType } from "./config"

// Define the schema for pages
export const PageSchema = BaseContentSchema.extend({
  content: z.string(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
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
    tags: [],
  },
  fileFormat: "markdown", // Use Markdown format for pages
})
