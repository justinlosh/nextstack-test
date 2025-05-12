import LayoutManager from "../../../lib/layouts/layout-manager"
import { dataService } from "../../../lib/data-service"
import { createStandardTemplate, createSidebarTemplate } from "../../../lib/utils/template-utils"

export default async function LayoutExample() {
  // Create example templates if they don't exist
  try {
    // Check if standard template exists
    const standardTemplates = await dataService.query("layoutTemplate", (item) => item.id === "standard-example")

    if (!standardTemplates || standardTemplates.length === 0) {
      // Create standard template
      const standardTemplate = createStandardTemplate(
        "standard-example",
        "Standard Example Template",
        "An example standard template",
      )

      await dataService.create("layoutTemplate", standardTemplate)
    }

    // Check if sidebar template exists
    const sidebarTemplates = await dataService.query("layoutTemplate", (item) => item.id === "sidebar-example")

    if (!sidebarTemplates || sidebarTemplates.length === 0) {
      // Create sidebar template
      const sidebarTemplate = createSidebarTemplate(
        "sidebar-example",
        "Sidebar Example Template",
        "left",
        "An example sidebar template",
      )

      await dataService.create("layoutTemplate", sidebarTemplate)
    }

    // Check if example page exists
    const examplePages = await dataService.query("pageLayout", (item) => item.id === "example-page")

    if (!examplePages || examplePages.length === 0) {
      // Create example page
      const examplePage = {
        id: "example-page",
        templateId: "standard-example",
        title: "Example Page",
        slug: "example",
        blocks: {
          "main-content": {
            content: {
              title: "Example Page Content",
              body: "This is an example page using the layout system.",
            },
          },
          "main-header": {
            content: {
              title: "Example Layout System",
              links: [
                { label: "Home", url: "/" },
                { label: "Documentation", url: "/docs/layouts" },
                { label: "Examples", url: "/examples/layouts" },
              ],
            },
          },
        },
      }

      await dataService.create("pageLayout", examplePage)
    }
  } catch (error) {
    console.error("Error creating example templates:", error)
  }

  return (
    <div>
      <LayoutManager pageId="example-page" />
    </div>
  )
}
