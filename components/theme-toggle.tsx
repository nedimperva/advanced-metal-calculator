"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Parse current theme - format: "mode-colorTheme" or just "mode"
  const parseTheme = (currentTheme: string | undefined) => {
    if (!currentTheme) return { mode: 'system', colorTheme: 'default' }
    
    const parts = currentTheme.split('-')
    if (parts.length === 1) {
      // Legacy theme format or just mode
      if (['light', 'dark', 'system'].includes(parts[0])) {
        return { mode: parts[0], colorTheme: 'default' }
      } else {
        // Legacy color theme, assume light mode
        return { mode: 'light', colorTheme: parts[0] }
      }
    }
    
    return { mode: parts[0], colorTheme: parts[1] || 'default' }
  }

  const { mode, colorTheme } = parseTheme(theme)

  const setModeAndTheme = (newMode: string, newColorTheme: string = colorTheme) => {
    const themeString = newColorTheme === 'default' ? newMode : `${newMode}-${newColorTheme}`
    setTheme(themeString)
  }

  const getThemeIcon = () => {
    const effectiveMode = mode === 'system' ? (systemTheme || 'light') : mode
    switch (effectiveMode) {
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Sun className="h-4 w-4" />
    }
  }

  const getModeLabel = () => {
    switch (mode) {
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'Light'
    }
  }

  const getColorThemeLabel = () => {
    switch (colorTheme) {
      case 'blue':
        return 'Professional Blue'
      case 'green':
        return 'Engineering Green'
      case 'purple':
        return 'Modern Purple'
      default:
        return 'Default'
    }
  }

  const colorThemes = [
    { value: 'default', label: 'Default', color: 'hsl(213, 94%, 55%)' },
    { value: 'blue', label: 'Professional Blue', color: 'hsl(205, 100%, 42%)' },
    { value: 'green', label: 'Engineering Green', color: 'hsl(142, 76%, 36%)' },
    { value: 'purple', label: 'Modern Purple', color: 'hsl(262, 83%, 58%)' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 h-9">
          {getThemeIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Mode: {getModeLabel()} • Theme: {getColorThemeLabel()}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-medium">Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setModeAndTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {mode === 'light' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setModeAndTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {mode === 'dark' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setModeAndTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {mode === 'system' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium">Color Theme</DropdownMenuLabel>
        
        {colorThemes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => setModeAndTheme(mode, themeOption.value)}
          >
            <div 
              className="mr-2 h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: themeOption.color }}
            />
            <span>{themeOption.label}</span>
            {colorTheme === themeOption.value && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
