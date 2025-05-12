import fs from "fs/promises"
import path from "path"

// Base content directory
const CONTENT_DIR = "content"

// Ensure content directory exists
export async function ensureContentDirectory(): Promise<void> {
  try {
    await fs.mkdir(CONTENT_DIR, { recursive: true })
  } catch (error) {
    console.error("Error creating content directory:", error)
  }
}

// Check if a file exists
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(CONTENT_DIR, filePath)
    await fs.access(fullPath)
    return true
  } catch {
    return false
  }
}

// Create a directory
export async function createDirectory(dirPath: string): Promise<void> {
  try {
    const fullPath = path.join(CONTENT_DIR, dirPath)
    await fs.mkdir(fullPath, { recursive: true })
  } catch (error) {
    console.error(`Error creating directory: ${dirPath}`, error)
    throw error
  }
}

// Read a file
export async function readFile(filePath: string): Promise<string> {
  try {
    const fullPath = path.join(CONTENT_DIR, filePath)
    return await fs.readFile(fullPath, "utf-8")
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error)
    throw error
  }
}

// Write a file
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    const fullPath = path.join(CONTENT_DIR, filePath)

    // Ensure directory exists
    const dirPath = path.dirname(fullPath)
    await fs.mkdir(dirPath, { recursive: true })

    await fs.writeFile(fullPath, content)
  } catch (error) {
    console.error(`Error writing file: ${filePath}`, error)
    throw error
  }
}

// Delete a file
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(CONTENT_DIR, filePath)
    await fs.unlink(fullPath)
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error)
    throw error
  }
}

// Read a directory
export async function readDirectory(dirPath: string): Promise<string[]> {
  try {
    const fullPath = path.join(CONTENT_DIR, dirPath)

    // Create directory if it doesn't exist
    await fs.mkdir(fullPath, { recursive: true })

    const files = await fs.readdir(fullPath)
    return files
  } catch (error) {
    console.error(`Error reading directory: ${dirPath}`, error)
    throw error
  }
}

// Initialize the CMS
export async function initCMS(): Promise<void> {
  await ensureContentDirectory()
}

// Call initCMS when this module is imported
initCMS().catch(console.error)
