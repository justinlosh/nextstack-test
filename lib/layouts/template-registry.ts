import type React from "react"
import StandardTemplate from "../components/templates/standard-template"
import SidebarLeftTemplate from "../components/templates/sidebar-left-template"
import SidebarRightTemplate from "../components/templates/sidebar-right-template"
import FullWidthTemplate from "../components/templates/full-width-template"
import LandingTemplate from "../components/templates/landing-template"
import DashboardTemplate from "../components/templates/dashboard-template"
import ArticleTemplate from "../components/templates/article-template"

// Template registry class
class TemplateRegistryClass {
  private templates: Map<string, React.ComponentType<any>> = new Map()

  constructor() {
    // Register default templates
    this.register("standard", StandardTemplate)
    this.register("sidebar-left", SidebarLeftTemplate)
    this.register("sidebar-right", SidebarRightTemplate)
    this.register("full-width", FullWidthTemplate)
    this.register("landing", LandingTemplate)
    this.register("dashboard", DashboardTemplate)
    this.register("article", ArticleTemplate)
  }

  // Register a template
  register(type: string, component: React.ComponentType<any>): void {
    this.templates.set(type, component)
  }

  // Get a template by type
  getTemplate(type: string): React.ComponentType<any> | null {
    return this.templates.get(type) || null
  }

  // Check if a template exists
  hasTemplate(type: string): boolean {
    return this.templates.has(type)
  }

  // Get all registered template types
  getRegisteredTypes(): string[] {
    return Array.from(this.templates.keys())
  }
}

// Export a singleton instance
export const TemplateRegistry = new TemplateRegistryClass()
