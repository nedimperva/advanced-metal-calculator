import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/formatters';

const ProductPreview = ({ product, onEdit, onDelete }) => {
  const { t, language } = useLanguage();

  if (!product) return null;

  // Format date
  const updatedAt = product.updatedAt ? formatDate(product.updatedAt, language) : '';
  const totalComponents = product.components.reduce((sum, c) => sum + c.quantity, 0);

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
      {/* Updated At */}
      <div className="text-xs" style={{ color: theme.colors.textLight }}>
        {t('updatedAt')}: {updatedAt}
      </div>
      {/* Components List */}
      <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
        <h4 className="text-sm font-medium mb-2" style={{ color: theme.colors.text }}>{t('components')}</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {product.components.map((component, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 rounded-md" style={{ backgroundColor: 'rgba(69,90,100,0.5)' }}>
              <div>
                <p className="text-sm" style={{ color: theme.colors.text }}>{component.name} ({component.quantity}x)</p>
                <p className="text-xs" style={{ color: theme.colors.textLight }}>
                  {component.material ? `${component.material} - ` : ''}{component.weight.toFixed(2)} kg
                </p>
              </div>
              <span className="text-xs font-medium" style={{ color: theme.colors.secondary }}>
                {(component.weight * component.quantity).toFixed(2)} kg
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
          <p className="text-sm font-medium" style={{ color: theme.colors.secondary }}>{product.totalWeight.toFixed(2)} kg</p>
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