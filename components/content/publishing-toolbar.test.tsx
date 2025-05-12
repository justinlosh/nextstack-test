import { render, screen, fireEvent, waitFor } from "@/nextstack/lib/test-utils/test-utils"
import { PublishingToolbar } from "./publishing-toolbar"

describe("PublishingToolbar", () => {
  const mockOnSave = jest.fn()
  const mockOnPublish = jest.fn()
  const mockOnSchedule = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders correctly with draft status", () => {
    render(
      <PublishingToolbar status="draft" onSave={mockOnSave} onPublish={mockOnPublish} onSchedule={mockOnSchedule} />,
    )

    // Check if the save button is rendered
    expect(screen.getByText("Save Draft")).toBeInTheDocument()

    // Check if the publish button is rendered
    expect(screen.getByText("Publish")).toBeInTheDocument()

    // Check if the schedule button is rendered
    expect(screen.getByText("Schedule")).toBeInTheDocument()
  })

  it("renders correctly with published status", () => {
    render(
      <PublishingToolbar
        status="published"
        onSave={mockOnSave}
        onPublish={mockOnPublish}
        onSchedule={mockOnSchedule}
      />,
    )

    // Check if the save button is rendered
    expect(screen.getByText("Save")).toBeInTheDocument()

    // Check if the unpublish button is rendered
    expect(screen.getByText("Unpublish")).toBeInTheDocument()

    // Schedule button should not be rendered for published content
    expect(screen.queryByText("Schedule")).not.toBeInTheDocument()
  })

  it("renders correctly with scheduled status", () => {
    render(
      <PublishingToolbar
        status="scheduled"
        scheduledDate={new Date("2023-01-01T12:00:00")}
        onSave={mockOnSave}
        onPublish={mockOnPublish}
        onSchedule={mockOnSchedule}
      />,
    )

    // Check if the save button is rendered
    expect(screen.getByText("Save")).toBeInTheDocument()

    // Check if the publish now button is rendered
    expect(screen.getByText("Publish Now")).toBeInTheDocument()

    // Check if the unschedule button is rendered
    expect(screen.getByText("Unschedule")).toBeInTheDocument()

    // Check if the scheduled date is displayed
    expect(screen.getByText(/Scheduled for/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument()
  })

  it("calls onSave when save button is clicked", async () => {
    render(
      <PublishingToolbar status="draft" onSave={mockOnSave} onPublish={mockOnPublish} onSchedule={mockOnSchedule} />,
    )

    // Click the save button
    fireEvent.click(screen.getByText("Save Draft"))

    // Check if onSave was called
    expect(mockOnSave).toHaveBeenCalled()
  })

  it("calls onPublish when publish button is clicked", async () => {
    render(
      <PublishingToolbar status="draft" onSave={mockOnSave} onPublish={mockOnPublish} onSchedule={mockOnSchedule} />,
    )

    // Click the publish button
    fireEvent.click(screen.getByText("Publish"))

    // Check if onPublish was called
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalled()
    })
  })

  it("opens the schedule dialog when schedule button is clicked", async () => {
    render(
      <PublishingToolbar status="draft" onSave={mockOnSave} onPublish={mockOnPublish} onSchedule={mockOnSchedule} />,
    )

    // Click the schedule button
    fireEvent.click(screen.getByText("Schedule"))

    // Check if the schedule dialog is opened
    expect(screen.getByText("Schedule Publication")).toBeInTheDocument()
    expect(screen.getByLabelText("Publication Date")).toBeInTheDocument()
  })
})
