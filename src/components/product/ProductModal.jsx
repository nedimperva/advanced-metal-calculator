import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { theme } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import ComponentSelector from './ComponentSelector';
import ComponentList from './ComponentList';

const calculateTotalWeight = (components) => {
  return components.reduce((total, component) => {
    return total + (component.weight * component.quantity);
  }, 0);
};

const ProductModal = ({ product, isOpen, onSave, onClose, mode = 'view', onEdit, onDelete }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState([]);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [internalMode, setInternalMode] = useState(mode);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode, isOpen]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setComponents(product.components || []);
    } else {
      setName('');
      setDescription('');
      setComponents([]);
    }
  }, [product, isOpen]);

  useEffect(() => {
    setTotalWeight(calculateTotalWeight(components));
  }, [components]);

  const handleAddComponent = (component) => {
    setComponents([...components, component]);
    setShowComponentSelector(false);
  };

  const handleUpdateComponentQuantity = (id, newQuantity) => {
    setComponents(
      components.map(component => 
        component.id === id 
          ? { ...component, quantity: newQuantity } 
          : component
      )
    );
  };

  const handleRemoveComponent = (id) => {
    setComponents(components.filter(component => component.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (!name.trim() || components.length === 0) {
      return;
    }
    
    const updatedProduct = {
      id: product?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      components,
      totalWeight,
      totalPrice: 0, // Can be calculated at runtime based on pricing settings
      createdAt: product?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(updatedProduct);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />

        {/* Modal panel */}
        <div 
          className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full w-full"
          style={{ maxWidth: '90vw' }}
        >
          <div className="w-full rounded-lg" style={{ backgroundColor: theme.colors.surface }}>
            <div className="p-4 sm:p-6">
              {/* VIEW MODE */}
              {internalMode === 'view' && product && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg sm:text-xl font-medium" style={{ color: theme.colors.text }}>
                      {product.name}
                    </h2>
                  </div>
                  <div className="mb-2 text-sm" style={{ color: theme.colors.textLight }}>
                    <p>{product.description}</p>
                  </div>
                  {/* Components section */}
                  <div className="border-t pt-4 mt-4" style={{ borderColor: theme.colors.border }}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-md font-medium" style={{ color: theme.colors.text }}>
                        {t('components')} ({components.length})
                      </h3>
                      {!showComponentSelector && (
                        <button
                          type="button"
                          onClick={() => setShowComponentSelector(true)}
                          className="py-1 px-3 rounded-md text-sm flex items-center"
                          style={{ 
                            backgroundColor: theme.colors.primary,
                            color: theme.colors.textOnPrimary
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {t('addComponent')}
                        </button>
                      )}
                    </div>
                    {showComponentSelector ? (
                      <ComponentSelector
                        onAdd={handleAddComponent}
                        onCancel={() => setShowComponentSelector(false)}
                      />
                    ) : (
                      <ComponentList
                        components={components}
                        onUpdateQuantity={handleUpdateComponentQuantity}
                        onRemove={handleRemoveComponent}
                      />
                    )}
                  </div>
                  {/* Total weight */}
                  <div className="border-t pt-4" style={{ borderColor: theme.colors.border }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: theme.colors.textLight }}>{t('totalWeight')}:</span>
                      <span className="font-medium" style={{ color: theme.colors.text }}>
                        {totalWeight.toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2 px-4 rounded-md"
                      style={{ 
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}
              {internalMode === 'edit' && (
                <form onSubmit={handleSave}>
                  <div className="mb-4">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('enterProductName')}
                      className="w-full text-lg sm:text-xl font-medium p-2 border rounded-md focus:ring-2"
                      style={{
                        color: theme.colors.text,
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                        outlineColor: theme.colors.primary
                      }}
                      required
                    />
                  </div>
                  <div className="mb-2 text-sm" style={{ color: theme.colors.textLight }}>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('enterProductDescription')}
                      className="w-full p-2 border rounded-md focus:ring-2 resize-none"
                      style={{ 
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                        outlineColor: theme.colors.primary,
                        minHeight: '80px'
                      }}
                    />
                  </div>
                  {/* Components section */}
                  <div className="border-t pt-4 mt-4" style={{ borderColor: theme.colors.border }}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-md font-medium" style={{ color: theme.colors.text }}>
                        {t('components')} ({components.length})
                      </h3>
                      {!showComponentSelector && (
                        <button
                          type="button"
                          onClick={() => setShowComponentSelector(true)}
                          className="py-1 px-3 rounded-md text-sm flex items-center"
                          style={{ 
                            backgroundColor: theme.colors.primary,
                            color: theme.colors.textOnPrimary
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {t('addComponent')}
                        </button>
                      )}
                    </div>
                    {showComponentSelector ? (
                      <ComponentSelector
                        onAdd={handleAddComponent}
                        onCancel={() => setShowComponentSelector(false)}
                      />
                    ) : (
                      <ComponentList
                        components={components}
                        onUpdateQuantity={handleUpdateComponentQuantity}
                        onRemove={handleRemoveComponent}
                      />
                    )}
                  </div>
                  {/* Total weight */}
                  <div className="border-t pt-4" style={{ borderColor: theme.colors.border }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: theme.colors.textLight }}>{t('totalWeight')}:</span>
                      <span className="font-medium" style={{ color: theme.colors.text }}>
                        {totalWeight.toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2 px-4 rounded-md"
                      style={{ 
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={!name.trim() || components.length === 0}
                      className="py-2 px-4 rounded-md disabled:opacity-50"
                      style={{ 
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.textOnPrimary
                      }}
                    >
                      {t('save')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductModal.propTypes = {
  product: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ProductModal;