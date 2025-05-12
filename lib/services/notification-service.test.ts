import { notificationService } from "./notification-service"
import { mockFetch, resetMocks } from "@/lib/test-utils/test-utils"

describe("Notification Service", () => {
  beforeEach(() => {
    resetMocks()
  })

  describe("sendNotification", () => {
    it("sends a notification successfully", async () => {
      // Mock API response
      mockFetch({ success: true, notification: { id: "123" } })

      // Call the service
      const result = await notificationService.sendNotification({
        type: "content.published",
        title: "Content Published",
        message: "Your content has been published",
        recipients: ["user1", "user2"],
      })

      // Verify the result
      expect(result).toEqual({ id: "123" })
      expect(fetch).toHaveBeenCalledWith("/api/notifications", {
        method: "POST",
        headers: expect.any(Object),
        body: JSON.stringify({
          type: "content.published",
          title: "Content Published",
          message: "Your content has been published",
          recipients: ["user1", "user2"],
        }),
      })
    })

    it("handles errors when sending notifications", async () => {
      // Mock API error
      mockFetch({ error: "Failed to send notification" }, 500)

      // Call the service and expect it to throw
      await expect(
        notificationService.sendNotification({
          type: "content.published",
          title: "Content Published",
          message: "Your content has been published",
          recipients: ["user1", "user2"],
        }),
      ).rejects.toThrow()

      expect(fetch).toHaveBeenCalled()
    })
  })

  describe("getNotifications", () => {
    it("fetches notifications for a user", async () => {
      // Mock API response
      const mockNotifications = [
        { id: "1", type: "content.published", title: "Content Published" },
        { id: "2", type: "content.scheduled", title: "Content Scheduled" },
      ]
      mockFetch({ notifications: mockNotifications })

      // Call the service
      const result = await notificationService.getNotifications("user1")

      // Verify the result
      expect(result).toEqual(mockNotifications)
      expect(fetch).toHaveBeenCalledWith("/api/notifications?userId=user1", expect.any(Object))
    })
  })

  describe("markAsRead", () => {
    it("marks a notification as read", async () => {
      // Mock API response
      mockFetch({ success: true })

      // Call the service
      const result = await notificationService.markAsRead("123")

      // Verify the result
      expect(result).toBe(true)
      expect(fetch).toHaveBeenCalledWith("/api/notifications/mark-read", {
        method: "POST",
        headers: expect.any(Object),
        body: JSON.stringify({ id: "123" }),
      })
    })
  })
})
