export type ColorTheme = 'professional-blue' | 'engineering-green' | 'industrial-orange' | 'structural-gray' | 'copper-bronze'

export interface ColorThemeConfig {
  name: string
  description: string
  light: {
    primary: string
    primaryForeground: string
    secondary: string
    accent: string
    destructive: string
    muted: string
    border: string
    input: string
    ring: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    mutedForeground: string
    secondaryForeground: string
    accentForeground: string
    destructiveForeground: string
  }
  dark: {
    primary: string
    primaryForeground: string
    secondary: string
    accent: string
    destructive: string
    muted: string
    border: string
    input: string
    ring: string
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    mutedForeground: string
    secondaryForeground: string
    accentForeground: string
    destructiveForeground: string
  }
}

export const COLOR_THEMES: Record<ColorTheme, ColorThemeConfig> = {
  'professional-blue': {
    name: 'Professional Blue',
    description: 'Clean and professional blue scheme for engineering applications',
    light: {
      primary: '209 142% 47%',           // Professional blue
      primaryForeground: '0 0% 98%',
      secondary: '210 40% 92%',          // Light blue-gray
      accent: '213 100% 96%',            // Very light blue
      destructive: '0 84% 60%',
      muted: '210 40% 96%',
      border: '214 32% 91%',
      input: '214 32% 91%',
      ring: '209 142% 47%',
      background: '0 0% 100%',
      foreground: '222 84% 5%',
      card: '0 0% 100%',
      cardForeground: '222 84% 5%',
      popover: '0 0% 100%',
      popoverForeground: '222 84% 5%',
      mutedForeground: '215 16% 47%',
      secondaryForeground: '215 25% 27%',
      accentForeground: '215 25% 27%',
      destructiveForeground: '0 0% 98%'
    },
    dark: {
      primary: '209 142% 55%',           // Brighter blue for dark mode
      primaryForeground: '209 30% 8%',
      secondary: '209 30% 15%',          // Dark blue-gray
      accent: '209 30% 18%',             // Darker blue accent
      destructive: '0 62.8% 30.6%',
      muted: '209 30% 15%',
      border: '209 30% 18%',
      input: '209 30% 18%',
      ring: '209 142% 55%',
      background: '209 30% 8%',
      foreground: '209 20% 95%',
      card: '209 30% 8%',
      cardForeground: '209 20% 95%',
      popover: '209 30% 8%',
      popoverForeground: '209 20% 95%',
      mutedForeground: '209 20% 70%',
      secondaryForeground: '209 20% 95%',
      accentForeground: '209 20% 95%',
      destructiveForeground: '210 40% 98%'
    }
  },
  
  'engineering-green': {
    name: 'Engineering Green',
    description: 'Fresh green scheme inspired by structural engineering',
    light: {
      primary: '142 76% 36%',            // Engineering green
      primaryForeground: '355 100% 97%',
      secondary: '138 76% 90%',          // Light green
      accent: '139 76% 94%',             // Very light green
      destructive: '0 84% 60%',
      muted: '138 76% 96%',
      border: '143 32% 88%',
      input: '143 32% 88%',
      ring: '142 76% 36%',
      background: '0 0% 100%',
      foreground: '240 10% 4%',
      card: '0 0% 100%',
      cardForeground: '240 10% 4%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 4%',
      mutedForeground: '240 4% 46%',
      secondaryForeground: '240 6% 10%',
      accentForeground: '240 6% 10%',
      destructiveForeground: '0 0% 98%'
    },
    dark: {
      primary: '142 76% 45%',            // Brighter green for dark mode
      primaryForeground: '142 30% 8%',
      secondary: '142 30% 15%',          // Dark green
      accent: '142 30% 18%',             // Darker green accent
      destructive: '0 62.8% 30.6%',
      muted: '142 30% 15%',
      border: '142 30% 18%',
      input: '142 30% 18%',
      ring: '142 76% 45%',
      background: '142 30% 8%',
      foreground: '142 20% 95%',
      card: '142 30% 8%',
      cardForeground: '142 20% 95%',
      popover: '142 30% 8%',
      popoverForeground: '142 20% 95%',
      mutedForeground: '142 20% 70%',
      secondaryForeground: '142 20% 95%',
      accentForeground: '142 20% 95%',
      destructiveForeground: '210 40% 98%'
    }
  },

  'industrial-orange': {
    name: 'Industrial Orange',
    description: 'Bold orange scheme for industrial and construction applications',
    light: {
      primary: '25 95% 53%',             // Industrial orange
      primaryForeground: '0 0% 98%',
      secondary: '25 95% 92%',           // Light orange
      accent: '25 95% 96%',              // Very light orange
      destructive: '0 84% 60%',
      muted: '25 95% 96%',
      border: '25 32% 90%',
      input: '25 32% 90%',
      ring: '25 95% 53%',
      background: '0 0% 100%',
      foreground: '20 14% 4%',
      card: '0 0% 100%',
      cardForeground: '20 14% 4%',
      popover: '0 0% 100%',
      popoverForeground: '20 14% 4%',
      mutedForeground: '25 5% 45%',
      secondaryForeground: '24 10% 10%',
      accentForeground: '24 10% 10%',
      destructiveForeground: '0 0% 98%'
    },
    dark: {
      primary: '25 95% 60%',             // Brighter orange for dark mode
      primaryForeground: '25 30% 8%',
      secondary: '25 30% 15%',           // Dark orange
      accent: '25 30% 18%',              // Darker orange accent
      destructive: '0 62.8% 30.6%',
      muted: '25 30% 15%',
      border: '25 30% 18%',
      input: '25 30% 18%',
      ring: '25 95% 60%',
      background: '25 30% 8%',
      foreground: '25 20% 95%',
      card: '25 30% 8%',
      cardForeground: '25 20% 95%',
      popover: '25 30% 8%',
      popoverForeground: '25 20% 95%',
      mutedForeground: '25 20% 70%',
      secondaryForeground: '25 20% 95%',
      accentForeground: '25 20% 95%',
      destructiveForeground: '210 40% 98%'
    }
  },

  'structural-gray': {
    name: 'Structural Gray',
    description: 'Sophisticated gray scheme like structural steel',
    light: {
      primary: '215 28% 17%',            // Steel gray
      primaryForeground: '0 0% 98%',
      secondary: '217 33% 92%',          // Light gray
      accent: '220 33% 96%',             // Very light gray
      destructive: '0 84% 60%',
      muted: '220 14% 96%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '215 28% 17%',
      background: '0 0% 100%',
      foreground: '224 71% 4%',
      card: '0 0% 100%',
      cardForeground: '224 71% 4%',
      popover: '0 0% 100%',
      popoverForeground: '224 71% 4%',
      mutedForeground: '215 16% 47%',
      secondaryForeground: '215 25% 27%',
      accentForeground: '215 25% 27%',
      destructiveForeground: '0 0% 98%'
    },
    dark: {
      primary: '215 28% 60%',            // Lighter gray for dark mode
      primaryForeground: '215 30% 8%',
      secondary: '215 30% 15%',          // Dark gray
      accent: '215 30% 18%',             // Darker gray accent
      destructive: '0 62.8% 30.6%',
      muted: '215 30% 15%',
      border: '215 30% 18%',
      input: '215 30% 18%',
      ring: '215 28% 60%',
      background: '215 30% 8%',
      foreground: '215 20% 95%',
      card: '215 30% 8%',
      cardForeground: '215 20% 95%',
      popover: '215 30% 8%',
      popoverForeground: '215 20% 95%',
      mutedForeground: '215 20% 70%',
      secondaryForeground: '215 20% 95%',
      accentForeground: '215 20% 95%',
      destructiveForeground: '210 40% 98%'
    }
  },

  'copper-bronze': {
    name: 'Copper Bronze',
    description: 'Warm metallic scheme inspired by copper and bronze materials',
    light: {
      primary: '19 78% 44%',             // Copper bronze
      primaryForeground: '0 0% 98%',
      secondary: '19 78% 90%',           // Light copper
      accent: '19 78% 94%',              // Very light copper
      destructive: '0 84% 60%',
      muted: '19 78% 96%',
      border: '19 32% 88%',
      input: '19 32% 88%',
      ring: '19 78% 44%',
      background: '0 0% 100%',
      foreground: '20 14% 4%',
      card: '0 0% 100%',
      cardForeground: '20 14% 4%',
      popover: '0 0% 100%',
      popoverForeground: '20 14% 4%',
      mutedForeground: '19 5% 45%',
      secondaryForeground: '20 10% 10%',
      accentForeground: '20 10% 10%',
      destructiveForeground: '0 0% 98%'
    },
    dark: {
      primary: '19 78% 52%',             // Brighter copper for dark mode
      primaryForeground: '19 30% 8%',
      secondary: '19 30% 15%',           // Dark copper
      accent: '19 30% 18%',              // Darker copper accent
      destructive: '0 62.8% 30.6%',
      muted: '19 30% 15%',
      border: '19 30% 18%',
      input: '19 30% 18%',
      ring: '19 78% 52%',
      background: '19 30% 8%',
      foreground: '19 20% 95%',
      card: '19 30% 8%',
      cardForeground: '19 20% 95%',
      popover: '19 30% 8%',
      popoverForeground: '19 20% 95%',
      mutedForeground: '19 20% 70%',
      secondaryForeground: '19 20% 95%',
      accentForeground: '19 20% 95%',
      destructiveForeground: '210 40% 98%'
    }
  }
}

