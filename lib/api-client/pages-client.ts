import type { ApiClient } from "./api-client"
import type { Page } from "./types"

export class PagesClient {
  private apiClient: ApiClient
  private basePath = "pages"

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  async getPages(): Promise<Page[]> {
    try {
      const pages = await this.apiClient.get<string[]>(this.basePath)

      // Map file names to Page objects
      const pagePromises = pages
        .filter((page) => !page.startsWith(".")) // Filter out hidden files
        .map(async (pageName) => {
          const pageData = await this.getPage(pageName.replace(/\.(json|md)$/, ""))
          return pageData
        })

      return await Promise.all(pagePromises)
    } catch (error) {
      console.error("Error fetching pages:", error)
      return []
    }
  }

  async getPage(id: string): Promise<Page> {
    try {
      const page = await this.apiClient.get<Page>(`${this.basePath}/${id}`)
      return {
        id,
        ...page,
      }
    } catch (error) {
      console.error(`Error fetching page ${id}:`, error)
      throw error
    }
  }

  async createPage(page: Omit<Page, "id">): Promise<Page> {
    const id = page.slug || Date.now().toString()
    try {
      const createdPage = await this.apiClient.post<Page>(`${this.basePath}/${id}`, page)
      return {
        id,
        ...createdPage,
      }
    } catch (error) {
      console.error("Error creating page:", error)
      throw error
    }
  }

  async updatePage(id: string, page: Partial<Page>): Promise<Page> {
    try {
      // First get the existing page
      const existingPage = await this.getPage(id)

      // Merge with updates
      const updatedPage = {
        ...existingPage,
        ...page,
      }

      // Save the updated page
      await this.apiClient.put<Page>(`${this.basePath}/${id}`, updatedPage)

      return updatedPage
    } catch (error) {
      console.error(`Error updating page ${id}:`, error)
      throw error
    }
  }

  async deletePage(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`${this.basePath}/${id}`)
    } catch (error) {
      console.error(`Error deleting page ${id}:`, error)
      throw error
    }
  }
}
