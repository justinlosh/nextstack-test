import { render, screen } from "@testing-library/react"
import { MediaRenderer } from "@/components/content/renderers/media-renderer"
import { mockMedia } from "../../../mocks/mock-data"

describe("MediaRenderer", () => {
  it("renders image media correctly", () => {
    render(<MediaRenderer media={mockMedia} />)
    expect(screen.getByRole("img")).toBeInTheDocument()
    expect(screen.getByRole("img")).toHaveAttribute("src", mockMedia.url)
    expect(screen.getByRole("img")).toHaveAttribute("alt", mockMedia.title)
  })

  it("renders nothing when media is null", () => {
    const { container } = render(<MediaRenderer media={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders video media correctly", () => {
    const videoMedia = {
      ...mockMedia,
      type: "video",
      url: "/test-video.mp4",
    }
    render(<MediaRenderer media={videoMedia} />)
    expect(screen.getByText(/Your browser does not support the video tag/i)).toBeInTheDocument()
    const videoElement = screen.getByText(/Your browser does not support the video tag/i).closest("video")
    expect(videoElement).toBeInTheDocument()
    expect(videoElement).toHaveAttribute("src", videoMedia.url)
  })

  it("renders audio media correctly", () => {
    const audioMedia = {
      ...mockMedia,
      type: "audio",
      url: "/test-audio.mp3",
    }
    render(<MediaRenderer media={audioMedia} />)
    expect(screen.getByText(/Your browser does not support the audio tag/i)).toBeInTheDocument()
    const audioElement = screen.getByText(/Your browser does not support the audio tag/i).closest("audio")
    expect(audioElement).toBeInTheDocument()
    expect(audioElement).toHaveAttribute("src", audioMedia.url)
  })

  it("renders PDF media correctly", () => {
    const pdfMedia = {
      ...mockMedia,
      type: "pdf",
      url: "/test-document.pdf",
    }
    render(<MediaRenderer media={pdfMedia} />)
    expect(screen.getByText("View PDF")).toBeInTheDocument()
    expect(screen.getByText("View PDF")).toHaveAttribute("href", pdfMedia.url)
  })

  it("renders unknown media type correctly", () => {
    const unknownMedia = {
      ...mockMedia,
      type: "unknown",
      url: "/test-file.xyz",
    }
    render(<MediaRenderer media={unknownMedia} />)
    expect(screen.getByText("Download")).toBeInTheDocument()
    expect(screen.getByText("Download")).toHaveAttribute("href", unknownMedia.url)
  })

  it("infers media type from URL when type is not provided", () => {
    const mediaWithoutType = {
      ...mockMedia,
      type: undefined,
      url: "/test-image.jpg",
    }
    render(<MediaRenderer media={mediaWithoutType} />)
    expect(screen.getByRole("img")).toBeInTheDocument()
  })

  it("renders meta information when showMeta is true", () => {
    render(<MediaRenderer media={mockMedia} showMeta={true} />)
    expect(screen.getByText(mockMedia.title)).toBeInTheDocument()
    expect(screen.getByText(/Added:/i)).toBeInTheDocument()
    expect(screen.getByText(/Size:/i)).toBeInTheDocument()
    expect(screen.getByText(/Dimensions:/i)).toBeInTheDocument()
  })

  it("does not render meta information when showMeta is false", () => {
    render(<MediaRenderer media={mockMedia} showMeta={false} />)
    expect(screen.queryByText(mockMedia.title)).not.toBeInTheDocument()
  })

  it("renders with card layout", () => {
    render(<MediaRenderer media={mockMedia} layout="card" />)
    expect(screen.getByRole("img")).toBeInTheDocument()
    // Card component should be rendered
    const cardElement = screen.getByRole("img").closest('div[class*="card"]')
    expect(cardElement).toBeInTheDocument()
  })

  it("renders with thumbnail layout", () => {
    render(<MediaRenderer media={mockMedia} layout="thumbnail" />)
    expect(screen.getByRole("img")).toBeInTheDocument()
    // Should have thumbnail layout class
    const thumbnailElement = screen.getByRole("img").closest('div[class*="aspect-square"]')
    expect(thumbnailElement).toBeInTheDocument()
  })

  it("renders with gallery layout", () => {
    render(<MediaRenderer media={mockMedia} layout="gallery" />)
    expect(screen.getByRole("img")).toBeInTheDocument()
    // Should have gallery layout class
    const galleryElement = screen.getByRole("img").closest('div[class*="group cursor-pointer"]')
    expect(galleryElement).toBeInTheDocument()
  })

  it("renders with default layout when layout is not specified", () => {
    render(<MediaRenderer media={mockMedia} />)
    expect(screen.getByRole("img")).toBeInTheDocument()
    // Should have default layout
    const defaultElement = screen.getByRole("img").closest('div[class*="space-y-3"]')
    expect(defaultElement).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<MediaRenderer media={mockMedia} className="custom-class" />)
    const mediaElement = screen.getByRole("img").closest('div[class*="space-y-3"]')
    expect(mediaElement).toHaveClass("custom-class")
  })
})
