import React from 'react';
import { theme } from '../../theme';

const MaterialSelector = ({ material, setMaterial, materials }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textLight }}>Material</label>
      <select 
        value={material} 
        onChange={(e) => setMaterial(e.target.value)}
        className="w-full rounded-lg border focus:ring-2"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.text,
          outlineColor: theme.colors.primary
        }}
      >
        {Object.entries(materials).map(([key, { name }]) => (
          <option key={key} value={key}>{name}</option>
        ))}
      </select>
    </div>
  );
};

export default MaterialSelector;
