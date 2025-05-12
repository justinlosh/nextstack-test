import { render, screen } from "@testing-library/react"
import { ContentLoading } from "@/components/content/core/content-loading"

describe("ContentLoading", () => {
  it("renders page loading skeleton", () => {
    render(<ContentLoading contentType="page" />)
    // Check for multiple skeleton elements
    const skeletons = screen.getAllByRole("status")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders note loading skeleton", () => {
    render(<ContentLoading contentType="note" />)
    const skeletons = screen.getAllByRole("status")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders form loading skeleton", () => {
    render(<ContentLoading contentType="form" />)
    const skeletons = screen.getAllByRole("status")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders collection loading skeleton with grid layout", () => {
    render(<ContentLoading contentType="collection" layout="grid" />)
    const skeletons = screen.getAllByRole("status")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders collection loading skeleton with default layout", () => {
    render(<ContentLoading contentType="collection" />)
    const skeletons = screen.getAllByRole("status")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders media loading skeleton", () => {
    render(<ContentLoading contentType="media" />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("renders default loading skeleton for unknown content type", () => {
    render(<ContentLoading contentType="unknown" />)
    const skeletons = screen.getAllByRole("status")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("applies custom className", () => {
    render(<ContentLoading contentType="page" className="custom-class" />)
    expect(screen.getByText(/content-loading/i).closest("div")).toHaveClass("custom-class")
  })
})
