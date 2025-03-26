import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const PipeCalculator = ({ pipeData, onPipeDataChange, unit }) => {
  const { t } = useLanguage();
  
  const handleOuterDiameterChange = (e) => {
    onPipeDataChange({
      ...pipeData,
      outerDiameter: parseFloat(e.target.value) || 0
    });
  };

  const handleSizeChange = (e) => {
    onPipeDataChange({
      ...pipeData,
      size: parseFloat(e.target.value) || 0
    });
  };

  const handleWidthChange = (e) => {
    onPipeDataChange({
      ...pipeData,
      width: parseFloat(e.target.value) || 0
    });
  };

  const handleHeightChange = (e) => {
    onPipeDataChange({
      ...pipeData,
      height: parseFloat(e.target.value) || 0
    });
  };

  const handleThicknessChange = (e) => {
    onPipeDataChange({
      ...pipeData,
      thickness: parseFloat(e.target.value) || 0
    });
  };

  const handleLengthChange = (e) => {
    onPipeDataChange({
      ...pipeData,
      length: parseFloat(e.target.value) || 0
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
              value={pipeData.outerDiameter || ''}
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
              value={pipeData.size || ''}
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
                value={pipeData.width || ''}
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
                value={pipeData.height || ''}
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
            value={pipeData.thickness || ''}
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
            value={pipeData.length || ''}
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
    outerDiameter: PropTypes.number,
    size: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    thickness: PropTypes.number,
    length: PropTypes.number
  }).isRequired,
  onPipeDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default PipeCalculator;
