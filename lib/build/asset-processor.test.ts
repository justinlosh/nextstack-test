import { assetProcessor } from "./asset-processor"
import fs from "fs"
import path from "path"

// Mock fs and path
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  statSync: jest.fn(),
}))

jest.mock("path", () => ({
  join: jest.fn(),
  dirname: jest.fn(),
  basename: jest.fn(),
  extname: jest.fn(),
  resolve: jest.fn(),
}))

// Mock sharp
jest.mock("sharp", () => {
  return jest.fn().mockImplementation(() => ({
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue({}),
  }))
})

describe("Asset Processor", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock path.join to return predictable paths
    path.join.mockImplementation((...args) => args.join("/"))

    // Mock path.dirname to return the directory part
    path.dirname.mockImplementation((p) => p.split("/").slice(0, -1).join("/"))

    // Mock path.basename to return the file name
    path.basename.mockImplementation((p) => p.split("/").pop())

    // Mock path.extname to return the extension
    path.extname.mockImplementation((p) => {
      const parts = p.split(".")
      return parts.length > 1 ? `.${parts.pop()}` : ""
    })

    // Mock fs.existsSync to return true
    fs.existsSync.mockReturnValue(true)

    // Mock fs.statSync to return a file stat
    fs.statSync.mockReturnValue({
      isFile: () => true,
      size: 1000,
    })

    // Mock fs.readFileSync to return a buffer
    fs.readFileSync.mockReturnValue(Buffer.from("test"))
  })

  describe("processModuleAssets", () => {
    it("processes module assets correctly", async () => {
      // Mock module config
      const moduleConfig = {
        name: "test-module",
        assets: {
          images: ["assets/images/**/*.{jpg,png}"],
          styles: ["assets/styles/**/*.css"],
          scripts: ["assets/scripts/**/*.js"],
        },
      }

      // Mock glob to return some files
      jest.mock("glob", () => ({
        sync: jest.fn().mockImplementation((pattern) => {
          if (pattern.includes("images")) {
            return ["assets/images/test.jpg", "assets/images/test.png"]
          }
          if (pattern.includes("styles")) {
            return ["assets/styles/test.css"]
          }
          if (pattern.includes("scripts")) {
            return ["assets/scripts/test.js"]
          }
          return []
        }),
      }))

      // Call the method
      const result = await assetProcessor.processModuleAssets(moduleConfig, "/path/to/module")

      // Expect the result to contain the processed assets
      expect(result.length).toBeGreaterThan(0)

      // Check if the assets were processed
      expect(fs.writeFileSync).toHaveBeenCalled()
    })
  })
})
