import { renderUI } from "./ui"
import { setupEventListeners } from "./events"
import { loadData } from "./data"

export async function initApp() {
  try {
    // Load initial data
    const data = await loadData()

    // Render the UI with the data
    renderUI(data)

    // Set up event listeners
    setupEventListeners()

    console.log("Application initialized successfully")
  } catch (error) {
    console.error("Failed to initialize application:", error)
  }
}
