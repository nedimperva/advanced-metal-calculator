import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const AngleCalculator = ({ angleData, onAngleDataChange, unit }) => {
  const { t } = useLanguage();
  
  const handleWidthChange = (e) => {
    onAngleDataChange({
      ...angleData,
      width: parseFloat(e.target.value) || 0
    });
  };

  const handleHeightChange = (e) => {
    onAngleDataChange({
      ...angleData,
      height: parseFloat(e.target.value) || 0
    });
  };

  const handleThicknessChange = (e) => {
    onAngleDataChange({
      ...angleData,
      thickness: parseFloat(e.target.value) || 0
    });
  };

  const handleLengthChange = (e) => {
    onAngleDataChange({
      ...angleData,
      length: parseFloat(e.target.value) || 0
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('width')} ({unit})
          </label>
          <input
            type="number"
            value={angleData.width || ''}
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
              value={angleData.height || ''}
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
            value={angleData.thickness || ''}
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
            value={angleData.length || ''}
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
    width: PropTypes.number,
    height: PropTypes.number,
    thickness: PropTypes.number,
    length: PropTypes.number
  }).isRequired,
  onAngleDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default AngleCalculator;
