import { dataService } from "../data-service"
import type { Page } from "../content-types/page"
import type { Post } from "../content-types/post"
import type { Product } from "../content-types/product"
import { initContentTypes } from "../content-types/init"
import { logger } from "../services/logger"
import { ValidationError, NotFoundError, DuplicateError, CmsError, ContentTypeError } from "../errors/cms-errors"

/**
 * Example usage of the data service
 */
export async function dataServiceExample(): Promise<void> {
  try {
    // Configure logger
    logger.configure({
      minLevel: 0, // DEBUG level
      enableConsole: true,
    })

    // Initialize content types
    await initContentTypes()

    console.log("=== CREATING CONTENT ===")

    // Create a page (Markdown format)
    const page = await dataService.create<Page>("page", {
      title: "About Us",
      slug: "about-us",
      content: "# About Us\n\nWelcome to our website!",
      status: "published",
    })
    console.log("Created page (Markdown):", page)

    // Create a blog post (Markdown format)
    const post = await dataService.create<Post>("post", {
      title: "Getting Started with Flat-File CMS",
      slug: "getting-started",
      content: "# Getting Started\n\nThis is a guide to get started with our CMS.",
      author: "Admin",
      tags: ["cms", "tutorial"],
    })
    console.log("Created post (Markdown):", post)

    // Create a product (JSON format)
    const product = await dataService.create<Product>("product", {
      title: "Premium Package",
      slug: "premium-package",
      description: "Our premium package with all features.",
      price: 99.99,
      sku: "PKG-PREMIUM-001",
      inventory: 100,
      images: ["/images/premium-package.jpg"],
    })
    console.log("Created product (JSON):", product)

    console.log("\n=== READING CONTENT ===")

    // Get a page by ID (Markdown format)
    const retrievedPage = await dataService.get<Page>("page", page.id)
    console.log("Retrieved page (Markdown):", retrievedPage)

    // Get a product by ID (JSON format)
    const retrievedProduct = await dataService.get<Product>("product", product.id)
    console.log("Retrieved product (JSON):", retrievedProduct)

    console.log("\n=== UPDATING CONTENT ===")

    // Update a page (Markdown format)
    const updatedPage = await dataService.update<Page>("page", page.id, {
      content: "# About Us\n\nWelcome to our awesome website!",
    })
    console.log("Updated page (Markdown):", updatedPage)

    // Update a product (JSON format)
    const updatedProduct = await dataService.update<Product>("product", product.id, {
      price: 89.99,
      salePrice: 79.99,
    })
    console.log("Updated product (JSON):", updatedProduct)

    console.log("\n=== LISTING AND QUERYING CONTENT ===")

    // List all posts (Markdown format)
    const posts = await dataService.list<Post>("post")
    console.log("All posts (Markdown):", posts)

    // Query products with filter and sort (JSON format)
    const products = await dataService.query<Product>(
      "product",
      (product) => product.price > 50,
      (a, b) => a.price - b.price,
    )
    console.log("Filtered and sorted products (JSON):", products)

    console.log("\n=== ERROR HANDLING EXAMPLES ===")

    // Example 1: Try to get a non-existent page
    try {
      await dataService.get<Page>("page", "non-existent-page")
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log("Expected error - Not Found:", error.getUserMessage())
      } else {
        console.error("Unexpected error type:", error)
      }
    }

    // Example 2: Try to create a page with invalid data
    try {
      // @ts-ignore - Intentionally passing invalid data
      await dataService.create<Page>("page", {
        title: 123, // Should be a string
        content: "Invalid page",
      })
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log("Expected error - Validation:", error.getUserMessage())
      } else {
        console.error("Unexpected error type:", error)
      }
    }

    // Example 3: Try to create a duplicate page
    try {
      await dataService.create<Page>("page", {
        title: "About Us",
        slug: "about-us", // Same slug as existing page
        content: "Duplicate page",
      })
    } catch (error) {
      if (error instanceof DuplicateError) {
        console.log("Expected error - Duplicate:", error.getUserMessage())
      } else {
        console.error("Unexpected error type:", error)
      }
    }

    // Example 4: Try to use a non-existent content type
    try {
      // @ts-ignore - Intentionally using wrong content type
      await dataService.get("non-existent-type", "some-id")
    } catch (error) {
      if (error instanceof ContentTypeError) {
        console.log("Expected error - Content Type:", error.getUserMessage())
      } else {
        console.error("Unexpected error type:", error)
      }
    }

    console.log("\n=== DELETING CONTENT ===")

    // Delete a post (Markdown format)
    await dataService.delete("post", post.id)
    console.log("Deleted post with ID:", post.id)

    // Delete a product (JSON format)
    await dataService.delete("product", product.id)
    console.log("Deleted product with ID:", product.id)

    // Example 5: Try to delete already deleted content
    try {
      await dataService.delete("product", product.id)
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log("Expected error - Already Deleted:", error.getUserMessage())
      } else {
        console.error("Unexpected error type:", error)
      }
    }
  } catch (error) {
    // Handle any unexpected errors
    if (error instanceof CmsError) {
      console.error("CMS Error:", error.getUserMessage())
    } else if (error instanceof Error) {
      console.error("Error:", error.message)
    } else {
      console.error("Unknown error:", error)
    }
  }
}
