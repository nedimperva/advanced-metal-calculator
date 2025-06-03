import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

// Import SVG icons
import EqualAngle from '../../assets/profiles/EqualAngle.svg';
import UnequalAngle from '../../assets/profiles/UnequalAngle.svg';
import SquarePipe from '../../assets/profiles/SquarePipe.svg';
import RoundPipe from '../../assets/profiles/RoundPipe.svg';
import RectangularPipe from '../../assets/profiles/RectangularPipe.svg';
import SteelPlate from '../../assets/profiles/SteelPlate.svg';
import FlatBar from '../../assets/profiles/FlatBar.svg';
import SquareBar from '../../assets/profiles/SquareBar.svg';
import RoundBar from '../../assets/profiles/RoundBar.svg';
import HEA from '../../assets/profiles/HEA.svg';
import HEB from '../../assets/profiles/HEB.svg';
import UProfile from '../../assets/profiles/UProfile.svg';

const MobileCalculationTypeSelector = ({ 
  selectedType, 
  onTypeChange, 
  selectedSubType, 
  onSubTypeChange 
}) => {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const calculationTypes = [
    {
      id: 'plate',
      icon: SteelPlate,
      color: theme.colors.accent1,
      description: t('plateDescription') || 'Steel plates and sheets'
    },
    {
      id: 'pipe',
      icon: RectangularPipe,
      color: theme.colors.primary,
      description: t('pipeDescription') || 'Round, square & rectangular pipes',
      subTypes: [
        { id: 'round', icon: RoundPipe, label: t('roundPipe') },
        { id: 'square', icon: SquarePipe, label: t('squarePipe') },
        { id: 'rectangular', icon: RectangularPipe, label: t('rectangularPipe') }
      ]
    },
    {
      id: 'angle',
      icon: EqualAngle,
      color: theme.colors.secondary,
      description: t('angleDescription') || 'Equal and unequal angles',
      subTypes: [
        { id: 'equal', icon: EqualAngle, label: t('equalAngle') },
        { id: 'unequal', icon: UnequalAngle, label: t('unequalAngle') }
      ]
    },
    {
      id: 'bar',
      icon: FlatBar,
      color: theme.colors.success,
      description: t('barDescription') || 'Flat, square & round bars',
      subTypes: [
        { id: 'flat', icon: FlatBar, label: t('flatBar') },
        { id: 'square', icon: SquareBar, label: t('squareBar') },
        { id: 'round', icon: RoundBar, label: t('roundBar') }
      ]
    },
    {
      id: 'profile',
      icon: HEA,
      color: theme.colors.accent2,
      description: t('profileDescription') || 'Standard structural profiles',
      subTypes: [
        { id: 'hea', icon: HEA, label: 'HEA' },
        { id: 'heb', icon: HEB, label: 'HEB' },
        { id: 'upn', icon: UProfile, label: 'UPN' }
      ]
    }
  ];

  // Touch/Mouse event handlers for horizontal scrolling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('mousemove', handleMouseMove);
      ref.addEventListener('mouseup', handleMouseUp);
      ref.addEventListener('mouseleave', handleMouseUp);
      ref.addEventListener('touchmove', handleTouchMove);
      ref.addEventListener('touchend', handleTouchEnd);

      return () => {
        ref.removeEventListener('mousemove', handleMouseMove);
        ref.removeEventListener('mouseup', handleMouseUp);
        ref.removeEventListener('mouseleave', handleMouseUp);
        ref.removeEventListener('touchmove', handleTouchMove);
        ref.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, startX, scrollLeft]);

  return (
    <div className="w-full">
      {/* Main Type Selector - Horizontal Scroll */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-3 px-4" style={{ color: theme.colors.textLight }}>
          {t('selectCalculationType')}
        </h3>
        <div
          ref={scrollRef}
          className="flex gap-3 px-4 overflow-x-auto scrollbar-hide cursor-grab"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {calculationTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => !isDragging && onTypeChange(type.id)}
              className={`flex-shrink-0 w-28 h-32 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all transform ${
                selectedType === type.id ? 'scale-105 shadow-lg' : 'hover:scale-102'
              }`}
              style={{
                backgroundColor: selectedType === type.id 
                  ? `${type.color}20` 
                  : theme.colors.surface,
                border: selectedType === type.id 
                  ? `2px solid ${type.color}` 
                  : `2px solid ${theme.colors.border}`
              }}
            >
              <img 
                src={type.icon} 
                alt={t(type.id)} 
                className="w-8 h-8 mb-2"
                style={{ filter: selectedType === type.id ? 'none' : 'grayscale(50%)' }}
              />
              <span 
                className="text-xs font-medium text-center leading-tight"
                style={{ 
                  color: selectedType === type.id ? type.color : theme.colors.text 
                }}
              >
                {t(type.id)}
              </span>
              <span 
                className="text-xs text-center leading-tight mt-1"
                style={{ color: theme.colors.textLight }}
              >
                {type.description.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Type Selector */}
      {selectedType && calculationTypes.find(t => t.id === selectedType)?.subTypes && (
        <div className="px-4">
          <h4 className="text-sm font-medium mb-3" style={{ color: theme.colors.textLight }}>
            {t('selectSubType')}
          </h4>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {calculationTypes.find(t => t.id === selectedType).subTypes.map((subType) => (
              <button
                key={subType.id}
                onClick={() => onSubTypeChange(subType.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  selectedSubType === subType.id ? 'shadow-md' : ''
                }`}
                style={{
                  backgroundColor: selectedSubType === subType.id 
                    ? theme.colors.primary 
                    : theme.colors.surface,
                  border: `1px solid ${selectedSubType === subType.id 
                    ? theme.colors.primary 
                    : theme.colors.border}`,
                  color: selectedSubType === subType.id 
                    ? theme.colors.textOnPrimary 
                    : theme.colors.text
                }}
              >
                <img 
                  src={subType.icon} 
                  alt={subType.label} 
                  className="w-5 h-5"
                  style={{ 
                    filter: selectedSubType === subType.id 
                      ? 'brightness(0) invert(1)' 
                      : 'none' 
                  }}
                />
                <span className="text-sm font-medium whitespace-nowrap">
                  {subType.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCalculationTypeSelector; 