import { render, screen } from "@testing-library/react"
import { SubmissionRenderer } from "@/components/content/renderers/submission-renderer"
import { mockSubmission, mockForm } from "../../../mocks/mock-data"

describe("SubmissionRenderer", () => {
  it("renders submission data", () => {
    render(<SubmissionRenderer submission={mockSubmission} />)
    expect(screen.getByText("Submission Details")).toBeInTheDocument()
    expect(screen.getByText("name")).toBeInTheDocument()
    expect(screen.getByText("John Doe")).toBeInTheDocument()
    expect(screen.getByText("email")).toBeInTheDocument()
    expect(screen.getByText("john@example.com")).toBeInTheDocument()
  })

  it("renders nothing when submission is null", () => {
    const { container } = render(<SubmissionRenderer submission={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders field labels from form when provided", () => {
    render(<SubmissionRenderer submission={mockSubmission} form={mockForm} />)
    expect(screen.getByText("Name")).toBeInTheDocument()
    expect(screen.getByText("Email")).toBeInTheDocument()
    expect(screen.getByText("Message")).toBeInTheDocument()
  })

  it("formats values based on field type", () => {
    const submissionWithSpecialFields = {
      ...mockSubmission,
      data: {
        ...mockSubmission.data,
        checkboxField: ["Option 1", "Option 2"],
        dateField: "2023-01-15",
        fileField: "file.pdf",
      },
    }

    const formWithSpecialFields = {
      ...mockForm,
      fields: [
        ...mockForm.fields,
        {
          id: "field-4",
          name: "checkboxField",
          label: "Checkbox Field",
          type: "checkbox",
        },
        {
          id: "field-5",
          name: "dateField",
          label: "Date Field",
          type: "date",
        },
        {
          id: "field-6",
          name: "fileField",
          label: "File Field",
          type: "file",
        },
      ],
    }

    render(<SubmissionRenderer submission={submissionWithSpecialFields} form={formWithSpecialFields} />)

    expect(screen.getByText("Checkbox Field")).toBeInTheDocument()
    expect(screen.getByText("Option 1, Option 2")).toBeInTheDocument()

    expect(screen.getByText("Date Field")).toBeInTheDocument()
    // Date should be formatted
    expect(screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeInTheDocument()

    expect(screen.getByText("File Field")).toBeInTheDocument()
    expect(screen.getByText("File uploaded")).toBeInTheDocument()
  })

  it("renders with card layout", () => {
    render(<SubmissionRenderer submission={mockSubmission} layout="card" />)
    expect(screen.getByText(/Submission submission-1/i)).toBeInTheDocument()
    // Card component should be rendered
    const cardElement = screen.getByText(/Submission submission-1/i).closest('div[class*="card"]')
    expect(cardElement).toBeInTheDocument()
  })

  it("renders with table-row layout", () => {
    render(<SubmissionRenderer submission={mockSubmission} layout="table-row" />)
    // Should be rendered as a table row
    expect(screen.getByRole("row")).toBeInTheDocument()
    expect(screen.getAllByRole("cell").length).toBeGreaterThan(0)
  })

  it("renders with default layout when layout is not specified", () => {
    render(<SubmissionRenderer submission={mockSubmission} />)
    expect(screen.getByText("Submission Details")).toBeInTheDocument()
    // Should have default layout
    const defaultElement = screen.getByText("Submission Details").closest('div[class*="space-y-4"]')
    expect(defaultElement).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<SubmissionRenderer submission={mockSubmission} className="custom-class" />)
    const submissionElement = screen.getByText("Submission Details").closest("div")
    expect(submissionElement).toHaveClass("custom-class")
  })

  it("renders meta information with submission date and IP", () => {
    render(<SubmissionRenderer submission={mockSubmission} />)
    expect(screen.getByText(/Submitted:/i)).toBeInTheDocument()
    expect(screen.getByText(/IP: 127.0.0.1/i)).toBeInTheDocument()
  })
})
