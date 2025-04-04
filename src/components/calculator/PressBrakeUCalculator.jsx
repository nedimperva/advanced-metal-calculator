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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('width')} ({unit})
        </label>
        <input
          type="number"
          value={pressBrakeUData.width || ''}
          onChange={(e) => handleChange('width', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('enterWidth')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('flangeWidth')} ({unit})
        </label>
        <input
          type="number"
          value={pressBrakeUData.flangeWidth || ''}
          onChange={(e) => handleChange('flangeWidth', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('enterFlangeWidth')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('thickness')} ({unit})
        </label>
        <input
          type="number"
          value={pressBrakeUData.thickness || ''}
          onChange={(e) => handleChange('thickness', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('enterThickness')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('length')} ({unit})
        </label>
        <input
          type="number"
          value={pressBrakeUData.length || ''}
          onChange={(e) => handleChange('length', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('enterLength')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('radius')} ({unit})
        </label>
        <input
          type="number"
          value={pressBrakeUData.radius || ''}
          onChange={(e) => handleChange('radius', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('enterRadius')}
        />
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
