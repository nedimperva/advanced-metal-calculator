export const generateCalculationName = (type, data, unit) => {
  const formatDimension = (value) => {
    if (!value) return '0';
    return unit === 'mm' ? Math.round(value).toString() : value.toFixed(2);
  };

  switch (type) {
    case 'plate':
      return `Plate ${formatDimension(data.thickness)}${unit} ${formatDimension(data.width)}x${formatDimension(data.length)}`;
    
    case 'profile':
      return `Profile ${data.type} ${data.size} L=${formatDimension(data.length)}${unit}`;
    
    case 'pipe':
      if (data.type === 'round') {
        return `Pipe Round Ø${formatDimension(data.outerDiameter)}x${formatDimension(data.thickness)}${unit}`;
      } else if (data.type === 'square') {
        return `Pipe ${formatDimension(data.outerDiameter)}x${formatDimension(data.outerDiameter)}x${formatDimension(data.thickness)}${unit}`;
      } else {
        // Rectangular pipe
        return `Pipe ${formatDimension(data.width)}x${formatDimension(data.height)}x${formatDimension(data.thickness)}${unit}`;
      }
    
    case 'angle':
      return `Angle ${formatDimension(data.width)}x${formatDimension(data.height)}x${formatDimension(data.thickness)}${unit}`;
    
    case 'bar':
      return data.type === 'round' 
        ? `Bar Ø${formatDimension(data.diameter)}${unit}`
        : `Bar ${formatDimension(data.width)}x${formatDimension(data.height)}${unit}`;
    
    default:
      return 'Unnamed Calculation';
  }
};
