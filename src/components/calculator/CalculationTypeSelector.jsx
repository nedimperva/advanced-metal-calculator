import React from 'react';
import { theme } from '../../theme';

const CalculationTypeSelector = ({ calculationType, setCalculationType }) => {
  const types = [
    { id: 'plate', label: 'Plate' },
    { id: 'profile', label: 'Profile' },
    { id: 'pipe', label: 'Pipe' },
    { id: 'angle', label: 'Angle' },
    { id: 'bar', label: 'Bar' }
  ];

  return (
    <div className="mb-8">
      <label className="block text-sm font-medium mb-3" style={{ color: theme.colors.textLight }}>
        Calculation Type
      </label>
      <div className="grid grid-cols-4 gap-3">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setCalculationType(type.id)}
            className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all`}
            style={{
              backgroundColor: calculationType === type.id ? theme.colors.surfaceHighlight : theme.colors.surface,
              borderColor: calculationType === type.id ? theme.colors.primary : theme.colors.border,
              color: calculationType === type.id ? theme.colors.primary : theme.colors.text
            }}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculationTypeSelector;
