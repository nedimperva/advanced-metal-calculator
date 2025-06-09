// Simplified, fast animation system focused on hover states and quick transitions
export const animations = {
  // Simple entrance - much faster
  fadeIn: "animate-in fade-in duration-150",
  
  // Quick hover effects - keep these as they feel responsive
  hoverScale: "hover:scale-[1.02] transition-transform duration-150",
  hoverBg: "hover:bg-muted/50 transition-colors duration-150",
  hoverColor: "hover:text-primary transition-colors duration-150",
  hoverBorder: "hover:border-primary/50 transition-colors duration-150",
  hoverShadow: "hover:shadow-sm transition-shadow duration-150",

  // Micro-interactions - very fast
  buttonPress: "active:scale-[0.98] transition-transform duration-75",
  
  // Focus states - important for accessibility
  inputFocus: "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150",
  buttonFocus: "focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-150",

  // Loading states - keep these minimal
  pulse: "animate-pulse",
  spin: "animate-spin",
}

export const transitions = {
  fast: "transition-all duration-100",
  normal: "transition-colors duration-150",
  hover: "transition-all duration-150",
}

// Simplified presets - no complex animations
export const animationPresets = {
  card: `${animations.hoverBg} ${transitions.hover}`,
  button: `${animations.buttonPress} ${animations.buttonFocus} ${transitions.hover}`,
  input: `${animations.inputFocus} ${transitions.normal}`,
  result: animations.fadeIn,
  tab: "", // No tab animations
  modal: animations.fadeIn,
}

// Simple utility for creating hover effects
export const createHoverEffect = (type: 'bg' | 'scale' | 'color' | 'border' | 'shadow' = 'bg') => {
  const effects = {
    bg: animations.hoverBg,
    scale: animations.hoverScale,
    color: animations.hoverColor,
    border: animations.hoverBorder,
    shadow: animations.hoverShadow
  }
  return `${effects[type]} ${transitions.hover}`
}

// Performance check - disable all animations if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Safe animation wrapper - returns empty string if reduced motion preferred
export const safeAnimation = (animationClass: string) => {
  return prefersReducedMotion() ? '' : animationClass
}

// Create staggered animation effects (simplified version)
export const createStaggeredAnimation = (count: number, delay: number = 100) => {
  return Array.from({ length: count }, (_, index) => ({
    className: animations.fadeIn,
    style: { animationDelay: `${index * delay}ms` }
  }))
}

// Quick hover states for common UI patterns
export const hoverStates = {
  // Cards and containers
  card: "hover:bg-muted/30 hover:border-primary/20 transition-all duration-150",
  listItem: "hover:bg-muted/50 transition-colors duration-150",
  
  // Buttons and interactive elements
  button: "hover:bg-primary/90 hover:shadow-sm transition-all duration-150",
  buttonSecondary: "hover:bg-muted hover:text-foreground transition-all duration-150",
  buttonGhost: "hover:bg-muted/50 hover:text-foreground transition-all duration-150",
  
  // Navigation and tabs
  nav: "hover:text-primary hover:bg-muted/30 transition-all duration-150",
  tab: "hover:text-foreground hover:bg-muted/50 transition-all duration-150",
  
  // Form elements
  input: "hover:border-primary/30 focus:border-primary transition-all duration-150",
  select: "hover:border-primary/30 transition-colors duration-150",
  
  // Icons and text
  icon: "hover:text-primary transition-colors duration-150",
  link: "hover:text-primary hover:underline transition-all duration-150",
  
  // Special effects
  danger: "hover:bg-destructive hover:text-destructive-foreground transition-all duration-150",
  success: "hover:bg-green-500 hover:text-white transition-all duration-150",
} 