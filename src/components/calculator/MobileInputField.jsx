import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../../theme';

const MobileInputField = ({ 
  label, 
  value, 
  onChange, 
  unit = '', 
  placeholder = '0', 
  type = 'number',
  error = false,
  helpText = '',
  required = false,
  min = 0,
  max = null,
  step = 'any',
  icon = null,
  onFocus = () => {},
  onBlur = () => {}
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(value && value !== '0' && value !== 0);
  const inputRef = useRef(null);

  useEffect(() => {
    setHasValue(value && value !== '0' && value !== 0);
  }, [value]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus(e);
    // Auto-select all text on focus for easy editing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, 50);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur(e);
  };

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Handle number validation
    if (type === 'number') {
      // Allow empty string, numbers, and decimal points
      if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
        onChange(newValue);
      }
    } else {
      onChange(newValue);
    }
  };

  const incrementValue = () => {
    const currentValue = parseFloat(value) || 0;
    const increment = step === 'any' ? 1 : parseFloat(step);
    const newValue = currentValue + increment;
    if (max === null || newValue <= max) {
      onChange(newValue.toString());
    }
  };

  const decrementValue = () => {
    const currentValue = parseFloat(value) || 0;
    const decrement = step === 'any' ? 1 : parseFloat(step);
    const newValue = Math.max(min, currentValue - decrement);
    onChange(newValue.toString());
  };

  return (
    <div className="w-full mb-4">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label 
          className="block text-sm font-medium"
          style={{ color: theme.colors.text }}
        >
          {label}
          {required && <span style={{ color: theme.colors.danger }}>*</span>}
        </label>
        {helpText && (
          <span 
            className="text-xs"
            style={{ color: theme.colors.textLight }}
          >
            {helpText}
          </span>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        <div
          className={`flex items-center rounded-lg border-2 transition-all duration-200 ${
            error ? 'ring-2 ring-red-500 ring-opacity-50' : ''
          }`}
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: error 
              ? theme.colors.danger 
              : isFocused 
                ? theme.colors.primary 
                : theme.colors.border
          }}
        >
          {/* Icon */}
          {icon && (
            <div className="flex items-center justify-center w-12 h-12">
              <img src={icon} alt="" className="w-6 h-6" />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="flex-1 px-4 py-3 bg-transparent border-0 outline-none text-lg font-medium"
            style={{ 
              color: theme.colors.text,
              caretColor: theme.colors.primary
            }}
            inputMode={type === 'number' ? 'decimal' : 'text'}
          />

          {/* Unit Display */}
          {unit && (
            <div 
              className="px-3 py-2 rounded-r-lg text-sm font-medium"
              style={{ 
                backgroundColor: `${theme.colors.primary}20`,
                color: theme.colors.primary
              }}
            >
              {unit}
            </div>
          )}

          {/* Number Input Controls */}
          {type === 'number' && (
            <div className="flex flex-col border-l" style={{ borderColor: theme.colors.border }}>
              <button
                type="button"
                onClick={incrementValue}
                className="px-3 py-1 hover:bg-opacity-80 transition-colors"
                style={{ 
                  backgroundColor: `${theme.colors.primary}20`,
                  color: theme.colors.primary
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={decrementValue}
                className="px-3 py-1 hover:bg-opacity-80 transition-colors"
                style={{ 
                  backgroundColor: `${theme.colors.primary}20`,
                  color: theme.colors.primary
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Floating Label Animation */}
        {(isFocused || hasValue) && (
          <div
            className="absolute left-3 -top-2 px-2 text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: theme.colors.surface,
              color: isFocused ? theme.colors.primary : theme.colors.textLight
            }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && typeof error === 'string' && (
        <p 
          className="mt-1 text-xs"
          style={{ color: theme.colors.danger }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default MobileInputField; 