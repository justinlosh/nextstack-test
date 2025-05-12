// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
import { TextDecoder, TextEncoder } from "util"
import { afterEach, jest } from "@jest/globals"

// Mock the global fetch
global.fetch = jest.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {
    return null
  }
  unobserve() {
    return null
  }
  disconnect() {
    return null
  }
}

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock scrollTo
window.scrollTo = jest.fn()

// Suppress console errors during tests
const originalConsoleError = console.error
console.error = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("Warning: ReactDOM.render is no longer supported")) {
    return
  }
  originalConsoleError(...args)
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
