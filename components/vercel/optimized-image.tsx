"use client"

import Image, { type ImageProps } from "next/image"
import { useState, useEffect } from "react"
import { useAssetUrl } from "../../lib/utils/asset-utils"

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string
  fallback?: string
  lowQuality?: boolean
  lazyLoad?: boolean
  sizes?: string
}

/**
 * Vercel-optimized image component that leverages Vercel's image optimization
 */
export function OptimizedImage({
  src,
  fallback = "/placeholder.svg",
  lowQuality = false,
  lazyLoad = true,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  alt,
  width,
  height,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const assetUrl = useAssetUrl(src)
  const quality = lowQuality ? 60 : 85

  // Reset error state if src changes
  useEffect(() => {
    setError(false)
  }, [src])

  return (
    <Image
      src={error ? fallback : assetUrl}
      alt={alt || ""}
      width={width}
      height={height}
      quality={quality}
      loading={lazyLoad ? "lazy" : "eager"}
      sizes={sizes}
      onError={() => setError(true)}
      {...props}
    />
  )
}
