"use client"

import { useState } from "react"
import { useContentQuery } from "../../lib/hooks"
import type { QueryCriteria } from "../../lib/hooks"

export default function ContentQueryExample() {
  const [contentType, setContentType] = useState("product")

  // Initial query criteria
  const initialCriteria: QueryCriteria = {
    filters: {
      price_gt: 50,
      status: "published",
    },
    sort: {
      field: "price",
      order: "asc",
    },
    pagination: {
      page: 1,
      pageSize: 5,
    },
  }

  const { data, isLoading, error, pagination, refreshContent, updateQuery } = useContentQuery(
    contentType,
    initialCriteria,
  )

  // Form state for filter controls
  const [minPrice, setMinPrice] = useState("50")
  const [status, setStatus] = useState("published")
  const [sortField, setSortField] = useState("price")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Apply filters
  const applyFilters = () => {
    updateQuery({
      filters: {
        price_gt: Number.parseFloat(minPrice),
        status,
      },
      sort: {
        field: sortField,
        order: sortOrder,
      },
    })
  }

  // Change content type
  const changeContentType = (type: string) => {
    setContentType(type)
  }

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
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Content</h2>
        <p className="text-red-600 mb-4">We couldn't load the content.</p>
        <div className="bg-white p-4 rounded border border-red-200 text-sm font-mono overflow-auto">
          {error.message}
        </div>
        <button onClick={refreshContent} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Query Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => changeContentType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="page">Pages</option>
              <option value="post">Posts</option>
              <option value="product">Products</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {contentType === "product" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="title">Title</option>
                <option value="updatedAt">Updated Date</option>
                {contentType === "product" && <option value="price">Price</option>}
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-24 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Apply Filters
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">{contentType.charAt(0).toUpperCase() + contentType.slice(1)} Results</h2>

      {data.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-700">No Results Found</h2>
          <p className="text-yellow-600">No content was found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {data.map((item: any) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>

              {contentType === "product" && (
                <div className="text-lg font-bold text-gray-900 mb-2">${item.price.toFixed(2)}</div>
              )}

              {item.excerpt && <p className="text-gray-600 mb-2">{item.excerpt}</p>}

              {item.description && <p className="text-gray-600 mb-2">{item.description}</p>}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Updated: {new Date(item.updatedAt).toLocaleDateString()}</div>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === "published"
                      ? "bg-green-100 text-green-800"
                      : item.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() =>
              updateQuery({
                pagination: { page: pagination.page - 1, pageSize: pagination.pageSize },
              })
            }
            disabled={!pagination.hasPreviousPage}
            className="px-4 py-2 border rounded bg-white disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              updateQuery({
                pagination: { page: pagination.page + 1, pageSize: pagination.pageSize },
              })
            }
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 border rounded bg-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <div className="mt-6">
        <button onClick={refreshContent} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Refresh Content
        </button>
      </div>
    </div>
  )
}