export const DEFAULT_COLOR_THEME: ColorTheme = 'professional-blue'

export const getColorThemeCSS = (theme: ColorTheme, mode: 'light' | 'dark'): string => {
  const config = COLOR_THEMES[theme][mode]
  
  return `
    --primary: ${config.primary};
    --primary-foreground: ${config.primaryForeground};
    --secondary: ${config.secondary};
    --secondary-foreground: ${config.secondaryForeground};
    --accent: ${config.accent};
    --accent-foreground: ${config.accentForeground};
    --destructive: ${config.destructive};
    --destructive-foreground: ${config.destructiveForeground};
    --muted: ${config.muted};
    --muted-foreground: ${config.mutedForeground};
    --border: ${config.border};
    --input: ${config.input};
    --ring: ${config.ring};
    --background: ${config.background};
    --foreground: ${config.foreground};
    --card: ${config.card};
    --card-foreground: ${config.cardForeground};
    --popover: ${config.popover};
    --popover-foreground: ${config.popoverForeground};
  `
}

export const applyColorTheme = (theme: ColorTheme, mode?: 'light' | 'dark') => {
  const root = document.documentElement
  
  // If mode is not provided, detect from current theme class
  const currentMode = mode || (root.classList.contains('dark') ? 'dark' : 'light')
  
  const css = getColorThemeCSS(theme, currentMode)
  
  // Parse and apply CSS variables
  css.split(';').forEach(rule => {
    const [property, value] = rule.split(':').map(s => s.trim())
    if (property && value) {
      root.style.setProperty(property, value)
    }
  })
} 