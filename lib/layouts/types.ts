import type React from "react"
/**
 * Types for the layout system
 */

// Content block types
export type ContentBlockType =
  | "header"
  | "footer"
  | "hero"
  | "article"
  | "sidebar"
  | "media"
  | "text"
  | "callout"
  | "gallery"
  | "form"
  | "custom"

// Base content block interface
export interface ContentBlock {
  id: string
  type: ContentBlockType
  title?: string
  content?: any
  metadata?: Record<string, any>
  styles?: Record<string, any>
  className?: string
}

// Layout template types
export type LayoutTemplateType =
  | "standard"
  | "sidebar-left"
  | "sidebar-right"
  | "full-width"
  | "landing"
  | "dashboard"
  | "article"
  | "custom"

// Layout area types
export type LayoutAreaType = "header" | "footer" | "main" | "sidebar" | "content" | "hero" | "pre-footer" | "custom"

// Layout area interface
export interface LayoutArea {
  id: string
  type: LayoutAreaType
  blocks: ContentBlock[]
  metadata?: Record<string, any>
  styles?: Record<string, any>
  className?: string
}

// Layout template interface
export interface LayoutTemplate {
  id: string
  type: LayoutTemplateType
  name: string
  description?: string
  areas: LayoutArea[]
  metadata?: Record<string, any>
  styles?: Record<string, any>
  className?: string
}

// Page layout configuration
export interface PageLayoutConfig {
  id: string
  templateId: string
  title: string
  description?: string
  slug: string
  areas?: Record<string, Partial<LayoutArea>>
  blocks?: Record<string, Partial<ContentBlock>>
  metadata?: Record<string, any>
  styles?: Record<string, any>
  className?: string
}

// Layout context
export interface LayoutContextType {
  currentTemplate?: LayoutTemplate
  currentPage?: PageLayoutConfig
  isLoading: boolean
  error: Error | null
}

// Layout props
export interface LayoutProps {
  pageId: string
  fallbackTemplate?: string
  children?: React.ReactNode
}

// Content block props
export interface ContentBlockProps {
  block: ContentBlock
  pageConfig?: PageLayoutConfig
}

// Layout area props
export interface LayoutAreaProps {
  area: LayoutArea
  pageConfig?: PageLayoutConfig
}

// Template props
export interface TemplateProps {
  template: LayoutTemplate
  pageConfig?: PageLayoutConfig
}
