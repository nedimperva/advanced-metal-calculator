"use client"

import * as React from "react"
import { Moon, Sun, Palette, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { customThemes } from "@/components/theme-provider"
import { animations, safeAnimation } from "@/lib/animations"

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="animate-pulse">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return <Sun className="h-[1.1rem] w-[1.1rem]" />
      case 'dark':
        return <Moon className="h-[1.1rem] w-[1.1rem]" />
      case 'system':
        return <Monitor className="h-[1.1rem] w-[1.1rem]" />
      default:
        return <Palette className="h-[1.1rem] w-[1.1rem]" />
    }
  }

  const getThemeLabel = (themeName: string) => {
    if (themeName === 'system') return 'System'
    if (themeName === 'light') return 'Light'
    if (themeName === 'dark') return 'Dark'
    
    const customTheme = customThemes[themeName as keyof typeof customThemes]
    return customTheme?.name || themeName.charAt(0).toUpperCase() + themeName.slice(1)
  }

  const getCurrentIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-[1.2rem] w-[1.2rem] transition-transform duration-200" />
    }
    if (theme === 'dark') {
      return <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-200" />
    }
    if (theme === 'light') {
      return <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-200" />
    }
    return <Palette className="h-[1.2rem] w-[1.2rem] transition-transform duration-200" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={safeAnimation("hover:scale-105 transition-all duration-200 hover:shadow-md")}
        >
          {getCurrentIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={safeAnimation(animations.fadeIn)}
      >
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Choose Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* System and basic themes */}
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`transition-all duration-200 ${theme === 'system' ? 'bg-accent' : ''}`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === 'system' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`transition-all duration-200 ${theme === 'light' ? 'bg-accent' : ''}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`transition-all duration-200 ${theme === 'dark' ? 'bg-accent' : ''}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Custom Themes
        </DropdownMenuLabel>

        {/* Custom themes */}
        {Object.keys(customThemes).map((themeName) => {
          if (themeName === 'light' || themeName === 'dark') return null
          
          return (
            <DropdownMenuItem
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={`transition-all duration-200 ${theme === themeName ? 'bg-accent' : ''}`}
            >
              <div className="mr-2 h-4 w-4 flex items-center justify-center">
                <div 
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ 
                    backgroundColor: customThemes[themeName as keyof typeof customThemes].primary 
                  }}
                />
              </div>
              <span>{getThemeLabel(themeName)}</span>
              {theme === themeName && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
