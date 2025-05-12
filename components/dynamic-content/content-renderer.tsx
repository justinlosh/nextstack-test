import React from "react"
import Markdown from "react-markdown"
import type { Page } from "../../nextstack/lib/content-types/page"
import type { Post } from "../../nextstack/lib/content-types/post"
import type { Product } from "../../nextstack/lib/content-types/product"

interface ContentRendererProps {
  content: any
  contentType: string
  customRenderers?: Record<string, (content: any) => React.ReactNode>
}

/**
 * Renders content based on its type
 */
export default function ContentRenderer({ content, contentType, customRenderers }: ContentRendererProps) {
  // Handle missing content
  if (!content) {
    return <div className="text-red-500">No content available</div>
  }

  // Use custom renderer if provided for this content type
  if (customRenderers && customRenderers[contentType]) {
    return customRenderers[contentType](content)
  }

  // Render based on content type
  switch (contentType) {
    case "page":
      return <PageRenderer page={content as Page} />
    case "post":
      return <PostRenderer post={content as Post} />
    case "product":
      return <ProductRenderer product={content as Product} />
    default:
      return <GenericRenderer content={content} />
  }
}

/**
 * Renders a Page content type
 */
function PageRenderer({ page }: { page: Page }) {
  return (
    <article className="page-content">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>

      {page.excerpt && <div className="text-lg text-gray-600 mb-6">{page.excerpt}</div>}

      {page.featuredImage && (
        <div className="mb-6">
          <img
            src={page.featuredImage || "/placeholder.svg"}
            alt={page.title}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <Markdown>{page.content || ""}</Markdown>
      </div>

      {page.tags && page.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {page.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

/**
 * Renders a Post content type
 */
function PostRenderer({ post }: { post: Post }) {
  return (
    <article className="post-content">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center text-gray-600 mb-6">
        {post.author && <span className="mr-4">By {post.author}</span>}
        {post.publishedAt && <span>Published on {new Date(post.publishedAt).toLocaleDateString()}</span>}
      </div>

      {post.excerpt && <div className="text-lg text-gray-600 mb-6">{post.excerpt}</div>}

      {post.featuredImage && (
        <div className="mb-6">
          <img
            src={post.featuredImage || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <Markdown>{post.content || ""}</Markdown>
      </div>

      {post.categories && post.categories.length > 0 && (
        <div className="mt-6 mb-2">
          <h3 className="text-sm uppercase text-gray-500">Categories:</h3>
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <span key={category} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="mt-2">
          <h3 className="text-sm uppercase text-gray-500">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

/**
 * Renders a Product content type
 */
function ProductRenderer({ product }: { product: Product }) {
  return (
    <div className="product-content">
      <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div className="product-images">
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-auto rounded-lg shadow-md"
              />

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} - ${index + 2}`}
                      className="w-full h-auto rounded-md shadow-sm"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-200 rounded-lg w-full h-64 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="product-details">
          <div className="mb-4">
            <div className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
              {product.salePrice && (
                <span className="ml-2 text-lg line-through text-gray-500">${product.salePrice.toFixed(2)}</span>
              )}
            </div>

            <div className="text-sm text-gray-600">SKU: {product.sku}</div>

            <div className={`text-sm mt-2 ${product.inventory > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.inventory > 0 ? `In Stock (${product.inventory} available)` : "Out of Stock"}
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-6">
            <Markdown>{product.description || ""}</Markdown>
          </div>

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Specifications</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <React.Fragment key={key}>
                    <dt className="text-gray-600">{key}</dt>
                    <dd className="text-gray-900">{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          )}

          {product.categories && product.categories.length > 0 && (
            <div className="mb-2">
              <h3 className="text-sm uppercase text-gray-500">Categories:</h3>
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <span key={category} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="mt-2">
              <h3 className="text-sm uppercase text-gray-500">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Renders generic content when no specific renderer is available
 */
function GenericRenderer({ content }: { content: any }) {
  return (
    <div className="generic-content">
      {content.title && <h1 className="text-3xl font-bold mb-4">{content.title}</h1>}

      {content.content && (
        <div className="prose prose-lg max-w-none">
          <Markdown>{content.content}</Markdown>
        </div>
      )}

      {/* Render other fields as JSON if they exist */}
      <div className="mt-8">
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {JSON.stringify(
            Object.fromEntries(Object.entries(content).filter(([key]) => !["title", "content"].includes(key))),
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  )
}
