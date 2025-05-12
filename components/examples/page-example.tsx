"use client"
import { usePage } from "../../lib/hooks"
import Markdown from "react-markdown"

interface PageExampleProps {
  pageId: string
}

export default function PageExample({ pageId }: PageExampleProps) {
  const {
    data: page,
    isLoading,
    error,
    refreshContent,
  } = usePage(pageId, {
    // Optional configuration
    cacheControl: "max-age=60", // Cache for 60 seconds
    retry: true,
    retryOptions: {
      maxRetries: 2,
      baseDelay: 500,
    },
    onSuccess: (data) => {
      console.log("Page loaded successfully:", data)
    },
    onError: (error) => {
      console.error("Error loading page:", error)
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-6"></div>
        <div className="h-6 bg-gray-200 rounded-md w-full mb-2"></div>
        <div className="h-6 bg-gray-200 rounded-md w-2/3 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Page</h2>
        <p className="text-red-600 mb-4">We couldn't load the page with ID "{pageId}".</p>
        <div className="bg-white p-4 rounded border border-red-200 text-sm font-mono overflow-auto">
          {error.message}
        </div>
        <button onClick={refreshContent} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Try Again
        </button>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-700">No Page Found</h2>
        <p className="text-yellow-600">No page was found with ID "{pageId}".</p>
      </div>
    )
  }

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

      <div className="mt-6">
        <button onClick={refreshContent} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Refresh Content
        </button>
      </div>
    </article>
  )
}
