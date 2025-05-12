"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useContent } from "@/lib/hooks/use-content"
import { useContentScheduling } from "@/lib/hooks/use-content-scheduling"
import { VersionStatus } from "@/lib/content-types/content-version"
import { PublishingToolbar } from "@/components/content/publishing-toolbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface ContentEditorPageProps {
  params: {
    type: string
    id: string
  }
}

export default function ContentEditorPage({ params }: ContentEditorPageProps) {
  const { type, id } = params
  const router = useRouter()
  const isNew = id === "new"

  // Fetch content data
  const {
    data: originalContent,
    isLoading,
    error,
    refreshContent,
    saveContent,
    publishContent,
  } = useContent(type, isNew ? "" : id)

  // State for edited content
  const [content, setContent] = useState<any>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Scheduling functionality
  const { isScheduled, scheduledAt, scheduleContent, unscheduleContent } = useContentScheduling(type, isNew ? "" : id)

  // Initialize content state when data is loaded
  useEffect(() => {
    if (originalContent && !content) {
      setContent(originalContent)
    }
  }, [originalContent, content])

  // Handle field change
  const handleFieldChange = (field: string, value: any) => {
    setContent((prev: any) => ({
      ...prev,
      [field]: value,
    }))
    setIsDirty(true)
  }

  // Save draft
  const handleSaveDraft = async () => {
    if (!content) return

    try {
      if (isNew) {
        // Create new content
        const newContent = await saveContent({
          ...content,
          status: VersionStatus.DRAFT,
        })

        // Redirect to the edit page for the new content
        router.push(`/admin/content/${type}/${newContent.id}`)
      } else {
        // Update existing content
        await saveContent({
          ...content,
          status: VersionStatus.DRAFT,
        })

        await refreshContent()
        setIsDirty(false)
      }
    } catch (error) {
      console.error("Error saving draft:", error)
    }
  }

  // Publish content
  const handlePublish = async () => {
    if (!content) return

    try {
      // Save any changes first if needed
      if (isDirty) {
        await saveContent(content)
      }

      // Publish the content
      await publishContent()

      await refreshContent()
      setIsDirty(false)
    } catch (error) {
      console.error("Error publishing content:", error)
    }
  }

  // Schedule content
  const handleSchedule = async (date: Date) => {
    if (!content) return

    try {
      // Save any changes first if needed
      if (isDirty) {
        await saveContent(content)
      }

      // Schedule the content
      await scheduleContent(date)

      await refreshContent()
      setIsDirty(false)
    } catch (error) {
      console.error("Error scheduling content:", error)
    }
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
        </div>
      </div>
    )
  }

  // Initialize content for new items
  if (isNew && !content) {
    setContent({
      title: "",
      description: "",
      content: "",
      status: VersionStatus.DRAFT,
    })
    return null
  }

  if (!content) return null

  return (
    <div className="min-h-screen pb-20">
      <PublishingToolbar
        contentType={type}
        contentId={id}
        versionId={content.id || ""}
        status={content.status || VersionStatus.DRAFT}
        scheduledAt={content.scheduledAt}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onSchedule={handleSchedule}
        onUnschedule={unscheduleContent}
        isDirty={isDirty}
        backUrl="/admin/content"
      />

      <div className="container py-6">
        <Tabs defaultValue="content">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={content.title || ""}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={content.description || ""}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Main Content</Label>
                  <Textarea
                    id="content"
                    value={content.content || ""}
                    onChange={(e) => handleFieldChange("content", e.target.value)}
                    className="min-h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata">
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={content.metaTitle || ""}
                    onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={content.metaDescription || ""}
                    onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={content.keywords || ""}
                    onChange={(e) => handleFieldChange("keywords", e.target.value)}
                    placeholder="Comma-separated keywords"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={content.slug || ""}
                    onChange={(e) => handleFieldChange("slug", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={content.author || ""}
                    onChange={(e) => handleFieldChange("author", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
