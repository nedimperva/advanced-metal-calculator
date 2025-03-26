import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import equalAngleImg from '../../img/equalAngle.png';
import unequalAngleImg from '../../img/unequalAngle.png';

const AngleCalculator = ({ angleData, onAngleDataChange, unit }) => {
  const { t } = useLanguage();
  
  const handleWidthChange = (e) => {
    const value = e.target.value;
    onAngleDataChange({
      ...angleData,
      width: value === '' ? '' : parseFloat(value)
    });
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    onAngleDataChange({
      ...angleData,
      height: value === '' ? '' : parseFloat(value)
    });
  };

  const handleThicknessChange = (e) => {
    const value = e.target.value;
    onAngleDataChange({
      ...angleData,
      thickness: value === '' ? '' : parseFloat(value)
    });
  };

  const handleLengthChange = (e) => {
    const value = e.target.value;
    onAngleDataChange({
      ...angleData,
      length: value === '' ? '' : parseFloat(value)
    });
  };

  // Get the appropriate image based on angle type
  const getAngleImage = () => {
    return angleData.type === 'equal' ? equalAngleImg : unequalAngleImg;
  };

  return (
    <div>
      <div className="mb-4 flex justify-center">
        <img 
          src={getAngleImage()} 
          alt={`${angleData.type} angle diagram`} 
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
            value={angleData.width === 0 ? '' : angleData.width}
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

        {angleData.type === 'unequal' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('height')} ({unit})
            </label>
            <input
              type="number"
              value={angleData.height === 0 ? '' : angleData.height}
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
        )}

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('thickness')} ({unit})
          </label>
          <input
            type="number"
            value={angleData.thickness === 0 ? '' : angleData.thickness}
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
            value={angleData.length === 0 ? '' : angleData.length}
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
      </div>
    </div>
  );
};

AngleCalculator.propTypes = {
  angleData: PropTypes.shape({
    type: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    thickness: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    length: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onAngleDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default AngleCalculator;
