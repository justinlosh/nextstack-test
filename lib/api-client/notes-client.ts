import type { ApiClient } from "./api-client"
import type { Note } from "./types"

export class NotesClient {
  private apiClient: ApiClient
  private basePath = "notes"

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  async getNotes(): Promise<Note[]> {
    try {
      const notes = await this.apiClient.get<string[]>(this.basePath)

      // Map file names to Note objects
      const notePromises = notes
        .filter((note) => !note.startsWith(".")) // Filter out hidden files
        .map(async (noteName) => {
          const noteData = await this.getNote(noteName.replace(/\.(json|md)$/, ""))
          return noteData
        })

      return await Promise.all(notePromises)
    } catch (error) {
      console.error("Error fetching notes:", error)
      return []
    }
  }

  async getNote(id: string): Promise<Note> {
    try {
      const note = await this.apiClient.get<Note>(`${this.basePath}/${id}`)
      return {
        id,
        ...note,
      }
    } catch (error) {
      console.error(`Error fetching note ${id}:`, error)
      throw error
    }
  }

  async createNote(note: Omit<Note, "id">): Promise<Note> {
    const id = note.slug || Date.now().toString()
    try {
      const createdNote = await this.apiClient.post<Note>(`${this.basePath}/${id}`, note)
      return {
        id,
        ...createdNote,
      }
    } catch (error) {
      console.error("Error creating note:", error)
      throw error
    }
  }

  async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    try {
      // First get the existing note
      const existingNote = await this.getNote(id)

      // Merge with updates
      const updatedNote = {
        ...existingNote,
        ...note,
      }

      // Save the updated note
      await this.apiClient.put<Note>(`${this.basePath}/${id}`, updatedNote)

      return updatedNote
    } catch (error) {
      console.error(`Error updating note ${id}:`, error)
      throw error
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`${this.basePath}/${id}`)
    } catch (error) {
      console.error(`Error deleting note ${id}:`, error)
      throw error
    }
  }
}
