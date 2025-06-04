export const animations = {
  // Entrance animations
  fadeIn: "animate-in fade-in duration-300",
  slideInFromTop: "animate-in slide-in-from-top-4 duration-300",
  slideInFromBottom: "animate-in slide-in-from-bottom-4 duration-300",
  slideInFromLeft: "animate-in slide-in-from-left-4 duration-300",
  slideInFromRight: "animate-in slide-in-from-right-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-300",
  
  // Exit animations
  fadeOut: "animate-out fade-out duration-200",
  slideOutToTop: "animate-out slide-out-to-top-4 duration-200",
  slideOutToBottom: "animate-out slide-out-to-bottom-4 duration-200",
  slideOutToLeft: "animate-out slide-out-to-left-4 duration-200",
  slideOutToRight: "animate-out slide-out-to-right-4 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",

  // Hover effects
  hoverScale: "hover:scale-105 transition-transform duration-200",
  hoverLift: "hover:-translate-y-1 hover:shadow-lg transition-all duration-200",
  hoverGlow: "hover:shadow-md hover:shadow-primary/25 transition-shadow duration-200",

  // Loading states
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",

  // Micro-interactions
  buttonPress: "active:scale-95 transition-transform duration-100",
  cardHover: "hover:shadow-md hover:scale-[1.02] transition-all duration-300",
  inputFocus: "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",

  // Staggered animations for lists
  staggerChildren: "animate-in fade-in duration-500",
  staggerChild: (delay: number) => `animate-in fade-in slide-in-from-bottom-4 duration-300 delay-${delay}`,

  // Results animations
  resultEnter: "animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out",
  errorShake: "animate-pulse",

  // Tab transitions
  tabContent: "animate-in fade-in slide-in-from-bottom-2 duration-300",
  tabIndicator: "transition-all duration-200 ease-out",
}

export const transitions = {
  fast: "transition-all duration-150",
  normal: "transition-all duration-200",
  slow: "transition-all duration-300",
  colors: "transition-colors duration-200",
  transform: "transition-transform duration-200",
  shadow: "transition-shadow duration-200",
}

// Animation presets for common components
export const animationPresets = {
  card: `${animations.fadeIn} ${animations.cardHover}`,
  button: `${animations.buttonPress} ${transitions.normal}`,
  input: `${animations.inputFocus} ${transitions.normal}`,
  result: animations.resultEnter,
  tab: animations.tabContent,
  modal: `${animations.fadeIn} ${animations.scaleIn}`,
}

// Utility function to create staggered animations
export const createStaggeredAnimation = (itemCount: number, baseDelay = 100) => {
  return Array.from({ length: itemCount }, (_, index) => ({
    className: `animate-in fade-in slide-in-from-bottom-4 duration-300`,
    style: { animationDelay: `${index * baseDelay}ms` }
  }))
}

// Performance-optimized animation detection
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Safe animation wrapper that respects user preferences
export const safeAnimation = (animationClass: string) => {
  return prefersReducedMotion() ? '' : animationClass
} 