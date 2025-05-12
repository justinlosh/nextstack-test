import { versioningService } from "./versioning-service"
import { mockFetch, resetMocks } from "@/nextstack/lib/test-utils/test-utils"

describe("Versioning Service", () => {
  beforeEach(() => {
    resetMocks()
  })

  describe("getVersions", () => {
    it("fetches versions for a content item", async () => {
      // Mock API response
      const mockVersions = [
        { id: "1", versionNumber: 1, status: "published" },
        { id: "2", versionNumber: 2, status: "draft" },
      ]
      mockFetch({ versions: mockVersions })

      // Call the service
      const result = await versioningService.getVersions("page", "123")

      // Verify the result
      expect(result).toEqual(mockVersions)
      expect(fetch).toHaveBeenCalledWith("/api/versions/list?type=page&id=123", expect.any(Object))
    })

    it("handles errors when fetching versions", async () => {
      // Mock API error
      mockFetch({ error: "Failed to fetch versions" }, 500)

      // Call the service and expect it to throw
      await expect(versioningService.getVersions("page", "123")).rejects.toThrow()
      expect(fetch).toHaveBeenCalledWith("/api/versions/list?type=page&id=123", expect.any(Object))
    })
  })

  describe("createVersion", () => {
    it("creates a new version for a content item", async () => {
      // Mock API response
      const mockVersion = { id: "3", versionNumber: 3, status: "draft" }
      mockFetch({ version: mockVersion })

      // Call the service
      const result = await versioningService.createVersion("page", "123", { title: "New Version" })

      // Verify the result
      expect(result).toEqual(mockVersion)
      expect(fetch).toHaveBeenCalledWith("/api/versions/create", {
        method: "POST",
        headers: expect.any(Object),
        body: JSON.stringify({
          type: "page",
          contentId: "123",
          data: { title: "New Version" },
        }),
      })
    })
  })
})
