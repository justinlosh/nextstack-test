/**
 * Generate a random session ID
 * @returns Random session ID
 */
export function generateSessionId(): string {
  return `session_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`
}

/**
 * Get the current session ID from localStorage or generate a new one
 * @param key localStorage key
 * @returns Session ID
 */
export function getOrCreateSessionId(key = "preview_session_id"): string {
  if (typeof window === "undefined") {
    return generateSessionId()
  }

  let sessionId = localStorage.getItem(key)
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem(key, sessionId)
  }
  return sessionId
}
