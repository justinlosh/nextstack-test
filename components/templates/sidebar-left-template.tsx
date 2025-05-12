import type { TemplateProps } from "../../lib/layouts/types"
import LayoutArea from "../../lib/layouts/layout-area"

export default function SidebarLeftTemplate({ template, pageConfig }: TemplateProps) {
  // Find areas by type
  const headerArea = template.areas.find((area) => area.type === "header")
  const sidebarArea = template.areas.find((area) => area.type === "sidebar")
  const contentArea = template.areas.find((area) => area.type === "content")
  const footerArea = template.areas.find((area) => area.type === "footer")

  // Apply template styles
  const templateStyles = template.styles || {}
  const templateClassName = template.className || ""

  return (
    <div
      className={`layout-template layout-template-sidebar-left ${templateClassName}`}
      style={templateStyles}
      data-template-id={template.id}
      data-template-type={template.type}
    >
      {headerArea && (
        <header className="layout-header">
          <LayoutArea area={headerArea} pageConfig={pageConfig} />
        </header>
      )}

      <div className="layout-body flex flex-col md:flex-row">
        {sidebarArea && (
          <aside className="layout-sidebar md:w-1/4">
            <LayoutArea area={sidebarArea} pageConfig={pageConfig} />
          </aside>
        )}

        {contentArea && (
          <div className="layout-content md:w-3/4">
            <LayoutArea area={contentArea} pageConfig={pageConfig} />
          </div>
        )}
      </div>

      {footerArea && (
        <footer className="layout-footer">
          <LayoutArea area={footerArea} pageConfig={pageConfig} />
        </footer>
      )}
    </div>
  )
}
