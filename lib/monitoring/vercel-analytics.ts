"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { inject } from "@vercel/analytics"
import { getVercelEnvironment } from "../config/vercel-env"

// Initialize Vercel Analytics
export function initVercelAnalytics() {
  // Only initialize in production or if explicitly enabled
  if (getVercelEnvironment() === "production" || process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true") {
    inject()
  }
}

// Custom hook to track page views
export function usePageViewTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      // Construct the URL with search parameters
      const url = searchParams?.size ? `${pathname}?${searchParams.toString()}` : pathname

      // Track page view
      if (window.va) {
        window.va("page_view", {
          page_path: url,
        })
      }
    }
  }, [pathname, searchParams])
}

// Track custom events
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (window.va) {
    window.va("event", {
      name: eventName,
      ...properties,
    })
  }
}

// Web Vitals reporting
export function reportWebVitals({
  id,
  name,
  label,
  value,
}: {
  id: string
  name: string
  label: string
  value: number
}) {
  if (window.va) {
    window.va("web_vitals", {
      id,
      name,
      label,
      value: Math.round(name === "CLS" ? value * 1000 : value),
    })
  }
}
