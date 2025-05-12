import type { TemplateProps } from "../../lib/layouts/types"
import LayoutArea from "../../lib/layouts/layout-area"

export default function StandardTemplate({ template, pageConfig }: TemplateProps) {
  // Find areas by type
  const headerArea = template.areas.find((area) => area.type === "header")
  const mainArea = template.areas.find((area) => area.type === "main")
  const footerArea = template.areas.find((area) => area.type === "footer")

  // Apply template styles
  const templateStyles = template.styles || {}
  const templateClassName = template.className || ""

  return (
    <div
      className={`layout-template layout-template-standard ${templateClassName}`}
      style={templateStyles}
      data-template-id={template.id}
      data-template-type={template.type}
    >
      {headerArea && (
        <header className="layout-header">
          <LayoutArea area={headerArea} pageConfig={pageConfig} />
        </header>
      )}

      <main className="layout-main">{mainArea && <LayoutArea area={mainArea} pageConfig={pageConfig} />}</main>

      {footerArea && (
        <footer className="layout-footer">
          <LayoutArea area={footerArea} pageConfig={pageConfig} />
        </footer>
      )}
    </div>
  )
}
