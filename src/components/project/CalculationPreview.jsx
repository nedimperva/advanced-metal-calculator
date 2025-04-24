import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';

const CalculationPreview = ({ calculation, onDelete }) => {
  const { t } = useLanguage();
  const totalWeight = calculation.weight * calculation.quantity;
  const [currency, setCurrency] = React.useState('€');
  React.useEffect(() => {
    try {
      const settings = JSON.parse(localStorage.getItem('amc_settings'));
      if (settings && settings.currency) {
        setCurrency(settings.currency);
      }
    } catch {
      setCurrency('€');
    }
    const handleStorage = () => {
      try {
        const settings = JSON.parse(localStorage.getItem('amc_settings'));
        if (settings && settings.currency) {
          setCurrency(settings.currency);
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
        <div className="mr-2 flex-1">
          <h3 className="font-medium break-words" style={{ color: theme.colors.text }}>{calculation.name}</h3>
          <div className="text-sm mt-1" style={{ color: theme.colors.textLight }}>
            {calculation.weight.toFixed(2)} kg × {calculation.quantity}
          </div>
        </div>
        <div className="flex items-start">
          <div className="flex flex-col items-end mr-2">
            <div className="text-lg font-bold" style={{ color: theme.colors.text }}>
              {totalWeight.toFixed(2)} kg
            </div>
            <div className="text-sm mt-1" style={{ color: theme.colors.primary }}>
              {currency}{calculation.totalPrice.toFixed(2)}
            </div>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(calculation.id);
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors self-start"
              style={{ color: theme.colors.textLight }}
              aria-label={t('delete') || "Delete"}
              title={t('delete') || "Delete"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
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
  }).isRequired,
  onDelete: PropTypes.func
};

export default CalculationPreview;
