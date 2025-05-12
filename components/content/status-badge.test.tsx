import { render, screen } from "@/nextstack/lib/test-utils/test-utils"
import { StatusBadge } from "./status-badge"

describe("StatusBadge", () => {
  it("renders draft status correctly", () => {
    render(<StatusBadge status="draft" />)

    const badge = screen.getByText("Draft")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-gray-200")
  })

  it("renders scheduled status correctly", () => {
    render(<StatusBadge status="scheduled" />)

    const badge = screen.getByText("Scheduled")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-blue-200")
  })

  it("renders published status correctly", () => {
    render(<StatusBadge status="published" />)

    const badge = screen.getByText("Published")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-green-200")
  })

  it("renders archived status correctly", () => {
    render(<StatusBadge status="archived" />)

    const badge = screen.getByText("Archived")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-red-200")
  })

  it("renders unknown status correctly", () => {
    render(<StatusBadge status="unknown" />)

    const badge = screen.getByText("Unknown")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-gray-200")
  })
})
