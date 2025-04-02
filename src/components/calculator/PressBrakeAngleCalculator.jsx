import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import angleImg from '../../img/pressBrakeAngle.png'; // This image will need to be created

const PressBrakeAngleCalculator = ({ pressBrakeAngleData, onPressBrakeAngleDataChange, unit }) => {
  const { t } = useLanguage();
  
  const handleWidthChange = (e) => {
    const value = e.target.value;
    onPressBrakeAngleDataChange({
      ...pressBrakeAngleData,
      width: value === '' ? '' : parseFloat(value)
    });
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    onPressBrakeAngleDataChange({
      ...pressBrakeAngleData,
      height: value === '' ? '' : parseFloat(value)
    });
  };

  const handleThicknessChange = (e) => {
    const value = e.target.value;
    onPressBrakeAngleDataChange({
      ...pressBrakeAngleData,
      thickness: value === '' ? '' : parseFloat(value)
    });
  };

  const handleLengthChange = (e) => {
    const value = e.target.value;
    onPressBrakeAngleDataChange({
      ...pressBrakeAngleData,
      length: value === '' ? '' : parseFloat(value)
    });
  };

  const handleAngleChange = (e) => {
    const value = e.target.value;
    onPressBrakeAngleDataChange({
      ...pressBrakeAngleData,
      angle: value === '' ? '' : parseFloat(value)
    });
  };

  const handleRadiusChange = (e) => {
    const value = e.target.value;
    onPressBrakeAngleDataChange({
      ...pressBrakeAngleData,
      radius: value === '' ? '' : parseFloat(value)
    });
  };

  return (
    <div>
      <div className="mb-4 flex justify-center">
        <img 
          src={angleImg} 
          alt="Press brake angle diagram" 
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
            value={pressBrakeAngleData.width === 0 ? '' : pressBrakeAngleData.width}
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
            value={pressBrakeAngleData.height === 0 ? '' : pressBrakeAngleData.height}
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
            {t('thickness')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeAngleData.thickness === 0 ? '' : pressBrakeAngleData.thickness}
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
            value={pressBrakeAngleData.length === 0 ? '' : pressBrakeAngleData.length}
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
            {t('angle')} (°)
          </label>
          <input
            type="number"
            value={pressBrakeAngleData.angle === 0 ? '' : pressBrakeAngleData.angle}
            onChange={handleAngleChange}
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={`${t('angle')} (°)`}
            min="0"
            max="180"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('radius')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeAngleData.radius === 0 ? '' : pressBrakeAngleData.radius}
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

PressBrakeAngleCalculator.propTypes = {
  pressBrakeAngleData: PropTypes.shape({
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    thickness: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    length: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    angle: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onPressBrakeAngleDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default PressBrakeAngleCalculator;
