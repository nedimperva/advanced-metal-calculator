import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/formatters';

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

  // Defensive: ensure quantity and pricePerUnit are valid
  const quantity = typeof product.quantity === 'number' && !isNaN(product.quantity) ? product.quantity : 1;
  const pricePerUnit = typeof product.pricePerUnit === 'number' || (typeof product.pricePerUnit === 'string' && product.pricePerUnit !== '') ? Number(product.pricePerUnit) : null;

  // Calculate totals
  const totalWeightAll = totalWeight * quantity;
  const totalPriceAll = pricePerUnit !== null ? (quantity * pricePerUnit) : null;

  // Format date
  const updatedAt = product.updatedAt ? formatDate(product.updatedAt, language) : '';
  const totalComponents = components.reduce((sum, c) => sum + (c.quantity || 0), 0);

  return (
    <div className="border rounded-lg p-4" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
      {/* Header: Name + Actions */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>{product.name}</h3>
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
      {/* Components/Description */}
      <div className="text-sm mt-2 mb-2" style={{ color: theme.colors.textSecondary }}>
        {product.description}
      </div>

      {/* Components count, weight, price */}
      <div className="flex flex-row gap-4 items-center text-sm mb-2">
        <span>{t('components')}: {totalComponents}</span>
        <span>{t('weight')}: <b>{totalWeight.toFixed(2)} kg</b></span>
        {quantity > 1 && (
          <span>{t('quantity')}: <b>{quantity}</b></span>
        )}
      </div>
      {(quantity > 1 || pricePerUnit !== null) && (
        <div className="flex flex-row gap-4 items-center text-sm mb-2">
          <span>{t('totalWeight')}: <b>{totalWeightAll.toFixed(2)} kg</b></span>
          {pricePerUnit !== null && (
            <span>{t('totalPrice')}: <b>{totalPriceAll.toFixed(2)} {currency}</b></span>
          )}
        </div>
      )}
      <div className="flex flex-row gap-4 items-center text-sm mb-2">
        <span>{t('lastUpdated')}: {updatedAt}</span>
      </div>

      {/* Components List */}
      <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
        <h4 className="text-sm font-medium mb-2" style={{ color: theme.colors.text }}>{t('components')}</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {components.map((component, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 rounded-md" style={{ backgroundColor: 'rgba(69,90,100,0.5)' }}>
              <div>
                <p className="text-sm" style={{ color: theme.colors.text }}>{component.name} ({component.quantity}x)</p>
                <p className="text-xs" style={{ color: theme.colors.textLight }}>
                  {component.material ? `${component.material} - ` : ''}{typeof component.weight === 'number' ? component.weight.toFixed(2) : '0.00'} kg
                </p>
              </div>
              <span className="text-xs font-medium" style={{ color: theme.colors.secondary }}>
                {typeof component.weight === 'number' && typeof component.quantity === 'number' ? (component.weight * component.quantity).toFixed(2) : '0.00'} kg
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Summary */}
      <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3" style={{ borderColor: theme.colors.border }}>
        <div className="text-center p-2 rounded-md" style={{ backgroundColor: theme.colors.background }}>
          <p className="text-xs" style={{ color: theme.colors.textLight }}>{t('totalComponents')}</p>
          <p className="text-sm font-medium" style={{ color: theme.colors.text }}>{totalComponents}</p>
        </div>
        <div className="text-center p-2 rounded-md" style={{ backgroundColor: theme.colors.background }}>
          <p className="text-xs" style={{ color: theme.colors.textLight }}>{t('totalWeight')}</p>
          <p className="text-sm font-medium" style={{ color: theme.colors.secondary }}>{totalWeight.toFixed(2)} kg</p>
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