import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
// Local helper for formatting dimensions
const formatDimension = (value, unit = 'mm') => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return unit === 'mm' ? Math.round(Number(value)).toString() : Number(value).toFixed(2);
};

// Import component type icons
import EqualAngle from '../../assets/profiles/EqualAngle.svg';
import UnequalAngle from '../../assets/profiles/UnequalAngle.svg';
import SquarePipe from '../../assets/profiles/SquarePipe.svg';
import RoundPipe from '../../assets/profiles/RoundPipe.svg';
import RectangularPipe from '../../assets/profiles/RectangularPipe.svg';
import HEA from '../../assets/profiles/HEA.svg';
import HEB from '../../assets/profiles/HEB.svg';
import UProfile from '../../assets/profiles/UProfile.svg';
import IPN from '../../assets/profiles/IPN.svg';
import IPE from '../../assets/profiles/IPE.svg';
import SteelPlate from '../../assets/profiles/SteelPlate.svg';
import FlatBar from '../../assets/profiles/FlatBar.svg';
import SquareBar from '../../assets/profiles/SquareBar.svg';
import RoundBar from '../../assets/profiles/RoundBar.svg';
import UPressBrake from '../../assets/profiles/UPressBrake.svg';
import LPressBrake from '../../assets/profiles/LPressBrake.svg';

const ComponentList = ({ components, onUpdateQuantity, onRemove }) => {
  const { t } = useLanguage();
  
  if (components.length === 0) {
    return (
      <div className="text-center py-4" style={{ color: theme.colors.textLight }}>
        {t('noComponentsAdded')}
      </div>
    );
  }

  // Helper function to get the appropriate icon based on component type
  const getComponentIcon = (component) => {
    const { type, subType } = component;
    
    switch (type) {
      case 'pipe':
        return subType === 'round' ? RoundPipe : 
               subType === 'square' ? SquarePipe : 
               RectangularPipe;
      case 'angle':
        return subType === 'equal' ? EqualAngle : 
               subType === 'unequal' ? UnequalAngle : 
               LPressBrake;
      case 'profile':
        if (subType === 'pressBrakeU') return UPressBrake;
        if (!component.dimensions || !component.dimensions.type) return UProfile;
        
        switch (component.dimensions.type.toLowerCase()) {
          case 'hea': return HEA;
          case 'heb': return HEB;
          case 'ipn': return IPN;
          case 'ipe': return IPE;
          case 'upn': return UProfile;
          default: return UProfile;
        }
      case 'bar':
        return subType === 'flat' ? FlatBar : 
               subType === 'square' ? SquareBar : 
               RoundBar;
      case 'plate':
        return SteelPlate;
      default:
        return SteelPlate;
    }
  };

  // Helper function to render component specs based on type
  const renderComponentSpecs = (component) => {
    const { type, subType, dimensions } = component;
    
    if (!dimensions) return null;
    
    switch (type) {
      case 'plate':
        return (
          <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
            {dimensions.width && dimensions.length && 
              <div>{formatDimension(dimensions.width)} × {formatDimension(dimensions.length)} × {formatDimension(dimensions.thickness)} mm</div>
            }
          </div>
        );
        
      case 'profile':
        if (subType === 'pressBrakeU') {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              {dimensions.width && dimensions.height && 
                <div>{t('uProfile')}: {formatDimension(dimensions.width)} × {formatDimension(dimensions.height)} × {formatDimension(dimensions.thickness)} mm</div>
              }
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        } else {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              {dimensions.type && <div>{dimensions.type.toUpperCase()} {dimensions.size}</div>}
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        }
        
      case 'pipe':
        if (subType === 'round') {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              <div>∅{formatDimension(dimensions.outerDiameter)} × {formatDimension(dimensions.thickness)} mm</div>
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        } else if (subType === 'square') {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              <div>{formatDimension(dimensions.size)} × {formatDimension(dimensions.size)} × {formatDimension(dimensions.thickness)} mm</div>
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        } else {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              <div>{formatDimension(dimensions.width)} × {formatDimension(dimensions.height)} × {formatDimension(dimensions.thickness)} mm</div>
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        }
        
      case 'angle':
        if (subType === 'pressBrake') {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              <div>{formatDimension(dimensions.width)} × {formatDimension(dimensions.height)} × {formatDimension(dimensions.thickness)} mm</div>
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
              {dimensions.angle && <div>{t('angle')}: {dimensions.angle}°</div>}
            </div>
          );
        } else {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              <div>{formatDimension(dimensions.width)} × {formatDimension(dimensions.height)} × {formatDimension(dimensions.thickness)} mm</div>
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        }
        
      case 'bar':
        if (subType === 'flat') {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              <div>{formatDimension(dimensions.width)} × {formatDimension(dimensions.height)} mm</div>
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        } else if (subType === 'square') {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              <div>{formatDimension(dimensions.sideLength)} × {formatDimension(dimensions.sideLength)} mm</div>
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        } else {
          return (
            <div className="mt-2 text-xs" style={{ color: theme.colors.textLight }}>
              <div>∅{formatDimension(dimensions.diameter)} mm</div>
              {dimensions.length && <div>{t('length')}: {formatDimension(dimensions.length)} mm</div>}
            </div>
          );
        }
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {components.map((component) => (
        <div 
          key={component.id}
          className="p-3 border rounded-lg"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center p-1.5 rounded-md mr-2" 
                style={{ backgroundColor: `${theme.colors.primary}15` }}>
                <img 
                  src={getComponentIcon(component)} 
                  alt={component.type}
                  className="h-5 w-5" 
                />
              </div>
              <h4 className="font-medium text-sm" style={{ color: theme.colors.text }}>
                {component.name}
              </h4>
            </div>
            <button
              onClick={() => onRemove(component.id)}
              className="p-1 rounded-full hover:opacity-80"
              style={{ color: theme.colors.danger }}
              aria-label={t('removeComponent')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Component specifications based on type */}
          {renderComponentSpecs(component)}
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs py-1 px-2 rounded-full" 
              style={{ backgroundColor: `${theme.colors.surface}80`, color: theme.colors.textLight }}>
              {t(component.material)}
            </span>
            <span className="text-xs py-1 px-2 rounded-full" 
              style={{ backgroundColor: `${theme.colors.surface}80`, color: theme.colors.textLight }}>
              {component.weight.toFixed(2)} kg
            </span>
            <span className="text-xs py-1 px-2 rounded-full" 
              style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}>
              {t('total')}: {(component.weight * component.quantity).toFixed(2)} kg
            </span>
          </div>
          
          <div className="flex mt-3 items-center justify-between">
            <label className="text-xs" style={{ color: theme.colors.textLight }}>
              {t('quantity')}:
            </label>
            <div className="flex items-center">
              <button
                onClick={() => onUpdateQuantity(component.id, Math.max(1, component.quantity - 1))}
                className="w-6 h-6 flex items-center justify-center rounded-full"
                style={{ 
                  backgroundColor: theme.colors.background, 
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={component.quantity}
                onChange={(e) => onUpdateQuantity(component.id, parseInt(e.target.value) || 1)}
                className="w-12 mx-2 text-center p-1 text-sm border rounded"
                style={{ 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }}
              />
              <button
                onClick={() => onUpdateQuantity(component.id, component.quantity + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full"
                style={{ 
                  backgroundColor: theme.colors.background, 
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

ComponentList.propTypes = {
  components: PropTypes.array.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired
};

export default ComponentList;