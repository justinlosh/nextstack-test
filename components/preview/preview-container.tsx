"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePreview, PreviewMode } from "../../lib/preview/preview-context"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable"
import { cn } from "../../lib/utils"

interface PreviewContainerProps {
  editor: React.ReactNode
  preview: React.ReactNode
  defaultSize?: number
}

export default function PreviewContainer({ editor, preview, defaultSize = 40 }: PreviewContainerProps) {
  const { previewMode } = usePreview()
  const [deviceClass, setDeviceClass] = useState("")

  // Handle device preview classes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const device = urlParams.get("device")

    switch (device) {
      case "mobile":
        setDeviceClass("max-w-[375px] mx-auto border-x border-gray-200")
        break
      case "tablet":
        setDeviceClass("max-w-[768px] mx-auto border-x border-gray-200")
        break
      default:
        setDeviceClass("")
        break
    }
  }, [])

  if (previewMode === PreviewMode.DISABLED) {
    return <div className="h-full w-full">{editor}</div>
  }

  if (previewMode === PreviewMode.FULLSCREEN) {
    return (
      <div className="h-full w-full">
        <div className={cn("h-full w-full overflow-auto", deviceClass)}>{preview}</div>
      </div>
    )
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={defaultSize} minSize={30}>
        <div className="h-full overflow-auto p-4">{editor}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - defaultSize} minSize={30}>
        <div className={cn("h-full overflow-auto", deviceClass)}>{preview}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
