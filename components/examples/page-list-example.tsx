"use client"
import { usePageList } from "../../lib/hooks"
import Link from "next/link"

export default function PageListExample() {
  const {
    data: pages,
    isLoading,
    error,
    pagination,
    refreshContent,
    setPage,
  } = usePageList({
    // Optional configuration
    page: 1,
    pageSize: 5,
    sortBy: "updatedAt",
    sortOrder: "desc",
    filters: {
      status: "published",
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Pages</h2>
        <p className="text-red-600 mb-4">We couldn't load the page list.</p>
        <div className="bg-white p-4 rounded border border-red-200 text-sm font-mono overflow-auto">
          {error.message}
        </div>
        <button onClick={refreshContent} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Try Again
        </button>
      </div>
    )
  }

  if (!pages || pages.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-yellow-700">No Pages Found</h2>
        <p className="text-yellow-600">No pages were found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4 mb-6">
        {pages.map((page) => (
          <div key={page.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">
              <Link href={`/content/page/${page.id}`} className="text-blue-600 hover:underline">
                {page.title}
              </Link>
            </h2>
            {page.excerpt && <p className="text-gray-600 mb-2">{page.excerpt}</p>}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Updated: {new Date(page.updatedAt).toLocaleDateString()}</div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  page.status === "published"
                    ? "bg-green-100 text-green-800"
                    : page.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {page.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
          className="px-4 py-2 border rounded bg-white disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
          className="px-4 py-2 border rounded bg-white disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="mt-6">
        <button onClick={refreshContent} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Refresh Content
        </button>
      </div>
    </div>
  )
}
