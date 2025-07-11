"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { ColorTheme, COLOR_THEMES, DEFAULT_COLOR_THEME, applyColorTheme } from '@/lib/color-themes'

interface ColorThemeContextType {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  availableThemes: Array<{
    value: ColorTheme
    name: string
    description: string
  }>
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined)

interface ColorThemeProviderProps {
  children: ReactNode
}

export function ColorThemeProvider({ children }: ColorThemeProviderProps) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(DEFAULT_COLOR_THEME)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Track mount state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load saved color theme preference on mount
  useEffect(() => {
    if (!mounted) return

    const savedTheme = localStorage.getItem('metal-calculator-color-theme') as ColorTheme
    if (savedTheme && COLOR_THEMES[savedTheme]) {
      setColorThemeState(savedTheme)
    }
  }, [mounted])

  // Apply color theme whenever the color theme or light/dark mode changes
  useEffect(() => {
    if (!mounted) return

    // Determine the current mode
    const currentMode = resolvedTheme === 'dark' ? 'dark' : 'light'
    
    // Apply the color theme with the current mode
    applyColorTheme(colorTheme, currentMode)
  }, [mounted, colorTheme, resolvedTheme, theme])

  const setColorTheme = (newTheme: ColorTheme) => {
    setColorThemeState(newTheme)
    localStorage.setItem('metal-calculator-color-theme', newTheme)
    
    // Apply immediately if mounted
    if (mounted) {
      const currentMode = resolvedTheme === 'dark' ? 'dark' : 'light'
      applyColorTheme(newTheme, currentMode)
    }
  }

  const availableThemes = Object.entries(COLOR_THEMES).map(([key, config]) => ({
    value: key as ColorTheme,
    name: config.name,
    description: config.description
  }))

  const value: ColorThemeContextType = {
    colorTheme,
    setColorTheme,
    availableThemes
  }

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  )
}

export function useColorTheme(): ColorThemeContextType {
  const context = useContext(ColorThemeContext)
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider')
  }
  return context
} 