"use client"

import { useEffect, useState } from "react"
import { getPerformanceBudget } from "../../lib/config/performance-budget"
import { trackEvent } from "../../lib/monitoring/vercel-analytics"

interface PerformanceMetrics {
  lcp?: number
  fid?: number
  cls?: number
  fcp?: number
  ttfb?: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const budget = getPerformanceBudget()

  useEffect(() => {
    // Only run in production or if explicitly enabled
    if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING !== "true") {
      return
    }

    // Set up performance observer for LCP
    if ("PerformanceObserver" in window) {
      // LCP observer
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          const lcp = lastEntry.startTime

          setMetrics((prev) => ({ ...prev, lcp }))
          reportPerformanceMetric("LCP", lcp, budget.lcp)
        })

        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
      } catch (e) {
        console.error("LCP observer error:", e)
      }

      // FID observer
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const firstInput = entries[0]
          const fid = firstInput.processingStart - firstInput.startTime

          setMetrics((prev) => ({ ...prev, fid }))
          reportPerformanceMetric("FID", fid, budget.fid)
        })

        fidObserver.observe({ type: "first-input", buffered: true })
      } catch (e) {
        console.error("FID observer error:", e)
      }

      // CLS observer
      try {
        let clsValue = 0
        const clsEntries = []

        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()

          entries.forEach((entry) => {
            // Only count layout shifts without recent user input
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              clsEntries.push(entry)
            }
          })

          setMetrics((prev) => ({ ...prev, cls: clsValue }))
          reportPerformanceMetric("CLS", clsValue, budget.cls)
        })

        clsObserver.observe({ type: "layout-shift", buffered: true })
      } catch (e) {
        console.error("CLS observer error:", e)
      }

      // FCP observer
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const fcp = entries[0].startTime

          setMetrics((prev) => ({ ...prev, fcp }))
          reportPerformanceMetric("FCP", fcp, budget.fcp)
        })

        fcpObserver.observe({ type: "paint", buffered: true })
      } catch (e) {
        console.error("FCP observer error:", e)
      }
    }

    // Measure TTFB
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigationEntries = performance.getEntriesByType("navigation")
        if (navigationEntries.length > 0) {
          const ttfb = navigationEntries[0].responseStart

          setMetrics((prev) => ({ ...prev, ttfb }))
          reportPerformanceMetric("TTFB", ttfb, budget.ttfb)
        }
      }, 0)
    })

    return () => {
      // Clean up observers if needed
    }
  }, [budget])

  // This component doesn't render anything visible
  return null
}

/**
 * Report a performance metric to analytics
 */
function reportPerformanceMetric(name: string, value: number, threshold: number) {
  const status = value <= threshold ? "good" : "poor"

  // Track the metric in analytics
  trackEvent("performance_metric", {
    metric_name: name,
    metric_value: Math.round(name === "CLS" ? value * 1000 : value),
    metric_status: status,
  })

  // Log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `%c${name}: %c${Math.round(name === "CLS" ? value * 1000 : value)}ms %c(${status})`,
      "font-weight: bold",
      "font-weight: normal",
      `color: ${status === "good" ? "green" : "red"}`,
    )
  }
}
