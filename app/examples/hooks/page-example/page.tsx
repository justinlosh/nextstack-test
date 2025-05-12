"use client"
import PageExample from "../../../../components/examples/page-example"

export default function PageExamplePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Page Example</h1>
      <p className="mb-6">
        This example demonstrates the <code>usePage</code> hook for fetching a single page.
      </p>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <PageExample pageId="about-us" />
      </div>

      <div className="mt-6">
        <a href="/docs/hooks" className="text-blue-600 hover:underline">
          &larr; Back to Hooks Documentation
        </a>
      </div>
    </div>
  )
}
