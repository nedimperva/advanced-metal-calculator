import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const BarCalculator = ({ barData, onBarDataChange, unit }) => {
  const { t } = useLanguage();
  
  const handleWidthChange = (e) => {
    onBarDataChange({
      ...barData,
      width: parseFloat(e.target.value) || 0
    });
  };

  const handleHeightChange = (e) => {
    onBarDataChange({
      ...barData,
      height: parseFloat(e.target.value) || 0
    });
  };

  const handleDiameterChange = (e) => {
    onBarDataChange({
      ...barData,
      diameter: parseFloat(e.target.value) || 0
    });
  };

  const handleSideLengthChange = (e) => {
    onBarDataChange({
      ...barData,
      sideLength: parseFloat(e.target.value) || 0
    });
  };

  const handleLengthChange = (e) => {
    onBarDataChange({
      ...barData,
      length: parseFloat(e.target.value) || 0
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barData.type === 'flat' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
                {t('width')} ({unit})
              </label>
              <input
                type="number"
                value={barData.width || ''}
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
                value={barData.height || ''}
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

        {barData.type === 'square' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('size')} ({unit})
            </label>
            <input
              type="number"
              value={barData.sideLength || ''}
              onChange={handleSideLengthChange}
              className="w-full p-2 border rounded-md focus:ring-2"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                outlineColor: theme.colors.primary
              }}
              placeholder={`${t('size')} (${unit})`}
            />
          </div>
        )}

        {barData.type === 'round' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('diameter')} ({unit})
            </label>
            <input
              type="number"
              value={barData.diameter || ''}
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

        <div className={barData.type === 'flat' ? 'md:col-span-2' : ''}>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('length')} ({unit})
          </label>
          <input
            type="number"
            value={barData.length || ''}
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
    width: PropTypes.number,
    height: PropTypes.number,
    sideLength: PropTypes.number,
    diameter: PropTypes.number,
    length: PropTypes.number
  }).isRequired,
  onBarDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default BarCalculator;
