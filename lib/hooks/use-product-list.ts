"use client"

import { useContentList, type UseContentListOptions, type UseContentListResult } from "./use-content-list"
import type { Product } from "../content-types/product"

/**
 * Hook for fetching a list of products from the CMS API
 * @param options Hook options
 * @returns Hook result
 */
export function useProductList(options: UseContentListOptions = {}): UseContentListResult<Product> {
  return useContentList<Product>("product", options)
}
