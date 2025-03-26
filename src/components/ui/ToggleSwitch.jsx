import React from 'react';
import PropTypes from 'prop-types';

const ToggleSwitch = ({ isChecked, onChange, activeColor = '#1A4D2E' }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={isChecked} 
        onChange={(e) => onChange(e.target.checked)}
      />
      <div 
        className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full 
                  peer-checked:after:border-white after:content-[''] after:absolute 
                  after:top-[2px] after:left-[2px] after:bg-white after:border 
                  after:rounded-full after:h-5 after:w-5 after:transition-all 
                  border-gray-300 bg-gray-200`}
        style={{ 
          backgroundColor: isChecked ? activeColor : '#e5e7eb',
          borderColor: isChecked ? activeColor : '#d1d5db'
        }}
      />
    </label>
  );
};

ToggleSwitch.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  activeColor: PropTypes.string
};

export default ToggleSwitch;
