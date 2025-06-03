import React, { useState, useEffect } from 'react';
import MetalCalculator from './calculator/MetalCalculator';
import MobileMetalCalculator from './calculator/MobileMetalCalculator';

const ResponsiveCalculator = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Mobile: width < 768px OR touch device with small screen
      const mobile = width < 768 || (width < 1024 && 'ontouchstart' in window);
      
      // Tablet: 768px <= width < 1024px
      const tablet = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
    };

    // Check on mount
    checkDevice();

    // Check on resize
    window.addEventListener('resize', checkDevice);
    
    // Check on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(checkDevice, 100);
    });

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  // Force mobile layout for screens smaller than 768px or touch devices
  const shouldUseMobileLayout = isMobile || isTablet;

  return shouldUseMobileLayout ? <MobileMetalCalculator /> : <MetalCalculator />;
};

export default ResponsiveCalculator; 