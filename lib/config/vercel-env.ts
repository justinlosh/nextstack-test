/**
 * Utility for working with Vercel environment variables and deployment context
 */

// Types for Vercel deployment environment
export type VercelEnvironment = "production" | "preview" | "development"

// Interface for Vercel deployment information
export interface VercelDeploymentInfo {
  environment: VercelEnvironment
  isProduction: boolean
  isPreview: boolean
  isDevelopment: boolean
  url: string
  region?: string
  deploymentId?: string
  commitSha?: string
  branchName?: string
}

/**
 * Get the current Vercel environment
 */
export function getVercelEnvironment(): VercelEnvironment {
  return (process.env.VERCEL_ENV as VercelEnvironment) || "development"
}

/**
 * Get information about the current Vercel deployment
 */
export function getVercelDeploymentInfo(): VercelDeploymentInfo {
  const environment = getVercelEnvironment()

  return {
    environment,
    isProduction: environment === "production",
    isPreview: environment === "preview",
    isDevelopment: environment === "development",
    url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
    region: process.env.VERCEL_REGION,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA,
    branchName: process.env.VERCEL_GIT_COMMIT_REF,
  }
}

/**
 * Check if the code is running on Vercel
 */
export function isRunningOnVercel(): boolean {
  return process.env.VERCEL === "1"
}

/**
 * Get the base URL for the current environment
 */
export function getBaseUrl(): string {
  if (isRunningOnVercel()) {
    return getVercelDeploymentInfo().url
  }

  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig<T>(config: {
  production: T
  preview: T
  development: T
}): T {
  const environment = getVercelEnvironment()
  return config[environment]
}
