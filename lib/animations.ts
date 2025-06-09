// Completely disabled animations for maximum performance
export const animations = {
  // All animations disabled
  fadeIn: "",
  
  // No hover effects
  hoverScale: "",
  hoverBg: "",
  hoverColor: "",
  hoverBorder: "",
  hoverShadow: "",

  // No micro-interactions
  buttonPress: "",
  
  // No focus states animations
  inputFocus: "focus:ring-2 focus:ring-primary/20 focus:border-primary",
  buttonFocus: "focus-visible:ring-2 focus-visible:ring-primary/20",

  // No loading animations
  pulse: "",
  spin: "",
}

export const transitions = {
  fast: "",
  normal: "",
  hover: "",
}

// All presets disabled
export const animationPresets = {
  card: "",
  button: `${animations.buttonFocus}`,
  input: `${animations.inputFocus}`,
  result: "",
  tab: "",
  modal: "",
}

// No hover effects
export const createHoverEffect = (type: 'bg' | 'scale' | 'color' | 'border' | 'shadow' = 'bg') => {
  return ""
}

// Performance check - always return true to disable animations
export const prefersReducedMotion = () => {
  return true
}

// Always return empty string for no animations
export const safeAnimation = (animationClass: string) => {
  return ""
}

// No staggered animations
export const createStaggeredAnimation = (count: number, delay: number = 100) => {
  return Array.from({ length: count }, (_, index) => ({
    className: "",
    style: {}
  }))
}

// No hover states
export const hoverStates = {
  // Cards and containers
  card: "",
  listItem: "",
  
  // Buttons and interactive elements
  button: "",
  buttonSecondary: "",
  buttonGhost: "",
  
  // Navigation and tabs
  nav: "",
  tab: "",
  
  // Form elements
  input: "",
  select: "",
  
  // Icons and text
  icon: "",
  link: "",
  
  // Special effects
  danger: "",
  success: "",
} 