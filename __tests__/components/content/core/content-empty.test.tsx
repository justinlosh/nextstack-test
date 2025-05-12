import { render, screen } from "@testing-library/react"
import { ContentEmpty } from "@/components/content/core/content-empty"

describe("ContentEmpty", () => {
  it("renders empty message for page content type", () => {
    render(<ContentEmpty contentType="page" />)
    expect(screen.getByText(/This page doesn't exist or has been removed/i)).toBeInTheDocument()
  })

  it("renders empty message for note content type", () => {
    render(<ContentEmpty contentType="note" />)
    expect(screen.getByText(/This note doesn't exist or has been removed/i)).toBeInTheDocument()
  })

  it("renders empty message for form content type", () => {
    render(<ContentEmpty contentType="form" />)
    expect(screen.getByText(/This form doesn't exist or has been removed/i)).toBeInTheDocument()
  })

  it("renders empty message for submission content type", () => {
    render(<ContentEmpty contentType="submission" />)
    expect(screen.getByText(/This submission doesn't exist or has been removed/i)).toBeInTheDocument()
  })

  it("renders empty message for media content type", () => {
    render(<ContentEmpty contentType="media" />)
    expect(screen.getByText(/This media doesn't exist or has been removed/i)).toBeInTheDocument()
  })

  it("renders empty message for collection content type", () => {
    render(<ContentEmpty contentType="collection" />)
    expect(screen.getByText(/No items found in this collection/i)).toBeInTheDocument()
  })

  it("renders empty message for unknown content type", () => {
    render(<ContentEmpty contentType="unknown" />)
    expect(screen.getByText(/No content found/i)).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<ContentEmpty contentType="page" className="custom-class" />)
    expect(screen.getByRole("alert")).toHaveClass("custom-class")
  })
})
