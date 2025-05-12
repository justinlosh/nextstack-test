"use client"

import { useEffect, useState } from "react"
import type { LayoutProps, LayoutTemplate, PageLayoutConfig } from "./types"
import { useLayoutTemplate } from "../hooks/use-layout-template"
import { usePageLayout } from "../hooks/use-page-layout"
import { LayoutProvider } from "./layout-context"
import { TemplateRegistry } from "./template-registry"
import ErrorBoundary from "../components/error-boundary"

export default function LayoutManager({ pageId, fallbackTemplate = "standard", children }: LayoutProps) {
  const [resolvedTemplate, setResolvedTemplate] = useState<LayoutTemplate | null>(null)
  const [resolvedPage, setResolvedPage] = useState<PageLayoutConfig | null>(null)

  // Fetch page layout configuration
  const {
    pageLayout,
    isLoading: isLoadingPage,
    error: pageError,
  } = usePageLayout({
    id: pageId,
  })

  // Fetch template configuration
  const {
    template,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = useLayoutTemplate({
    id: pageLayout?.templateId || fallbackTemplate,
  })

  // Merge template and page configurations
  useEffect(() => {
    if (template && pageLayout) {
      // Create a deep copy of the template
      const mergedTemplate: LayoutTemplate = JSON.parse(JSON.stringify(template))

      // Apply page-level overrides to areas
      if (pageLayout.areas) {
        for (const areaId in pageLayout.areas) {
          const areaIndex = mergedTemplate.areas.findIndex((area) => area.id === areaId)
          if (areaIndex !== -1) {
            mergedTemplate.areas[areaIndex] = {
              ...mergedTemplate.areas[areaIndex],
              ...pageLayout.areas[areaId],
            }
          }
        }
      }

      // Apply page-level overrides to blocks
      if (pageLayout.blocks) {
        for (const blockId in pageLayout.blocks) {
          for (const area of mergedTemplate.areas) {
            const blockIndex = area.blocks.findIndex((block) => block.id === blockId)
            if (blockIndex !== -1) {
              area.blocks[blockIndex] = {
                ...area.blocks[blockIndex],
                ...pageLayout.blocks[blockId],
              }
            }
          }
        }
      }

      setResolvedTemplate(mergedTemplate)
      setResolvedPage(pageLayout)
    }
  }, [template, pageLayout])

  // Handle loading state
  if (isLoadingPage || isLoadingTemplate) {
    return <div className="layout-loading">Loading layout...</div>
  }

  // Handle errors
  if (pageError) {
    return (
      <div className="layout-error">
        <h2>Error loading page layout</h2>
        <p>{pageError.message}</p>
      </div>
    )
  }

  if (templateError) {
    return (
      <div className="layout-error">
        <h2>Error loading template</h2>
        <p>{templateError.message}</p>
      </div>
    )
  }

  // If no template is found, render a fallback
  if (!resolvedTemplate) {
    return (
      <div className="layout-fallback">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </div>
    )
  }

  // Render the template
  const TemplateComponent = TemplateRegistry.getTemplate(resolvedTemplate.type)

  if (!TemplateComponent) {
    return (
      <div className="layout-error">
        <h2>Template not found</h2>
        <p>No template registered for type: {resolvedTemplate.type}</p>
      </div>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="layout-error">
          <h2>Error rendering layout</h2>
          <p>An error occurred while rendering the layout.</p>
        </div>
      }
    >
      <LayoutProvider initialTemplate={resolvedTemplate} initialPage={resolvedPage}>
        <TemplateComponent template={resolvedTemplate} pageConfig={resolvedPage} />
      </LayoutProvider>
    </ErrorBoundary>
  )
}
