import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const CalculationPreview = ({ calculation }) => {
  const { t } = useLanguage();
  const totalWeight = calculation.weight * calculation.quantity;

  return (
    <div 
      className="rounded-lg p-3 border"
      style={{ 
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
        borderLeftWidth: '4px', 
        borderLeftColor: calculation.color || theme.colors.primary 
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium" style={{ color: theme.colors.text }}>{calculation.name}</h3>
          <div className="text-sm mt-1" style={{ color: theme.colors.textLight }}>
            {calculation.weight.toFixed(2)} kg × {calculation.quantity}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-lg font-bold" style={{ color: theme.colors.text }}>
            {totalWeight.toFixed(2)} kg
          </div>
          <div className="text-sm mt-1" style={{ color: theme.colors.primary }}>
            ${calculation.totalPrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

CalculationPreview.propTypes = {
  calculation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    weight: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    totalPrice: PropTypes.number.isRequired,
    color: PropTypes.string
  }).isRequired
};

export default CalculationPreview;
