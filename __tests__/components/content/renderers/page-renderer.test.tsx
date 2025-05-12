import { render, screen } from "@testing-library/react"
import { PageRenderer } from "@/components/content/renderers/page-renderer"
import { mockPage } from "../../../mocks/mock-data"

describe("PageRenderer", () => {
  it("renders page title and content", () => {
    render(<PageRenderer page={mockPage} />)
    expect(screen.getByText("Test Page")).toBeInTheDocument()
    expect(screen.getByText(/This is a test page content/i)).toBeInTheDocument()
  })

  it("renders nothing when page is null", () => {
    const { container } = render(<PageRenderer page={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders meta information when showMeta is true", () => {
    render(<PageRenderer page={mockPage} showMeta={true} />)
    expect(screen.getByText(/Last updated/i)).toBeInTheDocument()
    expect(screen.getByText(/2 min read/i)).toBeInTheDocument()
  })

  it("does not render meta information when showMeta is false", () => {
    render(<PageRenderer page={mockPage} showMeta={false} />)
    expect(screen.queryByText(/Last updated/i)).not.toBeInTheDocument()
  })

  it("renders with card layout", () => {
    render(<PageRenderer page={mockPage} layout="card" />)
    expect(screen.getByText("Test Page")).toBeInTheDocument()
    // Card component should be rendered
    const cardElement = screen.getByText("Test Page").closest('div[class*="card"]')
    expect(cardElement).toBeInTheDocument()
  })

  it("renders with featured layout", () => {
    render(<PageRenderer page={mockPage} layout="featured" />)
    expect(screen.getByText("Test Page")).toBeInTheDocument()
    expect(screen.getByRole("img")).toBeInTheDocument()
    // Should have a grid layout
    const gridElement = screen.getByText("Test Page").closest('div[class*="grid"]')
    expect(gridElement).toBeInTheDocument()
  })

  it("renders with default layout when layout is not specified", () => {
    render(<PageRenderer page={mockPage} />)
    expect(screen.getByText("Test Page")).toBeInTheDocument()
    // Should be rendered as an article
    const articleElement = screen.getByText("Test Page").closest("article")
    expect(articleElement).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<PageRenderer page={mockPage} className="custom-class" />)
    const articleElement = screen.getByText("Test Page").closest("article")
    expect(articleElement).toHaveClass("custom-class")
  })

  it("renders HTML content correctly", () => {
    render(<PageRenderer page={mockPage} />)
    expect(screen.getByText(/This is a test page content/i)).toBeInTheDocument()
    expect(screen.getByText(/formatting/i)).toBeInTheDocument()
  })
})
