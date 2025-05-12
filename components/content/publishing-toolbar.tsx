"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { VersionStatus } from "@/lib/content-types/content-version"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { SchedulingDialog } from "./scheduling-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Save, Upload, Clock, ArrowLeft } from "lucide-react"

interface PublishingToolbarProps {
  contentType: string
  contentId: string
  versionId: string
  status: VersionStatus
  scheduledAt?: string | null
  onSaveDraft: () => Promise<void>
  onPublish: () => Promise<void>
  onSchedule: (date: Date) => Promise<void>
  onUnschedule: () => Promise<void>
  isDirty?: boolean
  backUrl?: string
}

export function PublishingToolbar({
  contentType,
  contentId,
  versionId,
  status,
  scheduledAt,
  onSaveDraft,
  onPublish,
  onSchedule,
  onUnschedule,
  isDirty = false,
  backUrl = "/admin/content",
}: PublishingToolbarProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const isScheduled = status === VersionStatus.SCHEDULED
  const isPublished = status === VersionStatus.PUBLISHED

  const handleSaveDraft = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await onSaveDraft()
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    setError(null)
    try {
      await onPublish()
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push(backUrl)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="ml-2">
          <StatusBadge status={status} scheduledAt={scheduledAt} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {error && <p className="text-sm text-red-500 mr-2">{error.message}</p>}

        <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving || isPublishing || !isDirty}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Draft
        </Button>

        {!isPublished && (
          <SchedulingDialog
            isScheduled={isScheduled}
            scheduledAt={scheduledAt ? new Date(scheduledAt) : null}
            onSchedule={onSchedule}
            onUnschedule={onUnschedule}
            isLoading={isSaving || isPublishing}
            error={error}
            trigger={
              <Button variant="outline" size="sm" disabled={isSaving || isPublishing}>
                <Clock className="h-4 w-4 mr-2" />
                {isScheduled ? "Edit Schedule" : "Schedule"}
              </Button>
            }
          />
        )}

        {!isPublished && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" disabled={isSaving || isPublishing}>
                {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Publish Now
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will publish the content immediately and make it visible to all users.
                  {isDirty && " Your unsaved changes will be saved automatically."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePublish}>Publish</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
