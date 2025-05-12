"use client"

import { render, screen } from "@/nextstack/lib/test-utils/test-utils"
import { DateTimePicker } from "./date-time-picker"
import { jest } from "@jest/globals"

describe("DateTimePicker", () => {
  it("renders correctly", () => {
    const onChange = jest.fn()
    const { container } = render(
      <DateTimePicker value={new Date("2023-01-01T12:00:00")} onChange={onChange} label="Schedule Date" />,
    )

    expect(container).toMatchSnapshot()
  })

  it("displays the correct date and time", () => {
    const onChange = jest.fn()
    render(<DateTimePicker value={new Date("2023-01-01T12:00:00")} onChange={onChange} label="Schedule Date" />)

    // Check if the date is displayed
    expect(screen.getByDisplayValue("2023-01-01")).toBeInTheDocument()

    // Check if the time is displayed
    expect(screen.getByDisplayValue("12:00")).toBeInTheDocument()
  })

  it("calls onChange when date changes", () => {
    const onChange = jest.fn()
    render(<DateTimePicker value={new Date("2023-01-01T12:00:00")} onChange={onChange} label="Schedule Date" />)

    // Get the date input
    const dateInput = screen.getByLabelText("Date")

    // Change the date
    dateInput.focus()
    dateInput.value = "2023-02-01"
    dateInput.dispatchEvent(new Event("change", { bubbles: true }))

    // Check if onChange was called with the new date
    expect(onChange).toHaveBeenCalled()

    // The first argument should be a Date object
    const newDate = onChange.mock.calls[0][0]
    expect(newDate instanceof Date).toBe(true)
    expect(newDate.getFullYear()).toBe(2023)
    expect(newDate.getMonth()).toBe(1) // February is month 1 (0-indexed)
    expect(newDate.getDate()).toBe(1)
  })
})
