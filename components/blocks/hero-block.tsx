import type { ContentBlockProps } from "../../lib/layouts/types"

export default function HeroBlock({ block }: ContentBlockProps) {
  const { content, metadata } = block

  // Default content if none provided
  const title = content?.title || metadata?.title || "Hero Title"
  const subtitle = content?.subtitle || metadata?.subtitle || "Hero Subtitle"
  const imageUrl = content?.imageUrl || metadata?.imageUrl
  const ctaText = content?.ctaText || metadata?.ctaText
  const ctaUrl = content?.ctaUrl || metadata?.ctaUrl || "#"

  return (
    <div className="hero-block py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl mb-6">{subtitle}</p>
            {ctaText && (
              <a
                href={ctaUrl}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                {ctaText}
              </a>
            )}
          </div>
          {imageUrl && (
            <div className="md:w-1/2">
              <img src={imageUrl || "/placeholder.svg"} alt={title} className="rounded-lg shadow-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
