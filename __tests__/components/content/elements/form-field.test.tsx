"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { FormField } from "@/components/content/elements/form-field"

describe("FormField", () => {
  it("renders text input field", () => {
    const field = {
      id: "field-1",
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Enter your name",
    }

    render(<FormField field={field} />)

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text")
    expect(screen.getByRole("textbox")).toHaveAttribute("required")
  })

  it("renders email input field", () => {
    const field = {
      id: "field-2",
      name: "email",
      label: "Email",
      type: "email",
      required: true,
    }

    render(<FormField field={field} />)

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email")
  })

  it("renders textarea field", () => {
    const field = {
      id: "field-3",
      name: "message",
      label: "Message",
      type: "textarea",
      required: false,
      placeholder: "Enter your message",
    }

    render(<FormField field={field} />)

    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter your message")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).not.toHaveAttribute("required")
  })

  it("renders select field", () => {
    const field = {
      id: "field-4",
      name: "country",
      label: "Country",
      type: "select",
      required: true,
      options: ["USA", "Canada", "UK"],
    }

    render(<FormField field={field} />)

    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeInTheDocument()

    // Open the select dropdown
    fireEvent.click(screen.getByRole("combobox"))

    // Check options
    expect(screen.getByText("USA")).toBeInTheDocument()
    expect(screen.getByText("Canada")).toBeInTheDocument()
    expect(screen.getByText("UK")).toBeInTheDocument()
  })

  it("renders checkbox field", () => {
    const field = {
      id: "field-5",
      name: "interests",
      label: "Interests",
      type: "checkbox",
      required: false,
      options: ["Sports", "Music", "Movies"],
    }

    render(<FormField field={field} />)

    expect(screen.getByText(/Interests/i)).toBeInTheDocument()
    expect(screen.getAllByRole("checkbox").length).toBe(3)
    expect(screen.getByLabelText("Sports")).toBeInTheDocument()
    expect(screen.getByLabelText("Music")).toBeInTheDocument()
    expect(screen.getByLabelText("Movies")).toBeInTheDocument()
  })

  it("renders radio field", () => {
    const field = {
      id: "field-6",
      name: "gender",
      label: "Gender",
      type: "radio",
      required: true,
      options: ["Male", "Female", "Other"],
    }

    render(<FormField field={field} />)

    expect(screen.getByText(/Gender/i)).toBeInTheDocument()
    expect(screen.getAllByRole("radio").length).toBe(3)
    expect(screen.getByLabelText("Male")).toBeInTheDocument()
    expect(screen.getByLabelText("Female")).toBeInTheDocument()
    expect(screen.getByLabelText("Other")).toBeInTheDocument()
  })

  it("renders file input field", () => {
    const field = {
      id: "field-7",
      name: "document",
      label: "Document",
      type: "file",
      required: true,
    }

    render(<FormField field={field} />)

    expect(screen.getByLabelText(/Document/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Document/i)).toHaveAttribute("type", "file")
  })

  it("renders unsupported field type message", () => {
    const field = {
      id: "field-8",
      name: "unknown",
      label: "Unknown",
      type: "unknown",
    }

    render(<FormField field={field} />)

    expect(screen.getByText(/Unsupported field type/i)).toBeInTheDocument()
  })

  it("calls onChange when input value changes", () => {
    const field = {
      id: "field-1",
      name: "name",
      label: "Name",
      type: "text",
    }

    const mockOnChange = jest.fn()

    render(<FormField field={field} onChange={mockOnChange} />)

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "John Doe" } })

    expect(mockOnChange).toHaveBeenCalledWith("name", "John Doe")
  })

  it("disables input when disabled prop is true", () => {
    const field = {
      id: "field-1",
      name: "name",
      label: "Name",
      type: "text",
    }

    render(<FormField field={field} disabled={true} />)

    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("shows asterisk for required fields", () => {
    const field = {
      id: "field-1",
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    }

    render(<FormField field={field} />)

    const label = screen.getByText(/Name/i)
    expect(label).toHaveClass("after:content-['*']")
  })
})
