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

// Component to apply custom CSS variables based on theme
function ThemeCustomizer() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    const applyTheme = (themeName: string) => {
      const theme = customThemes[themeName as keyof typeof customThemes]
      if (!theme) return

      const root = document.documentElement
      Object.entries(theme).forEach(([key, value]) => {
        if (key !== 'name') {
          root.style.setProperty(`--theme-${key}`, value)
        }
      })
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const classList = (mutation.target as HTMLElement).classList
          const currentTheme = Array.from(classList).find(cls => 
            Object.keys(customThemes).includes(cls)
          )
          if (currentTheme) {
            applyTheme(currentTheme)
          }
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [mounted])

  if (!mounted) return null

  return (
    <style jsx global>{`
      :root {
        --animation-duration-fast: 150ms;
        --animation-duration-normal: 200ms;
        --animation-duration-slow: 300ms;
        --animation-ease: cubic-bezier(0.4, 0, 0.2, 1);
        --animation-ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        
        /* Enhanced shadow system */
        --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        
        /* Gradient backgrounds */
        --gradient-primary: linear-gradient(135deg, hsl(213, 94%, 55%) 0%, hsl(213, 94%, 45%) 100%);
        --gradient-secondary: linear-gradient(135deg, hsl(210, 40%, 96%) 0%, hsl(210, 40%, 92%) 100%);
        
        /* Enhanced border radius system */
        --radius-sm: 4px;
        --radius: 6px;
        --radius-md: 8px;
        --radius-lg: 12px;
        --radius-xl: 16px;
      }

      /* Smooth transitions for theme changes */
      * {
        transition-property: background-color, border-color, color, fill, stroke, box-shadow;
        transition-duration: var(--animation-duration-normal);
        transition-timing-function: var(--animation-ease);
      }

      /* Enhanced focus styles */
      *:focus-visible {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
        transition: outline-offset var(--animation-duration-fast) var(--animation-ease);
      }

      /* Improved scrollbar styling */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      ::-webkit-scrollbar-track {
        background: hsl(var(--muted));
        border-radius: var(--radius);
      }

      ::-webkit-scrollbar-thumb {
        background: hsl(var(--muted-foreground) / 0.3);
        border-radius: var(--radius);
        transition: background-color var(--animation-duration-normal);
      }

      ::-webkit-scrollbar-thumb:hover {
        background: hsl(var(--muted-foreground) / 0.5);
      }

      /* Selection styling */
      ::selection {
        background: hsl(var(--primary) / 0.2);
        color: hsl(var(--primary-foreground));
      }

      /* Enhanced animations */
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }

      .animate-shimmer {
        background: linear-gradient(90deg, transparent, hsl(var(--muted)) 50%, transparent);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }

      /* Reduced motion preferences */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  )
}
