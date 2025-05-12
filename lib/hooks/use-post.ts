"use client"

import { useContent, type UseContentOptions, type UseContentResult } from "./use-content"
import type { Post } from "../content-types/post"

/**
 * Hook for fetching a post from the CMS API
 * @param postId Post ID to fetch
 * @param options Hook options
 * @returns Hook result
 */
export function usePost(postId: string, options: UseContentOptions = {}): UseContentResult<Post> {
  return useContent<Post>("post", postId, options)
}
