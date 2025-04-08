import React from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

const PressBrakeUCalculator = ({ pressBrakeUData, onPressBrakeUDataChange, unit }) => {
  const { t } = useLanguage();

  const handleChange = (field, value) => {
    onPressBrakeUDataChange({
      ...pressBrakeUData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
            {t('width')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.width || ''}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full p-2 rounded border"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
            placeholder={t('enterWidth')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
            {t('flangeWidth')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.flangeWidth || ''}
            onChange={(e) => handleChange('flangeWidth', e.target.value)}
            className="w-full p-2 rounded border"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
            placeholder={t('enterFlangeWidth')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
            {t('thickness')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.thickness || ''}
            onChange={(e) => handleChange('thickness', e.target.value)}
            className="w-full p-2 rounded border"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
            placeholder={t('enterThickness')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
            {t('length')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.length || ''}
            onChange={(e) => handleChange('length', e.target.value)}
            className="w-full p-2 rounded border"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
            placeholder={t('enterLength')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
            {t('radius')} ({unit})
          </label>
          <input
            type="number"
            value={pressBrakeUData.radius || ''}
            onChange={(e) => handleChange('radius', e.target.value)}
            className="w-full p-2 rounded border"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
            placeholder={t('enterRadius')}
          />
        </div>
      </div>
    </div>
  );
};

PressBrakeUCalculator.propTypes = {
  pressBrakeUData: PropTypes.shape({
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    flangeWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    thickness: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    length: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    radius: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onPressBrakeUDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default PressBrakeUCalculator;
