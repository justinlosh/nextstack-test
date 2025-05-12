import { notFound } from "next/navigation"
import { dataService } from "../../lib/data-service"
import LayoutManager from "../../lib/layouts/layout-manager"

interface PageParams {
  slug: string
}

export default async function Page({ params }: { params: PageParams }) {
  const { slug } = params

  try {
    // Find the page layout by slug
    const pageLayouts = await dataService.query("pageLayout", (item) => item.slug === slug)

    // If no page layout is found, return 404
    if (!pageLayouts || pageLayouts.length === 0) {
      return notFound()
    }

    const pageLayout = pageLayouts[0]

    return <LayoutManager pageId={pageLayout.id} />
  } catch (error) {
    console.error(`Error loading page with slug ${slug}:`, error)
    return notFound()
  }
}
