import { renderHook, act } from "@testing-library/react"
import { useContentScheduling } from "./use-content-scheduling"
import { mockFetch, resetMocks } from "@/nextstack/lib/test-utils/test-utils"

describe("useContentScheduling", () => {
  beforeEach(() => {
    resetMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("schedules content successfully", async () => {
    // Mock API response
    mockFetch({ success: true, version: { id: "1", status: "scheduled" } })

    // Render the hook
    const { result } = renderHook(() => useContentScheduling())

    // Schedule content
    let schedulePromise
    act(() => {
      schedulePromise = result.current.scheduleContent("page", "123", "1", new Date("2023-01-01"))
    })

    // Wait for the promise to resolve
    await act(async () => {
      await schedulePromise
    })

    // Verify the result
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(fetch).toHaveBeenCalledWith("/api/versions/schedule", {
      method: "POST",
      headers: expect.any(Object),
      body: JSON.stringify({
        type: "page",
        contentId: "123",
        versionId: "1",
        scheduledDate: new Date("2023-01-01").toISOString(),
      }),
    })
  })

  it("handles scheduling errors", async () => {
    // Mock API error
    mockFetch({ error: "Failed to schedule content" }, 500)

    // Render the hook
    const { result } = renderHook(() => useContentScheduling())

    // Schedule content
    let schedulePromise
    act(() => {
      schedulePromise = result.current.scheduleContent("page", "123", "1", new Date("2023-01-01"))
    })

    // Wait for the promise to resolve
    await act(async () => {
      await schedulePromise.catch(() => {})
    })

    // Verify the result
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe("Failed to schedule content")
  })
})
