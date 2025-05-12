"use client"

import { useContentList, type UseContentListOptions, type UseContentListResult } from "./use-content-list"
import type { Page } from "../content-types/page"

/**
 * Hook for fetching a list of pages from the CMS API
 * @param options Hook options
 * @returns Hook result
 */
export function usePageList(options: UseContentListOptions = {}): UseContentListResult<Page> {
  return useContentList<Page>("page", options)
}
