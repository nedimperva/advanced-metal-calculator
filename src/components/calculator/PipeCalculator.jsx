import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const PipeCalculator = ({ pipeData, onPipeDataChange, unit }) => {
  const { t } = useLanguage();
  
  const handleOuterDiameterChange = (e) => {
    const value = e.target.value;
    onPipeDataChange({
      ...pipeData,
      outerDiameter: value === '' ? '' : parseFloat(value)
    });
  };

  const handleSizeChange = (e) => {
    const value = e.target.value;
    onPipeDataChange({
      ...pipeData,
      size: value === '' ? '' : parseFloat(value)
    });
  };

  const handleWidthChange = (e) => {
    const value = e.target.value;
    onPipeDataChange({
      ...pipeData,
      width: value === '' ? '' : parseFloat(value)
    });
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    onPipeDataChange({
      ...pipeData,
      height: value === '' ? '' : parseFloat(value)
    });
  };

  const handleThicknessChange = (e) => {
    const value = e.target.value;
    onPipeDataChange({
      ...pipeData,
      thickness: value === '' ? '' : parseFloat(value)
    });
  };

  const handleLengthChange = (e) => {
    const value = e.target.value;
    onPipeDataChange({
      ...pipeData,
      length: value === '' ? '' : parseFloat(value)
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pipeData.type === 'round' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('outerDiameter')} ({unit})
            </label>
            <input
              type="number"
              value={pipeData.outerDiameter === 0 ? '' : pipeData.outerDiameter}
              onChange={handleOuterDiameterChange}
              className="w-full p-2 border rounded-md focus:ring-2"
              style={{ 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text,
                outlineColor: theme.colors.primary
              }}
              placeholder={`${t('outerDiameter')} (${unit})`}
            />
          </div>
        )}

        {pipeData.type === 'square' && (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
              {t('size')} ({unit})
            </label>
            <input
              type="number"
              value={pipeData.size === 0 ? '' : pipeData.size}
              onChange={handleSizeChange}
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

        {pipeData.type === 'rectangular' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
                {t('width')} ({unit})
              </label>
              <input
                type="number"
                value={pipeData.width === 0 ? '' : pipeData.width}
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
                value={pipeData.height === 0 ? '' : pipeData.height}
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

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('wallThickness')} ({unit})
          </label>
          <input
            type="number"
            value={pipeData.thickness === 0 ? '' : pipeData.thickness}
            onChange={handleThicknessChange}
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={`${t('wallThickness')} (${unit})`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('length')} ({unit})
          </label>
          <input
            type="number"
            value={pipeData.length === 0 ? '' : pipeData.length}
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

PipeCalculator.propTypes = {
  pipeData: PropTypes.shape({
    type: PropTypes.string,
    outerDiameter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    thickness: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    length: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }).isRequired,
  onPipeDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default PipeCalculator;
