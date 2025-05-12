"use client"

import { useState } from "react"
import { DynamicContent } from "../../../../components/dynamic-content"

export default function ContentPage({
  params,
}: {
  params: { type: string; id: string }
}) {
  const { type, id } = params
  const [refreshKey, setRefreshKey] = useState(0)

  // Function to handle content loaded
  const handleContentLoaded = (content: any) => {
    console.log(`Content loaded: ${type}/${id}`, content)
  }

  // Function to handle errors
  const handleError = (error: Error) => {
    console.error(`Error loading content: ${type}/${id}`, error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {type.charAt(0).toUpperCase() + type.slice(1)}: {id}
        </h1>

        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Content
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Using the key prop to force re-render when refreshing */}
        <DynamicContent
          key={refreshKey}
          contentType={type}
          contentId={id}
          onContentLoaded={handleContentLoaded}
          onError={handleError}
          className="p-6"
        />
      </div>

      <div className="mt-6">
        <a href="/" className="text-blue-600 hover:underline">
          &larr; Back to Home
        </a>
      </div>
    </div>
  )
}
