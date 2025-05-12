"use client"

import { useState } from "react"
import { useContentVersion } from "../../lib/hooks/use-content-version"
import VersionHistory from "./version-history"
import VersionComparison from "./version-comparison"
import { VersionStatus } from "../../lib/content-types/content-version"

interface ContentEditorProps {
  contentType: string
  contentId: string
  authorId: string
  initialData?: Record<string, any>
  onSave?: (data: Record<string, any>) => void
}

export default function ContentEditor({
  contentType,
  contentId,
  authorId,
  initialData = {},
  onSave,
}: ContentEditorProps) {
  const [editorData, setEditorData] = useState<Record<string, any>>(initialData)
  const [isEditing, setIsEditing] = useState(false)
  const [changeDescription, setChangeDescription] = useState("")
  const [compareVersions, setCompareVersions] = useState<string[]>([])

  const {
    version,
    isLoading,
    error,
    createDraft,
    publishVersion,
    archiveVersion,
    rollbackToVersion,
    versionHistory,
    isHistoryLoading,
    getVersionHistory,
  } = useContentVersion(contentType, contentId)

  const handleDataChange = (newData: Record<string, any>) => {
    setEditorData(newData)
  }

  const handleSaveDraft = async () => {
    try {
      await createDraft(editorData, authorId, changeDescription)
      setIsEditing(false)
      setChangeDescription("")
      if (onSave) {
        onSave(editorData)
      }
    } catch (error) {
      console.error("Error saving draft:", error)
    }
  }

  const handlePublish = async () => {
    try {
      await publishVersion(authorId)
      if (onSave) {
        onSave(version?.data || {})
      }
    } catch (error) {
      console.error("Error publishing version:", error)
    }
  }

  const handleArchive = async () => {
    try {
      await archiveVersion(authorId)
    } catch (error) {
      console.error("Error archiving version:", error)
    }
  }

  const handleRollback = async (versionId: string) => {
    if (confirm("Are you sure you want to rollback to this version?")) {
      try {
        await rollbackToVersion(versionId, authorId, "Rollback to previous version")
        setIsEditing(false)
      } catch (error) {
        console.error("Error rolling back:", error)
      }
    }
  }

  const handleSelectVersion = (versionId: string) => {
    const selectedVersion = versionHistory.find((v) => v.id === versionId)
    if (selectedVersion) {
      // Fetch the full version data
      // For now, we'll just use the current version data
      setEditorData(version?.data || {})
    }
  }

  const handleCompareVersions = (versionId1: string, versionId2: string) => {
    setCompareVersions([versionId1, versionId2])
  }

  const handleCloseComparison = () => {
    setCompareVersions([])
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading content...</div>
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Content" : "Content Details"}</h2>
          <div className="flex space-x-2">
            {version?.status === VersionStatus.DRAFT && (
              <button onClick={handlePublish} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Publish
              </button>
            )}
            {version?.status === VersionStatus.PUBLISHED && (
              <button onClick={handleArchive} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Archive
              </button>
            )}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Save Draft
                </button>
              </>
            )}
          </div>
        </div>

        {version && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  version.status === VersionStatus.PUBLISHED
                    ? "bg-green-100 text-green-800"
                    : version.status === VersionStatus.DRAFT
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {version.status}
              </span>
              <span className="ml-2 text-sm text-gray-500">Version {version.versionNumber}</span>
              <span className="ml-2 text-sm text-gray-500">
                Last updated: {new Date(version.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Change Description</label>
            <input
              type="text"
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your changes"
            />
          </div>
        )}

        <div className="border rounded-lg p-4 bg-gray-50">
          {isEditing ? (
            <textarea
              value={JSON.stringify(editorData, null, 2)}
              onChange={(e) => {
                try {
                  const newData = JSON.parse(e.target.value)
                  handleDataChange(newData)
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              className="w-full h-64 font-mono text-sm p-2 border rounded"
            />
          ) : (
            <pre className="overflow-auto max-h-96">{JSON.stringify(version?.data || {}, null, 2)}</pre>
          )}
        </div>
      </div>

      {compareVersions.length === 2 && (
        <VersionComparison
          versionId1={compareVersions[0]}
          versionId2={compareVersions[1]}
          onClose={handleCloseComparison}
        />
      )}

      <VersionHistory
        versionHistory={versionHistory}
        isLoading={isHistoryLoading}
        onSelectVersion={handleSelectVersion}
        onCompareVersions={handleCompareVersions}
        onRollbackToVersion={handleRollback}
        currentVersionId={version?.id}
      />
    </div>
  )
}
