import React from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

const PressBrakeLCalculator = ({ pressBrakeLData, onPressBrakeLDataChange, unit }) => {
  const { t } = useLanguage();

  const handleChange = (field, value) => {
    onPressBrakeLDataChange({
      ...pressBrakeLData,
      [field]: value === '' ? '' : parseFloat(value)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>{t('pressBrakeL')}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('width')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeLData.width === 0 ? '' : pressBrakeLData.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={`${t('width')} (${unit})`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('height')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeLData.height === 0 ? '' : pressBrakeLData.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={`${t('height')} (${unit})`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('thickness')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeLData.thickness === 0 ? '' : pressBrakeLData.thickness}
            onChange={(e) => handleChange('thickness', e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={`${t('thickness')} (${unit})`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('length')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeLData.length === 0 ? '' : pressBrakeLData.length}
            onChange={(e) => handleChange('length', e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={`${t('length')} (${unit})`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('radius')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeLData.radius === 0 ? '' : pressBrakeLData.radius}
            onChange={(e) => handleChange('radius', e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={`${t('radius')} (${unit})`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('flangeWidth')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeLData.flangeWidth === 0 ? '' : pressBrakeLData.flangeWidth}
            onChange={(e) => handleChange('flangeWidth', e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={`${t('flangeWidth')} (${unit})`}
          />
        </div>
      </div>
    </div>
  );
};

PressBrakeLCalculator.propTypes = {
  pressBrakeLData: PropTypes.shape({
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    thickness: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    length: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    flangeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onPressBrakeLDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default PressBrakeLCalculator; 