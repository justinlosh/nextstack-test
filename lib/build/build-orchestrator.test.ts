import { BuildOrchestrator } from "./build-orchestrator"
import { spawn } from "child_process"
import { configManager } from "./config-manager"
import { assetProcessor } from "./asset-processor"
import { jest } from "@jest/globals"

// Mock child_process
jest.mock("child_process", () => ({
  spawn: jest.fn(),
}))

// Mock config-manager
jest.mock("./config-manager", () => ({
  configManager: {
    init: jest.fn(),
    getSortedModules: jest.fn(),
    getGlobalEnv: jest.fn(),
  },
}))

// Mock asset-processor
jest.mock("./asset-processor", () => ({
  assetProcessor: {
    processModuleAssets: jest.fn(),
    writeManifest: jest.fn(),
  },
}))

// Mock fs
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  rmSync: jest.fn(),
  writeFileSync: jest.fn(),
}))

describe("BuildOrchestrator", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock spawn to return a successful process
    const mockProcess = {
      stdout: {
        on: jest.fn(),
      },
      stderr: {
        on: jest.fn(),
      },
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === "close") {
          callback(0) // Success
        }
      }),
    }

    spawn.mockReturnValue(mockProcess)

    // Mock configManager
    configManager.init.mockResolvedValue({
      modules: {
        test: {
          runtime: {
            feature: true,
          },
        },
      },
    })

    configManager.getSortedModules.mockReturnValue([{ name: "test", assets: {} }])

    configManager.getGlobalEnv.mockReturnValue({
      NODE_ENV: "production",
    })

    // Mock assetProcessor
    assetProcessor.processModuleAssets.mockResolvedValue([
      {
        type: "image",
        originalPath: "test.jpg",
        outputPath: "test-hash.jpg",
        size: {
          original: 1000,
          processed: 500,
        },
      },
    ])
  })

  describe("build", () => {
    it("runs the build process successfully", async () => {
      // Create an instance with test-only mode
      const orchestrator = new BuildOrchestrator({
        skipTests: true, // Skip tests for this test
      })

      // Run the build
      const result = await orchestrator.build()

      // Check the result
      expect(result.success).toBe(true)
      expect(result.modules.length).toBe(1)
      expect(result.modules[0].name).toBe("test")
      expect(result.modules[0].success).toBe(true)

      // Check if the methods were called
      expect(configManager.init).toHaveBeenCalled()
      expect(configManager.getSortedModules).toHaveBeenCalled()
      expect(assetProcessor.processModuleAssets).toHaveBeenCalled()
      expect(spawn).toHaveBeenCalledWith("npx", ["next", "build"], expect.any(Object))
    })

    it("handles build failures", async () => {
      // Mock spawn to return a failed process
      const mockFailedProcess = {
        stdout: {
          on: jest.fn(),
        },
        stderr: {
          on: jest.fn(),
        },
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === "close") {
            callback(1) // Failure
          }
        }),
      }

      spawn.mockReturnValueOnce(mockFailedProcess)

      // Create an instance with test-only mode
      const orchestrator = new BuildOrchestrator({
        skipTests: true, // Skip tests for this test
      })

      // Run the build and expect it to fail
      await expect(orchestrator.build()).rejects.toThrow()
    })
  })
})
