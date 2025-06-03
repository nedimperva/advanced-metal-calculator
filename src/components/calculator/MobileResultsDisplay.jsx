import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

const MobileResultsDisplay = ({
  weight = 0,
  totalWeight = 0,
  piecePrice = 0,
  totalPrice = 0,
  quantity = 1,
  pricePerKg = 0,
  material = '',
  calculationType = '',
  onSave = () => {},
  onShare = () => {},
  isSaving = false,
  isCalculating = false
}) => {
  const { t } = useLanguage();
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const resultCards = [
    {
      id: 'weight',
      title: t('weight'),
      icon: '⚖️',
      color: theme.colors.primary,
      main: {
        value: totalWeight.toFixed(2),
        unit: 'kg',
        label: t('totalWeight')
      },
      secondary: {
        value: weight.toFixed(2),
        unit: 'kg',
        label: t('singlePiece')
      },
      details: [
        { label: t('quantity'), value: quantity },
        { label: t('unitWeight'), value: `${weight.toFixed(3)} kg` },
        { label: t('material'), value: t(material) }
      ]
    },
    {
      id: 'price',
      title: t('price'),
      icon: '💰',
      color: theme.colors.success,
      main: {
        value: totalPrice.toFixed(2),
        unit: '$',
        label: t('totalPrice'),
        prefix: '$'
      },
      secondary: {
        value: piecePrice.toFixed(2),
        unit: '$',
        label: t('pricePerPiece'),
        prefix: '$'
      },
      details: [
        { label: t('pricePerKg'), value: `$${pricePerKg}` },
        { label: t('totalWeight'), value: `${totalWeight.toFixed(2)} kg` },
        { label: t('costPerKg'), value: `$${(totalPrice / totalWeight || 0).toFixed(2)}` }
      ]
    }
  ];

  if (isCalculating) {
    return (
      <div className="w-full p-4">
        <div 
          className="rounded-xl p-6 flex items-center justify-center"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent" style={{ borderColor: theme.colors.primary }}></div>
            <span style={{ color: theme.colors.text }}>{t('calculating')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
          {t('results')}
        </h3>
        <div className="flex items-center space-x-2">
          <span 
            className="text-sm px-3 py-1 rounded-full"
            style={{ 
              backgroundColor: `${theme.colors.primary}20`,
              color: theme.colors.primary
            }}
          >
            {t(calculationType)}
          </span>
        </div>
      </div>

      {/* Result Cards */}
      <div className="space-y-3">
        {resultCards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{ 
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            {/* Card Header */}
            <div
              onClick={() => toggleCard(card.id)}
              className="p-4 cursor-pointer active:bg-opacity-80"
              style={{ backgroundColor: `${card.color}10` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${card.color}20` }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="font-medium" style={{ color: theme.colors.text }}>
                      {card.title}
                    </h4>
                    <p className="text-sm" style={{ color: theme.colors.textLight }}>
                      {card.main.label}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-baseline space-x-1">
                    {card.main.prefix && (
                      <span className="text-lg font-bold" style={{ color: card.color }}>
                        {card.main.prefix}
                      </span>
                    )}
                    <span className="text-2xl font-bold" style={{ color: card.color }}>
                      {card.main.value}
                    </span>
                    <span className="text-sm" style={{ color: theme.colors.textLight }}>
                      {card.main.unit}
                    </span>
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <div className="mt-1">
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedCard === card.id ? 'rotate-180' : ''
                      }`}
                      style={{ color: theme.colors.textLight }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedCard === card.id && (
              <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
                {/* Secondary Value */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.colors.background }}>
                  <span style={{ color: theme.colors.textLight }}>{card.secondary.label}</span>
                  <div className="flex items-baseline space-x-1">
                    {card.secondary.prefix && (
                      <span className="font-medium" style={{ color: theme.colors.text }}>
                        {card.secondary.prefix}
                      </span>
                    )}
                    <span className="text-lg font-semibold" style={{ color: theme.colors.text }}>
                      {card.secondary.value}
                    </span>
                    <span className="text-sm" style={{ color: theme.colors.textLight }}>
                      {card.secondary.unit}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {card.details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: theme.colors.textLight }}>
                        {detail.label}
                      </span>
                      <span className="text-sm font-medium" style={{ color: theme.colors.text }}>
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={onSave}
          disabled={isSaving || !weight}
          className="flex items-center justify-center py-4 px-6 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.textOnPrimary
          }}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2" style={{ borderColor: theme.colors.textOnPrimary }}></div>
              {t('saving')}
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {t('save')}
            </>
          )}
        </button>

        <button
          onClick={onShare}
          disabled={!weight}
          className="flex items-center justify-center py-4 px-6 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            border: `2px solid ${theme.colors.border}`
          }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          {t('share')}
        </button>
      </div>
    </div>
  );
};

export default MobileResultsDisplay; 