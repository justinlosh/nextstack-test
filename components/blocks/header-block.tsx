import type { ContentBlockProps } from "../../lib/layouts/types"

export default function HeaderBlock({ block }: ContentBlockProps) {
  const { content, metadata } = block

  // Default content if none provided
  const title = content?.title || metadata?.title || "Site Title"
  const links = content?.links || metadata?.links || []

  return (
    <div className="header-block py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="header-logo">
            <h1 className="text-xl font-bold">{title}</h1>
          </div>

          {links.length > 0 && (
            <nav className="header-nav">
              <ul className="flex space-x-4">
                {links.map((link: any, index: number) => (
                  <li key={index}>
                    <a href={link.url} className="text-blue-600 hover:text-blue-800">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
