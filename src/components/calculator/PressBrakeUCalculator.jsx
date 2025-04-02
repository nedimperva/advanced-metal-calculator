import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import uShapeImg from '../../img/pressBrakeU.png'; // This image will need to be created

const PressBrakeUCalculator = ({ pressBrakeUData, onPressBrakeUDataChange, unit }) => {
  const { t } = useLanguage();
  
  const handleWidthChange = (e) => {
    const value = e.target.value;
    onPressBrakeUDataChange({
      ...pressBrakeUData,
      width: value === '' ? '' : parseFloat(value)
    });
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    onPressBrakeUDataChange({
      ...pressBrakeUData,
      height: value === '' ? '' : parseFloat(value)
    });
  };

  const handleThicknessChange = (e) => {
    const value = e.target.value;
    onPressBrakeUDataChange({
      ...pressBrakeUData,
      thickness: value === '' ? '' : parseFloat(value)
    });
  };

  const handleLengthChange = (e) => {
    const value = e.target.value;
    onPressBrakeUDataChange({
      ...pressBrakeUData,
      length: value === '' ? '' : parseFloat(value)
    });
  };

  const handleRadiusChange = (e) => {
    const value = e.target.value;
    onPressBrakeUDataChange({
      ...pressBrakeUData,
      radius: value === '' ? '' : parseFloat(value)
    });
  };

  const handleFlangeWidthChange = (e) => {
    const value = e.target.value;
    onPressBrakeUDataChange({
      ...pressBrakeUData,
      flangeWidth: value === '' ? '' : parseFloat(value)
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-center">
        <img 
          src={uShapeImg} 
          alt="Press brake U-shape diagram" 
          className="max-h-40 object-contain border rounded p-2"
          style={{ backgroundColor: theme.colors.backgroundLight }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('width')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.width === 0 ? '' : pressBrakeUData.width}
            onChange={handleWidthChange}
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
            value={pressBrakeUData.height === 0 ? '' : pressBrakeUData.height}
            onChange={handleHeightChange}
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
            {t('flangeWidth')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.flangeWidth === 0 ? '' : pressBrakeUData.flangeWidth}
            onChange={handleFlangeWidthChange}
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

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('thickness')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.thickness === 0 ? '' : pressBrakeUData.thickness}
            onChange={handleThicknessChange}
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
            value={pressBrakeUData.length === 0 ? '' : pressBrakeUData.length}
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

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('radius')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.radius === 0 ? '' : pressBrakeUData.radius}
            onChange={handleRadiusChange}
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
      </div>
    </div>
  );
};

PressBrakeUCalculator.propTypes = {
  pressBrakeUData: PropTypes.shape({
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    thickness: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    length: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    flangeWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onPressBrakeUDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default PressBrakeUCalculator;
