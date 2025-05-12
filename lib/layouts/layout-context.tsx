"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { LayoutContextType, LayoutTemplate, PageLayoutConfig } from "./types"

// Create the layout context
const LayoutContext = createContext<LayoutContextType>({
  isLoading: false,
  error: null,
})

// Layout provider props
interface LayoutProviderProps {
  children: React.ReactNode
  initialTemplate?: LayoutTemplate
  initialPage?: PageLayoutConfig
}

// Layout provider component
export function LayoutProvider({ children, initialTemplate, initialPage }: LayoutProviderProps) {
  const [currentTemplate, setCurrentTemplate] = useState<LayoutTemplate | undefined>(initialTemplate)
  const [currentPage, setCurrentPage] = useState<PageLayoutConfig | undefined>(initialPage)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  // Context value
  const contextValue: LayoutContextType = {
    currentTemplate,
    currentPage,
    isLoading,
    error,
  }

  return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>
}

// Hook to use the layout context
export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
}
