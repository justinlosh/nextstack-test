"use client"
import ContentQueryExample from "../../../../components/examples/content-query-example"

export default function ContentQueryExamplePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Content Query Example</h1>
      <p className="mb-6">
        This example demonstrates the <code>useContentQuery</code> hook for performing advanced queries.
      </p>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <ContentQueryExample />
      </div>

      <div className="mt-6">
        <a href="/docs/hooks" className="text-blue-600 hover:underline">
          &larr; Back to Hooks Documentation
        </a>
      </div>
    </div>
  )
}
