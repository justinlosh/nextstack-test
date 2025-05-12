"use client"

import { useContentList, type UseContentListOptions, type UseContentListResult } from "./use-content-list"
import type { Post } from "../content-types/post"

/**
 * Hook for fetching a list of posts from the CMS API
 * @param options Hook options
 * @returns Hook result
 */
export function usePostList(options: UseContentListOptions = {}): UseContentListResult<Post> {
  return useContentList<Post>("post", options)
}
