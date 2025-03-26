import React from 'react';
import { theme } from '../../theme';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeMap = {
    sm: '1rem',
    md: '2rem',
    lg: '3rem'
  };

  return (
    <div
      className="inline-block"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        animation: theme.animations.spin,
        borderRadius: '50%',
        border: `2px solid ${theme.colors[color]}`,
        borderTopColor: 'transparent'
      }}
    />
  );
};

export default LoadingSpinner;
