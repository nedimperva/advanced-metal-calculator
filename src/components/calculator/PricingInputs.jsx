import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const PricingInputs = ({ pricePerKg, setPricePerKg, quantity, setQuantity }) => {
  const { t } = useLanguage();
  
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPricePerKg(value === '' ? '' : parseFloat(value));
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value === '' ? '' : parseFloat(value));
  };
  
  return (
    <div className="p-6 rounded-lg border" style={{ 
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border
    }}>
      <h3 className="text-lg font-medium mb-3" style={{ color: theme.colors.text }}>{t('priceAndQuantity')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('pricePerKg')} ($)
          </label>
          <input
            type="number"
            value={pricePerKg === 0 ? '' : pricePerKg}
            onChange={handlePriceChange}
            min="0"
            step="0.01"
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={t('pricePerKg')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.textLight }}>
            {t('quantity')}
          </label>
          <input
            type="number"
            value={quantity === 0 ? '' : quantity}
            onChange={handleQuantityChange}
            min="0"
            step="0.1"
            className="w-full p-2 border rounded-md focus:ring-2"
            style={{ 
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              outlineColor: theme.colors.primary
            }}
            placeholder={t('quantity')}
          />
        </div>
      </div>
    </div>
  );
};

PricingInputs.propTypes = {
  pricePerKg: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setPricePerKg: PropTypes.func.isRequired,
  quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setQuantity: PropTypes.func.isRequired
};

export default PricingInputs;
