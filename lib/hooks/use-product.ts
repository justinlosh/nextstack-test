"use client"

import { useContent, type UseContentOptions, type UseContentResult } from "./use-content"
import type { Product } from "../content-types/product"

/**
 * Hook for fetching a product from the CMS API
 * @param productId Product ID to fetch
 * @param options Hook options
 * @returns Hook result
 */
export function useProduct(productId: string, options: UseContentOptions = {}): UseContentResult<Product> {
  return useContent<Product>("product", productId, options)
}
