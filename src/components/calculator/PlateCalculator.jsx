import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const PlateCalculator = ({ plateData, onPlateDataChange, unit }) => {
  const { t } = useLanguage();

  const handleWidthChange = (e) => {
    onPlateDataChange({
      ...plateData,
      width: parseFloat(e.target.value) || 0
    });
  };

  const handleLengthChange = (e) => {
    onPlateDataChange({
      ...plateData,
      length: parseFloat(e.target.value) || 0
    });
  };

  const handleThicknessChange = (e) => {
    onPlateDataChange({
      ...plateData,
      thickness: parseFloat(e.target.value) || 0
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-protonpass-form="">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }} data-component-name="PlateCalculator">
          {t('width')} ({unit})
        </label>
        <input
          type="number"
          value={plateData.width || ''}
          onChange={handleWidthChange}
          className="w-full p-2 border rounded-md focus:ring-2"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            outlineColor: theme.colors.primary
          }}
          placeholder={`${t('width')} (${unit})`}
          data-component-name="PlateCalculator"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
          {t('length')} ({unit})
        </label>
        <input
          type="number"
          value={plateData.length || ''}
          onChange={handleLengthChange}
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
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }} data-component-name="PlateCalculator">
          {t('thickness')} ({unit})
        </label>
        <input
          type="number"
          value={plateData.thickness || ''}
          onChange={handleThicknessChange}
          className="w-full p-2 border rounded-md focus:ring-2"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            outlineColor: theme.colors.primary
          }}
          placeholder={`${t('thickness')} (${unit})`}
          data-component-name="PlateCalculator"
        />
      </div>
    </div>
  );
};

PlateCalculator.propTypes = {
  plateData: PropTypes.shape({
    width: PropTypes.number,
    length: PropTypes.number,
    thickness: PropTypes.number
  }).isRequired,
  onPlateDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default PlateCalculator;
