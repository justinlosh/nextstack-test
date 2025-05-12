import type { ApiClient } from "./api-client"
import type { Form, FormSubmission } from "./types"

export class FormsClient {
  private apiClient: ApiClient
  private basePath = "forms"

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }

  async getForms(): Promise<Form[]> {
    try {
      const forms = await this.apiClient.get<string[]>(this.basePath)

      // Map file names to Form objects
      const formPromises = forms
        .filter((form) => !form.startsWith(".")) // Filter out hidden files
        .map(async (formName) => {
          const formData = await this.getForm(formName.replace(/\.(json|md)$/, ""))
          return formData
        })

      return await Promise.all(formPromises)
    } catch (error) {
      console.error("Error fetching forms:", error)
      return []
    }
  }

  async getForm(id: string): Promise<Form> {
    try {
      const form = await this.apiClient.get<Form>(`${this.basePath}/${id}`)
      return {
        id,
        ...form,
      }
    } catch (error) {
      console.error(`Error fetching form ${id}:`, error)
      throw error
    }
  }

  async createForm(form: Omit<Form, "id">): Promise<Form> {
    const id = form.slug || Date.now().toString()
    try {
      const createdForm = await this.apiClient.post<Form>(`${this.basePath}/${id}`, form)
      return {
        id,
        ...createdForm,
      }
    } catch (error) {
      console.error("Error creating form:", error)
      throw error
    }
  }

  async updateForm(id: string, form: Partial<Form>): Promise<Form> {
    try {
      // First get the existing form
      const existingForm = await this.getForm(id)

      // Merge with updates
      const updatedForm = {
        ...existingForm,
        ...form,
      }

      // Save the updated form
      await this.apiClient.put<Form>(`${this.basePath}/${id}`, updatedForm)

      return updatedForm
    } catch (error) {
      console.error(`Error updating form ${id}:`, error)
      throw error
    }
  }

  async deleteForm(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`${this.basePath}/${id}`)
    } catch (error) {
      console.error(`Error deleting form ${id}:`, error)
      throw error
    }
  }

  async getSubmissions(formId: string): Promise<FormSubmission[]> {
    try {
      const submissions = await this.apiClient.get<string[]>(`${this.basePath}/${formId}/submissions`)

      // Map file names to FormSubmission objects
      const submissionPromises = submissions
        .filter((submission) => !submission.startsWith(".")) // Filter out hidden files
        .map(async (submissionName) => {
          const submissionData = await this.getSubmission(formId, submissionName.replace(/\.(json|md)$/, ""))
          return submissionData
        })

      return await Promise.all(submissionPromises)
    } catch (error) {
      console.error(`Error fetching submissions for form ${formId}:`, error)
      return []
    }
  }

  async getSubmission(formId: string, submissionId: string): Promise<FormSubmission> {
    try {
      const submission = await this.apiClient.get<FormSubmission>(
        `${this.basePath}/${formId}/submissions/${submissionId}`,
      )
      return {
        id: submissionId,
        ...submission,
      }
    } catch (error) {
      console.error(`Error fetching submission ${submissionId} for form ${formId}:`, error)
      throw error
    }
  }

  async createSubmission(formId: string, submission: Omit<FormSubmission, "id">): Promise<FormSubmission> {
    const id = Date.now().toString()
    try {
      const createdSubmission = await this.apiClient.post<FormSubmission>(
        `${this.basePath}/${formId}/submissions/${id}`,
        submission,
      )
      return {
        id,
        ...createdSubmission,
      }
    } catch (error) {
      console.error(`Error creating submission for form ${formId}:`, error)
      throw error
    }
  }

  async deleteSubmission(formId: string, submissionId: string): Promise<void> {
    try {
      await this.apiClient.delete(`${this.basePath}/${formId}/submissions/${submissionId}`)
    } catch (error) {
      console.error(`Error deleting submission ${submissionId} for form ${formId}:`, error)
      throw error
    }
  }
}
