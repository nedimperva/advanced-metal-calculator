export const animations = {
  // All entrance/exit animations disabled for performance
  fadeIn: "",
  slideInFromTop: "",
  slideInFromBottom: "",
  slideInFromLeft: "",
  slideInFromRight: "",
  scaleIn: "",
  
  fadeOut: "",
  slideOutToTop: "",
  slideOutToBottom: "",
  slideOutToLeft: "",
  slideOutToRight: "",
  scaleOut: "",

  // Only keep color transitions for headers
  hoverScale: "",
  hoverLift: "",
  hoverGlow: "",

  // Remove loading animations for speed
  pulse: "",
  spin: "",
  bounce: "",

  // Remove micro-interactions
  buttonPress: "",
  cardHover: "",
  inputFocus: "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150",

  // Remove staggered animations
  staggerChildren: "",
  staggerChild: (delay: number) => "",

  // Remove results animations
  resultEnter: "",
  errorShake: "",

  // Remove tab transitions
  tabContent: "",
  tabIndicator: "",
}

export const transitions = {
  fast: "",
  normal: "",
  slow: "",
  colors: "transition-colors duration-150", // Keep only for headers
  transform: "",
  shadow: "",
}

// Simplified animation presets - all disabled
export const animationPresets = {
  card: "",
  button: "",
  input: "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-150",
  result: "",
  tab: "",
  modal: "",
}

// Disabled staggered animations
export const createStaggeredAnimation = (itemCount: number, baseDelay = 100) => {
  return Array.from({ length: itemCount }, (_, index) => ({
    className: "",
    style: {}
  }))
}

// Always return true for reduced motion to disable all animations
export const prefersReducedMotion = () => {
  return true
}

// Always return empty string to disable all animations
export const safeAnimation = (animationClass: string) => {
  return ""
} 