export const theme = {
  colors: {
    // New color palette based on logo
    primary: '#00bcd4', // Teal from the middle of the gradient
    secondary: '#26a69a', // Teal-green from the end of the gradient
    background: '#F5EFE6', // Keeping the light cream background
    surface: '#E8DFCA', // Keeping the warm beige surface
    
    // Variations
    primaryLight: '#29b6f6', // Light blue from the start of the gradient
    secondaryLight: '#4db6ac', // Lighter teal-green
    
    // Text colors
    text: '#1a237e', // Dark blue from the logo stroke
    textLight: '#4F6F52', // Keeping medium green for secondary text
    textOnPrimary: '#F5EFE6', // Light cream on dark backgrounds
    
    // Accent colors
    accent1: '#29b6f6', // Light blue from the start of the gradient
    accent2: '#00bcd4', // Teal from the middle of the gradient
    accent3: '#26a69a', // Teal-green from the end of the gradient
    
    // Status colors
    success: '#26a69a', // Teal-green
    warning: '#D4AC2B', // Keeping gold
    danger: '#B22727', // Keeping red
    
    // Border colors
    border: '#E8DFCA', // Keeping warm beige
    
    // Hover states
    primaryHover: '#00acc1', // Darker teal
    secondaryHover: '#00897b', // Darker teal-green
    successHover: '#00897b', // Darker teal-green
    warningHover: '#C39B1A', // Keeping gold hover
    dangerHover: '#A11616', // Keeping red hover
    accent1Hover: '#0288d1', // Darker light blue
    accent2Hover: '#00acc1', // Darker teal
    accent3Hover: '#00897b' // Darker teal-green
  },
  transitions: {
    DEFAULT: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-in-out',
    slow: 'all 0.3s ease-in-out'
  },
  animations: {
    spin: 'spin 1s linear infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    fadeIn: 'fadeIn 0.5s ease-in',
    slideIn: 'slideIn 0.3s ease-out',
    progress: 'progress 2s ease-in-out infinite'
  },
  keyframes: {
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: .5 }
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
      '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }
    },
    fadeIn: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    },
    slideIn: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' }
    },
    progress: {
      '0%': { width: '0%' },
      '100%': { width: '100%' }
    }
  }
};
