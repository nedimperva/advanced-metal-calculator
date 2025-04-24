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
    <div className="space-y-2">
      {components.map((component) => (
        <div
          key={component.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded border"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          <div className="flex items-center space-x-2 flex-1">
            <img src={getComponentIcon(component)} alt="icon" className="h-7 w-7" />
            <div>
              <div className="font-medium" style={{ color: theme.colors.text }}>
                {component.name}
              </div>
              <div className="text-xs" style={{ color: theme.colors.textLight }}>
                {t(component.material)} | {t(component.type)}
              </div>
              <div className="text-xs mt-1" style={{ color: theme.colors.textLight }}>
                {t('quantity')}: <span className="font-semibold" style={{ color: theme.colors.text }}>{component.quantity}</span>
                {' | '}
                {t('pricePerUnit')}: <span className="font-semibold" style={{ color: theme.colors.text }}>{component.price?.toFixed(2) ?? '0.00'}</span> {t('currencySymbol') || '€'}
                {' | '}
                {t('total')}: <span className="font-semibold" style={{ color: theme.colors.text }}>{((component.price || 0) * (component.quantity || 1)).toFixed(2)}</span> {t('currencySymbol') || '€'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <input
              type="number"
              min="1"
              value={component.quantity}
              onChange={e => onUpdateQuantity(component.id, parseInt(e.target.value) || 1)}
              className="w-14 px-1 py-0.5 border rounded text-sm text-center"
              style={{ borderColor: theme.colors.border, color: theme.colors.text }}
            />
            <button
              onClick={() => onRemove(component.id)}
              className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-800"
            >
              {t('remove')}
            </button>
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