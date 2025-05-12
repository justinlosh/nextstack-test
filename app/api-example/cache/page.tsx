"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiClient } from "../../../nextstack/lib/api/api-client"

export default function CacheManagementPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invalidatePath, setInvalidatePath] = useState("")
  const [namespace, setNamespace] = useState("api")

  useEffect(() => {
    loadCacheStats()
  }, [])

  async function loadCacheStats() {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.getCacheStats()
      setStats(response.data)
    } catch (err: any) {
      setError(err.message || "Failed to load cache statistics")
      console.error("Error loading cache statistics:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleClearCache() {
    if (!confirm("Are you sure you want to clear the entire cache?")) {
      return
    }

    try {
      setLoading(true)
      await apiClient.clearCache()
      await loadCacheStats()
    } catch (err: any) {
      setError(err.message || "Failed to clear cache")
      console.error("Error clearing cache:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvalidateCache(e: React.FormEvent) {
    e.preventDefault()

    if (!invalidatePath) {
      setError("Please enter a path to invalidate")
      return
    }

    try {
      setLoading(true)
      await apiClient.invalidateCache(invalidatePath, namespace)
      await loadCacheStats()
      setInvalidatePath("")
    } catch (err: any) {
      setError(err.message || "Failed to invalidate cache")
      console.error("Error invalidating cache:", err)
    } finally {
      setLoading(false)
    }
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cache Management</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading && !stats ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Cache Statistics</h2>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-blue-600 font-medium">Memory Cache Entries</div>
                  <div className="text-2xl font-bold">{stats.stats.memoryCacheSize}</div>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-sm text-green-600 font-medium">File Cache Entries</div>
                  <div className="text-2xl font-bold">{stats.stats.fileCacheCount}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <div className="text-sm text-purple-600 font-medium">File Cache Size</div>
                  <div className="text-2xl font-bold">{formatBytes(stats.stats.fileCacheSize)}</div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={handleClearCache}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Clear All Cache
              </button>
              <button
                onClick={loadCacheStats}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Refresh Statistics
              </button>
            </div>
          </div>

          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Invalidate Cache</h2>

            <form onSubmit={handleInvalidateCache}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="path">
                  Path
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="path"
                  type="text"
                  placeholder="/api/page/list or * for all"
                  value={invalidatePath}
                  onChange={(e) => setInvalidatePath(e.target.value)}
                />
                <p className="text-gray-600 text-xs mt-1">
                  Enter a specific path to invalidate or * to invalidate all paths in the namespace
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="namespace">
                  Namespace
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="namespace"
                  type="text"
                  placeholder="api"
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Invalidate Cache
              </button>
            </form>
          </div>

          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-xl font-semibold mb-4">Cache Tips</h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Clear All Cache</strong> - Removes all cached data from both memory and file cache.
              </li>
              <li>
                <strong>Invalidate Path</strong> - Removes cached data for a specific path or pattern.
              </li>
              <li>
                <strong>Namespace</strong> - Caches are grouped by namespace, with "api" being the default for API
                routes.
              </li>
              <li>
                <strong>Automatic Invalidation</strong> - Cache is automatically invalidated when content is created,
                updated, or deleted.
              </li>
              <li>
                <strong>Cache Headers</strong> - API responses include cache control headers for browser and CDN
                caching.
              </li>
            </ul>
          </div>
        </>
      )}

      <div className="mt-4">
        <a href="/api-example" className="text-blue-600 hover:underline">
          &larr; Back to API Example
        </a>
      </div>
    </div>
  )
}
