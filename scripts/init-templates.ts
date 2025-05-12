import { dataService } from "../lib/data-service"
import { createStandardTemplate, createSidebarTemplate } from "../lib/utils/template-utils"

/**
 * Initialize default templates
 */
export async function initializeTemplates() {
  try {
    console.log("Initializing default templates...")

    // Create standard template
    const standardTemplate = createStandardTemplate(
      "standard",
      "Standard Template",
      "A standard template with header, main content, and footer",
    )

    await dataService.create("layoutTemplate", standardTemplate)
    console.log("Created standard template")

    // Create sidebar-left template
    const sidebarLeftTemplate = createSidebarTemplate(
      "sidebar-left",
      "Sidebar Left Template",
      "left",
      "A template with a sidebar on the left",
    )

    await dataService.create("layoutTemplate", sidebarLeftTemplate)
    console.log("Created sidebar-left template")

    // Create sidebar-right template
    const sidebarRightTemplate = createSidebarTemplate(
      "sidebar-right",
      "Sidebar Right Template",
      "right",
      "A template with a sidebar on the right",
    )

    await dataService.create("layoutTemplate", sidebarRightTemplate)
    console.log("Created sidebar-right template")

    console.log("Default templates initialized successfully")
  } catch (error) {
    console.error("Error initializing templates:", error)
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeTemplates()
}
