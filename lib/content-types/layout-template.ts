import { z } from "zod"
import { BaseContentSchema, registerContentType } from "./config"

// Define the schema for content blocks
const ContentBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string().optional(),
  content: z.any().optional(),
  metadata: z.record(z.any()).optional(),
  styles: z.record(z.any()).optional(),
  className: z.string().optional(),
})

// Define the schema for layout areas
const LayoutAreaSchema = z.object({
  id: z.string(),
  type: z.string(),
  blocks: z.array(ContentBlockSchema),
  metadata: z.record(z.any()).optional(),
  styles: z.record(z.any()).optional(),
  className: z.string().optional(),
})

// Define the schema for layout templates
export const LayoutTemplateSchema = BaseContentSchema.extend({
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  areas: z.array(LayoutAreaSchema),
  metadata: z.record(z.any()).optional(),
  styles: z.record(z.any()).optional(),
  className: z.string().optional(),
})

export type LayoutTemplate = z.infer<typeof LayoutTemplateSchema>

// Register the layout template content type
registerContentType({
  name: "layoutTemplate",
  pluralName: "layoutTemplates",
  directory: "layout-templates",
  schema: LayoutTemplateSchema,
  defaultValues: {
    type: "standard",
    areas: [],
  },
  fileFormat: "json",
})
