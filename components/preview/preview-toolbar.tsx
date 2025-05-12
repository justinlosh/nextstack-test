"use client"

import { useState } from "react"
import { usePreview, PreviewMode } from "../../lib/preview/preview-context"
import { Button } from "../ui/button"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Eye, EyeOff, Smartphone, Tablet, Monitor, Save, Upload, RotateCcw } from "lucide-react"

interface PreviewToolbarProps {
  contentType: string
  contentId: string
  onSave?: () => Promise<void>
  onPublish?: () => Promise<void>
  onReset?: () => void
}

export default function PreviewToolbar({ contentType, contentId, onSave, onPublish, onReset }: PreviewToolbarProps) {
  const { previewMode, setPreviewMode, isConnected } = usePreview()
  const [deviceView, setDeviceView] = useState<"mobile" | "tablet" | "desktop">("desktop")
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true)
      try {
        await onSave()
      } catch (error) {
        console.error("Error saving content:", error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handlePublish = async () => {
    if (onPublish) {
      setIsPublishing(true)
      try {
        await onPublish()
      } finally {
        setIsPublishing(false)
      }
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    }
  }

  const togglePreviewMode = () => {
    setPreviewMode(previewMode === PreviewMode.DISABLED ? PreviewMode.SPLIT : PreviewMode.DISABLED)
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-background border-b p-2 shadow-sm">
      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreviewMode}
                className={previewMode !== PreviewMode.DISABLED ? "bg-primary text-primary-foreground" : ""}
              >
                {previewMode !== PreviewMode.DISABLED ? (
                  <Eye className="h-4 w-4 mr-2" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-2" />
                )}
                {previewMode !== PreviewMode.DISABLED ? "Preview On" : "Preview Off"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {previewMode !== PreviewMode.DISABLED ? "Disable preview mode" : "Enable preview mode"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {previewMode !== PreviewMode.DISABLED && (
          <>
            <div className="h-4 border-l border-gray-300" />

            <Tabs value={deviceView} onValueChange={(value) => setDeviceView(value as any)}>
              <TabsList>
                <TabsTrigger value="mobile">
                  <Smartphone className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="tablet">
                  <Tablet className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="desktop">
                  <Monitor className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-4 border-l border-gray-300" />

            <Tabs value={previewMode} onValueChange={(value) => setPreviewMode(value as PreviewMode)}>
              <TabsList>
                <TabsTrigger value={PreviewMode.SPLIT}>Split</TabsTrigger>
                <TabsTrigger value={PreviewMode.FULLSCREEN}>Full</TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {previewMode !== PreviewMode.DISABLED && (
          <>
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
          </>
        )}

        <div className="h-4 border-l border-gray-300 mx-2" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset changes</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save as draft</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" onClick={handlePublish} disabled={isPublishing}>
                <Upload className="h-4 w-4 mr-2" />
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Publish changes</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
