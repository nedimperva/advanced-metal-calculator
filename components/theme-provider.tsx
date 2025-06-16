"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

// Custom theme configurations
export const customThemes = {
  light: {
    name: "Light",
    primary: "hsl(213, 94%, 55%)",
    primaryForeground: "hsl(210, 40%, 98%)",
    secondary: "hsl(210, 40%, 96%)",
    accent: "hsl(210, 40%, 95%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(222.2, 84%, 4.9%)",
    muted: "hsl(210, 40%, 98%)",
    border: "hsl(214.3, 31.8%, 91.4%)",
  },
  dark: {
    name: "Dark",
    primary: "hsl(213, 94%, 55%)",
    primaryForeground: "hsl(222.2, 84%, 4.9%)",
    secondary: "hsl(217.2, 32.6%, 17.5%)",
    accent: "hsl(217.2, 32.6%, 17.5%)",
    background: "hsl(222.2, 84%, 4.9%)",
    foreground: "hsl(210, 40%, 98%)",
    muted: "hsl(217.2, 32.6%, 17.5%)",
    border: "hsl(217.2, 32.6%, 17.5%)",
  },
  // Light color themes
  "light-blue": {
    name: "Professional Blue Light",
    primary: "hsl(205, 100%, 42%)",
    primaryForeground: "hsl(210, 40%, 98%)",
    secondary: "hsl(205, 20%, 94%)",
    accent: "hsl(205, 20%, 90%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(205, 30%, 15%)",
    muted: "hsl(205, 20%, 96%)",
    border: "hsl(205, 20%, 88%)",
  },
  "light-green": {
    name: "Engineering Green Light",
    primary: "hsl(142, 76%, 36%)",
    primaryForeground: "hsl(355.7, 100%, 97.3%)",
    secondary: "hsl(142, 20%, 94%)",
    accent: "hsl(142, 20%, 90%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(142, 30%, 15%)",
    muted: "hsl(142, 20%, 96%)",
    border: "hsl(142, 20%, 88%)",
  },
  "light-purple": {
    name: "Modern Purple Light",
    primary: "hsl(262, 83%, 58%)",
    primaryForeground: "hsl(210, 40%, 98%)",
    secondary: "hsl(262, 20%, 94%)",
    accent: "hsl(262, 20%, 90%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(262, 30%, 15%)",
    muted: "hsl(262, 20%, 96%)",
    border: "hsl(262, 20%, 88%)",
  },
  // Dark color themes
  "dark-blue": {
    name: "Professional Blue Dark",
    primary: "hsl(205, 100%, 55%)",
    primaryForeground: "hsl(205, 30%, 8%)",
    secondary: "hsl(205, 30%, 15%)",
    accent: "hsl(205, 30%, 18%)",
    background: "hsl(205, 30%, 8%)",
    foreground: "hsl(205, 20%, 95%)",
    muted: "hsl(205, 30%, 15%)",
    border: "hsl(205, 30%, 18%)",
  },
  "dark-green": {
    name: "Engineering Green Dark",
    primary: "hsl(142, 76%, 45%)",
    primaryForeground: "hsl(142, 30%, 8%)",
    secondary: "hsl(142, 30%, 15%)",
    accent: "hsl(142, 30%, 18%)",
    background: "hsl(142, 30%, 8%)",
    foreground: "hsl(142, 20%, 95%)",
    muted: "hsl(142, 30%, 15%)",
    border: "hsl(142, 30%, 18%)",
  },
  "dark-purple": {
    name: "Modern Purple Dark",
    primary: "hsl(262, 83%, 65%)",
    primaryForeground: "hsl(262, 30%, 8%)",
    secondary: "hsl(262, 30%, 15%)",
    accent: "hsl(262, 30%, 18%)",
    background: "hsl(262, 30%, 8%)",
    foreground: "hsl(262, 20%, 95%)",
    muted: "hsl(262, 30%, 15%)",
    border: "hsl(262, 30%, 18%)",
  },
  // System themes (will inherit from light/dark based on system preference)
  "system": {
    name: "System",
    primary: "hsl(213, 94%, 55%)",
    primaryForeground: "hsl(210, 40%, 98%)",
    secondary: "hsl(210, 40%, 96%)",
    accent: "hsl(210, 40%, 95%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(222.2, 84%, 4.9%)",
    muted: "hsl(210, 40%, 98%)",
    border: "hsl(214.3, 31.8%, 91.4%)",
  },
  "system-blue": {
    name: "Professional Blue System",
    primary: "hsl(205, 100%, 42%)",
    primaryForeground: "hsl(210, 40%, 98%)",
    secondary: "hsl(205, 20%, 94%)",
    accent: "hsl(205, 20%, 90%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(205, 30%, 15%)",
    muted: "hsl(205, 20%, 96%)",
    border: "hsl(205, 20%, 88%)",
  },
  "system-green": {
    name: "Engineering Green System",
    primary: "hsl(142, 76%, 36%)",
    primaryForeground: "hsl(355.7, 100%, 97.3%)",
    secondary: "hsl(142, 20%, 94%)",
    accent: "hsl(142, 20%, 90%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(142, 30%, 15%)",
    muted: "hsl(142, 20%, 96%)",
    border: "hsl(142, 20%, 88%)",
  },
  "system-purple": {
    name: "Modern Purple System",
    primary: "hsl(262, 83%, 58%)",
    primaryForeground: "hsl(210, 40%, 98%)",
    secondary: "hsl(262, 20%, 94%)",
    accent: "hsl(262, 20%, 90%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(262, 30%, 15%)",
    muted: "hsl(262, 20%, 96%)",
    border: "hsl(262, 20%, 88%)",
  }
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Generate all possible theme combinations
  const allThemes = Object.keys(customThemes)

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange
      themes={allThemes}
      storageKey="metal-calculator-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

// Simplified theme provider without complex customizer
function ThemeCustomizer() {
  return null // Theme styles are now handled in globals.css
}
