export const theme = {
  colors: {
    // New color palette
    primary: '#1A4D2E', // Dark green
    secondary: '#4F6F52', // Medium green
    background: '#F5EFE6', // Light cream
    surface: '#E8DFCA', // Warm beige
    
    // Variations
    primaryLight: '#2A5D3E',
    secondaryLight: '#5F7F62',
    
    // Text colors
    text: '#1A4D2E', // Dark green for text
    textLight: '#4F6F52', // Medium green for secondary text
    textOnPrimary: '#F5EFE6', // Light cream on dark backgrounds
    
    // Accent colors
    accent1: '#1A4D2E', // Dark green
    accent2: '#4F6F52', // Medium green
    accent3: '#E8DFCA', // Warm beige
    
    // Status colors
    success: '#1A4D2E', // Dark green
    warning: '#D4AC2B', // Gold
    danger: '#B22727', // Red
    
    // Border colors
    border: '#E8DFCA', // Warm beige
    
    // Hover states
    primaryHover: '#0D3C1D',
    secondaryHover: '#3E5E41',
    successHover: '#0D3C1D',
    warningHover: '#C39B1A',
    dangerHover: '#A11616',
    accent1Hover: '#0D3C1D',
    accent2Hover: '#3E5E41',
    accent3Hover: '#D9D0BB'
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
