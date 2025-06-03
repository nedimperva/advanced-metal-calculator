import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

const MobileSavedCalculationsModal = ({ 
  isOpen, 
  onClose, 
  calculations = [], 
  onDelete = () => {},
  onClearAll = () => {},
  onLoadCalculation = () => {}
}) => {
  const { t } = useLanguage();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems(new Set());
      setIsSelectionMode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleItemClick = (calculation) => {
    if (isSelectionMode) {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(calculation.id)) {
        newSelected.delete(calculation.id);
      } else {
        newSelected.add(calculation.id);
      }
      setSelectedItems(newSelected);
    } else {
      onLoadCalculation(calculation);
      onClose();
    }
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(id => onDelete(id));
    setSelectedItems(new Set());
    setIsSelectionMode(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCalculationIcon = (type) => {
    const icons = {
      plate: '🔳',
      pipe: '🟫',
      angle: '📐',
      bar: '📏',
      profile: '🏗️'
    };
    return icons[type] || '⚙️';
  };

  const getCalculationColor = (type) => {
    const colors = {
      plate: theme.colors.accent1,
      pipe: theme.colors.primary,
      angle: theme.colors.secondary,
      bar: theme.colors.success,
      profile: theme.colors.accent2
    };
    return colors[type] || theme.colors.primary;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-h-[85vh] rounded-t-2xl overflow-hidden"
        style={{ backgroundColor: theme.colors.surface }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
              {t('savedCalculations')}
            </h2>
            {calculations.length > 0 && (
              <span 
                className="px-2 py-1 rounded-full text-xs"
                style={{ 
                  backgroundColor: `${theme.colors.primary}20`,
                  color: theme.colors.primary
                }}
              >
                {calculations.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {calculations.length > 0 && (
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: isSelectionMode ? theme.colors.primary : `${theme.colors.primary}20`,
                  color: isSelectionMode ? theme.colors.textOnPrimary : theme.colors.primary
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: `${theme.colors.textLight}20`,
                color: theme.colors.textLight
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Selection Mode Actions */}
        {isSelectionMode && selectedItems.size > 0 && (
          <div className="p-4 border-b" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.background }}>
            <div className="flex items-center justify-between">
              <span style={{ color: theme.colors.text }}>
                {selectedItems.size} {t('selected')}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center px-3 py-2 rounded-lg"
                  style={{ 
                    backgroundColor: theme.colors.danger,
                    color: theme.colors.textOnPrimary
                  }}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {calculations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${theme.colors.textLight}20` }}
              >
                <svg className="w-8 h-8" style={{ color: theme.colors.textLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: theme.colors.text }}>
                {t('noSavedCalculations')}
              </h3>
              <p className="text-center" style={{ color: theme.colors.textLight }}>
                {t('noSavedCalculationsDesc')}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {calculations.map((calculation) => (
                <div
                  key={calculation.id}
                  onClick={() => handleItemClick(calculation)}
                  className={`rounded-xl p-4 transition-all duration-200 ${
                    isSelectionMode ? 'cursor-pointer' : 'cursor-pointer active:scale-98'
                  }`}
                  style={{
                    backgroundColor: selectedItems.has(calculation.id) 
                      ? `${theme.colors.primary}20` 
                      : theme.colors.background,
                    border: selectedItems.has(calculation.id) 
                      ? `2px solid ${theme.colors.primary}` 
                      : `1px solid ${theme.colors.border}`
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Selection checkbox */}
                      {isSelectionMode && (
                        <div 
                          className="w-5 h-5 rounded border-2 flex items-center justify-center mt-1"
                          style={{
                            borderColor: selectedItems.has(calculation.id) ? theme.colors.primary : theme.colors.border,
                            backgroundColor: selectedItems.has(calculation.id) ? theme.colors.primary : 'transparent'
                          }}
                        >
                          {selectedItems.has(calculation.id) && (
                            <svg className="w-3 h-3" style={{ color: theme.colors.textOnPrimary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                      
                      {/* Icon */}
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${getCalculationColor(calculation.type)}20` }}
                      >
                        {getCalculationIcon(calculation.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium truncate" style={{ color: theme.colors.text }}>
                            {calculation.name || `${t(calculation.type)} ${t('calculation')}`}
                          </h4>
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: `${getCalculationColor(calculation.type)}20`,
                              color: getCalculationColor(calculation.type)
                            }}
                          >
                            {t(calculation.type)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: theme.colors.textLight }}>
                            {calculation.totalWeight?.toFixed(2)} kg • ${calculation.totalPrice?.toFixed(2)}
                          </span>
                          <span style={{ color: theme.colors.textLight }}>
                            {formatDate(calculation.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Individual delete button (when not in selection mode) */}
                    {!isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(calculation.id);
                        }}
                        className="p-2 rounded-lg opacity-70 hover:opacity-100"
                        style={{ 
                          backgroundColor: `${theme.colors.danger}20`,
                          color: theme.colors.danger
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {calculations.length > 0 && !isSelectionMode && (
          <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
            <button
              onClick={onClearAll}
              className="w-full py-3 px-4 rounded-lg font-medium"
              style={{
                backgroundColor: `${theme.colors.danger}20`,
                color: theme.colors.danger
              }}
            >
              {t('clearAll')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSavedCalculationsModal; 