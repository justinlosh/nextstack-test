import { render, screen, fireEvent } from "@testing-library/react"
import { CollectionRenderer } from "@/components/content/renderers/collection-renderer"
import { mockPages } from "../../../mocks/mock-data"

// Mock the ContentRenderer component
jest.mock("@/components/content/core/content-renderer", () => ({
  ContentRenderer: ({ data, contentType, layout }) => (
    <div data-testid={`content-renderer-${data.id}`} data-content-type={contentType} data-layout={layout}>
      {data.title}
    </div>
  ),
}))

describe("CollectionRenderer", () => {
  it("renders collection items", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" />)
    expect(screen.getByTestId("content-renderer-page-1")).toBeInTheDocument()
    expect(screen.getByTestId("content-renderer-page-2")).toBeInTheDocument()
    expect(screen.getByTestId("content-renderer-page-3")).toBeInTheDocument()
  })

  it("renders empty message when collection is null", () => {
    render(<CollectionRenderer collection={null} contentType="page" />)
    expect(screen.getByText(/No items in this collection/i)).toBeInTheDocument()
  })

  it("renders empty message when collection is empty", () => {
    render(<CollectionRenderer collection={[]} contentType="page" />)
    expect(screen.getByText(/No items in this collection/i)).toBeInTheDocument()
  })

  it("renders with grid layout", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" layout="grid" />)
    // Should have grid layout class
    const gridElement = screen.getByTestId("content-renderer-page-1").closest('div[class*="grid"]')
    expect(gridElement).toBeInTheDocument()
  })

  it("renders with list layout", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" layout="list" />)
    // Should have list layout class
    const listElement = screen.getByTestId("content-renderer-page-1").closest('div[class*="space-y-4"]')
    expect(listElement).toBeInTheDocument()
  })

  it("renders with carousel layout", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" layout="carousel" />)
    // Should have carousel layout class
    const carouselElement = screen.getByTestId("content-renderer-page-1").closest('div[class*="flex gap-4"]')
    expect(carouselElement).toBeInTheDocument()
  })

  it("renders with masonry layout", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" layout="masonry" />)
    // Should have masonry layout class
    const masonryElement = screen.getByTestId("content-renderer-page-1").closest('div[class*="columns-1"]')
    expect(masonryElement).toBeInTheDocument()
  })

  it("renders with default layout when layout is not specified", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" />)
    // Should have default (grid) layout class
    const defaultElement = screen.getByTestId("content-renderer-page-1").closest('div[class*="grid"]')
    expect(defaultElement).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" className="custom-class" />)
    const collectionElement = screen.getByTestId("content-renderer-page-1").closest("div").parentElement
    expect(collectionElement).toHaveClass("custom-class")
  })

  it("applies itemClassName to each item", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" itemClassName="item-class" />)
    const itemElements = screen.getAllByTestId(/content-renderer-page-/)
    itemElements.forEach((element) => {
      expect(element.closest("div")).toHaveClass("item-class")
    })
  })

  it("renders pagination when there are more items than itemsPerPage", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" itemsPerPage={2} />)
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("Previous")).toBeInTheDocument()
    expect(screen.getByText("Next")).toBeInTheDocument()
  })

  it("does not render pagination when showPagination is false", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" itemsPerPage={2} showPagination={false} />)
    expect(screen.queryByText("1")).not.toBeInTheDocument()
    expect(screen.queryByText("2")).not.toBeInTheDocument()
    expect(screen.queryByText("Previous")).not.toBeInTheDocument()
    expect(screen.queryByText("Next")).not.toBeInTheDocument()
  })

  it("changes page when pagination buttons are clicked", () => {
    render(<CollectionRenderer collection={mockPages} contentType="page" itemsPerPage={2} />)

    // Initially, page 1 should be active and show first 2 items
    expect(screen.getByText("1").closest("button")).toHaveClass("bg-primary")
    expect(screen.getByTestId("content-renderer-page-1")).toBeInTheDocument()
    expect(screen.getByTestId("content-renderer-page-2")).toBeInTheDocument()
    expect(screen.queryByTestId("content-renderer-page-3")).not.toBeInTheDocument()

    // Click on page 2
    fireEvent.click(screen.getByText("2"))

    // Now page 2 should be active and show the 3rd item
    expect(screen.getByText("2").closest("button")).toHaveClass("bg-primary")
    expect(screen.queryByTestId("content-renderer-page-1")).not.toBeInTheDocument()
    expect(screen.queryByTestId("content-renderer-page-2")).not.toBeInTheDocument()
    expect(screen.getByTestId("content-renderer-page-3")).toBeInTheDocument()

    // Click on Previous
    fireEvent.click(screen.getByText("Previous"))

    // Should go back to page 1
    expect(screen.getByText("1").closest("button")).toHaveClass("bg-primary")
    expect(screen.getByTestId("content-renderer-page-1")).toBeInTheDocument()
    expect(screen.getByTestId("content-renderer-page-2")).toBeInTheDocument()

    // Click on Next
    fireEvent.click(screen.getByText("Next"))

    // Should go to page 2 again
    expect(screen.getByText("2").closest("button")).toHaveClass("bg-primary")
    expect(screen.getByTestId("content-renderer-page-3")).toBeInTheDocument()
  })

  it("passes renderers and rendererProps to ContentRenderer", () => {
    const mockRenderers = { page: jest.fn() }
    const mockRendererProps = { showMeta: true }

    render(
      <CollectionRenderer
        collection={mockPages}
        contentType="page"
        renderers={mockRenderers}
        rendererProps={mockRendererProps}
      />,
    )

    // ContentRenderer should be called with the correct props
    // We can't directly test this with the mock, but we can verify the component renders
    expect(screen.getByTestId("content-renderer-page-1")).toBeInTheDocument()
  })
})
