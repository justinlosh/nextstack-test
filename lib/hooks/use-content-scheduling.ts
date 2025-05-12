"use client"

import { useState, useCallback } from "react"
import { useContent } from "./use-content"
import { VersionStatus } from "../content-types/content-version"

interface UseContentSchedulingOptions {
  onScheduled?: (scheduledAt: Date) => void
  onUnscheduled?: () => void
  onError?: (error: Error) => void
}

export function useContentScheduling<T = any>(
  contentType: string,
  contentId: string,
  options: UseContentSchedulingOptions = {},
) {
  const { data, isLoading, error, refreshContent } = useContent<T>(contentType, contentId)
  const [isScheduling, setIsScheduling] = useState(false)
  const [isUnscheduling, setIsUnscheduling] = useState(false)
  const [schedulingError, setSchedulingError] = useState<Error | null>(null)

  // Check if content is scheduled
  const isScheduled = data?.status === VersionStatus.SCHEDULED
  const scheduledAt = data?.scheduledAt ? new Date(data.scheduledAt) : null

  // Schedule content
  const scheduleContent = useCallback(
    async (date: Date) => {
      setIsScheduling(true)
      setSchedulingError(null)

      try {
        const response = await fetch(`/api/versions/schedule`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            versionId: data?.id,
            scheduledAt: date.toISOString(),
            authorId: "current-user", // In a real app, this would be the current user's ID
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || "Failed to schedule content")
        }

        await refreshContent()

        if (options.onScheduled) {
          options.onScheduled(date)
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setSchedulingError(err)

        if (options.onError) {
          options.onError(err)
        }
      } finally {
        setIsScheduling(false)
      }
    },
    [data?.id, refreshContent, options],
  )

  // Unschedule content
  const unscheduleContent = useCallback(async () => {
    if (!isScheduled) return

    setIsUnscheduling(true)
    setSchedulingError(null)

    try {
      const response = await fetch(`/api/versions/unschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          versionId: data?.id,
          authorId: "current-user", // In a real app, this would be the current user's ID
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || "Failed to unschedule content")
      }

      await refreshContent()

      if (options.onUnscheduled) {
        options.onUnscheduled()
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setSchedulingError(err)

      if (options.onError) {
        options.onError(err)
      }
    } finally {
      setIsUnscheduling(false)
    }
  }, [data?.id, isScheduled, refreshContent, options])

  return {
    data,
    isLoading,
    error,
    isScheduled,
    scheduledAt,
    isScheduling,
    isUnscheduling,
    schedulingError,
    scheduleContent,
    unscheduleContent,
    refreshContent,
  }
}
