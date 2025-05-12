import Link from "next/link"

const Page = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Flat File CMS</h1>
      <p className="mb-4">This is a simple flat file CMS built with Next.js.</p>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>File-based content management</li>
          <li>Support for multiple content types</li>
          <li>Schema validation</li>
          <li>CRUD operations</li>
          <li>Query and filtering capabilities</li>
          <li>API caching for improved performance</li>
          <li>Dynamic content rendering</li>
          <li>React hooks for data fetching</li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Examples</h2>
        <ul className="list-disc pl-6">
          <li>
            <Link href="/api/examples/data-service" className="text-blue-600 hover:underline">
              Run Data Service Example
            </Link>
          </li>
          <li>
            <Link href="/api-example" className="text-blue-600 hover:underline">
              API Routes Example
            </Link>
          </li>
          <li>
            <Link href="/api-example/cache" className="text-blue-600 hover:underline">
              Cache Management
            </Link>
          </li>
          <li>
            <Link href="/docs/dynamic-content" className="text-blue-600 hover:underline">
              Dynamic Content Component Documentation
            </Link>
          </li>
          <li>
            <Link href="/docs/hooks" className="text-blue-600 hover:underline">
              CMS Hooks Documentation
            </Link>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Dynamic Content Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Page Example</h3>
            <p className="text-gray-600 mb-4">View a page rendered with the DynamicContent component</p>
            <Link
              href="/content/page/about-us"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Page
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Blog Post Example</h3>
            <p className="text-gray-600 mb-4">View a blog post rendered with the DynamicContent component</p>
            <Link
              href="/content/post/getting-started"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Post
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Product Example</h3>
            <p className="text-gray-600 mb-4">View a product rendered with the DynamicContent component</p>
            <Link
              href="/content/product/premium-package"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Product
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Hooks Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Page Hook Example</h3>
            <p className="text-gray-600 mb-4">View a page fetched with the usePage hook</p>
            <Link
              href="/examples/hooks/page-example"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Example
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Page List Hook Example</h3>
            <p className="text-gray-600 mb-4">View a list of pages fetched with the usePageList hook</p>
            <Link
              href="/examples/hooks/page-list-example"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Example
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Content Query Hook Example</h3>
            <p className="text-gray-600 mb-4">View advanced content querying with the useContentQuery hook</p>
            <Link
              href="/examples/hooks/content-query-example"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Example
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
