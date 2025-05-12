"use client"

import { useEffect } from "react"
import { useVersionComparison } from "../../lib/hooks/use-version-comparison"

interface VersionComparisonProps {
  versionId1: string
  versionId2: string
  onClose: () => void
}

export default function VersionComparison({ versionId1, versionId2, onClose }: VersionComparisonProps) {
  const { comparison, isLoading, error, compareVersions } = useVersionComparison()

  useEffect(() => {
    compareVersions(versionId1, versionId2)
  }, [versionId1, versionId2, compareVersions])

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Comparing Versions</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
        <div className="text-center py-4">Loading comparison...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Comparing Versions</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Error: {error.message}</div>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Comparing Versions</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
        <div className="text-center py-4">No comparison data available.</div>
      </div>
    )
  }

  const { previousVersion, currentVersion, changes } = comparison

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Comparing Version {previousVersion.versionNumber} and Version {currentVersion.versionNumber}
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          Close
        </button>
      </div>

      <div className="mb-4">
        <h4 className="text-md font-medium text-gray-700 mb-2">Changes Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800">Added</div>
            <div className="text-sm text-green-700">{changes.added.length > 0 ? changes.added.join(", ") : "None"}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <div className="font-medium text-yellow-800">Modified</div>
            <div className="text-sm text-yellow-700">
              {changes.modified.length > 0 ? changes.modified.join(", ") : "None"}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <div className="font-medium text-red-800">Removed</div>
            <div className="text-sm text-red-700">
              {changes.removed.length > 0 ? changes.removed.join(", ") : "None"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <h4 className="text-md font-medium text-gray-700 mb-2">Version {previousVersion.versionNumber}</h4>
          <div className="text-xs text-gray-500 mb-2">{new Date(previousVersion.createdAt).toLocaleString()}</div>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(previousVersion.data, null, 2)}
          </pre>
        </div>
        <div className="border rounded p-4">
          <h4 className="text-md font-medium text-gray-700 mb-2">Version {currentVersion.versionNumber}</h4>
          <div className="text-xs text-gray-500 mb-2">{new Date(currentVersion.createdAt).toLocaleString()}</div>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(currentVersion.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
