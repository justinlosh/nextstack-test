"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "../../../nextstack/lib/api/api-client"

export default function CreatePageForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    status: "draft",
    excerpt: "",
    tags: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)
      setValidationErrors({})

      // Process tags
      const processedData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
      }

      // Create the page
      await apiClient.create("page", processedData)

      // Redirect to the list page
      router.push("/api-example")
    } catch (err: any) {
      console.error("Error creating page:", err)

      if (err.details) {
        setValidationErrors(err.details)
      } else {
        setError(err.message || "Failed to create page")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Page</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input
            className={`shadow appearance-none border ${validationErrors.title ? "border-red-500" : "border-gray-300"} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Page Title"
          />
          {validationErrors.title && <p className="text-red-500 text-xs italic">{validationErrors.title.join(", ")}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slug">
            Slug
          </label>
          <input
            className={`shadow appearance-none border ${validationErrors.slug ? "border-red-500" : "border-gray-300"} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="slug"
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="page-slug"
          />
          {validationErrors.slug && <p className="text-red-500 text-xs italic">{validationErrors.slug.join(", ")}</p>}
          <p className="text-gray-600 text-xs mt-1">Leave empty to generate from title</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="excerpt">
            Excerpt
          </label>
          <input
            className={`shadow appearance-none border ${validationErrors.excerpt ? "border-red-500" : "border-gray-300"} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="excerpt"
            type="text"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Brief description"
          />
          {validationErrors.excerpt && (
            <p className="text-red-500 text-xs italic">{validationErrors.excerpt.join(", ")}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
            Content (Markdown)
          </label>
          <textarea
            className={`shadow appearance-none border ${validationErrors.content ? "border-red-500" : "border-gray-300"} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="# Page Content"
            rows={10}
          />
          {validationErrors.content && (
            <p className="text-red-500 text-xs italic">{validationErrors.content.join(", ")}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            Status
          </label>
          <select
            className={`shadow appearance-none border ${validationErrors.status ? "border-red-500" : "border-gray-300"} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          {validationErrors.status && (
            <p className="text-red-500 text-xs italic">{validationErrors.status.join(", ")}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tags">
            Tags
          </label>
          <input
            className={`shadow appearance-none border ${validationErrors.tags ? "border-red-500" : "border-gray-300"} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            id="tags"
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
          />
          {validationErrors.tags && <p className="text-red-500 text-xs italic">{validationErrors.tags.join(", ")}</p>}
          <p className="text-gray-600 text-xs mt-1">Comma-separated list of tags</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Page"}
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-indigo-600 hover:text-indigo-800"
            href="/api-example"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
