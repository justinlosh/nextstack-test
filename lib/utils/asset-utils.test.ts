import { getAssetUrl, getAssetPath } from "./asset-utils"

// Mock the global window object
global.window = Object.create(window)
Object.defineProperty(window, "__ASSET_MANIFEST__", {
  value: {
    "modules/content/assets/images/logo.png": "/static/assets/content/images/logo-abc123.png",
    "modules/ui/assets/styles/main.css": "/static/assets/ui/styles/main-def456.css",
  },
})

describe("Asset Utils", () => {
  describe("getAssetPath", () => {
    it("returns the correct path for a known asset", () => {
      const result = getAssetPath("modules/content/assets/images/logo.png")
      expect(result).toBe("/static/assets/content/images/logo-abc123.png")
    })

    it("returns null for an unknown asset", () => {
      const result = getAssetPath("modules/content/assets/images/unknown.png")
      expect(result).toBeNull()
    })
  })

  describe("getAssetUrl", () => {
    it("returns the correct URL for a known asset", () => {
      const result = getAssetUrl("modules/content/assets/images/logo.png")
      expect(result).toBe("/static/assets/content/images/logo-abc123.png")
    })

    it("returns the fallback for an unknown asset", () => {
      const result = getAssetUrl("modules/content/assets/images/unknown.png", "/fallback.png")
      expect(result).toBe("/fallback.png")
    })

    it("returns null for an unknown asset without fallback", () => {
      const result = getAssetUrl("modules/content/assets/images/unknown.png")
      expect(result).toBeNull()
    })
  })
})
