export const theme = {
  colors: {
    // Primary colors based on copper gradient
    primary: '#ff8a65', // Medium copper
    secondary: '#d84315', // Dark copper
    
    // Background colors based on darker steel gradient
    background: '#455a64', // Dark steel
    surface: '#37474f', // Darker steel
    
    // Variations
    primaryLight: '#ffccbc', // Light copper
    secondaryLight: '#ff8a65', // Medium copper
    
    // Text colors
    text: '#ffffff', // White for better contrast on dark background
    textLight: '#cfd8dc', // Light steel for secondary text
    textOnPrimary: '#ffffff', // White from logo
    
    // Accent colors
    accent1: '#90a4ae', // Medium steel
    accent2: '#607d8b', // Dark steel
    accent3: '#455a64', // Darker steel
    
    // Status colors
    success: '#26a69a', // Keeping teal-green
    warning: '#D4AC2B', // Keeping gold
    danger: '#B22727', // Keeping red
    
    // Border colors
    border: '#37474f', // Darker steel
    
    // Hover states
    primaryHover: '#d84315', // Dark copper
    secondaryHover: '#bf360c', // Darker copper
    successHover: '#00897b', // Darker teal-green
    warningHover: '#C39B1A', // Keeping gold hover
    dangerHover: '#A11616', // Keeping red hover
    accent1Hover: '#607d8b', // Dark steel
    accent2Hover: '#455a64', // Darker steel
    accent3Hover: '#263238' // Darkest steel
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
