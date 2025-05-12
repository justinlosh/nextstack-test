import { render, screen } from "@testing-library/react"
import { ContentError } from "@/components/content/core/content-error"

describe("ContentError", () => {
  it("renders error message for page content type", () => {
    render(<ContentError error={new Error("Test error")} contentType="page" />)
    expect(screen.getByText(/We couldn't load this page/i)).toBeInTheDocument()
  })

  it("renders error message for note content type", () => {
    render(<ContentError error={new Error("Test error")} contentType="note" />)
    expect(screen.getByText(/We couldn't load this note/i)).toBeInTheDocument()
  })

  it("renders error message for form content type", () => {
    render(<ContentError error={new Error("Test error")} contentType="form" />)
    expect(screen.getByText(/We couldn't load this form/i)).toBeInTheDocument()
  })

  it("renders error message for submission content type", () => {
    render(<ContentError error={new Error("Test error")} contentType="submission" />)
    expect(screen.getByText(/We couldn't load this submission/i)).toBeInTheDocument()
  })

  it("renders error message for media content type", () => {
    render(<ContentError error={new Error("Test error")} contentType="media" />)
    expect(screen.getByText(/We couldn't load this media/i)).toBeInTheDocument()
  })

  it("renders error message for collection content type", () => {
    render(<ContentError error={new Error("Test error")} contentType="collection" />)
    expect(screen.getByText(/We couldn't load this collection/i)).toBeInTheDocument()
  })

  it("renders error message for unknown content type", () => {
    render(<ContentError error={new Error("Test error")} contentType="unknown" />)
    expect(screen.getByText(/We couldn't load this content/i)).toBeInTheDocument()
  })

  it("displays the error message when provided", () => {
    render(<ContentError error={new Error("Custom error message")} contentType="page" />)
    expect(screen.getByText("Custom error message")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<ContentError error={new Error("Test error")} contentType="page" className="custom-class" />)
    expect(screen.getByRole("alert")).toHaveClass("custom-class")
  })

  it("shows technical details in development mode", () => {
    const originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    render(<ContentError error={new Error("Test error")} contentType="page" />)

    expect(screen.getByText("Technical details")).toBeInTheDocument()

    process.env.NODE_ENV = originalNodeEnv
  })
})
