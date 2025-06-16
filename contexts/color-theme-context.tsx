"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

  // Load saved color theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('metal-calculator-color-theme') as ColorTheme
    if (savedTheme && COLOR_THEMES[savedTheme]) {
      setColorThemeState(savedTheme)
      applyColorTheme(savedTheme)
    } else {
      // Apply default theme
      applyColorTheme(DEFAULT_COLOR_THEME)
    }
  }, [])

  const setColorTheme = (newTheme: ColorTheme) => {
    setColorThemeState(newTheme)
    localStorage.setItem('metal-calculator-color-theme', newTheme)
    applyColorTheme(newTheme)
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