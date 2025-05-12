import { render } from "@/nextstack/lib/test-utils/test-utils"
import { ModuleConfigProvider, useModuleConfig } from "./module-config-provider"

// Test component that uses the hook
const TestComponent = () => {
  const contentConfig = useModuleConfig("content")
  const featureEnabled = useModuleConfig<boolean>("content", "features.enableDrafts")

  return (
    <div>
      <div data-testid="content-config">{JSON.stringify(contentConfig)}</div>
      <div data-testid="feature-enabled">{String(featureEnabled)}</div>
    </div>
  )
}

describe("ModuleConfigProvider", () => {
  it("provides module configuration to components", () => {
    const mockConfig = {
      content: {
        features: {
          enableDrafts: true,
          enableScheduling: false,
        },
      },
    }

    const { getByTestId } = render(
      <ModuleConfigProvider initialConfig={mockConfig}>
        <TestComponent />
      </ModuleConfigProvider>,
    )

    // Check if the full config is provided
    expect(getByTestId("content-config").textContent).toBe(JSON.stringify(mockConfig.content))

    // Check if the specific path is provided
    expect(getByTestId("feature-enabled").textContent).toBe("true")
  })

  it("returns null for non-existent modules", () => {
    const mockConfig = {
      content: {
        features: {
          enableDrafts: true,
        },
      },
    }

    const NonExistentModule = () => {
      const config = useModuleConfig("non-existent")
      return <div data-testid="non-existent">{String(config === null)}</div>
    }

    const { getByTestId } = render(
      <ModuleConfigProvider initialConfig={mockConfig}>
        <NonExistentModule />
      </ModuleConfigProvider>,
    )

    expect(getByTestId("non-existent").textContent).toBe("true")
  })

  it("returns default value for non-existent paths", () => {
    const mockConfig = {
      content: {
        features: {
          enableDrafts: true,
        },
      },
    }

    const NonExistentPath = () => {
      const value = useModuleConfig<boolean>("content", "features.nonExistent", false)
      return <div data-testid="non-existent-path">{String(value)}</div>
    }

    const { getByTestId } = render(
      <ModuleConfigProvider initialConfig={mockConfig}>
        <NonExistentPath />
      </ModuleConfigProvider>,
    )

    expect(getByTestId("non-existent-path").textContent).toBe("false")
  })
})
