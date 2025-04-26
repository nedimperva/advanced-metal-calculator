// Mobile improvements: responsive card, font sizes, touch-friendly buttons
import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/formatters';
import styles from './productScrollbar.module.css';

const ProductPreview = ({ product, onEdit, onDelete }) => {
  const { t, language } = useLanguage();
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

  if (!product) return null;

  // Defensive: ensure components is always an array
  const components = Array.isArray(product.components) ? product.components : [];
  // Defensive: ensure totalWeight is a valid number
  const totalWeight = typeof product.totalWeight === 'number' && !isNaN(product.totalWeight) ? product.totalWeight : 0;

  // Calculate product total price from all components
  const totalPriceAll = components.reduce(
    (sum, c) => sum + (typeof c.totalPrice === 'number' ? c.totalPrice : ((c.pricePerKg || 0) * (c.weight || 0) * (c.quantity || 1))),
    0
  );

  // Format date
  const updatedAt = product.updatedAt ? formatDate(product.updatedAt, language) : '';
  const totalComponents = components.reduce((sum, c) => sum + (c.quantity || 0), 0);

  return (
    <div className="border rounded-lg p-2 sm:p-4" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
      {/* Header: Name + Actions */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-base sm:text-lg font-medium" style={{ color: theme.colors.text }}>{product.name}</h3>
        <div className="flex gap-2">
          <button
            className="p-2 rounded-full hover:opacity-80"
            aria-label="Edit"
            style={{ backgroundColor: `${theme.colors.secondary}15`, color: theme.colors.secondary }}
            onClick={e => { e.stopPropagation(); onEdit(product); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="p-2 rounded-full hover:opacity-80"
            aria-label="Delete"
            style={{ backgroundColor: `rgba(178,39,39,0.082)`, color: '#B22727' }}
            onClick={e => { e.stopPropagation(); onDelete(product.id); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Description (only if available) */}
      {product.description && (
        <div className="text-sm mb-1" style={{ color: theme.colors.textLight, fontStyle: 'italic' }}>
          {product.description}
        </div>
      )}
      {/* Last updated */}
      <div className="text-xs mb-2" style={{ color: theme.colors.textLight }}>
        {t('lastUpdated')}: {updatedAt}
      </div>


      {/* Summary & Actions aligned */}
      {/* Shared width container for summary and actions */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-[340px]">
          <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-1 w-full" style={{ borderColor: theme.colors.border }}>
            <div className="flex flex-col items-center justify-center w-full h-full rounded-none" style={{ backgroundColor: theme.colors.background }}>
              <span className="text-xs leading-tight w-full text-center" style={{ color: theme.colors.textLight }}>{t('totalComponents')}</span>
              <span className="text-base font-semibold font-mono tabular-nums min-w-[60px] w-full text-center" style={{ color: theme.colors.primary, fontVariantNumeric: 'tabular-nums', minWidth: 60 }}>{totalComponents}</span>
            </div>
            <div className="flex flex-col items-center justify-center w-full h-full rounded-none" style={{ backgroundColor: theme.colors.background }}>
              <span className="text-xs leading-tight w-full text-center" style={{ color: theme.colors.textLight }}>{t('totalWeight')}</span>
              <span className="text-base font-semibold font-mono tabular-nums min-w-[60px] w-full text-center" style={{ color: theme.colors.primary, fontVariantNumeric: 'tabular-nums', minWidth: 60 }}>{totalWeight.toFixed(2)} kg</span>
            </div>
            <div className="flex flex-col items-center justify-center w-full h-full rounded-none" style={{ backgroundColor: theme.colors.background }}>
              <span className="text-xs leading-tight w-full text-center" style={{ color: theme.colors.textLight }}>{t('totalPrice')}</span>
              <span className="text-base font-semibold font-mono tabular-nums min-w-[60px] w-full text-center" style={{ color: theme.colors.primary, fontVariantNumeric: 'tabular-nums', minWidth: 60 }}>{totalPriceAll.toFixed(2)} {currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductPreview.propTypes = {
  product: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default ProductPreview;