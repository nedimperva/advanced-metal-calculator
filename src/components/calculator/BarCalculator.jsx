import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import flatBarImg from '../../img/flatBar.png';
import roundBarImg from '../../img/roundBar.png';
import squareBarImg from '../../img/squareBar.png';

const BarCalculator = ({ barData, onBarDataChange, unit }) => {
  const { t } = useLanguage();
  
  const handleWidthChange = (e) => {
    const value = e.target.value;
    onBarDataChange({
      ...barData,
      width: value === '' ? '' : parseFloat(value)
    });
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    onBarDataChange({
      ...barData,
      height: value === '' ? '' : parseFloat(value)
    });
  };

  const handleDiameterChange = (e) => {
    const value = e.target.value;
    onBarDataChange({
      ...barData,
      diameter: value === '' ? '' : parseFloat(value)
    });
  };

  const handleSideLengthChange = (e) => {
    const value = e.target.value;
    onBarDataChange({
      ...barData,
      sideLength: value === '' ? '' : parseFloat(value)
    });
  };

  const handleLengthChange = (e) => {
    const value = e.target.value;
    onBarDataChange({
      ...barData,
      length: value === '' ? '' : parseFloat(value)
    });
  };

  // Get the appropriate image based on bar type
  const getBarImage = () => {
    switch(barData.type) {
      case 'flat':
        return flatBarImg;
      case 'round':
        return roundBarImg;
      case 'square':
        return squareBarImg;
      default:
        return flatBarImg;
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-center">
        <img 
          src={getBarImage()} 
          alt={`${barData.type} bar diagram`} 
          className="max-h-40 object-contain border rounded p-2"
          style={{ backgroundColor: theme.colors.backgroundLight }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barData.type === 'flat' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
                {t('width')} ({unit})
              </label>
              <input
                type="number"
                value={barData.width === 0 ? '' : barData.width}
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
                value={barData.height === 0 ? '' : barData.height}
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
          </>
        )}

        {barData.type === 'round' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('diameter')} ({unit})
            </label>
            <input
              type="number"
              value={barData.diameter === 0 ? '' : barData.diameter}
              onChange={handleDiameterChange}
              className="w-full p-2 border rounded-md focus:ring-2"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                outlineColor: theme.colors.primary
              }}
              placeholder={`${t('diameter')} (${unit})`}
            />
          </div>
        )}

        {barData.type === 'square' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('sideLength')} ({unit})
            </label>
            <input
              type="number"
              value={barData.sideLength === 0 ? '' : barData.sideLength}
              onChange={handleSideLengthChange}
              className="w-full p-2 border rounded-md focus:ring-2"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                outlineColor: theme.colors.primary
              }}
              placeholder={`${t('sideLength')} (${unit})`}
            />
          </div>
        )}

        <div className={barData.type === 'flat' ? 'md:col-span-2' : ''}>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('length')} ({unit})
          </label>
          <input
            type="number"
            value={barData.length === 0 ? '' : barData.length}
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

BarCalculator.propTypes = {
  barData: PropTypes.shape({
    type: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    diameter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sideLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    length: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onBarDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default BarCalculator;
