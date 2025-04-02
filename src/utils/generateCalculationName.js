import { getTranslation } from '../translations/translations';

/**
 * Generate a standardized name for a calculation based on its type and dimensions
 * @param {string} type - The type of calculation (plate, profile, pipe, angle, bar, pressBrakeAngle, pressBrakeU)
 * @param {Object} data - The dimension data for the calculation
 * @param {string} unit - The unit of measurement (mm or in)
 * @param {string} language - The current language (en or bs)
 * @returns {string} - The generated name
 */
export const generateCalculationName = (type, data, unit, language = 'en') => {
  if (!type || !data) return '';
  
  const t = (key) => getTranslation(key, language);

  switch (type) {
    case 'plate':
      return `${t('plate')} ${data.width}x${data.length}x${data.thickness}${unit}`;
    
    case 'profile':
      return `${t('profile')} ${data.size} L=${data.length}${unit}`;
    
    case 'pipe': {
      if (data.type === 'round') {
        return `${t('roundPipe')} Ø${data.outerDiameter}x${data.thickness} L=${data.length}${unit}`;
      } else if (data.type === 'square') {
        return `${t('squarePipe')} ${data.size}x${data.size}x${data.thickness} L=${data.length}${unit}`;
      } else if (data.type === 'rectangular') {
        return `${t('rectangularPipe')} ${data.width}x${data.height}x${data.thickness} L=${data.length}${unit}`;
      }
      return '';
    }
    
    case 'angle':
      if (data.type === 'equal') {
        return `${t('equalAngle')} ${data.width}x${data.width}x${data.thickness} L=${data.length}${unit}`;
      } else {
        return `${t('unequalAngle')} ${data.width}x${data.height}x${data.thickness} L=${data.length}${unit}`;
      }
    
    case 'bar':
      if (data.type === 'round') {
        return `${t('roundBar')} Ø${data.diameter} L=${data.length}${unit}`;
      } else if (data.type === 'square') {
        return `${t('squareBar')} ${data.sideLength}x${data.sideLength} L=${data.length}${unit}`;
      } else if (data.type === 'flat') {
        return `${t('flatBar')} ${data.width}x${data.height} L=${data.length}${unit}`;
      }
      return '';
    
    case 'pressBrakeAngle':
      return `${t('pressBrakeAngle')} ${data.width}x${data.height}x${data.thickness} ${data.angle}° L=${data.length}${unit}`;
    
    case 'pressBrakeU':
      return `${t('pressBrakeU')} ${data.width}x${data.height}x${data.thickness} L=${data.length}${unit}`;
    
    default:
      return '';
  }
};
