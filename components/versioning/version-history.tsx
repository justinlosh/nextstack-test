"use client"

import { useState } from "react"
import { VersionStatus } from "../../lib/content-types/content-version"

interface VersionHistoryProps {
  versionHistory: any[]
  isLoading: boolean
  onSelectVersion: (versionId: string) => void
  onCompareVersions: (versionId1: string, versionId2: string) => void
  onRollbackToVersion: (versionId: string) => void
  currentVersionId?: string
}

export default function VersionHistory({
  versionHistory,
  isLoading,
  onSelectVersion,
  onCompareVersions,
  onRollbackToVersion,
  currentVersionId,
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter((id) => id !== versionId))
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, versionId])
      } else {
        setSelectedVersions([selectedVersions[1], versionId])
      }
    }
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompareVersions(selectedVersions[0], selectedVersions[1])
    }
  }

  const getStatusBadgeClass = (status: VersionStatus) => {
    switch (status) {
      case VersionStatus.DRAFT:
        return "bg-yellow-100 text-yellow-800"
      case VersionStatus.PUBLISHED:
        return "bg-green-100 text-green-800"
      case VersionStatus.ARCHIVED:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading version history...</div>
  }

  if (versionHistory.length === 0) {
    return <div className="text-center py-4">No version history available.</div>
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Version History</h3>
        <div>
          <button
            onClick={handleCompare}
            disabled={selectedVersions.length !== 2}
            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded disabled:opacity-50"
          >
            Compare Selected
          </button>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {versionHistory.map((version) => (
          <li
            key={version.id}
            className={`px-4 py-3 hover:bg-gray-50 ${currentVersionId === version.id ? "bg-blue-50" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVersions.includes(version.id)}
                  onChange={() => handleVersionSelect(version.id)}
                  className="mr-3 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">Version {version.versionNumber}</span>
                    <span
                      className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        version.status,
                      )}`}
                    >
                      {version.status}
                    </span>
                    {currentVersionId === version.id && <span className="ml-2 text-xs text-blue-600">Current</span>}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(version.createdAt).toLocaleString()}</div>
                  {version.changeDescription && (
                    <div className="text-sm text-gray-700 mt-1">{version.changeDescription}</div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onSelectVersion(version.id)}
                  className="px-2 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                >
                  View
                </button>
                <button
                  onClick={() => onRollbackToVersion(version.id)}
                  className="px-2 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Rollback
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
