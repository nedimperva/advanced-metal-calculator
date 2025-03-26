import React from 'react';
import { theme } from '../../theme';

const ToggleSwitch = ({ isChecked, onChange, leftLabel, rightLabel }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm" style={{ color: !isChecked ? theme.colors.primary : theme.colors.text }}>
        {leftLabel}
      </span>
      <div
        className="relative inline-block w-12 h-6 cursor-pointer"
        onClick={() => onChange(!isChecked)}
      >
        <div
          className="absolute inset-0 rounded-full transition-colors"
          style={{
            backgroundColor: isChecked ? theme.colors.primary : theme.colors.border,
            transition: theme.transitions.DEFAULT
          }}
        />
        <div
          className="absolute inset-y-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform"
          style={{
            transform: isChecked ? 'translateX(100%)' : 'translateX(0)',
            transition: theme.transitions.DEFAULT
          }}
        />
      </div>
      <span className="text-sm" style={{ color: isChecked ? theme.colors.primary : theme.colors.text }}>
        {rightLabel}
      </span>
    </div>
  );
};

export default ToggleSwitch;
