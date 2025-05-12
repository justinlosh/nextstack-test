"use client"

import { useState, useEffect } from "react"
import { apiClient } from "../../lib/api/api-client"

export default function ApiExamplePage() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [cacheInfo, setCacheInfo] = useState<string | null>(null)

  useEffect(() => {
    loadPages()
  }, [currentPage, statusFilter])

  async function loadPages() {
    try {
      setLoading(true)
      setError(null)
      setCacheInfo(null)

      const params: Record<string, string> = {
        page: currentPage.toString(),
        pageSize: "5",
      }

      // Add status filter if not 'all'
      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      const response = await apiClient.list("page", params)
      setPages(response.data)
      setTotalPages(response.pagination.totalPages)

      // Check for X-Cache header
      const headers = response.headers
      if (headers && headers["X-Cache"]) {
        setCacheInfo(`Cache: ${headers["X-Cache"]}`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load pages")
      console.error("Error loading pages:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeletePage(id: string) {
    if (!confirm("Are you sure you want to delete this page?")) {
      return
    }

    try {
      setLoading(true)
      await apiClient.delete("page", id)
      await loadPages() // Reload the list
    } catch (err: any) {
      setError(err.message || "Failed to delete page")
      console.error("Error deleting page:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Example: Pages</h1>

      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="mr-2">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <a
            href="/api-example/cache"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Cache Management
          </a>
          <a
            href="/api-example/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Page
          </a>
        </div>
      </div>

      {cacheInfo && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded mb-4">{cacheInfo}</div>
      )}

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          {pages.length === 0 ? (
            <div className="text-center py-4">No pages found.</div>
          ) : (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">{page.slug || page.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={`/api-example/edit/${page.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Edit
                        </a>
                        <button onClick={() => handleDeletePage(page.id)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded bg-white disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
