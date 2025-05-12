import { POST } from "./route"
import { versioningService } from "@/lib/services/versioning-service"
import { notificationService } from "@/lib/services/notification-service"

// Mock the versioning service
jest.mock("@/lib/services/versioning-service", () => ({
  versioningService: {
    scheduleVersion: jest.fn(),
  },
}))

// Mock the notification service
jest.mock("@/lib/services/notification-service", () => ({
  notificationService: {
    sendNotification: jest.fn(),
  },
}))

describe("Schedule API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("schedules a version successfully", async () => {
    // Mock the request
    const request = new Request("http://localhost:3000/api/versions/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "page",
        contentId: "123",
        versionId: "456",
        scheduledDate: "2023-01-01T12:00:00.000Z",
      }),
    })

    // Mock the versioning service response
    versioningService.scheduleVersion.mockResolvedValue({
      id: "456",
      versionNumber: 2,
      status: "scheduled",
      scheduledDate: "2023-01-01T12:00:00.000Z",
    })

    // Call the API route
    const response = await POST(request)
    const data = await response.json()

    // Check the response
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.version).toBeDefined()
    expect(data.version.status).toBe("scheduled")

    // Check if the versioning service was called
    expect(versioningService.scheduleVersion).toHaveBeenCalledWith(
      "page",
      "123",
      "456",
      new Date("2023-01-01T12:00:00.000Z"),
      undefined, // No author ID in this test
    )

    // Check if the notification service was called
    expect(notificationService.sendNotification).toHaveBeenCalled()
  })

  it("handles validation errors", async () => {
    // Mock the request with missing fields
    const request = new Request("http://localhost:3000/api/versions/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Missing required fields
        type: "page",
      }),
    })

    // Call the API route
    const response = await POST(request)
    const data = await response.json()

    // Check the response
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()

    // Check that the versioning service was not called
    expect(versioningService.scheduleVersion).not.toHaveBeenCalled()
  })

  it("handles service errors", async () => {
    // Mock the request
    const request = new Request("http://localhost:3000/api/versions/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "page",
        contentId: "123",
        versionId: "456",
        scheduledDate: "2023-01-01T12:00:00.000Z",
      }),
    })

    // Mock the versioning service to throw an error
    versioningService.scheduleVersion.mockRejectedValue(new Error("Service error"))

    // Call the API route
    const response = await POST(request)
    const data = await response.json()

    // Check the response
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBeDefined()
  })
})
