/**
 * Options for retry functionality
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number

  /**
   * Base delay between retries in milliseconds
   * @default 1000
   */
  baseDelay?: number

  /**
   * Whether to use exponential backoff for retries
   * @default true
   */
  exponentialBackoff?: boolean

  /**
   * Function to determine if an error is retryable
   * @default All errors are retryable
   */
  isRetryable?: (error: Error) => boolean
}

/**
 * Default retry options
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  exponentialBackoff: true,
  isRetryable: () => true,
}

/**
 * Executes a function with retry logic
 * @param fn Function to execute
 * @param options Retry options
 * @returns Promise with the function result
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxRetries, baseDelay, exponentialBackoff, isRetryable } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  }

  let lastError: Error | null = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      if (attempt >= maxRetries || (isRetryable && !isRetryable(lastError))) {
        break
      }

      // Calculate delay with exponential backoff if enabled
      const delay = exponentialBackoff ? baseDelay * Math.pow(2, attempt) : baseDelay

      // Wait before next retry
      await new Promise((resolve) => setTimeout(resolve, delay))

      attempt++
    }
  }

  throw lastError
}
