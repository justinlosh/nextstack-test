import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { jest } from "@jest/globals"

// Import your providers
import { ModuleConfigProvider } from "../../components/module-config/module-config-provider"

// Define a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // Mock module config for testing
  const mockModuleConfig = {
    content: {
      features: {
        enableDrafts: true,
        enableScheduling: true,
      },
    },
    ui: {
      theme: "light",
    },
  }

  return <ModuleConfigProvider initialConfig={mockModuleConfig}>{children}</ModuleConfigProvider>
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  }
}

// Re-export everything from testing-library
export * from "@testing-library/react"

// Override the render method
export { customRender as render }

// Export userEvent
export { userEvent }

// Mock fetch responses
export const mockFetch = (data: any, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue(data),
    status,
    ok: status >= 200 && status < 300,
  })
}

// Reset mocks
export const resetMocks = () => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
}

// Create a mock for the next/router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  reload: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  query: {},
  pathname: "/",
  asPath: "/",
  isFallback: false,
}

// Mock next/navigation
export const mockNavigation = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}
