"use client"

import { useEffect, useState } from "react"
import type React from "react"

// Type for the asset manifest
interface AssetManifest {
  [key: string]: string
}

/**
 * Get the URL for an asset, resolving it from the asset manifest
 */
export function getAssetUrl(assetPath: string): string {
  // Check if we're in the browser
  if (typeof window !== "undefined") {
    // Get the asset manifest from window.__ASSET_MANIFEST__
    const manifest = (window as any).__ASSET_MANIFEST__ as AssetManifest

    if (manifest && manifest[assetPath]) {
      return manifest[assetPath]
    }
  }

  // Fallback to the original path
  return assetPath
}

/**
 * Hook to get an asset URL
 */
export function useAssetUrl(assetPath: string): string {
  const [url, setUrl] = useState<string>(assetPath)

  useEffect(() => {
    setUrl(getAssetUrl(assetPath))
  }, [assetPath])

  return url
}

/**
 * Component to render an image with the correct asset URL
 */
export function AssetImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>): JSX.Element {
  const assetUrl = useAssetUrl(src || "")

  return <img src={assetUrl || "/placeholder.svg"} alt={alt} {...props} />
}
