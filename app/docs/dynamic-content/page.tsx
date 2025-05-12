import Link from "next/link"

export default function DynamicContentDocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Dynamic Content Component Documentation</h1>

      <div className="prose prose-lg max-w-none">
        <h2>Overview</h2>
        <p>
          The <code>DynamicContent</code> component is a reusable React component that fetches and renders content from
          the Flat File CMS API. It handles different content types, loading states, and error scenarios.
        </p>

        <h2>Installation</h2>
        <p>The component is part of the project and can be imported from the components directory:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`import { DynamicContent } from '@/components/dynamic-content'`}
        </pre>

        <h2>Basic Usage</h2>
        <p>To use the component, provide the content type and ID:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`<DynamicContent
  contentType="page"
  contentId="about-us"
/>`}
        </pre>

        <h2>Props</h2>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Prop</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>contentType</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>string</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">Required</td>
              <td className="border border-gray-300 px-4 py-2">
                Content type to fetch (e.g., 'page', 'post', 'product')
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>contentId</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>string</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">Required</td>
              <td className="border border-gray-300 px-4 py-2">Content ID to fetch</td>
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
                <code>showSkeleton</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>boolean</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">true</td>
              <td className="border border-gray-300 px-4 py-2">Whether to show a skeleton loader while fetching</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>errorComponent</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>React.ReactNode</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">
                Custom error component to display when fetching fails
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>loadingComponent</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>React.ReactNode</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Custom loading component to display while fetching</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>customRenderers</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>Record&lt;string, (content: any) =&gt; React.ReactNode&gt;</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Custom renderer for specific content fields</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>onContentLoaded</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>(content: any) =&gt; void</code>
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
                <code>(error: Error) =&gt; void</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">undefined</td>
              <td className="border border-gray-300 px-4 py-2">Callback function when an error occurs</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">
                <code>className</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <code>string</code>
              </td>
              <td className="border border-gray-300 px-4 py-2">''</td>
              <td className="border border-gray-300 px-4 py-2">Additional CSS class names</td>
            </tr>
          </tbody>
        </table>

        <h2>Advanced Usage</h2>

        <h3>Custom Renderers</h3>
        <p>You can provide custom renderers for specific content types:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`<DynamicContent
  contentType="page"
  contentId="about-us"
  customRenderers={{
    page: (content) => (
      <div>
        <h1 className="custom-title">{content.title}</h1>
        <div className="custom-content">{content.content}</div>
      </div>
    )
  }}
/>`}
        </pre>

        <h3>Cache Control</h3>
        <p>You can control caching behavior:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`// Bypass cache
<DynamicContent
  contentType="page"
  contentId="about-us"
  cacheControl="no-cache"
/>

// Set specific max-age
<DynamicContent
  contentType="page"
  contentId="about-us"
  cacheControl="max-age=60"
/>`}
        </pre>

        <h3>Custom Loading and Error Components</h3>
        <p>You can provide custom loading and error components:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`<DynamicContent
  contentType="page"
  contentId="about-us"
  loadingComponent={<div>Loading custom component...</div>}
  errorComponent={<div>Custom error component</div>}
/>`}
        </pre>

        <h3>Event Callbacks</h3>
        <p>You can listen for content loaded and error events:</p>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {`<DynamicContent
  contentType="page"
  contentId="about-us"
  onContentLoaded={(content) => {
    console.log('Content loaded:', content);
    // Update page title, analytics, etc.
  }}
  onError={(error) => {
    console.error('Error loading content:', error);
    // Log to error tracking service
  }}
/>`}
        </pre>

        <h2>Examples</h2>

        <h3>Basic Page</h3>
        <p>
          <Link href="/content/page/about-us" className="text-blue-600 hover:underline">
            View Example: Page
          </Link>
        </p>

        <h3>Blog Post</h3>
        <p>
          <Link href="/content/post/getting-started" className="text-blue-600 hover:underline">
            View Example: Blog Post
          </Link>
        </p>

        <h3>Product</h3>
        <p>
          <Link href="/content/product/premium-package" className="text-blue-600 hover:underline">
            View Example: Product
          </Link>
        </p>

        <h2>Error Handling</h2>
        <p>The component handles various error scenarios:</p>
        <ul>
          <li>API request failures</li>
          <li>Missing content</li>
          <li>Invalid content format</li>
          <li>Network errors</li>
        </ul>
        <p>
          <Link href="/content/page/non-existent-page" className="text-blue-600 hover:underline">
            View Example: Error Handling
          </Link>
        </p>

        <h2>Performance Considerations</h2>
        <ul>
          <li>The component uses the API client's caching capabilities</li>
          <li>Skeleton loaders improve perceived performance</li>
          <li>Content is only fetched when the component mounts or when contentType/contentId changes</li>
          <li>Custom cache control allows for fine-tuning caching behavior</li>
        </ul>
      </div>
    </div>
  )
}
