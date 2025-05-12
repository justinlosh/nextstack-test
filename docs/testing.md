# Testing Guide

This document provides guidelines for writing and running tests in the Next.js application.

## Testing Framework

We use Jest as our testing framework, along with React Testing Library for component testing. This combination allows us to write tests that focus on user behavior rather than implementation details.

## Running Tests

### Basic Test Commands

\`\`\`bash
# Run all tests
npm run build -- --test-only

# Run tests with coverage
npm run build -- --test-only --coverage

# Run tests for a specific file or pattern
npm run build -- --test-only --test-match "components/content/*.test.tsx"

# Update snapshots
npm run build -- --test-only --update-snapshots
\`\`\`

### Test During Build

Tests are automatically run as part of the build process. If you want to skip tests during build:

\`\`\`bash
npm run build -- --skip-tests
\`\`\`

## Writing Tests

### Test Organization

Tests should be organized alongside the code they're testing:

\`\`\`
components/
  MyComponent.tsx
  MyComponent.test.tsx
lib/
  utils/
    myUtil.ts
    myUtil.test.ts
\`\`\`

### Component Tests

Use React Testing Library to test components:

\`\`\`tsx
import { render, screen } from '@/lib/test-utils/test-utils'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalled()
  })
})
\`\`\`

### Hook Tests

Use `renderHook` to test custom hooks:

\`\`\`tsx
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('returns the correct initial state', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.count).toBe(0)
  })

  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyHook())
    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(1)
  })
})
\`\`\`

### API Tests

Use mocks to test API interactions:

\`\`\`tsx
import { myApiFunction } from './myApiFunction'
import { mockFetch, resetMocks } from '@/lib/test-utils/test-utils'

describe('myApiFunction', () => {
  beforeEach(() => {
    resetMocks()
  })

  it('fetches data successfully', async () => {
    mockFetch({ data: 'test' })
    const result = await myApiFunction()
    expect(result).toEqual({ data: 'test' })
    expect(fetch).toHaveBeenCalledWith('/api/endpoint', expect.any(Object))
  })

  it('handles errors', async () => {
    mockFetch({ error: 'Failed' }, 500)
    await expect(myApiFunction()).rejects.toThrow()
  })
})
\`\`\`

## Test Utilities

We provide several test utilities to make testing easier:

### Custom Render

Use our custom render function to include providers:

\`\`\`tsx
import { render, screen } from '@/lib/test-utils/test-utils'

// This will render the component with all necessary providers
render(<MyComponent />)
\`\`\`

### Mock Fetch

Use `mockFetch` to mock API responses:

\`\`\`tsx
import { mockFetch, resetMocks } from '@/lib/test-utils/test-utils'

beforeEach(() => {
  resetMocks()
})

it('fetches data', async () => {
  mockFetch({ data: 'test' })
  // Test your component or function
})
\`\`\`

### Mock Router

Use `mockRouter` to mock Next.js router:

\`\`\`tsx
import { mockRouter } from '@/lib/test-utils/test-utils'
import { useRouter } from 'next/router'

// Mock the useRouter hook
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}))

it('navigates on click', () => {
  render(<MyComponent />)
  screen.getByText('Go to Dashboard').click()
  expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
})
\`\`\`

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the user sees and does, not on implementation details.

2. **Use Meaningful Assertions**: Make your assertions clear and meaningful.

3. **Keep Tests Independent**: Each test should be independent of others.

4. **Mock External Dependencies**: Use mocks for external dependencies like APIs.

5. **Use Data-Test Attributes**: For components that are difficult to select, use data-test attributes:

   \`\`\`tsx
   <button data-testid="submit-button">Submit</button>
   \`\`\`

   \`\`\`tsx
   screen.getByTestId('submit-button')
   \`\`\`

6. **Test Edge Cases**: Test error states, loading states, and edge cases.

7. **Maintain Coverage**: Aim for at least 70% code coverage.

## Continuous Integration

Tests are automatically run in our CI pipeline. The build will fail if tests fail or if coverage falls below the defined thresholds.
\`\`\`

Let's update the package.json to include test scripts:
