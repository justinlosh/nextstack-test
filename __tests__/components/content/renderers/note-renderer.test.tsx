import { render, screen } from "@testing-library/react"
import { NoteRenderer } from "@/components/content/renderers/note-renderer"
import { mockNote } from "../../../mocks/mock-data"

describe("NoteRenderer", () => {
  it("renders note title and content", () => {
    render(<NoteRenderer note={mockNote} />)
    expect(screen.getByText("Test Note")).toBeInTheDocument()
    expect(screen.getByText(/This is a test note with/i)).toBeInTheDocument()
  })

  it("renders nothing when note is null", () => {
    const { container } = render(<NoteRenderer note={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders tags when showTags is true", () => {
    render(<NoteRenderer note={mockNote} showTags={true} />)
    expect(screen.getByText("test")).toBeInTheDocument()
    expect(screen.getByText("example")).toBeInTheDocument()
    expect(screen.getByText("note")).toBeInTheDocument()
  })

  it("does not render tags when showTags is false", () => {
    render(<NoteRenderer note={mockNote} showTags={false} />)
    expect(screen.queryByText("test")).not.toBeInTheDocument()
  })

  it("renders with card layout", () => {
    render(<NoteRenderer note={mockNote} layout="card" />)
    expect(screen.getByText("Test Note")).toBeInTheDocument()
    // Card component should be rendered
    const cardElement = screen.getByText("Test Note").closest('div[class*="card"]')
    expect(cardElement).toBeInTheDocument()
  })

  it("renders with compact layout", () => {
    render(<NoteRenderer note={mockNote} layout="compact" />)
    expect(screen.getByText("Test Note")).toBeInTheDocument()
    // Should have a compact layout with excerpt
    expect(screen.getByText(/This is a test note excerpt/i)).toBeInTheDocument()
  })

  it("renders with default layout when layout is not specified", () => {
    render(<NoteRenderer note={mockNote} />)
    expect(screen.getByText("Test Note")).toBeInTheDocument()
    // Should be rendered as an article
    const articleElement = screen.getByText("Test Note").closest("article")
    expect(articleElement).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<NoteRenderer note={mockNote} className="custom-class" />)
    const articleElement = screen.getByText("Test Note").closest("article")
    expect(articleElement).toHaveClass("custom-class")
  })

  it("renders meta information with creation date", () => {
    render(<NoteRenderer note={mockNote} />)
    expect(screen.getByText(/Created:/i)).toBeInTheDocument()
  })

  it("renders meta information with update date when different from creation date", () => {
    const noteWithDifferentDates = {
      ...mockNote,
      createdAt: "2023-01-01T12:00:00Z",
      updatedAt: "2023-01-10T12:00:00Z",
    }
    render(<NoteRenderer note={noteWithDifferentDates} />)
    expect(screen.getByText(/Updated:/i)).toBeInTheDocument()
  })
})
