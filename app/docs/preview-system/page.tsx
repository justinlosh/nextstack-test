import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Real-Time Preview System Documentation",
  description: "Documentation for the real-time preview system in the Next.js CMS",
}

export default function PreviewSystemDocsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Real-Time Preview System</h1>

      <div className="prose max-w-none">
        <h2>Overview</h2>
        <p>
          The real-time preview system allows content editors to see live updates of their changes on the frontend as
          they edit content in the editor interface. This system uses WebSockets for real-time communication between the
          editor and preview interfaces.
        </p>

        <h2>Key Features</h2>
        <ul>
          <li>Real-time content updates without page refresh</li>
          <li>Split-screen and full-screen preview modes</li>
          <li>Device-specific previews (mobile, tablet, desktop)</li>
          <li>Rich text editing with image and link support</li>
          <li>Draft saving and publishing workflow</li>
          <li>Integration with the content versioning system</li>
        </ul>

        <h2>Architecture</h2>
        <p>The preview system consists of the following components:</p>
        <ul>
          <li>
            <strong>WebSocket Service</strong>: Handles real-time communication between editor and preview clients
          </li>
          <li>
            <strong>Preview Context</strong>: React context for managing preview state and actions
          </li>
          <li>
            <strong>Content Preview Hook</strong>: Custom hook for working with content in preview mode
          </li>
          <li>
            <strong>Editor Components</strong>: UI components for editing content with preview
          </li>
        </ul>

        <h2>Usage</h2>
        <h3>Basic Setup</h3>
        <pre>
          <code>
            {`// Wrap your application with PreviewProvider
import { PreviewProvider } from "../lib/preview/preview-context"

export default function Layout({ children }) {
  return (
    <PreviewProvider>
      {children}
    </PreviewProvider>
  )
}`}
          </code>
        </pre>

        <h3>Using the Content Preview Hook</h3>
        <pre>
          <code>
            {`// Use the useContentPreview hook in your components
import { useContentPreview } from "../lib/hooks/use-content-preview"

function MyComponent() {
  const {
    data,
    isLoading,
    error,
    isPreviewMode,
    previewData,
    updatePreview,
    saveAsDraft,
    publish,
    resetPreview,
  } = useContentPreview("page", "home-page")

  // Use the data and preview functions
  return (
    <div>
      <h1>{isPreviewMode && previewData ? previewData.title : data?.title}</h1>
      {/* ... */}
    </div>
  )
}`}
          </code>
        </pre>

        <h3>Using the Content Editor Preview Component</h3>
        <pre>
          <code>
            {`// Use the ContentEditorPreview component
import ContentEditorPreview from "../components/preview/content-editor-preview"

function EditorPage() {
  return (
    <ContentEditorPreview
      contentType="page"
      contentId="home-page"
      renderPreview={(content) => (
        <div>
          <h1>{content?.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: content?.content }} />
        </div>
      )}
    />
  )
}`}
          </code>
        </pre>

        <h2>Configuration</h2>
        <p>The preview system can be configured using environment variables:</p>
        <ul>
          <li>
            <code>PREVIEW_SECRET</code>: Secret key for authenticating preview requests
          </li>
          <li>
            <code>NEXT_PUBLIC_SITE_URL</code>: URL of the site for WebSocket connections
          </li>
        </ul>

        <h2>Security Considerations</h2>
        <p>The preview system includes several security measures:</p>
        <ul>
          <li>Preview requests are authenticated using a secret key</li>
          <li>WebSocket connections are authenticated using session IDs</li>
          <li>Content updates are validated before being applied</li>
          <li>Preview mode is time-limited using cookies with expiration</li>
        </ul>

        <h2>Performance Optimization</h2>
        <p>The preview system is optimized for performance:</p>
        <ul>
          <li>Content updates are debounced to reduce network traffic</li>
          <li>WebSocket connections are reused across the application</li>
          <li>Preview data is cached in memory for fast access</li>
          <li>Components are optimized to prevent unnecessary re-renders</li>
        </ul>

        <h2>Troubleshooting</h2>
        <p>Common issues and solutions:</p>
        <ul>
          <li>
            <strong>Preview not updating:</strong> Check WebSocket connection status in the toolbar. If disconnected,
            try refreshing the page.
          </li>
          <li>
            <strong>Cannot save or publish:</strong> Ensure you have the necessary permissions and that the content is
            valid.
          </li>
          <li>
            <strong>WebSocket connection errors:</strong> Check network connectivity and ensure the WebSocket server is
            running.
          </li>
        </ul>
      </div>
    </div>
  )
}
