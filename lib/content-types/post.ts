import { z } from "zod"
import { BaseContentSchema, registerContentType } from "./config"

// Define the schema for blog posts
export const PostSchema = BaseContentSchema.extend({
  content: z.string(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  author: z.string(),
  publishedAt: z.string().datetime().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
})

export type Post = z.infer<typeof PostSchema>

// Register the post content type
registerContentType({
  name: "post",
  pluralName: "posts",
  directory: "content/posts",
  schema: PostSchema,
  defaultValues: {
    status: "draft",
    categories: [],
    tags: [],
  },
  fileFormat: "markdown", // Use Markdown format for posts
})
