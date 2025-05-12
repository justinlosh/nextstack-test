"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useContentPreview } from "../../lib/hooks/use-content-preview"
import { usePreview } from "../../lib/preview/preview-context"
import PreviewToolbar from "./preview-toolbar"
import PreviewContainer from "./preview-container"
import RichTextEditor from "./rich-text-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"

interface ContentEditorPreviewProps {
  contentType: string
  contentId: string
  renderPreview: (content: any) => React.ReactNode
}

export default function ContentEditorPreview({ contentType, contentId, renderPreview }: ContentEditorPreviewProps) {
  const { data, isLoading, error, isPreviewMode, previewData, updatePreview, saveAsDraft, publish, resetPreview } =
    useContentPreview(contentType, contentId)

  const { previewMode } = usePreview()
  const [activeTab, setActiveTab] = useState("content")
  const [localContent, setLocalContent] = useState<any>(null)

  // Initialize local content when data is loaded
  useEffect(() => {
    if (data && !localContent) {
      setLocalContent(data)
    }
  }, [data, localContent])

  // Update local content when preview data changes
  useEffect(() => {
    if (isPreviewMode && previewData) {
      setLocalContent(previewData)
    } else if (data) {
      setLocalContent(data)
    }
  }, [isPreviewMode, previewData, data])

  // Handle field change
  const handleFieldChange = (field: string, value: any) => {
    const updatedContent = {
      ...localContent,
      [field]: value,
    }
    setLocalContent(updatedContent)
    updatePreview(updatedContent)
  }

  // Render editor based on content type
  const renderEditor = () => {
    if (!localContent) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Edit the basic information for this content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={localContent.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={localContent.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Edit the main content.</CardDescription>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={localContent.content || ""}
              onChange={(value) => handleFieldChange("content", value)}
              placeholder="Start writing your content..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Edit metadata for SEO and social sharing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={localContent.metaTitle || ""}
                onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={localContent.metaDescription || ""}
                onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render JSON editor tab
  const renderJsonEditor = () => {
    if (!localContent) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>JSON Editor</CardTitle>
          <CardDescription>Edit the raw JSON content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="font-mono h-[500px]"
            value={JSON.stringify(localContent, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                setLocalContent(parsed)
                updatePreview(parsed)
              } catch (error) {
                // Ignore JSON parse errors while typing
              }
            }}
          />
        </CardContent>
      </Card>
    )
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading content...</span>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600">Error loading content</h2>
          <p className="mt-2">{error.message}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Render editor with preview
  return (
    <div className="flex flex-col h-screen">
      <PreviewToolbar
        contentType={contentType}
        contentId={contentId}
        onSave={saveAsDraft}
        onPublish={publish}
        onReset={resetPreview}
      />

      <div className="flex-1 pt-14">
        <PreviewContainer
          editor={
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="content">Content Editor</TabsTrigger>
                <TabsTrigger value="json">JSON Editor</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="mt-0">
                {renderEditor()}
              </TabsContent>
              <TabsContent value="json" className="mt-0">
                {renderJsonEditor()}
              </TabsContent>
            </Tabs>
          }
          preview={renderPreview(isPreviewMode && previewData ? previewData : data)}
        />
      </div>
    </div>
  )
}
