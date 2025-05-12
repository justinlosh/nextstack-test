"use client"

import { useContent, type UseContentOptions, type UseContentResult } from "./use-content"
import type { Page } from "../content-types/page"

/**
 * Hook for fetching a page from the CMS API
 * @param pageId Page ID to fetch
 * @param options Hook options
 * @returns Hook result
 */
export function usePage(pageId: string, options: UseContentOptions = {}): UseContentResult<Page> {
  return useContent<Page>("page", pageId, options)
}
