import { render, screen } from "@testing-library/react"
import { ContentRenderer } from "@/components/content/core/content-renderer"
import { mockPage, mockNote, mockForm, mockSubmission, mockMedia } from "../../../mocks/mock-data"

// Mock the child components
jest.mock("@/components/content/core/content-loading", () => ({
  ContentLoading: () => <div data-testid="content-loading">Loading...</div>,
}))

jest.mock("@/components/content/core/content-error", () => ({
  ContentError: () => <div data-testid="content-error">Error occurred</div>,
}))

jest.mock("@/components/content/core/content-empty", () => ({
  ContentEmpty: () => <div data-testid="content-empty">No content</div>,
}))

jest.mock("@/components/content/renderers/page-renderer", () => ({
  PageRenderer: () => <div data-testid="page-renderer">Page content</div>,
}))

jest.mock("@/components/content/renderers/note-renderer", () => ({
  NoteRenderer: () => <div data-testid="note-renderer">Note content</div>,
}))

jest.mock("@/components/content/renderers/form-renderer", () => ({
  FormRenderer: () => <div data-testid="form-renderer">Form content</div>,
}))

jest.mock("@/components/content/renderers/submission-renderer", () => ({
  SubmissionRenderer: () => <div data-testid="submission-renderer">Submission content</div>,
}))

jest.mock("@/components/content/renderers/media-renderer", () => ({
  MediaRenderer: () => <div data-testid="media-renderer">Media content</div>,
}))

jest.mock("@/components/content/renderers/collection-renderer", () => ({
  CollectionRenderer: () => <div data-testid="collection-renderer">Collection content</div>,
}))

describe("ContentRenderer", () => {
  it("renders loading state when isLoading is true", () => {
    render(<ContentRenderer data={mockPage} contentType="page" isLoading={true} />)
    expect(screen.getByTestId("content-loading")).toBeInTheDocument()
  })

  it("renders error state when error is provided", () => {
    render(<ContentRenderer data={mockPage} contentType="page" error={new Error("Test error")} />)
    expect(screen.getByTestId("content-error")).toBeInTheDocument()
  })

  it("renders empty state when data is null", () => {
    render(<ContentRenderer data={null} contentType="page" />)
    expect(screen.getByTestId("content-empty")).toBeInTheDocument()
  })

  it("renders page content when contentType is page", () => {
    render(<ContentRenderer data={mockPage} contentType="page" />)
    expect(screen.getByTestId("page-renderer")).toBeInTheDocument()
  })

  it("renders note content when contentType is note", () => {
    render(<ContentRenderer data={mockNote} contentType="note" />)
    expect(screen.getByTestId("note-renderer")).toBeInTheDocument()
  })

  it("renders form content when contentType is form", () => {
    render(<ContentRenderer data={mockForm} contentType="form" />)
    expect(screen.getByTestId("form-renderer")).toBeInTheDocument()
  })

  it("renders submission content when contentType is submission", () => {
    render(<ContentRenderer data={mockSubmission} contentType="submission" />)
    expect(screen.getByTestId("submission-renderer")).toBeInTheDocument()
  })

  it("renders media content when contentType is media", () => {
    render(<ContentRenderer data={mockMedia} contentType="media" />)
    expect(screen.getByTestId("media-renderer")).toBeInTheDocument()
  })

  it("renders collection content when contentType is collection", () => {
    render(<ContentRenderer data={[mockPage, mockPage]} contentType="collection" />)
    expect(screen.getByTestId("collection-renderer")).toBeInTheDocument()
  })

  it("renders custom renderer when provided", () => {
    const CustomRenderer = () => <div data-testid="custom-renderer">Custom content</div>
    render(<ContentRenderer data={mockPage} contentType="custom" renderers={{ custom: CustomRenderer }} />)
    expect(screen.getByTestId("custom-renderer")).toBeInTheDocument()
  })

  it("applies transformations to data", () => {
    const transformSpy = jest.fn().mockImplementation((data) => ({ ...data, transformed: true }))

    render(<ContentRenderer data={mockPage} contentType="page" transformations={[transformSpy]} />)

    expect(transformSpy).toHaveBeenCalledWith(mockPage)
  })

  it("renders fallback for unknown content types", () => {
    render(<ContentRenderer data={{ test: "data" }} contentType="unknown" />)
    expect(screen.getByText(/"test": "data"/)).toBeInTheDocument()
  })
})
