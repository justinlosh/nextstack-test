"use client"

import { useState, useEffect } from "react"
import { getVercelEnvironment } from "../../lib/config/vercel-env"

interface DeploymentInfo {
  environment: string
  deploymentId?: string
  url?: string
  branch?: string
  commit?: string
  buildTime?: string
  region?: string
}

export function DeploymentStatus() {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeploymentInfo() {
      try {
        const response = await fetch("/api/deployment/info")
        if (response.ok) {
          const data = await response.json()
          setDeploymentInfo(data)
        }
      } catch (error) {
        console.error("Failed to fetch deployment info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeploymentInfo()
  }, [])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading deployment info...</div>
  }

  if (!deploymentInfo) {
    return null
  }

  const environment = deploymentInfo.environment || getVercelEnvironment()
  const isProduction = environment === "production"

  return (
    <div className="text-xs rounded bg-gray-100 p-2 border border-gray-200">
      <div className="flex items-center mb-1">
        <span
          className={`inline-block w-2 h-2 rounded-full mr-2 ${
            isProduction ? "bg-green-500" : environment === "preview" ? "bg-yellow-500" : "bg-blue-500"
          }`}
        ></span>
        <span className="font-semibold">
          {isProduction ? "Production" : environment === "preview" ? "Preview" : "Development"}
        </span>
      </div>

      {deploymentInfo.deploymentId && (
        <div className="text-gray-600 truncate">ID: {deploymentInfo.deploymentId.substring(0, 8)}</div>
      )}

      {deploymentInfo.branch && <div className="text-gray-600 truncate">Branch: {deploymentInfo.branch}</div>}

      {deploymentInfo.commit && (
        <div className="text-gray-600 truncate">Commit: {deploymentInfo.commit.substring(0, 7)}</div>
      )}

      {deploymentInfo.region && <div className="text-gray-600">Region: {deploymentInfo.region}</div>}

      {deploymentInfo.buildTime && (
        <div className="text-gray-600">Built: {new Date(deploymentInfo.buildTime).toLocaleString()}</div>
      )}
    </div>
  )
}
