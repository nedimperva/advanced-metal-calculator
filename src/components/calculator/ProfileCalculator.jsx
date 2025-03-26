import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { profiles } from '../../data/profiles';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const ProfileCalculator = ({ profileData, onProfileDataChange, unit }) => {
  const { t } = useLanguage();
  const [availableSizes, setAvailableSizes] = useState([]);
  
  // Handle type change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    onProfileDataChange({
      ...profileData,
      type,
      size: ''
    });
  };
  
  // Handle size change
  const handleSizeChange = (e) => {
    onProfileDataChange({
      ...profileData,
      size: e.target.value
    });
  };
  
  // Handle length change
  const handleLengthChange = (e) => {
    onProfileDataChange({
      ...profileData,
      length: parseFloat(e.target.value) || 0
    });
  };
  
  // Update available sizes when type changes
  useEffect(() => {
    if (!profileData.type || !profiles[profileData.type]) {
      setAvailableSizes([]);
      return;
    }
    
    setAvailableSizes(profiles[profileData.type].sizes || []);
  }, [profileData.type]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
          {t('profileType')}
        </label>
        <select
          value={profileData.type || ''}
          onChange={handleTypeChange}
          className="w-full p-2 border rounded-md focus:ring-2"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            outlineColor: theme.colors.primary
          }}
        >
          <option value="">{t('selectType')}</option>
          {Object.keys(profiles).map(type => (
            <option key={type} value={type}>{profiles[type].name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
          {t('profileSize')}
        </label>
        <select
          value={profileData.size || ''}
          onChange={handleSizeChange}
          className="w-full p-2 border rounded-md focus:ring-2"
          style={{ 
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            outlineColor: theme.colors.primary
          }}
          disabled={!profileData.type}
        >
          <option value="">{t('selectSize')}</option>
          {availableSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
          {t('length')} ({unit})
        </label>
        <input
          type="number"
          value={profileData.length || 0}
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
  );
};

ProfileCalculator.propTypes = {
  profileData: PropTypes.object.isRequired,
  onProfileDataChange: PropTypes.func.isRequired,
  unit: PropTypes.string.isRequired
};

export default ProfileCalculator;
