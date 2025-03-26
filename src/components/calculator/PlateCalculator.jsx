import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const PlateCalculator = ({ plateData, onPlateDataChange, unit }) => {
  const { t } = useLanguage();

  const handleWidthChange = (e) => {
    const value = e.target.value;
    onPlateDataChange({
      ...plateData,
      width: value === '' ? '' : parseFloat(value)
    });
  };

  const handleLengthChange = (e) => {
    const value = e.target.value;
    onPlateDataChange({
      ...plateData,
      length: value === '' ? '' : parseFloat(value)
    });
  };

  const handleThicknessChange = (e) => {
    const value = e.target.value;
    onPlateDataChange({
      ...plateData,
      thickness: value === '' ? '' : parseFloat(value)
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
          value={plateData.width === 0 ? '' : plateData.width}
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
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }} data-component-name="PlateCalculator">
          {t('length')} ({unit})
        </label>
        <input
          type="number"
          value={plateData.length === 0 ? '' : plateData.length}
          onChange={handleLengthChange}
          className="w-full p-2 border rounded-md focus:ring-2"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            outlineColor: theme.colors.primary
          }}
          placeholder={`${t('length')} (${unit})`}
          data-component-name="PlateCalculator"
        />
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }} data-component-name="PlateCalculator">
          {t('thickness')} ({unit})
        </label>
        <input
          type="number"
          value={plateData.thickness === 0 ? '' : plateData.thickness}
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
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    length: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    thickness: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onPlateDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default PlateCalculator;
