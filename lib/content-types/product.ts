import { z } from "zod"
import { BaseContentSchema, registerContentType } from "./config"

// Define the schema for products
export const ProductSchema = BaseContentSchema.extend({
  description: z.string(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  sku: z.string(),
  inventory: z.number().int().nonnegative(),
  images: z.array(z.string()),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.string()).optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
})

export type Product = z.infer<typeof ProductSchema>

// Register the product content type
registerContentType({
  name: "product",
  pluralName: "products",
  directory: "content/products",
  schema: ProductSchema,
  defaultValues: {
    status: "published",
    inventory: 0,
    images: [],
    categories: [],
    tags: [],
    attributes: {},
  },
  fileFormat: "json", // Use JSON format for products
})
