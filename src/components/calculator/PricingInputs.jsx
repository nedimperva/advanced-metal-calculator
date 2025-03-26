import React from 'react';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const PricingInputs = ({ pricePerKg, setPricePerKg, quantity, setQuantity }) => {
  const { t } = useLanguage();
  
  return (
    <div className="p-6 rounded-lg border" style={{ 
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border
    }}>
      <h3 className="text-lg font-semibold mb-5" style={{ color: theme.colors.text }}>{t('priceAndQuantity')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textLight }}>
            {t('pricePerKg')} ($)
          </label>
          <input
            type="number"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full p-3 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.textLight }}>
            {t('quantity')}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full p-3 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingInputs;
