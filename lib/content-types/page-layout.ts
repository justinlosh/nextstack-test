import { z } from "zod"
import { BaseContentSchema, registerContentType } from "./config"

// Define the schema for page layout configurations
export const PageLayoutSchema = BaseContentSchema.extend({
  templateId: z.string(),
  slug: z.string(),
  areas: z.record(z.any()).optional(),
  blocks: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  styles: z.record(z.any()).optional(),
  className: z.string().optional(),
})

export type PageLayout = z.infer<typeof PageLayoutSchema>

// Register the page layout content type
registerContentType({
  name: "pageLayout",
  pluralName: "pageLayouts",
  directory: "page-layouts",
  schema: PageLayoutSchema,
  defaultValues: {
    templateId: "standard",
  },
  fileFormat: "json",
})
