"use client"
import PageListExample from "../../../../components/examples/page-list-example"

export default function PageListExamplePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Page List Example</h1>
      <p className="mb-6">
        This example demonstrates the <code>usePageList</code> hook for fetching a list of pages.
      </p>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <PageListExample />
      </div>

      <div className="mt-6">
        <a href="/docs/hooks" className="text-blue-600 hover:underline">
          &larr; Back to Hooks Documentation
        </a>
      </div>
    </div>
  )
}
