/**
 * Performance budget configuration for the application
 */

export interface PerformanceBudget {
  // Core Web Vitals
  lcp: number // Largest Contentful Paint (ms)
  fid: number // First Input Delay (ms)
  cls: number // Cumulative Layout Shift (unitless)

  // Additional metrics
  fcp: number // First Contentful Paint (ms)
  ttfb: number // Time to First Byte (ms)

  // Bundle size limits
  totalBundleSize: number // Total JS bundle size (KB)
  initialBundleSize: number // Initial JS bundle size (KB)

  // Image limits
  maxImageSize: number // Maximum image size (KB)

  // API response times
  apiResponseTime: number // Maximum API response time (ms)
}

// Default performance budget
export const defaultPerformanceBudget: PerformanceBudget = {
  // Core Web Vitals - "Good" thresholds
  lcp: 2500, // 2.5 seconds
  fid: 100, // 100 milliseconds
  cls: 0.1, // 0.1 unitless

  // Additional metrics
  fcp: 1800, // 1.8 seconds
  ttfb: 800, // 800 milliseconds

  // Bundle size limits
  totalBundleSize: 350, // 350 KB
  initialBundleSize: 150, // 150 KB

  // Image limits
  maxImageSize: 200, // 200 KB

  // API response times
  apiResponseTime: 500, // 500 milliseconds
}

// Environment-specific performance budgets
export const performanceBudgets: Record<string, PerformanceBudget> = {
  production: defaultPerformanceBudget,

  preview: {
    ...defaultPerformanceBudget,
    // Slightly relaxed limits for preview environments
    lcp: 3000,
    fid: 200,
    cls: 0.15,
    totalBundleSize: 400,
    initialBundleSize: 180,
  },

  development: {
    ...defaultPerformanceBudget,
    // Relaxed limits for development
    lcp: 4000,
    fid: 300,
    cls: 0.25,
    totalBundleSize: 500,
    initialBundleSize: 250,
    apiResponseTime: 1000,
  },
}

/**
 * Get the performance budget for the current environment
 */
export function getPerformanceBudget(): PerformanceBudget {
  const environment = process.env.VERCEL_ENV || "development"
  return performanceBudgets[environment] || defaultPerformanceBudget
}
