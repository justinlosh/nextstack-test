"use client"

import { useState } from "react"
import ContentEditor from "../../../components/versioning/content-editor"

export default function VersioningExamplePage() {
  const [contentId, setContentId] = useState("example-content")
  const [authorId, setAuthorId] = useState("user-123")

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Content Versioning Example</h1>

      <div className="mb-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content ID</label>
            <input
              type="text"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author ID</label>
            <input
              type="text"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <ContentEditor
        contentType="page"
        contentId={contentId}
        authorId={authorId}
        initialData={{
          title: "Example Page",
          content: "This is an example page content.",
          status: "draft",
        }}
        onSave={(data) => console.log("Content saved:", data)}
      />
    </div>
  )
}
