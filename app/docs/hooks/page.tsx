"use client"

import Link from "next/link"

export default function HooksDocumentationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">CMS Hooks Documentation</h1>

      <div className="prose prose-lg max-w-none">
        <h2>Overview</h2>
        <p>
          The CMS Hooks library provides a set of React hooks for fetching content from the Flat File CMS API. These
          hooks handle loading states, error handling, caching, and automatic retries.
        </p>

        <h2>Installation</h2>
        <p>The hooks are part of the project and can be imported from the hooks directory:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`import { usePage, usePageList, useContentQuery } from '@/lib/hooks'`}
        </pre>

        <h2>Provider Setup</h2>
        <p>
          To configure global options for all hooks, wrap your application with the <code>CmsProvider</code>:
        </p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`import { CmsProvider } from '@/lib/hooks'

export default function RootLayout({ children }) {
  return (
    <CmsProvider
      config={{
        baseUrl: '/api',
        defaultCacheControl: 'max-age=60',
        defaultRetryOptions: {
          maxRetries: 3,
          baseDelay: 1000,
        },
        debug: process.env.NODE_ENV === 'development',
      }}
    >
      {children}
    </CmsProvider>
  )
}`}
        </pre>

        <h2>Available Hooks</h2>

        <h3>Single Content Hooks</h3>
        <ul>
          <li>
            <code>useContent</code> - General hook for fetching any content type
          </li>
          <li>
            <code>usePage</code> - Specialized hook for fetching pages
          </li>
          <li>
            <code>usePost</code> - Specialized hook for fetching posts
          </li>
          <li>
            <code>useProduct</code> - Specialized hook for fetching products
          </li>
        </ul>

        <h3>Content List Hooks</h3>
        <ul>
          <li>
            <code>useContentList</code> - General hook for fetching lists of any content type
          </li>
          <li>
            <code>usePageList</code> - Specialized hook for fetching lists of pages
          </li>
          <li>
            <code>usePostList</code> - Specialized hook for fetching lists of posts
          </li>
          <li>
            <code>useProductList</code> - Specialized hook for fetching lists of products
          </li>
        </ul>

        <h3>Advanced Hooks</h3>
        <ul>
          <li>
            <code>useContentQuery</code> - Hook for performing advanced queries
          </li>
          <li>
            <code>useCmsConfig</code> - Hook to access CMS configuration
          </li>
        </ul>

        <h2>Basic Usage</h2>

        <h3>Fetching a Single Content Item</h3>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`import { usePage } from '@/lib/hooks'

function PageComponent({ pageId }) {
  const { data, isLoading, error, refreshContent } = usePage(pageId)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <div>No page found</div>

  return (
    <div>
      <h1>{data.title}</h1>
      <div>{data.content}</div>
      <button onClick={refreshContent}>Refresh</button>
    </div>
  )
}`}
        </pre>

        <h3>Fetching a List of Content Items</h3>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`import { usePageList } from '@/lib/hooks'

function PageListComponent() {
  const {
    data: pages,
    isLoading,
    error,
    pagination,
    setPage,
  } = usePageList({
    page: 1,
    pageSize: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    filters: {
      status: 'published',
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!pages || pages.length === 0) return <div>No pages found</div>

  return (
    <div>
      {pages.map(page => (
        <div key={page.id}>
          <h2>{page.title}</h2>
          <p>{page.excerpt}</p>
        </div>
      ))}

      <div>
        <button
          onClick={() => setPage(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage}
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage(pagination.page + 1)}
          disabled={!pagination.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  )
}`}
        </pre>

        <h3>Advanced Querying</h3>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`import { useContentQuery } from '@/lib/hooks'

function ProductQueryComponent() {
  const {
    data: products,
    isLoading,
    error,
    pagination,
    updateQuery,
  } = useContentQuery('product', {
    filters: {
      price_gt: 50,
      status: 'published',
    },
    sort: {
      field: 'price',
      order: 'asc',
    },
    pagination: {
      page: 1,
      pageSize: 10,
    },
  })

  // Update query criteria
  const applyFilters = () => {
    updateQuery({
      filters: {
        price_gt: 100,
        category: 'electronics',
      },
    })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!products || products.length === 0) return <div>No products found</div>

  return (
    <div>
      <button onClick={applyFilters}>Apply Filters</button>
      
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.title}</h2>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  )
}`}
        </pre>

        <h2>Hook Options</h2>

        <h3>useContent / usePage / usePost / useProduct</h3>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Option</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>autoFetch</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">true</td>
              <td className="border border-gray-300 px-4 py-2">Whether to fetch content automatically on mount</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>cacheControl</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>string</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Cache control directive for the API request</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>retry</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">true</td>
              <td className="border border-gray-300 px-4 py-2">Whether to enable retry logic</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>retryOptions</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>RetryOptions</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Custom retry options</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>onSuccess</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>(data: T) => void</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">
                Callback function when content is successfully loaded
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>onError</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>(error: Error) => void</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Callback function when an error occurs</td>
            </tr>
          </tbody>
        </table>

        <h3>useContentList / usePageList / usePostList / useProductList</h3>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Option</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>autoFetch</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">true</td>
              <td className="border border-gray-300 px-4 py-2">Whether to fetch content automatically on mount</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>cacheControl</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>string</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Cache control directive for the API request</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>retry</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">true</td>
              <td className="border border-gray-300 px-4 py-2">Whether to enable retry logic</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>retryOptions</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>RetryOptions</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Custom retry options</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>page</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>number</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">1</td>
              <td className="border border-gray-300 px-4 py-2">Page number for pagination</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>pageSize</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>number</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">10</td>
              <td className="border border-gray-300 px-4 py-2">Number of items per page</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>sortBy</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>string</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">"updatedAt"</td>
              <td className="border border-gray-300 px-4 py-2">Field to sort by</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>sortOrder</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>"asc" | "desc"</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">"desc"</td>
              <td className="border border-gray-300 px-4 py-2">Sort order</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>filters</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>Record&lt;string, string&gt;</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">{}</td>
              <td className="border border-gray-300 px-4 py-2">Filter criteria</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>onSuccess</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>(data: T[], pagination: PaginationInfo) => void</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">
                Callback function when content is successfully loaded
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>onError</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>(error: Error) => void</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Callback function when an error occurs</td>
            </tr>
          </tbody>
        </table>

        <h3>useContentQuery</h3>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Option</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>autoFetch</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">true</td>
              <td className="border border-gray-300 px-4 py-2">Whether to fetch content automatically on mount</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>retry</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">true</td>
              <td className="border border-gray-300 px-4 py-2">Whether to enable retry logic</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>retryOptions</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>RetryOptions</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Custom retry options</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>onSuccess</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>(data: T[], pagination: PaginationInfo) => void</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">
                Callback function when content is successfully loaded
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>onError</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>(error: Error) => void</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Callback function when an error occurs</td>
            </tr>
          </tbody>
        </table>

        <h2>RetryOptions</h2>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Option</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>maxRetries</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>number</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">3</td>
              <td className="border border-gray-300 px-4 py-2">Maximum number of retry attempts</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>baseDelay</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>number</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">1000</td>
              <td className="border border-gray-300 px-4 py-2">Base delay between retries in milliseconds</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>exponentialBackoff</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">true</td>
              <td className="border border-gray-300 px-4 py-2">Whether to use exponential backoff for retries</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>isRetryable</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>(error: Error) => boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">() => true</td>
              <td className="border border-gray-300 px-4 py-2">Function to determine if an error is retryable</td>
            </tr>
          </tbody>
        </table>

        <h2>Advanced Usage</h2>

        <h3>Manual Fetching</h3>
        <p>You can disable automatic fetching and manually trigger it:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`const { data, isLoading, error, fetchContent } = usePage('about-us', {
  autoFetch: false,
})

// Later, manually fetch the content
const handleFetch = () => {
  fetchContent()
}`}
        </pre>

        <h3>Refreshing Content</h3>
        <p>You can refresh content at any time:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`const { data, refreshContent } = usePage('about-us')

// Refresh the content
const handleRefresh = () => {
  refreshContent()
}`}
        </pre>

        <h3>Cache Control</h3>
        <p>You can control caching behavior:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`// Bypass cache
const { data } = usePage('about-us', {
  cacheControl: 'no-cache',
})

// Set specific max-age
const { data } = usePage('about-us', {
  cacheControl: 'max-age=60',
})`}
        </pre>

        <h3>Retry Configuration</h3>
        <p>You can configure retry behavior:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`const { data } = usePage('about-us', {
  retry: true,
  retryOptions: {
    maxRetries: 5,
    baseDelay: 500,
    exponentialBackoff: true,
    isRetryable: (error) => {
      // Don't retry 404 errors
      if (error && 'status' in error && error.status === 404) {
        return false;
      }
      return true;
    },
  },
})`}
        </pre>

        <h3>Event Callbacks</h3>
        <p>You can listen for success and error events:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`const { data } = usePage('about-us', {
  onSuccess: (data) => {
    console.log('Content loaded:', data);
    // Update page title, analytics, etc.
    document.title = data.title;
  },
  onError: (error) => {
    console.error('Error loading content:', error);
    // Log to error tracking service
  },
})`}
        </pre>

        <h2>Examples</h2>

        <h3>Basic Page Example</h3>
        <p>
          <Link href="/examples/hooks/page-example" className="text-blue-600 hover:underline">
            View Example: Page
          </Link>
        </p>

        <h3>Page List Example</h3>
        <p>
          <Link href="/examples/hooks/page-list-example" className="text-blue-600 hover:underline">
            View Example: Page List
          </Link>
        </p>

        <h3>Content Query Example</h3>
        <p>
          <Link href="/examples/hooks/content-query-example" className="text-blue-600 hover:underline">
            View Example: Content Query
          </Link>
        </p>

        <h2>Error Handling</h2>
        <p>The hooks handle various error scenarios:</p>
        <ul>
          <li>API request failures</li>
          <li>Network errors</li>
          <li>Timeout errors</li>
          <li>Invalid response formats</li>
        </ul>

        <h2>Performance Considerations</h2>
        <ul>
          <li>The hooks use the API client's caching capabilities</li>
          <li>Content is only fetched when the component mounts or when dependencies change</li>
          <li>Custom cache control allows for fine-tuning caching behavior</li>
          <li>Automatic retries with exponential backoff improve reliability</li>
        </ul>

        <h2>Best Practices</h2>
        <ul>
          <li>
            Use the specialized hooks (<code>usePage</code>, <code>usePost</code>, etc.) when possible
          </li>
          <li>
            Configure global options with <code>CmsProvider</code>
          </li>
          <li>Handle loading and error states appropriately</li>
          <li>
            Use the <code>refreshContent</code> function to refresh content when needed
          </li>
          <li>
            Use the <code>cacheControl</code> option to control caching behavior
          </li>
          <li>
            Use the <code>retry</code> and <code>retryOptions</code> to configure retry behavior
          </li>
        </ul>
      </div>
    </div>
  )
}
