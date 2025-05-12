export default function VersioningDocumentationPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Content Versioning System</h1>

      <div className="prose prose-indigo max-w-none">
        <h2>Overview</h2>
        <p>
          The content versioning system enables draft/published states and content history tracking. It allows content
          creators to create drafts, publish content, track history, compare versions, and roll back to previous
          versions.
        </p>

        <h2>Key Features</h2>
        <ul>
          <li>
            <strong>Draft and Published States</strong>: Content can exist in draft, published, or archived states.
          </li>
          <li>
            <strong>Version History</strong>: All versions of content are tracked with metadata.
          </li>
          <li>
            <strong>Version Comparison</strong>: Compare different versions to see what changed.
          </li>
          <li>
            <strong>Rollback</strong>: Revert to previous versions when needed.
          </li>
          <li>
            <strong>Author Tracking</strong>: Each version records who made the changes.
          </li>
          <li>
            <strong>Change Descriptions</strong>: Document what changed in each version to maintain a clear history of
            modifications.
          </li>
        </ul>

        <h2>Architecture</h2>
        <p>The versioning system consists of several components:</p>
        <ul>
          <li>
            <strong>Content Version Model</strong>: Defines the structure of version data, including metadata and
            content.
          </li>
          <li>
            <strong>Versioning Service</strong>: Provides methods for creating, publishing, archiving, and comparing
            versions.
          </li>
          <li>
            <strong>API Endpoints</strong>: RESTful endpoints for interacting with the versioning system.
          </li>
          <li>
            <strong>React Hooks</strong>: Custom hooks for working with content versions in React components.
          </li>
          <li>
            <strong>UI Components</strong>: Components for displaying version history, comparing versions, and editing
            content.
          </li>
        </ul>

        <h2>Usage</h2>
        <h3>Basic Usage</h3>
        <p>
          To use the versioning system in your components, import the <code>useContentVersion</code> hook:
        </p>
        <pre className="bg-gray-100 p-4 rounded">
          {`import { useContentVersion } from '@/lib/hooks/use-content-version';

function MyComponent() {
  const {
    version,
    isLoading,
    error,
    createDraft,
    publishVersion,
    versionHistory
  } = useContentVersion('page', 'my-page-id');

  // Use the version data and methods
}`}
        </pre>

        <h3>Creating a Draft</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {`// Create a new draft
await createDraft(
  { title: 'My Page', content: 'Page content' },
  'user-123',
  'Initial draft'
);`}
        </pre>

        <h3>Publishing Content</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {`// Publish the current draft
await publishVersion('user-123');`}
        </pre>

        <h3>Comparing Versions</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {`import { useVersionComparison } from '@/lib/hooks/use-version-comparison';

function CompareComponent() {
  const { comparison, compareVersions } = useVersionComparison();
  
  // Compare two versions
  compareVersions('version-id-1', 'version-id-2');
}`}
        </pre>

        <h2>API Reference</h2>
        <h3>Versioning Service</h3>
        <ul>
          <li>
            <code>createDraft(contentType, contentId, data, authorId, changeDescription)</code>
          </li>
          <li>
            <code>publishVersion(versionId, authorId)</code>
          </li>
          <li>
            <code>archiveVersion(versionId, authorId)</code>
          </li>
          <li>
            <code>getLatestVersion(contentType, contentId, includesDrafts)</code>
          </li>
          <li>
            <code>getPublishedVersion(contentType, contentId)</code>
          </li>
          <li>
            <code>getContentVersions(contentType, contentId)</code>
          </li>
          <li>
            <code>getVersion(versionId)</code>
          </li>
          <li>
            <code>compareVersions(versionId1, versionId2)</code>
          </li>
          <li>
            <code>rollbackToVersion(versionId, authorId, changeDescription)</code>
          </li>
        </ul>

        <h3>React Hooks</h3>
        <ul>
          <li>
            <code>useContentVersion(contentType, contentId, options)</code>
          </li>
          <li>
            <code>useVersionComparison()</code>
          </li>
        </ul>

        <h2>Example Implementation</h2>
        <p>
          Check out the{" "}
          <a href="/examples/versioning" className="text-indigo-600 hover:text-indigo-800">
            versioning example page
          </a>{" "}
          to see the system in action.
        </p>
      </div>
    </div>
  )
}
