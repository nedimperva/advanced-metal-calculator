import React from 'react';
import { theme } from '../../theme';

const UnitSelector = ({ unit, setUnit }) => {
  const units = [
    { id: 'mm', label: 'Millimeters' },
    { id: 'in', label: 'Inches' }
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textLight }}>Unit</label>
      <div className="flex space-x-4">
        {units.map((unitOption) => (
          <label key={unitOption.id} className="inline-flex items-center">
            <input
              type="radio"
              name="unit"
              value={unitOption.id}
              checked={unit === unitOption.id}
              onChange={() => setUnit(unitOption.id)}
              className="h-4 w-4 focus:ring-2 border"
              style={{ 
                borderColor: theme.colors.border,
                color: theme.colors.primary
              }}
            />
            <span className="ml-2" style={{ color: theme.colors.text }}>{unitOption.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default UnitSelector;
