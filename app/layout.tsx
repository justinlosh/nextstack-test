import type React from "react"
import "./globals.css"
import { AnalyticsProvider } from "../components/vercel/analytics-provider"
import { PerformanceMonitor } from "../components/vercel/performance-monitor"
import { getVercelEnvironment } from "../lib/config/vercel-env"
import { Suspense } from "react"

export const metadata = {
  title: "Flat File CMS",
  description: "A simple flat file CMS",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const environment = getVercelEnvironment()
  const isProduction = environment === "production"

  return (
    <html lang="en">
      <head>
        {/* Add preconnect for Vercel's domains */}
        <link rel="preconnect" href="https://vercel.com" />
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />

        {/* Add preload for critical assets */}
        <link rel="preload" href="/_next/static/chunks/asset-manifest.js" as="script" />

        {/* Add meta tags for Vercel deployment */}
        <meta name="deployment-environment" content={environment} />
        {process.env.VERCEL_DEPLOYMENT_ID && <meta name="deployment-id" content={process.env.VERCEL_DEPLOYMENT_ID} />}
      </head>
      <body>
        <Suspense>
          <AnalyticsProvider>
            {children}
            <PerformanceMonitor />
          </AnalyticsProvider>
        </Suspense>

        {/* Add Vercel deployment badge in non-production environments */}
        {!isProduction && process.env.VERCEL && (
          <div className="fixed bottom-2 right-2 z-50">
            <a
              href={`https://vercel.com/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-black text-white px-2 py-1 rounded flex items-center"
            >
              <span>▲</span>
              <span className="ml-1">Vercel</span>
            </a>
          </div>
        )}
      </body>
    </html>
  )
}
