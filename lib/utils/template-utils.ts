import type { LayoutTemplate, LayoutArea, ContentBlock } from "../layouts/types"

/**
 * Create a standard layout template
 */
export function createStandardTemplate(id: string, name: string, description?: string): LayoutTemplate {
  return {
    id,
    type: "standard",
    name,
    description,
    areas: [createHeaderArea(), createMainArea(), createFooterArea()],
  }
}

/**
 * Create a sidebar layout template
 */
export function createSidebarTemplate(
  id: string,
  name: string,
  sidebarPosition: "left" | "right" = "left",
  description?: string,
): LayoutTemplate {
  return {
    id,
    type: sidebarPosition === "left" ? "sidebar-left" : "sidebar-right",
    name,
    description,
    areas: [createHeaderArea(), createSidebarArea(), createContentArea(), createFooterArea()],
  }
}

/**
 * Create a header area
 */
export function createHeaderArea(): LayoutArea {
  return {
    id: "header",
    type: "header",
    blocks: [
      {
        id: "main-header",
        type: "header",
        content: {
          title: "Site Title",
          links: [
            { label: "Home", url: "/" },
            { label: "About", url: "/about" },
            { label: "Contact", url: "/contact" },
          ],
        },
      },
    ],
  }
}

/**
 * Create a main area
 */
export function createMainArea(): LayoutArea {
  return {
    id: "main",
    type: "main",
    blocks: [
      {
        id: "main-content",
        type: "article",
        content: {
          title: "Main Content",
          body: "This is the main content area.",
        },
      },
    ],
  }
}

/**
 * Create a sidebar area
 */
export function createSidebarArea(): LayoutArea {
  return {
    id: "sidebar",
    type: "sidebar",
    blocks: [
      {
        id: "sidebar-content",
        type: "sidebar",
        content: {
          title: "Sidebar",
          items: [
            { label: "Item 1", url: "#" },
            { label: "Item 2", url: "#" },
            { label: "Item 3", url: "#" },
          ],
        },
      },
    ],
  }
}

/**
 * Create a content area
 */
export function createContentArea(): LayoutArea {
  return {
    id: "content",
    type: "content",
    blocks: [
      {
        id: "main-content",
        type: "article",
        content: {
          title: "Main Content",
          body: "This is the main content area.",
        },
      },
    ],
  }
}

/**
 * Create a footer area
 */
export function createFooterArea(): LayoutArea {
  return {
    id: "footer",
    type: "footer",
    blocks: [
      {
        id: "main-footer",
        type: "footer",
        content: {
          copyright: `© ${new Date().getFullYear()} Your Company`,
          links: [
            { label: "Privacy", url: "/privacy" },
            { label: "Terms", url: "/terms" },
          ],
        },
      },
    ],
  }
}

/**
 * Create a hero area
 */
export function createHeroArea(): LayoutArea {
  return {
    id: "hero",
    type: "hero",
    blocks: [
      {
        id: "main-hero",
        type: "hero",
        content: {
          title: "Welcome to Our Site",
          subtitle: "Discover amazing content and features",
          ctaText: "Get Started",
          ctaUrl: "/get-started",
        },
      },
    ],
  }
}

/**
 * Create a content block
 */
export function createContentBlock(id: string, type: string, content: any): ContentBlock {
  return {
    id,
    type,
    content,
  }
}
