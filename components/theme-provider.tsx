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
  blue: {
    name: "Professional Blue",
    primary: "hsl(205, 100%, 42%)",
    primaryForeground: "hsl(210, 40%, 98%)",
    secondary: "hsl(205, 20%, 94%)",
    accent: "hsl(205, 20%, 90%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(205, 30%, 15%)",
    muted: "hsl(205, 20%, 96%)",
    border: "hsl(205, 20%, 88%)",
  },
  green: {
    name: "Engineering Green",
    primary: "hsl(142, 76%, 36%)",
    primaryForeground: "hsl(355.7, 100%, 97.3%)",
    secondary: "hsl(142, 20%, 94%)",
    accent: "hsl(142, 20%, 90%)",
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(142, 30%, 15%)",
    muted: "hsl(142, 20%, 96%)",
    border: "hsl(142, 20%, 88%)",
  },
  purple: {
    name: "Modern Purple",
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
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      themes={["light", "dark", "blue", "green", "purple"]}
      {...props}
    >
      <ThemeCustomizer />
      {children}
    </NextThemesProvider>
  )
}

// Simplified theme provider without complex customizer
function ThemeCustomizer() {
  return null // Theme styles are now handled in globals.css
}
