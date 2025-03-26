import React from 'react';
import { theme } from '../../theme';

const ProgressBar = ({ color = 'primary', height = '2px' }) => {
  return (
    <div 
      style={{
        width: '100%',
        height,
        backgroundColor: theme.colors.border,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: theme.colors[color],
          animation: theme.animations.progress,
          transformOrigin: 'left',
        }}
      />
    </div>
  );
};

export default ProgressBar;
