/**
 * Parse frontmatter from Markdown content
 * @param content Markdown content with frontmatter
 * @returns Object containing frontmatter and content
 */
export function parseFrontmatter<T>(content: string): { frontmatter: T; content: string } {
  // Check if the content has frontmatter (starts with ---)
  if (!content.startsWith("---")) {
    return {
      frontmatter: {} as T,
      content,
    }
  }

  // Find the end of the frontmatter
  const endOfFrontmatter = content.indexOf("---", 3)
  if (endOfFrontmatter === -1) {
    return {
      frontmatter: {} as T,
      content,
    }
  }

  // Extract the frontmatter and content
  const frontmatterStr = content.substring(3, endOfFrontmatter).trim()
  const remainingContent = content.substring(endOfFrontmatter + 3).trim()

  // Parse the frontmatter
  const frontmatter: Record<string, any> = {}
  frontmatterStr.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":")
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim()
      let value = line.substring(colonIndex + 1).trim()

      // Handle arrays
      if (value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value)
        } catch (error) {
          // If parsing fails, keep the original string
          value = value
            .substring(1, value.length - 1)
            .split(",")
            .map((item) => item.trim())
        }
      }
      // Handle booleans
      else if (value === "true" || value === "false") {
        value = value === "true"
      }
      // Handle numbers
      else if (!isNaN(Number(value)) && value !== "") {
        value = Number(value)
      }

      frontmatter[key] = value
    }
  })

  return {
    frontmatter: frontmatter as T,
    content: remainingContent,
  }
}

/**
 * Generate frontmatter from an object
 * @param data Object to convert to frontmatter
 * @returns Frontmatter string
 */
export function generateFrontmatter(data: Record<string, any>): string {
  const frontmatter = Object.entries(data)
    .map(([key, value]) => {
      // Skip content field
      if (key === "content") {
        return null
      }

      // Format the value based on its type
      let formattedValue: string
      if (Array.isArray(value)) {
        formattedValue = JSON.stringify(value)
      } else if (typeof value === "object" && value !== null) {
        formattedValue = JSON.stringify(value)
      } else {
        formattedValue = String(value)
      }

      return `${key}: ${formattedValue}`
    })
    .filter(Boolean)
    .join("\n")

  return `---\n${frontmatter}\n---\n\n`
}
