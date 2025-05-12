"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { FormRenderer } from "@/components/content/renderers/form-renderer"
import { mockForm } from "../../../mocks/mock-data"

// Mock the FormField component
jest.mock("@/components/content/elements/form-field", () => ({
  FormField: ({ field }) => (
    <div data-testid={`form-field-${field.name}`}>
      {field.label}: {field.type}
    </div>
  ),
}))

describe("FormRenderer", () => {
  it("renders form name and description", () => {
    render(<FormRenderer form={mockForm} />)
    expect(screen.getByText("Test Form")).toBeInTheDocument()
    expect(screen.getByText("This is a test form.")).toBeInTheDocument()
  })

  it("renders nothing when form is null", () => {
    const { container } = render(<FormRenderer form={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders form fields", () => {
    render(<FormRenderer form={mockForm} />)
    expect(screen.getByTestId("form-field-name")).toBeInTheDocument()
    expect(screen.getByTestId("form-field-email")).toBeInTheDocument()
    expect(screen.getByTestId("form-field-message")).toBeInTheDocument()
  })

  it("renders submit button with custom text", () => {
    render(<FormRenderer form={mockForm} />)
    expect(screen.getByRole("button")).toHaveTextContent("Submit Form")
  })

  it("renders submit button with default text when not provided", () => {
    const formWithoutButtonText = { ...mockForm, submitButtonText: undefined }
    render(<FormRenderer form={formWithoutButtonText} />)
    expect(screen.getByRole("button")).toHaveTextContent("Submit")
  })

  it("disables submit button when isSubmitting is true", () => {
    render(<FormRenderer form={mockForm} isSubmitting={true} />)
    expect(screen.getByRole("button")).toBeDisabled()
    expect(screen.getByRole("button")).toHaveTextContent("Submitting...")
  })

  it("calls onSubmit with form data when form is submitted", async () => {
    const mockOnSubmit = jest.fn()

    // Mock FormData
    const mockFormData = {
      get: jest.fn().mockImplementation((name) => `test-${name}`),
      getAll: jest.fn().mockImplementation((name) => [`test-${name}-1`, `test-${name}-2`]),
    }
    global.FormData = jest.fn().mockImplementation(() => mockFormData)

    render(<FormRenderer form={mockForm} onSubmit={mockOnSubmit} />)

    fireEvent.submit(screen.getByRole("form"))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "test-name",
        email: "test-email",
        message: "test-message",
      })
    })
  })

  it("renders with card layout", () => {
    render(<FormRenderer form={mockForm} layout="card" />)
    expect(screen.getByText("Test Form")).toBeInTheDocument()
    // Card component should be rendered
    const cardElement = screen.getByText("Test Form").closest('div[class*="card"]')
    expect(cardElement).toBeInTheDocument()
  })

  it("renders with embedded layout", () => {
    render(<FormRenderer form={mockForm} layout="embedded" />)
    expect(screen.getByText("Test Form")).toBeInTheDocument()
    // Should have embedded layout class
    const embeddedElement = screen.getByText("Test Form").closest('div[class*="rounded-lg border"]')
    expect(embeddedElement).toBeInTheDocument()
  })

  it("renders with default layout when layout is not specified", () => {
    render(<FormRenderer form={mockForm} />)
    expect(screen.getByText("Test Form")).toBeInTheDocument()
    // Should have default layout
    const defaultElement = screen.getByText("Test Form").closest('div[class*="space-y-4"]')
    expect(defaultElement).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<FormRenderer form={mockForm} className="custom-class" />)
    const formElement = screen.getByText("Test Form").closest("div")
    expect(formElement).toHaveClass("custom-class")
  })
})
