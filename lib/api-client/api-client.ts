import { readFile, writeFile, readDirectory, fileExists, createDirectory } from "../cms"

export class ApiClient {
  private baseUrl: string | null = null

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl
    }
  }

  async get<T>(path: string): Promise<T> {
    // If we have a base URL, make an API request
    if (this.baseUrl) {
      const response = await fetch(`${this.baseUrl}${path}`)
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }
      return response.json()
    }

    // Otherwise, read directly from the file system
    try {
      // Remove leading slash if present
      const filePath = path.startsWith("/") ? path.substring(1) : path

      // Determine if we're reading a directory or a file
      if (filePath.endsWith("/") || filePath === "") {
        const items = await readDirectory(filePath)
        return items as unknown as T
      } else {
        // Check if file exists with .json extension
        const jsonPath = `${filePath}.json`
        if (await fileExists(jsonPath)) {
          const content = await readFile(jsonPath)
          return JSON.parse(content) as T
        }

        // Check if file exists with .md extension
        const mdPath = `${filePath}.md`
        if (await fileExists(mdPath)) {
          const content = await readFile(mdPath)
          return { content } as unknown as T
        }

        throw new Error(`File not found: ${filePath}`)
      }
    } catch (error) {
      console.error(`Error reading file: ${path}`, error)
      throw error
    }
  }

  async post<T>(path: string, data: any): Promise<T> {
    // If we have a base URL, make an API request
    if (this.baseUrl) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      return response.json()
    }

    // Otherwise, write directly to the file system
    try {
      // Remove leading slash if present
      const filePath = path.startsWith("/") ? path.substring(1) : path

      // Ensure directory exists
      const directoryPath = filePath.split("/").slice(0, -1).join("/")
      if (directoryPath) {
        await createDirectory(directoryPath)
      }

      // Determine file extension based on data
      const isMarkdown =
        typeof data === "string" || (data && typeof data.content === "string" && Object.keys(data).length === 1)
      const fileExtension = isMarkdown ? ".md" : ".json"
      const fullPath = `${filePath}${fileExtension}`

      // Write the content
      const content = isMarkdown ? (typeof data === "string" ? data : data.content) : JSON.stringify(data, null, 2)
      await writeFile(fullPath, content)

      return data as T
    } catch (error) {
      console.error(`Error writing file: ${path}`, error)
      throw error
    }
  }

  async put<T>(path: string, data: any): Promise<T> {
    return this.post<T>(path, data)
  }

  async delete(path: string): Promise<void> {
    // If we have a base URL, make an API request
    if (this.baseUrl) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      return
    }

    // Otherwise, delete directly from the file system
    try {
      // Remove leading slash if present
      const filePath = path.startsWith("/") ? path.substring(1) : path

      // Check if file exists with .json extension
      const jsonPath = `${filePath}.json`
      if (await fileExists(jsonPath)) {
        await Deno.remove(jsonPath)
        return
      }

      // Check if file exists with .md extension
      const mdPath = `${filePath}.md`
      if (await fileExists(mdPath)) {
        await Deno.remove(mdPath)
        return
      }

      throw new Error(`File not found: ${filePath}`)
    } catch (error) {
      console.error(`Error deleting file: ${path}`, error)
      throw error
    }
  }
}

// Create a singleton instance for client-side use
export const apiClient = new ApiClient()

// Export a function to create a new instance with a custom base URL
export function createApiClient(baseUrl?: string): ApiClient {
  return new ApiClient(baseUrl)
}
