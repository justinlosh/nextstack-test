"use client"

import { type ReactNode, useEffect } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { initVercelAnalytics, usePageViewTracking } from "../../lib/monitoring/vercel-analytics"
import { getVercelEnvironment } from "../../lib/config/vercel-env"

interface AnalyticsProviderProps {
  children: ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialize Vercel Analytics
  useEffect(() => {
    initVercelAnalytics()
  }, [])

  // Track page views
  usePageViewTracking()

  // Only include Speed Insights in production or preview
  const environment = getVercelEnvironment()
  const enableSpeedInsights = environment === "production" || environment === "preview"

  return (
    <>
      {children}
      {enableSpeedInsights && <SpeedInsights />}
    </>
  )
}
