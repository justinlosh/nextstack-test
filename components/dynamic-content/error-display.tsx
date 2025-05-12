interface ErrorDisplayProps {
  error: Error
  contentType: string
  contentId: string
  className?: string
}

/**
 * Displays an error message when content fetching fails
 */
export default function ErrorDisplay({ error, contentType, contentId, className = "" }: ErrorDisplayProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Content</h2>

      <p className="text-red-600 mb-4">
        We couldn't load the {contentType} with ID "{contentId}".
      </p>

      <div className="bg-white p-4 rounded border border-red-200 text-sm font-mono overflow-auto">{error.message}</div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Try refreshing the page or contact support if the problem persists.</p>
      </div>
    </div>
  )
}
